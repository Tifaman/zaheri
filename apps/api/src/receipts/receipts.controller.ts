import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PharmacyReceiptDto } from '@zaheri/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { ReceiptsService } from './receipts.service';

/** The doctor issues the receipt — clinician/admin only. */
@Controller('cases/:caseId/receipts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLINICIAN', 'ADMIN')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  issue(
    @Param('caseId') caseId: string,
    @Body() dto: CreateReceiptDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PharmacyReceiptDto> {
    return this.receiptsService.issue(caseId, dto.medicationNames, user.id);
  }
}
