import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_CATEGORIES, CATALOG_PRODUCTS } from '../../../../lib/catalog-data';

const DEMO_ORDERS = [
  {
    id: 'ord-admin-1',
    orderNumber: 'ORD-20261118-8812',
    status: 'DELIVERED',
    subtotal: 165000,
    shippingCost: 0,
    taxTotal: 0,
    grandTotal: 165000,
    currency: 'IDR',
    createdAt: '2026-11-17T10:15:00.000Z',
    notes: '[Kurir: JNE Express - Reguler] Titipkan ke pos satpam cluster.',
    user: {
      id: 'usr-1',
      email: 'customer@commerceos.dev',
      firstName: 'Budi',
      lastName: 'Santoso',
    },
    shippingAddress: {
      fullName: 'Budi Santoso',
      phone: '081234567890',
      streetAddress: 'Jl. Wijaya II No. 48, Kebayoran Baru',
      city: 'Jakarta Selatan',
      state: 'DKI Jakarta',
      postalCode: '12160',
      country: 'ID',
    },
    payment: {
      id: 'pay-1',
      method: 'MANUAL_BANK_TRANSFER',
      status: 'PAID',
      amount: 165000,
      transactionReference: 'BCA-VA-8730192819',
      paidAt: '2026-11-17T10:18:00.000Z',
    },
    items: [
      {
        id: 'oi-1',
        productNameSnapshot: 'Bakpia Kukus Tugu Jogja Original',
        variantSkuSnapshot: 'BKTJ-COK-10',
        unitPriceSnapshot: 45000,
        quantity: 2,
        lineTotal: 90000,
      },
      {
        id: 'oi-2',
        productNameSnapshot: 'Kopi Arabika Gayo Aceh Single Origin 250g',
        variantSkuSnapshot: 'KGA-FIN-250',
        unitPriceSnapshot: 75000,
        quantity: 1,
        lineTotal: 75000,
      },
    ],
  },
  {
    id: 'ord-admin-2',
    orderNumber: 'ORD-20261118-9214',
    status: 'PROCESSING',
    subtotal: 170000,
    shippingCost: 0,
    taxTotal: 0,
    grandTotal: 170000,
    currency: 'IDR',
    createdAt: '2026-11-18T03:40:00.000Z',
    notes: '[Kurir: SiCepat Ekspres - BEST] Mohon dibungkus bubble wrap tebal.',
    user: {
      id: 'usr-1',
      email: 'customer@commerceos.dev',
      firstName: 'Budi',
      lastName: 'Santoso',
    },
    shippingAddress: {
      fullName: 'Budi Santoso',
      phone: '081234567890',
      streetAddress: 'Jl. Wijaya II No. 48, Kebayoran Baru',
      city: 'Jakarta Selatan',
      state: 'DKI Jakarta',
      postalCode: '12160',
      country: 'ID',
    },
    payment: {
      id: 'pay-2',
      method: 'MANUAL_BANK_TRANSFER',
      status: 'PAID',
      amount: 170000,
      transactionReference: 'QRIS-ID202609182910',
      paidAt: '2026-11-18T03:42:00.000Z',
    },
    items: [
      {
        id: 'oi-3',
        productNameSnapshot: 'Sambal Bu Rudy Khas Surabaya Set 3 Varian',
        variantSkuSnapshot: 'SBR-SET-3',
        unitPriceSnapshot: 85000,
        quantity: 2,
        lineTotal: 170000,
      },
    ],
  },
  {
    id: 'ord-admin-3',
    orderNumber: 'ORD-20261118-9501',
    status: 'SHIPPED',
    subtotal: 280000,
    shippingCost: 0,
    taxTotal: 0,
    grandTotal: 280000,
    currency: 'IDR',
    createdAt: '2026-11-18T05:10:00.000Z',
    notes: '[Kurir: J&T Express - EZ Regular]',
    user: {
      id: 'usr-2',
      email: 'siti.aminah@contoh.id',
      firstName: 'Siti',
      lastName: 'Aminah',
    },
    shippingAddress: {
      fullName: 'Siti Aminah',
      phone: '082198765432',
      streetAddress: 'Jl. Riau No. 88, Citarum, Kec. Bandung Wetan',
      city: 'Kota Bandung',
      state: 'Jawa Barat',
      postalCode: '40115',
      country: 'ID',
    },
    payment: {
      id: 'pay-3',
      method: 'CASH_ON_DELIVERY',
      status: 'PAID',
      amount: 280000,
      transactionReference: 'COD-JNT-882910',
      paidAt: '2026-11-18T05:12:00.000Z',
    },
    items: [
      {
        id: 'oi-4',
        productNameSnapshot: 'Kain Batik Tulis Motif Parang Khas Solo',
        variantSkuSnapshot: 'BTS-PRS-24',
        unitPriceSnapshot: 280000,
        quantity: 1,
        lineTotal: 280000,
      },
    ],
  },
];

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const route = path.join('/');
  const { searchParams } = new URL(req.url);

  // 1. GET /api/v1/analytics/overview
  if (route === 'analytics/overview') {
    return NextResponse.json({
      totalRevenue: 14635000,
      totalOrders: 131,
      averageOrderValue: 111717,
      lowStockCount: 2,
      recentOrders: DEMO_ORDERS,
    });
  }

  // 2. GET /api/v1/categories
  if (route === 'categories') {
    return NextResponse.json(CATALOG_CATEGORIES);
  }

  // 3. GET /api/v1/products
  if (route === 'products') {
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const limit = Math.max(1, Number(searchParams.get('limit') || '50'));
    let filtered = [...CATALOG_PRODUCTS];
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }
    return NextResponse.json({
      items: filtered.slice(0, limit),
      meta: {
        total: filtered.length,
        page: 1,
        limit,
        totalPages: 1,
      },
    });
  }

  // 4. GET /api/v1/orders
  if (route === 'orders') {
    const statusFilter = searchParams.get('status') || '';
    const filtered = statusFilter
      ? DEMO_ORDERS.filter((o) => o.status === statusFilter)
      : DEMO_ORDERS;
    return NextResponse.json({
      items: filtered,
      meta: {
        total: filtered.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }

  // 5. GET /api/v1/orders/:id
  if (path[0] === 'orders' && path[1]) {
    const found = DEMO_ORDERS.find((o) => o.id === path[1]) || DEMO_ORDERS[0];
    return NextResponse.json(found);
  }

  // 6. GET /api/v1/inventory
  if (route === 'inventory') {
    const allVariants: any[] = [];
    CATALOG_PRODUCTS.forEach((p) => {
      p.variants.forEach((v) => {
        allVariants.push({
          id: `inv-${v.id}`,
          variantId: v.id,
          quantityOnHand: v.inventory.quantityOnHand,
          reservedQuantity: 0,
          safetyStockLevel: v.inventory.safetyStockLevel,
          updatedAt: p.updatedAt,
          variant: {
            id: v.id,
            sku: v.sku,
            title: v.title,
            product: {
              id: p.id,
              title: p.title,
              slug: p.slug,
            },
          },
        });
      });
    });

    return NextResponse.json({
      items: allVariants,
      meta: { total: allVariants.length, page: 1, limit: 100, totalPages: 1 },
    });
  }

  // 7. GET /api/v1/inventory/movements
  if (route === 'inventory/movements') {
    return NextResponse.json({
      items: [
        {
          id: 'mov-1',
          quantityDelta: -2,
          balanceAfter: 63,
          reason: 'ORDER_PLACED',
          notes: 'Pesanan #ORD-20261118-8812',
          createdAt: '2026-11-17T10:15:00.000Z',
          inventory: {
            variant: {
              sku: 'BKTJ-COK-10',
              title: 'Rasa Cokelat Lumer (10 pcs)',
              product: { title: 'Bakpia Kukus Tugu Jogja Original' },
            },
          },
        },
      ],
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });
  }

  // 8. GET /api/v1/customers
  if (route === 'customers') {
    const customers = [
      {
        id: 'usr-1',
        email: 'customer@commerceos.dev',
        firstName: 'Budi',
        lastName: 'Santoso',
        createdAt: '2026-11-01T08:00:00.000Z',
        totalOrders: 2,
        totalSpent: 335000,
        orders: DEMO_ORDERS.slice(0, 2),
      },
      {
        id: 'usr-2',
        email: 'siti.aminah@contoh.id',
        firstName: 'Siti',
        lastName: 'Aminah',
        createdAt: '2026-11-05T09:30:00.000Z',
        totalOrders: 1,
        totalSpent: 280000,
        orders: [DEMO_ORDERS[2]],
      },
    ];
    return NextResponse.json({
      items: customers,
      meta: { total: customers.length, page: 1, limit: 50, totalPages: 1 },
    });
  }

  if (path[0] === 'customers' && path[1]) {
    return NextResponse.json({
      id: 'usr-1',
      email: 'customer@commerceos.dev',
      firstName: 'Budi',
      lastName: 'Santoso',
      createdAt: '2026-11-01T08:00:00.000Z',
      orders: DEMO_ORDERS.slice(0, 2),
      addresses: [DEMO_ORDERS[0].shippingAddress],
    });
  }

  // 9. GET /api/v1/audit-logs
  if (route === 'audit-logs') {
    return NextResponse.json({
      items: [
        {
          id: 'aud-1',
          action: 'ORDER_STATUS_UPDATED',
          entityType: 'Order',
          entityId: 'ORD-20261118-8812',
          createdAt: '2026-11-18T04:00:00.000Z',
          user: { email: 'admin@commerceos.dev', firstName: 'Bambang', lastName: 'Suryono' },
        },
      ],
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });
  }

  // 10. GET /api/v1/reports/export-csv
  if (route === 'reports/export-csv') {
    const csv =
      'OrderNumber,Customer,Status,GrandTotal,Date\nORD-20261118-8812,Budi Santoso,DELIVERED,165000,2026-11-17\nORD-20261118-9214,Budi Santoso,PROCESSING,170000,2026-11-18\nORD-20261118-9501,Siti Aminah,SHIPPED,280000,2026-11-18';
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="nusava-revenue-report.csv"',
      },
    });
  }

  return NextResponse.json({ items: [], meta: { total: 0 } });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    user: {
      id: '00000000-0000-4000-8000-000000000001',
      email: body.email || 'admin@commerceos.dev',
      firstName: 'Bambang',
      lastName: 'Suryono',
      role: 'ADMIN',
    },
    success: true,
  });
}

export async function PATCH() {
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
