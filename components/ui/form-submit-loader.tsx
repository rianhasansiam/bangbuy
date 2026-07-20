"use client";

import type React from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

type FormSubmitLoaderProps = Omit<ButtonProps, "type" | "loading"> & {
  pendingLabel?: React.ReactNode;
};

export function FormSubmitLoader({
  children,
  pendingLabel = children,
  disabled,
  ...props
}: FormSubmitLoaderProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled || pending}
      loading={pending}
      loadingText={pendingLabel}
    >
      {children}
    </Button>
  );
}
