import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IntakeDto, PatientCaseDto } from '@zaheri/types';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { IntakeService } from './intake.service';

/**
 * Patient-facing intake submission and status lookup. Deliberately
 * unauthenticated — patients don't log in (see CLAUDE.md); the intake id is
 * the capability. Clinician reads/routing live under /cases
 * (cases.controller.ts), behind JwtAuthGuard + RolesGuard.
 */
@Controller('intake')
export class IntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @Post()
  create(@Body() dto: CreateIntakeDto): Promise<IntakeDto> {
    return this.intakeService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PatientCaseDto> {
    return this.intakeService.findPatientView(id);
  }
}
