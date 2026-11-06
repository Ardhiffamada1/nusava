import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
  Req,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { CartService } from './cart.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  AddToCartDto,
  AddToCartDtoSchema,
  UpdateCartItemDto,
  UpdateCartItemDtoSchema,
  AuthUserResponse,
} from '@commerceos/contracts';

@Public()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private extractGuestSessionId(req: Request, headerSession?: string): string {
    return (
      headerSession ||
      req.cookies?.['guest_session_id'] ||
      'guest-session-anonymous'
    );
  }

  @Get()
  async getCart(
    @CurrentUser() user: AuthUserResponse | null,
    @Headers('x-guest-session-id') guestHeader: string,
    @Req() req: Request,
  ) {
    const guestId = user ? undefined : this.extractGuestSessionId(req, guestHeader);
    return this.cartService.getCart(user?.id, guestId);
  }

  @Post('items')
  @UsePipes(new ZodValidationPipe(AddToCartDtoSchema))
  async addItem(
    @CurrentUser() user: AuthUserResponse | null,
    @Headers('x-guest-session-id') guestHeader: string,
    @Req() req: Request,
    @Body() dto: AddToCartDto,
  ) {
    const guestId = user ? undefined : this.extractGuestSessionId(req, guestHeader);
    return this.cartService.addItem(dto, user?.id, guestId);
  }

  @Patch('items/:id')
  @UsePipes(new ZodValidationPipe(UpdateCartItemDtoSchema))
  async updateItem(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserResponse | null,
    @Headers('x-guest-session-id') guestHeader: string,
    @Req() req: Request,
    @Body() dto: UpdateCartItemDto,
  ) {
    const guestId = user ? undefined : this.extractGuestSessionId(req, guestHeader);
    return this.cartService.updateItem(id, dto, user?.id, guestId);
  }

  @Delete('items/:id')
  async removeItem(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserResponse | null,
    @Headers('x-guest-session-id') guestHeader: string,
    @Req() req: Request,
  ) {
    const guestId = user ? undefined : this.extractGuestSessionId(req, guestHeader);
    return this.cartService.removeItem(id, user?.id, guestId);
  }

  @Post('validate')
  async validateCart(
    @CurrentUser() user: AuthUserResponse | null,
    @Headers('x-guest-session-id') guestHeader: string,
    @Req() req: Request,
  ) {
    const guestId = user ? undefined : this.extractGuestSessionId(req, guestHeader);
    return this.cartService.validateCart(user?.id, guestId);
  }
}
