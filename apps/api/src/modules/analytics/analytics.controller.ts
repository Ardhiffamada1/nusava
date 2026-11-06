import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@commerceos/contracts';

@Roles(UserRole.ADMIN)
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('analytics/overview')
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('analytics/sales-trend')
  async getSalesTrend(@Query('days') days?: string) {
    return this.analyticsService.getSalesTrend(days ? parseInt(days, 10) : 14);
  }

  @Get('reports/export-csv')
  async exportCsv(
    @Query('type') type: 'orders' | 'inventory' | 'products',
    @Res() res: Response,
  ) {
    const csvData = await this.analyticsService.exportCsv(type || 'orders');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=commerceos-${type || 'orders'}-${Date.now()}.csv`);
    return res.send(csvData);
  }
}
