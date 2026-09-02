import { signReceiptId, verifyReceiptSignature } from './signature';

const SECRET = 'dev-only-test-secret';

describe('signReceiptId / verifyReceiptSignature', () => {
  it('verifies a signature produced by the matching secret', () => {
    const id = 'receipt-1';
    const signature = signReceiptId(id, SECRET);

    expect(verifyReceiptSignature(id, signature, SECRET)).toBe(true);
  });

  it('rejects a signature for a different receipt id (tampering)', () => {
    const signature = signReceiptId('receipt-1', SECRET);

    expect(verifyReceiptSignature('receipt-2', signature, SECRET)).toBe(false);
  });

  it('rejects a signature produced with a different secret', () => {
    const id = 'receipt-1';
    const signature = signReceiptId(id, 'wrong-secret');

    expect(verifyReceiptSignature(id, signature, SECRET)).toBe(false);
  });

  it('rejects a garbled/non-hex signature without throwing', () => {
    expect(() => verifyReceiptSignature('receipt-1', 'not-a-real-signature', SECRET)).not.toThrow();
    expect(verifyReceiptSignature('receipt-1', 'not-a-real-signature', SECRET)).toBe(false);
  });

  it('rejects an empty signature', () => {
    expect(verifyReceiptSignature('receipt-1', '', SECRET)).toBe(false);
  });

  it('produces deterministic signatures for the same id and secret', () => {
    const a = signReceiptId('receipt-1', SECRET);
    const b = signReceiptId('receipt-1', SECRET);
    expect(a).toBe(b);
  });
});
