import {
  Controller,
  Post,
  Body,
  UsePipes,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CheckoutDto,
  CheckoutDtoSchema,
  GuestCheckoutDto,
  GuestCheckoutDtoSchema,
  AuthUserResponse,
} from '@commerceos/contracts';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CheckoutDtoSchema))
  async checkout(
    @CurrentUser() user: AuthUserResponse,
    @Body() dto: CheckoutDto,
  ) {
    return this.checkoutService.checkout(user.id, dto);
  }

  @Public()
  @Post('guest')
  @UsePipes(new ZodValidationPipe(GuestCheckoutDtoSchema))
  async guestCheckout(@Body() dto: GuestCheckoutDto) {
    return this.checkoutService.guestCheckout(dto);
  }
}
