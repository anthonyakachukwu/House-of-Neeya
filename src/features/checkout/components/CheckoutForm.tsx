"use client";

import { Button } from "@/components";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/SelectInput";
import { ReactNode, ChangeEvent } from "react";
import formatCurrency from "@/lib/formatCurrency";

const PaymentMethod = ({
  children,
  paymentOptions,
  brandStyle,
}: {
  children: ReactNode;
  paymentOptions: string;
  brandStyle?: string;
}) => {
  return (
    <div className="flex flex-col gap-4 items-center border border-foreground/20 p-4 bg-white">
      <p className={`flex flex-col items-center gap-2 text-lg capitalize ${brandStyle}`}>
        {children}
      </p>
      <p className="text-xs text-foreground/60">{paymentOptions}</p>
    </div>
  );
};

const CheckoutForm = ({
  onClick,
}: {
  onClick: (state: string, fee: number) => void;
}) => {
  const deliveryFees = {
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

  return (
    <form className="flex flex-col flex-5 gap-6">
      <h1 className="text-4xl font-serif">Complete Your Order</h1>
      <h2 className="uppercase text-[11px] text-primary pb-2 tracking-[0.22em] border-b border-b-foreground/20">
        Contact Information
      </h2>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Input
          type="text"
          label="First Name *"
          placeholder="James"
          className="min-w-70"
        />
        <Input
          type="text"
          label="Last Name *"
          placeholder="Nasiru"
          className="min-w-70"
        />
      </div>
      <Input
        type="email"
        label="Email *"
        placeholder="johnnasiru@mail.com"
        className="min-w-70"
      />
      <Input
        type="tel"
        label="Phone Number *"
        placeholder="+234 800 000 0000"
        className="min-w-70"
      />
      <h2 className="uppercase text-[11px] text-primary pb-2 tracking-[0.22em] border-b border-b-foreground/20">
        Delivery Address
      </h2>
      <Input
        type="text"
        label="Street Address"
        placeholder="12 Allen Avenue, Maitama"
        className="min-w-70"
      />
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Input
          type="text"
          label="City *"
          placeholder="Abuja"
          className="min-w-70"
        />
        <Select
          label="State"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            const state = e.target.value;
            if (!state) return;
            const fee = deliveryFees[state as keyof typeof deliveryFees];
            onClick(state, fee);
          }}
        >
          <option value="">Select state</option>
          {Object.entries(deliveryFees).map(([state, fee]) => (
            <option key={state} value={state}>
              {state} - {formatCurrency(fee)}
            </option>
          ))}
        </Select>
      </div>
      <h2 className="uppercase text-[11px] text-primary pb-2 tracking-[0.22em] border-b border-b-foreground/20">
        Payment Method
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PaymentMethod
          paymentOptions="Cards, Bank Transfer, USSD"
          brandStyle="text-forground"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1C1916" strokeWidth="1.6"><path d="M4 12l6-8h10l-6 8h6l-12 12 2-8H4z"></path></svg>
          Flutterwave
        </PaymentMethod>
        <PaymentMethod
          paymentOptions="Cards, Bank Transfer, QR"
          brandStyle="text-foreground"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1C1916" strokeWidth="1.6"><path d="M6 4h9a4 4 0 010 8H9l-1 8H5L7 4z"></path><path d="M9 12h8a4 4 0 010 8h-6"></path></svg>
          Paypal
        </PaymentMethod>
      </div>
      <p className="text-[10px] md:text-xs text-foreground/60">
        🔒 Payments are securely processed. We never store card details.
      </p>
      <Button>Place Order & Pay</Button>
    </form>
  );
};

export default CheckoutForm;
