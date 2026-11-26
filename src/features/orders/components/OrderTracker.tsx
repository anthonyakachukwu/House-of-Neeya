import { Check } from "lucide-react";
import { getProgress, TRACKING_STEPS } from "../lib/orderStatus";
import type { AdminOrder } from "@/features/admin/orders/api/order.mappers";

const OrderTracker = ({ order }: { order: AdminOrder }) => {
  const progress = getProgress(order);

  if (progress === -1) {
    return (
      <p
        role="status"
        className="border-l-2 border-destructive bg-destructive/10 text-destructive px-4 py-2 text-xs"
      >
        This order was cancelled. Contact us on WhatsApp if you have questions.
      </p>
    );
  }

  return (
    <ol className="grid grid-cols-4 gap-1 list-none" aria-label="Order progress">
      {TRACKING_STEPS.map((step, index) => {
        const done = index <= progress;
        const current = index === progress;
        return (
          <li
            key={step.key}
            aria-current={current ? "step" : undefined}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div className="relative flex w-full items-center justify-center">
              {index > 0 && (
                <span
                  className={`absolute right-1/2 h-px w-full ${done ? "bg-accent" : "bg-foreground/20"}`}
                />
              )}
              <span
                className={`relative z-1 flex size-6 items-center justify-center rounded-full border text-[10px] ${
                  done
                    ? "bg-accent border-accent text-background"
                    : "bg-white border-foreground/30 text-foreground/40"
                } ${current ? "ring-4 ring-accent/20" : ""}`}
              >
                {done ? <Check size={12} /> : index + 1}
              </span>
            </div>
            <span
              className={`text-[10px] md:text-xs leading-tight ${done ? "text-foreground" : "text-foreground/40"}`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default OrderTracker;
