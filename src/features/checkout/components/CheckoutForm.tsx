"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/SelectInput";
import formatCurrency from "@/lib/formatCurrency";
import {
  DELIVERY_FEES,
  DELIVERY_STATE_NAMES,
} from "../lib/checkout.constants";
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "../schema/checkout.schema";

type CheckoutFormProps = {
  onStateChange: (state: string, fee: number) => void;
  onSubmit: (values: CheckoutFormValues) => Promise<void> | void;
  submitting: boolean;
  disabled?: boolean;
  error?: string;
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="uppercase text-[11px] text-primary pb-2 tracking-[0.22em] border-b border-b-foreground/20">
    {children}
  </h2>
);

const CheckoutForm = ({
  onStateChange,
  onSubmit,
  submitting,
  disabled,
  error,
}: CheckoutFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
  });

  const stateField = register("state", {
    onChange: (e) => {
      const state = e.target.value as keyof typeof DELIVERY_FEES;
      onStateChange(state, DELIVERY_FEES[state] ?? 0);
    },
  });

  return (
    <form
      className="flex flex-col flex-5 gap-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <h1 className="text-4xl font-serif">Complete Your Order</h1>

      <SectionTitle>Contact Information</SectionTitle>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Input
          type="text"
          label="First Name *"
          placeholder="James"
          autoComplete="given-name"
          className="min-w-70"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          type="text"
          label="Last Name *"
          placeholder="Nasiru"
          autoComplete="family-name"
          className="min-w-70"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>
      <Input
        type="email"
        label="Email *"
        placeholder="johnnasiru@mail.com"
        autoComplete="email"
        className="min-w-70"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        type="tel"
        label="Phone Number *"
        placeholder="+234 800 000 0000"
        autoComplete="tel"
        className="min-w-70"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <SectionTitle>Delivery Address</SectionTitle>
      <Input
        type="text"
        label="Street Address *"
        placeholder="12 Allen Avenue, Maitama"
        autoComplete="street-address"
        className="min-w-70"
        error={errors.street?.message}
        {...register("street")}
      />
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Input
          type="text"
          label="City *"
          placeholder="Abuja"
          className="min-w-70"
          error={errors.city?.message}
          {...register("city")}
        />
        <Select label="State *" error={errors.state?.message} {...stateField}>
          <option value="">Select state</option>
          {DELIVERY_STATE_NAMES.map((state) => (
            <option key={state} value={state}>
              {state} - {formatCurrency(DELIVERY_FEES[state])}
            </option>
          ))}
        </Select>
      </div>

      <SectionTitle>Payment</SectionTitle>
      <div className="flex flex-col gap-2 border border-foreground/20 p-4 bg-white text-sm">
        <p className="font-semibold">Bank transfer</p>
        <p className="text-xs text-foreground/60">
          Place your order, then transfer the total to our account and send
          your proof of payment on WhatsApp. We start processing your order
          once we confirm the payment.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting || disabled}>
        {submitting ? "Placing order..." : "Place Order"}
      </Button>
    </form>
  );
};

export default CheckoutForm;
