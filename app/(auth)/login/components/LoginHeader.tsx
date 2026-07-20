"use client";

import Link from "next/link";

export default function LoginHeader() {
  return (
    <header className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-brand-text-dark sm:text-3xl">
          Welcome{" "}
          <span className="text-brand-red">
            back
          </span>
        </h2>

        <p className="mt-1 text-sm text-brand-text-muted">
          New here?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-red underline-offset-2 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </header>
  );
}
