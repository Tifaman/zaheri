-- One receipt now covers every medication issued in a visit (one QR, one
-- signature) instead of one receipt per medication. Data-preserving:
-- existing single-value receipts are backfilled into a one-element array
-- rather than dropped.

-- Add the new column, nullable for now so the backfill can populate it.
ALTER TABLE "PharmacyReceipt" ADD COLUMN "medicationNames" TEXT[];

-- Backfill existing rows.
UPDATE "PharmacyReceipt" SET "medicationNames" = ARRAY["medicationName"] WHERE "medicationName" IS NOT NULL;
UPDATE "PharmacyReceipt" SET "medicationNames" = ARRAY[]::TEXT[] WHERE "medicationNames" IS NULL;

-- Now safe to enforce NOT NULL and drop the old column.
ALTER TABLE "PharmacyReceipt" ALTER COLUMN "medicationNames" SET NOT NULL;
ALTER TABLE "PharmacyReceipt" DROP COLUMN "medicationName";
