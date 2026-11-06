import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthUserResponse, AddressDto, AddressDtoSchema } from '@commerceos/contracts';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('addresses')
  async getAddresses(@CurrentUser() user: AuthUserResponse) {
    return this.usersService.getUserAddresses(user.id);
  }

  @Post('addresses')
  @UsePipes(new ZodValidationPipe(AddressDtoSchema))
  async createAddress(
    @CurrentUser() user: AuthUserResponse,
    @Body() dto: AddressDto,
  ) {
    return this.usersService.createAddress(user.id, dto);
  }

  @Put('addresses/:id')
  async updateAddress(
    @CurrentUser() user: AuthUserResponse,
    @Param('id') addressId: string,
    @Body() dto: Partial<AddressDto>,
  ) {
    return this.usersService.updateAddress(user.id, addressId, dto);
  }

  @Delete('addresses/:id')
  async deleteAddress(
    @CurrentUser() user: AuthUserResponse,
    @Param('id') addressId: string,
  ) {
    return this.usersService.deleteAddress(user.id, addressId);
  }
}
