import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { LabOrderDto } from '@zaheri/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { CreateLabReportDto } from './dto/create-lab-report.dto';
import { LabsService } from './labs.service';

/** Lab orders/results — clinician/admin only. Shown to the patient via GET /intake/:id. */
@Controller('cases/:caseId/labs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLINICIAN', 'ADMIN')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Post()
  order(
    @Param('caseId') caseId: string,
    @Body() dto: CreateLabOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LabOrderDto> {
    return this.labsService.order(caseId, dto.testName, user.id);
  }

  @Post(':labOrderId/report')
  report(
    @Param('caseId') caseId: string,
    @Param('labOrderId') labOrderId: string,
    @Body() dto: CreateLabReportDto,
  ): Promise<LabOrderDto> {
    return this.labsService.report(caseId, labOrderId, dto.resultSummary);
  }
}
