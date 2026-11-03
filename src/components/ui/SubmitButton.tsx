"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { buttonClass } from "@/components/ui";

/** Submit button that shows a clear "working" message while the form is sending. */
export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  size = "lg",
  className = "",
  ...props
}: ComponentProps<"button"> & {
  pendingText: string;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "md" | "lg" | "xl";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      aria-busy={pending}
      className={buttonClass(variant, size, className)}
      {...props}
    >
      {pending ? (
        <>
          <span className="inline-block size-5 animate-spin rounded-full border-4 border-current border-r-transparent" aria-hidden />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
