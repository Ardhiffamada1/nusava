import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddressDto } from '@commerceos/contracts';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefaultShipping: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, dto: AddressDto, isDefaultShipping = false) {
    if (isDefaultShipping) {
      await this.prisma.address.updateMany({
        where: { userId, isDefaultShipping: true },
        data: { isDefaultShipping: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        fullName: dto.fullName,
        phone: dto.phone,
        streetAddress: dto.streetAddress,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country || 'US',
        isDefaultShipping,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, dto: Partial<AddressDto>) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('You cannot modify this address');
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('You cannot delete this address');
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return { success: true, message: 'Address removed successfully' };
  }
}
