-- Additive only. Apply through the normal reviewed migration process.
CREATE TABLE "MarketingConsent" (
  "id" TEXT NOT NULL,
  "secretHash" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "policyVersion" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "origin" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "matching" JSONB,
  "context" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketingConsent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketingConsent_state_check" CHECK ("state" IN ('unknown','granted','denied','revoked'))
);
CREATE UNIQUE INDEX "MarketingConsent_secretHash_key" ON "MarketingConsent"("secretHash");
CREATE INDEX "MarketingConsent_state_expiresAt_idx" ON "MarketingConsent"("state", "expiresAt");

CREATE TABLE "MarketingOrderConsent" (
  "orderId" TEXT NOT NULL,
  "consentId" TEXT NOT NULL,
  "policyVersion" TEXT NOT NULL,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketingOrderConsent_pkey" PRIMARY KEY ("orderId"),
  CONSTRAINT "MarketingOrderConsent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MarketingOrderConsent_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "MarketingConsent"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "MarketingConversionOutbox" (
  "id" TEXT NOT NULL,
  "businessKey" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "eventName" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "payload" JSONB NOT NULL,
  "consentId" TEXT,
  "policyVersion" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "matching" JSONB,
  "context" JSONB,
  "state" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "lockedAt" TIMESTAMP(3),
  "lockToken" TEXT,
  "lastFailureCode" TEXT,
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketingConversionOutbox_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketingOutbox_state_check" CHECK ("state" IN ('INTERNAL','PENDING','PROCESSING','RETRY','DELIVERED','SUPPRESSED','BLOCKED','EXPIRED','DEAD_LETTER')),
  CONSTRAINT "MarketingOutbox_event_check" CHECK ("eventName" IN ('OrderPlaced','InitiateCheckout','Purchase')),
  CONSTRAINT "MarketingOutbox_attempts_check" CHECK ("attempts" >= 0),
  CONSTRAINT "MarketingConversionOutbox_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MarketingConversionOutbox_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "MarketingConsent"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "MarketingConversionOutbox_businessKey_key" ON "MarketingConversionOutbox"("businessKey");
CREATE INDEX "MarketingOutbox_claimable_idx" ON "MarketingConversionOutbox"("state", "nextAttemptAt", "createdAt");
CREATE INDEX "MarketingOutbox_stale_claim_idx" ON "MarketingConversionOutbox"("state", "lockedAt");
CREATE INDEX "MarketingConversionOutbox_consentId_state_idx" ON "MarketingConversionOutbox"("consentId", "state");
