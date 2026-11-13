-- Remove retired Meta tracking storage after its application code and workers
-- have been stopped. Historical migrations remain unchanged.
DROP TABLE "MarketingConversionOutbox";
DROP TABLE "MarketingOrderConsent";
DROP TABLE "MarketingConsent";
