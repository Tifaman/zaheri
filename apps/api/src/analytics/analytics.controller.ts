import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FlowMetricsDto, SymptomTrendsDto } from '@zaheri/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsRangeDto } from './dto/analytics-range.dto';
import { AnalyticsService } from './analytics.service';

/** Admin-only analytics — flow metrics and anonymised symptom surveillance. */
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('flow')
  getFlowMetrics(@Query() range: AnalyticsRangeDto): Promise<FlowMetricsDto> {
    return this.analyticsService.getFlowMetrics(range);
  }

  @Get('symptom-trends')
  getSymptomTrends(@Query() range: AnalyticsRangeDto): Promise<SymptomTrendsDto> {
    return this.analyticsService.getSymptomTrends(range);
  }
}
