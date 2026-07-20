"use client";

import Link from "next/link";

import { REGISTER_STEPS } from "./constants";
import Stepper from "./Stepper";
import type { RegisterStep } from "../page";

type RegisterHeaderProps = {
  currentStep: RegisterStep;
};

export default function RegisterHeader({ currentStep }: RegisterHeaderProps) {
  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-brand-text-dark sm:text-3xl">
            Create your{" "}
            <span className="text-brand-red">
              account
            </span>
          </h2>

          <p className="mt-1 text-sm text-brand-text-muted">
            Already a member?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-red underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <span className="hidden shrink-0 rounded-full bg-brand-red/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-red ring-1 ring-brand-red/20 sm:inline-flex">
          Step {currentStep + 1} of {REGISTER_STEPS.length}
        </span>
      </div>

      <Stepper currentStep={currentStep} />
    </header>
  );
}
