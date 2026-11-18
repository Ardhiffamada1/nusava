import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_CATEGORIES, CATALOG_PRODUCTS } from '../../../../lib/catalog-data';
import { getProductOrigin } from '../../../../lib/storefront-helpers';

const USER_COOKIE = 'nusava_session_user';
const CART_COOKIE = 'nusava_cart_v1';
const ORDERS_COOKIE = 'nusava_orders_v1';

interface CookieCartEntry {
  id: string;
  variantId: string;
  quantity: number;
}

function findVariantAndProduct(variantId: string) {
  for (const product of CATALOG_PRODUCTS) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) {
      return { product, variant };
    }
  }
  const fallbackProduct = CATALOG_PRODUCTS[0];
  return { product: fallbackProduct, variant: fallbackProduct.variants[0] };
}

function buildCartResponse(rawEntries: CookieCartEntry[]) {
  const items = rawEntries.map((entry) => {
    const { product, variant } = findVariantAndProduct(entry.variantId);
    const unitPrice = Number(variant.priceOverride || product.basePrice);
    const lineTotal = unitPrice * entry.quantity;
    return {
      id: entry.id,
      variantId: variant.id,
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug,
      variantTitle: variant.title,
      sku: variant.sku,
      unitPrice,
      quantity: entry.quantity,
      lineTotal,
      imageUrl: product.images?.[0]?.url || null,
      maxAvailable: variant.inventory?.quantityOnHand ?? 50,
    };
  });

  const subtotal = items.reduce((acc, it) => acc + it.lineTotal, 0);
  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return {
    id: 'cart-serverless',
    items,
    subtotal,
    itemCount,
  };
}

function getCartFromRequest(req: NextRequest): CookieCartEntry[] {
  try {
    const val = req.cookies.get(CART_COOKIE)?.value;
    if (!val) return [];
    const parsed = JSON.parse(decodeURIComponent(val));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getUserFromRequest(req: NextRequest) {
  try {
    const val = req.cookies.get(USER_COOKIE)?.value;
    if (!val) return null;
    return JSON.parse(decodeURIComponent(val));
  } catch {
    return null;
  }
}

function getOrdersFromRequest(req: NextRequest): any[] {
  try {
    const val = req.cookies.get(ORDERS_COOKIE)?.value;
    if (!val) return [];
    const parsed = JSON.parse(decodeURIComponent(val));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const route = path.join('/');
  const { searchParams } = new URL(req.url);

  // 1. GET /api/v1/categories
  if (route === 'categories') {
    return NextResponse.json(CATALOG_CATEGORIES);
  }

  // 2. GET /api/v1/products
  if (route === 'products') {
    const categorySlug = searchParams.get('category') || '';
    const originQuery = searchParams.get('origin') || '';
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.max(1, Number(searchParams.get('limit') || '20'));

    let filtered = [...CATALOG_PRODUCTS];

    if (categorySlug) {
      filtered = filtered.filter((p) => p.category?.slug === categorySlug);
    }

    if (originQuery) {
      const q = originQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const orig = getProductOrigin(p);
        return (
          orig.city.toLowerCase().includes(q) ||
          orig.badge.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      });
    }

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category?.name.toLowerCase().includes(search)
      );
    }

    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return NextResponse.json({
      items,
      meta: { total, page, limit, totalPages },
    });
  }

  // 3. GET /api/v1/products/:slug
  if (path[0] === 'products' && path[1]) {
    const slugOrId = path[1];
    const found = CATALOG_PRODUCTS.find(
      (p) => p.slug === slugOrId || p.id === slugOrId
    );
    if (!found) {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json(found);
  }

  // 4. GET /api/v1/auth/me
  if (route === 'auth/me') {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(user);
  }

  // 5. GET /api/v1/cart
  if (route === 'cart') {
    const entries = getCartFromRequest(req);
    return NextResponse.json(buildCartResponse(entries));
  }

  // 6. GET /api/v1/users/addresses
  if (route === 'users/addresses') {
    return NextResponse.json([
      {
        id: 'addr-default-1',
        fullName: 'Budi Santoso',
        phone: '081234567890',
        streetAddress: 'Jl. Wijaya II No. 48, Kebayoran Baru',
        city: 'Jakarta Selatan',
        state: 'DKI Jakarta',
        postalCode: '12160',
        country: 'ID',
        isDefaultShipping: true,
      },
    ]);
  }

  // 7. GET /api/v1/orders
  if (route === 'orders') {
    const customOrders = getOrdersFromRequest(req);
    return NextResponse.json({ items: customOrders });
  }

  // 8. GET /api/v1/orders/track/:orderNumber
  if (path[0] === 'orders' && path[1] === 'track' && path[2]) {
    const orderNumber = path[2];
    const customOrders = getOrdersFromRequest(req);
    const found = customOrders.find((o) => o.orderNumber === orderNumber);
    if (found) {
      return NextResponse.json(found);
    }

    const fallbackProduct = CATALOG_PRODUCTS[0];
    return NextResponse.json({
      id: `ord-${orderNumber}`,
      orderNumber,
      status: 'PROCESSING',
      subtotal: 90000,
      shippingCost: 0,
      grandTotal: 90000,
      createdAt: new Date().toISOString(),
      notes: '[Kurir: JNE Express - Reguler]',
      shippingAddress: {
        fullName: 'Budi Santoso',
        phone: '081234567890',
        streetAddress: 'Jl. Wijaya II No. 48, Kebayoran Baru',
        city: 'Jakarta Selatan',
        state: 'DKI Jakarta',
        postalCode: '12160',
      },
      payment: {
        method: 'MANUAL_BANK_TRANSFER',
        status: 'PAID',
      },
      items: [
        {
          id: 'item-1',
          productNameSnapshot: fallbackProduct.title,
          variantSkuSnapshot: fallbackProduct.variants[0].sku,
          unitPriceSnapshot: Number(fallbackProduct.basePrice),
          quantity: 2,
          lineTotal: Number(fallbackProduct.basePrice) * 2,
        },
      ],
    });
  }

  return NextResponse.json({ message: 'Endpoint not found' }, { status: 404 });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const route = path.join('/');
  const body = await req.json().catch(() => ({}));

  // 1. POST /api/v1/auth/register
  if (route === 'auth/register') {
    const user = {
      id: `usr-${Date.now()}`,
      email: body.email || 'member@nusava.id',
      firstName: body.firstName || 'Member',
      lastName: body.lastName || 'NUSAVA',
      role: 'CUSTOMER',
    };
    const res = NextResponse.json({ user });
    res.cookies.set(USER_COOKIE, encodeURIComponent(JSON.stringify(user)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return res;
  }

  // 2. POST /api/v1/auth/login
  if (route === 'auth/login') {
    const email = (body.email || 'customer@commerceos.dev').toLowerCase().trim();
    const isAdmin = email.includes('admin');
    const nameParts = email.split('@')[0].split(/[._-]/);
    const firstName =
      email === 'customer@commerceos.dev'
        ? 'Budi'
        : nameParts[0]
          ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1)
          : 'Budi';
    const lastName =
      email === 'customer@commerceos.dev'
        ? 'Santoso'
        : nameParts[1]
          ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
          : 'Santoso';

    const user = {
      id: isAdmin ? '00000000-0000-4000-8000-000000000001' : '00000000-0000-4000-8000-000000000002',
      email,
      firstName,
      lastName,
      role: isAdmin ? 'ADMIN' : 'CUSTOMER',
    };

    const res = NextResponse.json({ user });
    res.cookies.set(USER_COOKIE, encodeURIComponent(JSON.stringify(user)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return res;
  }

  // 3. POST /api/v1/auth/logout
  if (route === 'auth/logout') {
    const res = NextResponse.json({ success: true });
    res.cookies.delete(USER_COOKIE);
    return res;
  }

  // 4. POST /api/v1/cart/items
  if (route === 'cart/items') {
    const { variantId, quantity = 1 } = body;
    const entries = getCartFromRequest(req);
    const existingIdx = entries.findIndex((e) => e.variantId === variantId);
    if (existingIdx >= 0) {
      entries[existingIdx].quantity += Number(quantity);
    } else {
      entries.push({
        id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        variantId,
        quantity: Number(quantity),
      });
    }

    const cartData = buildCartResponse(entries);
    const res = NextResponse.json(cartData);
    res.cookies.set(CART_COOKIE, encodeURIComponent(JSON.stringify(entries)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return res;
  }

  // 5. POST /api/v1/checkout or /api/v1/checkout/guest
  if (route === 'checkout' || route === 'checkout/guest') {
    const rawItems: Array<{ variantId: string; quantity: number }> = body.items || [];
    const built = buildCartResponse(
      rawItems.map((it, idx) => ({
        id: `ord-item-${idx}`,
        variantId: it.variantId,
        quantity: it.quantity,
      }))
    );

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-20261118-${randomNum}`;
    const addr = body.newAddress || {
      fullName: body.fullName || 'Budi Santoso',
      phone: body.phone || '081234567890',
      streetAddress: body.streetAddress || 'Jl. Wijaya II No. 48',
      city: body.city || 'Jakarta Selatan',
      state: body.state || 'DKI Jakarta',
      postalCode: body.postalCode || '12160',
    };

    const newOrder = {
      id: `order-${Date.now()}`,
      orderNumber,
      status: 'PROCESSING',
      subtotal: built.subtotal,
      shippingCost: built.subtotal >= 150000 ? 0 : 18000,
      grandTotal: built.subtotal + (built.subtotal >= 150000 ? 0 : 18000),
      currency: 'IDR',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      shippingAddress: addr,
      payment: {
        method: body.paymentMethod || 'MANUAL_BANK_TRANSFER',
        status: 'PENDING',
      },
      items: built.items.map((it) => ({
        id: it.id,
        variantId: it.variantId,
        productNameSnapshot: it.productTitle,
        variantSkuSnapshot: it.sku,
        unitPriceSnapshot: it.unitPrice,
        quantity: it.quantity,
        lineTotal: it.lineTotal,
        variant: {
          title: it.variantTitle,
          product: {
            title: it.productTitle,
            slug: it.productSlug,
            images: it.imageUrl ? [{ url: it.imageUrl }] : [],
          },
        },
      })),
    };

    const existingOrders = getOrdersFromRequest(req);
    const updatedOrders = [newOrder, ...existingOrders].slice(0, 10);

    const res = NextResponse.json(newOrder);
    res.cookies.delete(CART_COOKIE);
    res.cookies.set(ORDERS_COOKIE, encodeURIComponent(JSON.stringify(updatedOrders)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return res;
  }

  return NextResponse.json({ message: 'Not supported' }, { status: 400 });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const route = path.join('/');
  const body = await req.json().catch(() => ({}));

  // 1. PATCH /api/v1/cart/items/:id
  if (path[0] === 'cart' && path[1] === 'items' && path[2]) {
    const itemId = path[2];
    const quantity = Number(body.quantity || 1);
    let entries = getCartFromRequest(req);

    if (quantity <= 0) {
      entries = entries.filter((e) => e.id !== itemId);
    } else {
      entries = entries.map((e) => (e.id === itemId ? { ...e, quantity } : e));
    }

    const cartData = buildCartResponse(entries);
    const res = NextResponse.json(cartData);
    res.cookies.set(CART_COOKIE, encodeURIComponent(JSON.stringify(entries)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return res;
  }

  // 2. PATCH /api/v1/users/profile
  if (route === 'users/profile') {
    const current = getUserFromRequest(req) || {
      id: '00000000-0000-4000-8000-000000000002',
      email: 'customer@commerceos.dev',
      role: 'CUSTOMER',
    };
    const updated = {
      ...current,
      firstName: body.firstName ?? current.firstName,
      lastName: body.lastName ?? current.lastName,
    };
    const res = NextResponse.json(updated);
    res.cookies.set(USER_COOKIE, encodeURIComponent(JSON.stringify(updated)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return res;
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const route = path.join('/');

  // 1. DELETE /api/v1/cart/items/:id
  if (path[0] === 'cart' && path[1] === 'items' && path[2]) {
    const itemId = path[2];
    const entries = getCartFromRequest(req).filter((e) => e.id !== itemId);
    const cartData = buildCartResponse(entries);
    const res = NextResponse.json(cartData);
    res.cookies.set(CART_COOKIE, encodeURIComponent(JSON.stringify(entries)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return res;
  }

  // 2. DELETE /api/v1/cart
  if (route === 'cart') {
    const res = NextResponse.json(buildCartResponse([]));
    res.cookies.delete(CART_COOKIE);
    return res;
  }

  return NextResponse.json({ success: true });
}
