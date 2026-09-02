import { Module } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller';
import { ReceiptVerificationController } from './receipt-verification.controller';
import { ReceiptsService } from './receipts.service';

@Module({
  controllers: [ReceiptsController, ReceiptVerificationController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
