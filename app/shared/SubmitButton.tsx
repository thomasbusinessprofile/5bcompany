"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
};

export function SubmitButton({ children, className = "primary-link", pendingLabel = "Submitting..." }: Props) {
  const { pending } = useFormStatus();
  return (
    <button aria-busy={pending} className={className} disabled={pending} type="submit">
      {pending ? pendingLabel : children}
    </button>
  );
}
