import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UsePipes,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  OrderStatus,
  UserRole,
  AuthUserResponse,
  UpdateOrderStatusDto,
  UpdateOrderStatusDtoSchema,
  UpdatePaymentStatusDto,
  UpdatePaymentStatusDtoSchema,
} from '@commerceos/contracts';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(
    @CurrentUser() user: AuthUserResponse,
    @Query('status') status?: OrderStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getOrders({
      userId: user.id,
      role: user.role,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Public()
  @Get('public/:orderNumber')
  async getPublicOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByNumber(orderNumber);
  }

  @Public()
  @Post('public/:orderNumber/confirm-payment')
  async confirmPayment(
    @Param('orderNumber') orderNumber: string,
    @Body('transactionReference') transactionReference?: string,
  ) {
    return this.ordersService.confirmDemoPayment(orderNumber, transactionReference);
  }

  @Get(':id')
  async getOrder(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserResponse,
  ) {
    return this.ordersService.getOrderById(id, user.id, user.role);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @UsePipes(new ZodValidationPipe(UpdateOrderStatusDtoSchema))
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthUserResponse,
  ) {
    return this.ordersService.updateOrderStatus(id, dto, user.id);
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserResponse,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(id, user.id, user.role, reason);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/payment')
  @UsePipes(new ZodValidationPipe(UpdatePaymentStatusDtoSchema))
  async updatePayment(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
    @CurrentUser() user: AuthUserResponse,
  ) {
    return this.ordersService.updatePaymentStatus(id, dto, user.id);
  }
}
