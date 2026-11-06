import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UsePipes,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateProductDto,
  CreateProductDtoSchema,
  UpdateProductDto,
  ProductQueryDto,
  ProductQuerySchema,
  UserRole,
  AuthUserResponse,
} from '@commerceos/contracts';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ================= CATEGORIES =================
  @Public()
  @Get('categories')
  async getCategories() {
    return this.catalogService.getCategories();
  }

  @Public()
  @Get('categories/:slug')
  async getCategoryBySlug(@Param('slug') slug: string) {
    return this.catalogService.getCategoryBySlug(slug);
  }

  @Roles(UserRole.ADMIN)
  @Post('categories')
  async createCategory(@Body() body: { name: string; slug: string; description?: string; parentId?: string; displayOrder?: number }) {
    return this.catalogService.createCategory(body);
  }

  @Roles(UserRole.ADMIN)
  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string; description?: string; parentId?: string; displayOrder?: number; isActive?: boolean },
  ) {
    return this.catalogService.updateCategory(id, body);
  }

  // ================= PRODUCTS =================
  @Public()
  @Get('products')
  @UsePipes(new ZodValidationPipe(ProductQuerySchema))
  async getProducts(@Query() query: ProductQueryDto) {
    return this.catalogService.getProducts(query);
  }

  @Public()
  @Get('products/:slugOrId')
  async getProduct(@Param('slugOrId') slugOrId: string) {
    return this.catalogService.getProductBySlugOrId(slugOrId);
  }

  @Roles(UserRole.ADMIN)
  @Post('products')
  @UsePipes(new ZodValidationPipe(CreateProductDtoSchema))
  async createProduct(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: AuthUserResponse,
  ) {
    return this.catalogService.createProduct(dto, user.id);
  }

  @Roles(UserRole.ADMIN)
  @Put('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthUserResponse,
  ) {
    return this.catalogService.updateProduct(id, dto, user.id);
  }

  @Roles(UserRole.ADMIN)
  @Delete('products/:id')
  async archiveProduct(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserResponse,
  ) {
    return this.catalogService.archiveProduct(id, user.id);
  }
}
