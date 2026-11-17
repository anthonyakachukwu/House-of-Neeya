import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { DELIVERY_FEES } from "@/features/checkout/lib/checkout.constants";
import { checkoutRequestSchema } from "@/features/checkout/schema/checkout.schema";

// No 0/O/1/I so references are easy to read out and type
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newReference() {
  const bytes = randomBytes(6);
  let code = "";
  for (const b of bytes) code += REF_ALPHABET[b % REF_ALPHABET.length];
  return `HON-${code}`;
}

const fail = (error: string, status: number, extra?: object) =>
  NextResponse.json({ error, ...extra }, { status });

async function handleCheckout(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Please check the form and try again.", 400, {
      fields: z.flattenError(parsed.error).fieldErrors,
    });
  }
  const input = parsed.data;

  // Signed-in customers get the order linked to their account; guests get null.
  const userClient = createClient(await cookies());
  const { data: claimsData } = await userClient.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("checkout: SUPABASE_SERVICE_ROLE_KEY is not configured");
    return fail("Checkout is not configured. Please contact the store.", 500);
  }

  const db = createAdminClient();

  // Prices and stock come from the database, never from the browser.
  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const { data: products, error: productsError } = await db
    .from("Products")
    .select("id, name, price, discountedPrice, stock")
    .in("id", productIds);

  if (productsError) {
    console.error("checkout: product lookup failed", productsError);
    return fail("Could not place your order. Please try again.", 500, {
      code: "PRODUCT_LOOKUP_FAILED",
      databaseCode: productsError.code,
    });
  }

  const byId = new Map((products ?? []).map((p) => [p.id as string, p]));

  const missing = productIds.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    return fail(
      "Some items in your bag are no longer available. Remove them and try again.",
      409,
      { unavailable: missing },
    );
  }

  const qtyByProduct = new Map<string, number>();
  for (const line of input.items) {
    qtyByProduct.set(
      line.productId,
      (qtyByProduct.get(line.productId) ?? 0) + line.quantity,
    );
  }
  const outOfStock = [...qtyByProduct.entries()]
    .filter(([id, qty]) => qty > Number(byId.get(id)!.stock))
    .map(([id]) => byId.get(id)!.name as string);
  if (outOfStock.length > 0) {
    return fail(`Not enough stock for: ${outOfStock.join(", ")}.`, 409);
  }

  const lines = input.items.map((line) => {
    const p = byId.get(line.productId)!;
    const unitPrice = Number(p.discountedPrice || p.price);
    return { ...line, unitPrice };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const shippingFee = DELIVERY_FEES[input.state];
  const total = subtotal + shippingFee;

  // 1. address
  const { data: address, error: addressError } = await db
    .from("Addresses")
    .insert({
      userId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      street: input.street,
      city: input.city,
      state: input.state,
      country: "Nigeria",
    })
    .select("id")
    .single();

  if (addressError || !address) {
    console.error("checkout: address insert failed", addressError);
    return fail("Could not place your order. Please try again.", 500, {
      code: "ADDRESS_INSERT_FAILED",
      databaseCode: addressError.code,
    });
  }

  // 2. order: always pending + unpaid. Only an admin can change these later.
  let order: { id: string; reference: string } | null = null;
  let orderInsertFailed = false;
  for (let attempt = 0; attempt < 3 && !order; attempt++) {
    const reference = newReference();
    const { data, error } = await db
      .from("Orders")
      .insert({
        userId,
        addressId: address.id,
        status: "unfulfilled",
        paymentStatus: "pending",
        paymentReference: null,
        subtotal,
        discount: 0,
        shippingFee,
        total,
        reference,
      })
      .select("id, reference")
      .single();

    if (!error && data) {
      order = data as { id: string; reference: string };
    } else if (error?.code !== "23505") {
      console.error("checkout: order insert failed", error);
      orderInsertFailed = true;
      break;
    }
  }

  if (!order) {
    await db.from("Addresses").delete().eq("id", address.id);
    return fail("Could not place your order. Please try again.", 500, {
      code: orderInsertFailed
        ? "ORDER_INSERT_FAILED"
        : "ORDER_REFERENCE_COLLISION",
    });
  }

  // 3. items
  const { error: itemsError } = await db.from("Order items").insert(
    lines.map((l) => ({
      orderId: order!.id,
      productId: l.productId,
      variantId: null,
      quantity: l.quantity,
      priceAtPurchase: l.unitPrice,
      color: l.color || null,
      size: l.size || null,
    })),
  );

  if (itemsError) {
    console.error("checkout: order items insert failed", itemsError);
    await db.from("Orders").delete().eq("id", order.id);
    await db.from("Addresses").delete().eq("id", address.id);
    return fail("Could not place your order. Please try again.", 500, {
      code: "ORDER_ITEMS_INSERT_FAILED",
    });
  }

  return NextResponse.json(
    { reference: order.reference, subtotal, shippingFee, total },
    { status: 201 },
  );
}

export async function POST(request: NextRequest) {
  try {
    return await handleCheckout(request);
  } catch (error) {
    console.error("checkout: unexpected request failure", error);
    return fail("Could not place your order. Please try again.", 500, {
      code: "UNEXPECTED_SERVER_ERROR",
    });
  }
}
