/**
 * Only two states, by design: a receipt is either still redeemable or
 * already used. See apps/api's ReceiptsService — never honour an unsigned
 * or already-REDEEMED receipt.
 */
export const RECEIPT_STATUSES = ['ISSUED', 'REDEEMED'] as const;
export type ReceiptStatus = (typeof RECEIPT_STATUSES)[number];

/** One receipt covers every medication issued in a visit — one QR, one signature. */
export interface CreateReceiptRequest {
  medicationNames: string[];
}

/** Exactly what the QR code encodes — the pharmacy scan posts this back verbatim. */
export interface VerifyReceiptRequest {
  id: string;
  signature: string;
}

export interface VerifyReceiptResponse {
  valid: boolean;
  alreadyRedeemed?: boolean;
  medicationNames?: string[];
  registrationNumber?: string;
  message: string;
}

export interface PharmacyReceiptDto {
  id: string;
  medicationNames: string[];
  status: ReceiptStatus;
  /** Data URL (PNG) — encodes { id, signature }, i.e. VerifyReceiptRequest. */
  qrCodeDataUrl: string;
  issuedAt: string;
  redeemedAt: string | null;
}
