import formatCurrency from "@/lib/formatCurrency";

export const DELIVERY_STATE_NAMES = [
  "Abuja",
  "Nasarawa",
  "Lagos",
  "Kano",
  "Rivers",
  "Edo",
  "Oyo",
  "Delta",
  "Anambra",
  "Others",
] as const;

export type DeliveryState = (typeof DELIVERY_STATE_NAMES)[number];

// Same fees the checkout form showed before. The server uses this table,
// so a customer cannot change the fee from the browser.
export const DELIVERY_FEES: Record<DeliveryState, number> = {
  Abuja: 2000,
  Nasarawa: 3000,
  Lagos: 3000,
  Kano: 3500,
  Rivers: 4000,
  Edo: 3000,
  Oyo: 3000,
  Delta: 3000,
  Anambra: 3500,
  Others: 3500,
};

// International format, no "+": +234 913 119 9267 -> 2349131199267
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2349131199267";

// Fill these in .env.local. If they are empty, the confirmation screen tells
// the customer to ask for account details on WhatsApp.
export const PAYMENT_ACCOUNT = {
  bank: process.env.NEXT_PUBLIC_BANK_NAME ?? "",
  accountName: process.env.NEXT_PUBLIC_ACCOUNT_NAME ?? "",
  accountNumber: process.env.NEXT_PUBLIC_ACCOUNT_NUMBER ?? "",
};

export function buildWhatsAppLink(reference: string, total: number) {
  const text =
    `Hello House of Neeya, I have paid for order ${reference} ` +
    `(${formatCurrency(total)}). Here is my proof of payment.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
