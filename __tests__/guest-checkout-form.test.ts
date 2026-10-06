import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CheckoutHeader from "@/app/(shop)/checkout/components/CheckoutHeader";
import CustomerForm, { type CustomerFormState } from "@/app/(shop)/checkout/components/CustomerForm";

const form: CustomerFormState = {
  customerName: "Buyer", customerPhone: "01700000000", customerEmail: "buyer@example.test",
  customerAddress: "12 Main Road", customerCity: "Dhaka", deliveryZone: "INSIDE_DHAKA",
  customerPostalCode: "", customerNote: "",
};

function renderForm(isAuthenticated: boolean) {
  return renderToStaticMarkup(createElement(CustomerForm, {
    form, isAuthenticated, onChange: () => {}, errors: {}, profileStatus: "idle", onRetryProfile: () => {},
  }));
}

describe("guest checkout delivery form", () => {
  it("offers an editable optional guest email without account settings", () => {
    const markup = renderForm(false);
    const email = markup.match(/<input[^>]*type="email"[^>]*>/)?.[0];
    expect(email).toBeDefined();
    expect(email).toContain('value="buyer@example.test"');
    expect(email).not.toMatch(/\sreadOnly(?:=|\s|\/?>)/);
    expect(email).not.toMatch(/\sdisabled(?:=|\s|\/?>)/);
    expect(markup).toContain("Email (optional)");
    expect(markup).not.toContain("/profile?tab=settings");
  });

  it("keeps the account email locked and the profile settings link for signed-in buyers", () => {
    const markup = renderForm(true);
    const email = markup.match(/<input[^>]*type="email"[^>]*>/)?.[0];
    expect(email).toMatch(/\sreadOnly(?:=|\s|\/?>)/);
    expect(email).toMatch(/\sdisabled(?:=|\s|\/?>)/);
    expect(markup).toContain("/profile?tab=settings");
  });

  it("shows optional sign-in with the original checkout destination for guests", () => {
    const loginHref = "/login?callbackUrl=%2Fcheckout%3Fbuy%3Dproduct-1%253A2%253Avariant-1";
    const markup = renderToStaticMarkup(createElement(CheckoutHeader, {
      isAuthenticated: false, itemCount: 2, source: "buy-now", loginHref,
    }));
    expect(markup).toContain("Checkout as a guest");
    expect(markup).toContain("Sign in (optional)");
    expect(markup).toContain(loginHref);
  });
});
