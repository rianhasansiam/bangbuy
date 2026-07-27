/**
 * Payment risk assessment and review quarantine.
 *
 * Flags anomalous payments (mismatches, missing risk data) for manual review
 * without blocking the terminal state transition.
 */

import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  lockOrderForStatusChange,
  lockPaymentAttempt,
} from "@/lib/orders/mutations";

import { PROVIDER } from "./payment.constants";
import { PaymentError } from "./payment.errors";

export async function quarantineVerificationMismatch(
  candidate: { id: string; orderId: string },
  reviewReason:
    | "IPN_VALIDATION_MISMATCH"
    | "CALLBACK_VALIDATION_MISMATCH"
    | "RECONCILIATION_MISMATCH",
) {
  await prisma.$transaction(async (tx) => {
    await lockOrderForStatusChange(tx, candidate.orderId);
    await lockPaymentAttempt(tx, candidate.id);

    const payment = await tx.paymentTransaction.findUnique({
      where: { id: candidate.id },
      select: { provider: true, status: true },
    });
    if (!payment || payment.provider !== PROVIDER) {
      throw new PaymentError(404, "Payment attempt not found.");
    }

    await tx.paymentTransaction.update({
      where: { id: candidate.id },
      data: {
        requiresReview: true,
        reviewReason,
        // A completed refund remains immutable audit evidence even if a new
        // anomaly arrives. Other prior resolutions are superseded by this
        // newly unresolved review.
        ...(payment.status === "REFUNDED"
          ? {}
          : {
              reviewResolvedAt: null,
              reviewResolvedBy: null,
              reviewResolution: null,
              reviewResolutionReference: null,
            }),
      },
    });
  });
}
