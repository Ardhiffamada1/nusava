import {
  Controller,
  Post,
  Body,
  UsePipes,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CheckoutDto,
  CheckoutDtoSchema,
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
}
