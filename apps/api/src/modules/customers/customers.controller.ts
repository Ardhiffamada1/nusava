import { Controller, Get, Param, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@commerceos/contracts';

@Roles(UserRole.ADMIN)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async getCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.customersService.getCustomers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
  }

  @Get(':id')
  async getCustomer(@Param('id') id: string) {
    return this.customersService.getCustomerById(id);
  }
}
