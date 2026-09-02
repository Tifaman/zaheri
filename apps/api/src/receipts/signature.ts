import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Pure HMAC-SHA256 sign/verify over a receipt's own id. No DB, no config —
 * takes the secret as a parameter so unit tests can exercise the mechanics
 * without touching RECEIPT_SIGNING_KEY. A receipt is trustworthy only if
 * this verifies; see ReceiptsService for the enforcement (never honour an
 * unsigned or already-redeemed receipt).
 */
export function signReceiptId(receiptId: string, secret: string): string {
  return createHmac('sha256', secret).update(receiptId).digest('hex');
}

export function verifyReceiptSignature(
  receiptId: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signReceiptId(receiptId, secret);
  const expectedBuf = Buffer.from(expected, 'hex');
  const actualBuf = Buffer.from(signature, 'hex');
  // Constant-time comparison: a length-based short-circuit would already be
  // safe (lengths aren't secret), but comparing equal-length buffers via
  // timingSafeEqual avoids any timing signal on the actual byte contents.
  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }
  return timingSafeEqual(expectedBuf, actualBuf);
}
