import { createElement } from "react";
import { renderToStaticMarkup } from "./helpers/intl";
import { describe, expect, it } from "vitest";

import PaymentMethodPicker from "@/app/(private-commerce)/(shop)/checkout/components/PaymentMethodPicker";
import type { CheckoutPaymentMethod } from "@/features/checkout/api";

function renderPaymentMethods(
  value: CheckoutPaymentMethod,
  airwallexEnabled: boolean,
) {
  return renderToStaticMarkup(
    createElement(PaymentMethodPicker, {
      value,
      airwallexEnabled,
      onChange: () => {},
    }),
  ).match(/<button\b[^>]*>[\s\S]*?<\/button>/g) ?? [];
}

describe("Airwallex checkout payment option", () => {
  it.each(["AIRWALLEX", "CASH_ON_DELIVERY"] as const)(
    "shows Airwallex when a quote is available and marks %s selected",
    (selectedMethod) => {
      const buttons = renderPaymentMethods(selectedMethod, true);
      const airwallex = buttons.find((button) =>
        button.includes("Airwallex secure payment"),
      );
      const cashOnDelivery = buttons.find((button) =>
        button.includes("Cash on delivery"),
      );

      expect(buttons).toHaveLength(2);
      expect(airwallex).toBeDefined();
      expect(cashOnDelivery).toBeDefined();
      expect(airwallex).toContain(
        `aria-pressed="${selectedMethod === "AIRWALLEX"}"`,
      );
      expect(cashOnDelivery).toContain(
        `aria-pressed="${selectedMethod === "CASH_ON_DELIVERY"}"`,
      );
    },
  );

  it("hides Airwallex when unavailable and keeps cash on delivery visible", () => {
    const buttons = renderPaymentMethods("CASH_ON_DELIVERY", false);

    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toContain("Cash on delivery");
    expect(buttons[0]).toContain('aria-pressed="true"');
    expect(buttons.join("")).not.toContain("Airwallex");
  });
});
