import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CaseDto } from '@zaheri/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { RouteCaseDto } from './dto/route-case.dto';
import { CasesService } from './cases.service';

/** Doctor console API — clinician/admin only. */
@Controller('cases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLINICIAN', 'ADMIN')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  findAll(): Promise<CaseDto[]> {
    return this.casesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CaseDto> {
    return this.casesService.findOne(id);
  }

  @Post(':id/route')
  route(
    @Param('id') id: string,
    @Body() dto: RouteCaseDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CaseDto> {
    return this.casesService.route(id, dto.disposition, user.id);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string): Promise<CaseDto> {
    return this.casesService.complete(id);
  }
}
