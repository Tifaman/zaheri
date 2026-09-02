import { Body, Controller, Post } from '@nestjs/common';
import { VerifyReceiptResponse } from '@zaheri/types';
import { VerifyReceiptDto } from './dto/verify-receipt.dto';
import { ReceiptsService } from './receipts.service';

/**
 * Public by design — the pharmacy scans the patient's QR and posts back
 * exactly what it encodes. See ReceiptsService.verify for why this doesn't
 * need its own auth: the signed id/signature pair IS the credential.
 */
@Controller('receipts')
export class ReceiptVerificationController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post('verify')
  verify(@Body() dto: VerifyReceiptDto): Promise<VerifyReceiptResponse> {
    return this.receiptsService.verify(dto.id, dto.signature);
  }
}
