import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] text-[12.5px] font-medium transition-all duration-200 ease-premium disabled:pointer-events-none disabled:opacity-45 active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
  {
    variants: {
      variant: {
        primary:
          "bg-gold text-[#1b1505] shadow-[0_8px_28px_rgba(var(--gold-rgb),.18)] hover:brightness-105",
        secondary:
          "border border-line bg-raised text-ink shadow-[inset_0_1px_0_rgba(255,255,255,.025)] hover:border-[var(--line-strong)] hover:bg-[var(--overlay)]",
        ghost: "text-muted hover:bg-raised hover:text-ink",
        mint: "border border-[rgba(var(--mint-rgb),.2)] bg-[var(--mint-soft)] text-mint hover:bg-[rgba(var(--mint-rgb),.16)]",
        danger:
          "border border-[rgba(var(--coral-rgb),.2)] bg-[var(--coral-soft)] text-coral hover:bg-[rgba(var(--coral-rgb),.16)]",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-5 text-[13px]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
