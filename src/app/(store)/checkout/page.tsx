"use client";

import { useMemo, useState } from "react";
import SectionLayout from "@/components/layout/SectionLayout";
import { useCartStore } from "@/features/cart/store/cartStore";
import CheckoutForm from "@/features/checkout/components/CheckoutForm";
import OrderPlaced, {
  type PlacedOrder,
} from "@/features/checkout/components/OrderPlaced";
import OrderSummary from "@/features/checkout/components/OrderSummary";
import type { CheckoutFormValues } from "@/features/checkout/schema/checkout.schema";
import { useAuthUser } from "@/features/auth/hooks/useAuthUser";
import { DELIVERY_STATE_NAMES, type DeliveryState } from "@/features/checkout/lib/checkout.constants";

export default function Checkout() {
  const { profile } = useAuthUser();
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  //Handle prefill
  const prefill = useMemo(() => {
    if (!profile || profile.isGuest) return undefined;
    const state = (DELIVERY_STATE_NAMES as readonly string[]).includes(profile.address.state)
      ? (profile.address.state as DeliveryState) : undefined;
    return {
      firstName: profile.firstName, lastName: profile.lastName, email: profile.email,
      phone: profile.phone, street: profile.address.street, city: profile.address.city, state,
    };
  }, [profile]);

  const handleSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      setError("Your bag is empty.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: items.map((item) => ({
            productId: item.id,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      });
      const responseText = await res.text();
      let data: { error?: string; reference?: string; total?: number } = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Checkout failed (${res.status}): ${responseText.slice(0, 200)}`,
          );
        }
      }

      if (!res.ok) {
        throw new Error(
          data.error ?? `Could not place your order (HTTP ${res.status}).`,
        );
      }

      if (!data.reference || typeof data.total !== "number") {
        throw new Error("The checkout server returned an incomplete response.");
      }

      setPlaced({ reference: data.reference, total: data.total });
      clearCart();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not place your order.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <SectionLayout>
        <OrderPlaced order={placed} />
      </SectionLayout>
    );
  }

  return (
    <SectionLayout className="flex flex-col md:flex-row gap-8">
      <CheckoutForm
        onStateChange={(_state, fee) => setDeliveryFee(fee)}
        onSubmit={handleSubmit}
        submitting={submitting}
        disabled={items.length === 0}
        error={error}
        prefill={prefill}
      />
      <OrderSummary
        checkoutItems={items}
        orderTotal={total}
        deliveryFee={deliveryFee}
      />
    </SectionLayout>
  );
}
