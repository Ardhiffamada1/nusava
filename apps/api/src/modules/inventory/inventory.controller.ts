import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UsePipes,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  StockAdjustmentDto,
  StockAdjustmentDtoSchema,
  UserRole,
  AuthUserResponse,
} from '@commerceos/contracts';

@Roles(UserRole.ADMIN)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getInventory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('lowStockOnly') lowStockOnly?: string,
  ) {
    return this.inventoryService.getInventory({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      lowStockOnly: lowStockOnly === 'true',
    });
  }

  @Post('adjust')
  @UsePipes(new ZodValidationPipe(StockAdjustmentDtoSchema))
  async adjustStock(
    @Body() dto: StockAdjustmentDto,
    @CurrentUser() user: AuthUserResponse,
  ) {
    return this.inventoryService.adjustStock(dto, user.id);
  }

  @Get('movements')
  async getMovements(
    @Query('variantId') variantId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getMovements({
      variantId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }
}
