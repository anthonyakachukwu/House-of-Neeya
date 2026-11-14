import { Button } from "@/components";
import formatCurrency from "@/lib/formatCurrency";
import Link from "next/link";
import { PAYMENT_ACCOUNT, buildWhatsAppLink } from "../lib/checkout.constants";

export type PlacedOrder = { reference: string; total: number };

const OrderPlaced = ({ order }: { order: PlacedOrder }) => {
  const { bank, accountName, accountNumber } = PAYMENT_ACCOUNT;
  const hasAccount = Boolean(bank && accountName && accountNumber);

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif">Order placed</h1>
        <p className="text-sm text-foreground/60">
          Your order is waiting for payment. Order reference:{" "}
          <span className="font-semibold text-foreground">
            {order.reference}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-3 bg-foreground/5 p-6 text-sm">
        <p className="uppercase text-[11px] text-primary tracking-[0.22em]">
          1. Pay by transfer
        </p>
        <p>
          Amount:{" "}
          <span className="font-semibold">{formatCurrency(order.total)}</span>
        </p>
        {hasAccount ? (
          <>
            <p>Bank: {bank}</p>
            <p>Account name: {accountName}</p>
            <p>Account number: {accountNumber}</p>
          </>
        ) : (
          <p>Message us on WhatsApp for our account details.</p>
        )}
        <p className="text-xs text-foreground/60">
          Use {order.reference} as the transfer narration if your bank allows it.
        </p>
      </div>

      <div className="flex flex-col gap-3 bg-foreground/5 p-6 text-sm">
        <p className="uppercase text-[11px] text-primary tracking-[0.22em]">
          2. Send your proof of payment
        </p>
        <p className="text-xs text-foreground/60">
          Open WhatsApp and paste your payment receipt or screenshot in the
          chat. We confirm the payment, then ship your order.
        </p>
        <a
          href={buildWhatsAppLink(order.reference, order.total)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>Send proof on WhatsApp</Button>
        </a>
      </div>

      <Link href="/shop" className="text-sm underline underline-offset-4">
        Continue shopping
      </Link>
    </div>
  );
};

export default OrderPlaced;
