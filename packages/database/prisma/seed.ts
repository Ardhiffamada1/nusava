import { PrismaClient, UserRole, ProductStatus, OrderStatus, PaymentMethod, PaymentStatus, StockMovementReason } from '../src';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CommerceOS database...');

  // Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned old records.');

  // Password hashes
  const salt = 10;
  const adminPasswordHash = await bcrypt.hash('Admin12345!', salt);
  const customerPasswordHash = await bcrypt.hash('Customer12345!', salt);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@commerceos.dev',
      passwordHash: adminPasswordHash,
      firstName: 'Alex',
      lastName: 'Vance',
      role: UserRole.ADMIN,
    },
  });

  // 2. Create Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@commerceos.dev',
      passwordHash: customerPasswordHash,
      firstName: 'Elena',
      lastName: 'Rostova',
      role: UserRole.CUSTOMER,
      cart: { create: {} },
      addresses: {
        create: {
          fullName: 'Elena Rostova',
          phone: '+1 555-019-2831',
          streetAddress: '742 Evergreen Terrace',
          city: 'Portland',
          state: 'OR',
          postalCode: '97201',
          country: 'US',
          isDefaultShipping: true,
          isDefaultBilling: true,
        },
      },
    },
    include: { addresses: true },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'marcus.chen@example.com',
      passwordHash: customerPasswordHash,
      firstName: 'Marcus',
      lastName: 'Chen',
      role: UserRole.CUSTOMER,
      cart: { create: {} },
      addresses: {
        create: {
          fullName: 'Marcus Chen',
          phone: '+1 415-882-9012',
          streetAddress: '450 Mission Street, Suite 1200',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'US',
          isDefaultShipping: true,
          isDefaultBilling: true,
        },
      },
    },
    include: { addresses: true },
  });

  console.log('Created Admin and Customer accounts.');

  // 3. Create Categories
  const apparel = await prisma.category.create({
    data: {
      name: 'Apparel',
      slug: 'apparel',
      description: 'Understated silhouettes tailored from Japanese and Italian fabrics.',
      displayOrder: 1,
    },
  });

  const leatherGoods = await prisma.category.create({
    data: {
      name: 'Leather Goods',
      slug: 'leather-goods',
      description: 'Vegetable-tanned full-grain leather essentials made to age gracefully.',
      displayOrder: 2,
    },
  });

  const workspace = await prisma.category.create({
    data: {
      name: 'Workspace',
      slug: 'workspace',
      description: 'Machined aluminum, solid walnut, and tactile desktop objects.',
      displayOrder: 3,
    },
  });

  const audio = await prisma.category.create({
    data: {
      name: 'Audio',
      slug: 'audio',
      description: 'Precision acoustics, tuned drivers, and monolithic industrial design.',
      displayOrder: 4,
    },
  });

  const objects = await prisma.category.create({
    data: {
      name: 'Living & Ceramics',
      slug: 'living-ceramics',
      description: 'Tactile stoneware, hand-poured candle vessels, and sculptural homeware.',
      displayOrder: 5,
    },
  });

  console.log('Created Categories.');

  // 4. Products Data (32 distinct, high-craft editorial products)
  const productsData = [
    // Apparel
    {
      category: apparel.id,
      title: 'Heavyweight Raw Denim Jacket',
      slug: 'heavyweight-raw-denim-jacket',
      description: '14.5oz Japanese selvedge denim woven on vintage Toyoda shuttle looms. Unwashed and rigid, tailored to develop bespoke patina with wear.',
      basePrice: 285.0,
      image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'DEN-JCK-S', title: 'Small / Indigo', priceOverride: 285.0, attributes: { size: 'S', color: 'Indigo' }, stock: 12 },
        { sku: 'DEN-JCK-M', title: 'Medium / Indigo', priceOverride: 285.0, attributes: { size: 'M', color: 'Indigo' }, stock: 18 },
        { sku: 'DEN-JCK-L', title: 'Large / Indigo', priceOverride: 285.0, attributes: { size: 'L', color: 'Indigo' }, stock: 4 }, // low stock
      ],
    },
    {
      category: apparel.id,
      title: 'Merino Wool Mockneck Sweater',
      slug: 'merino-wool-mockneck-sweater',
      description: 'Superfine 19.5-micron extrafine merino wool from Zegna Baruffa. Naturally temperature-regulating and silky against the skin.',
      basePrice: 195.0,
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'MRN-MCK-BLK-M', title: 'Medium / Charcoal Black', priceOverride: 195.0, attributes: { size: 'M', color: 'Charcoal Black' }, stock: 25 },
        { sku: 'MRN-MCK-BLK-L', title: 'Large / Charcoal Black', priceOverride: 195.0, attributes: { size: 'L', color: 'Charcoal Black' }, stock: 15 },
        { sku: 'MRN-MCK-OAT-M', title: 'Medium / Oat', priceOverride: 195.0, attributes: { size: 'M', color: 'Oat' }, stock: 8 },
      ],
    },
    {
      category: apparel.id,
      title: 'Relaxed Tailored Wool Trouser',
      slug: 'relaxed-tailored-wool-trouser',
      description: 'Pleated high-rise trousers cut from 100% tropical wool. Internal waistband curtain, horn buttons, and clean drape.',
      basePrice: 220.0,
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'TRS-WOL-30', title: 'Size 30 / Olive', priceOverride: 220.0, attributes: { waist: '30', color: 'Olive' }, stock: 10 },
        { sku: 'TRS-WOL-32', title: 'Size 32 / Olive', priceOverride: 220.0, attributes: { waist: '32', color: 'Olive' }, stock: 14 },
        { sku: 'TRS-WOL-34', title: 'Size 34 / Olive', priceOverride: 220.0, attributes: { waist: '34', color: 'Olive' }, stock: 3 }, // low stock
      ],
    },
    {
      category: apparel.id,
      title: 'Heavyweight Boxy Crewneck Tee',
      slug: 'heavyweight-boxy-crewneck-tee',
      description: '280 GSM combed organic cotton jersey with reinforced binding. Drop-shoulder cut designed for longevity.',
      basePrice: 65.0,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'TEE-WHT-S', title: 'Small / Chalk White', priceOverride: 65.0, attributes: { size: 'S', color: 'Chalk White' }, stock: 40 },
        { sku: 'TEE-WHT-M', title: 'Medium / Chalk White', priceOverride: 65.0, attributes: { size: 'M', color: 'Chalk White' }, stock: 35 },
        { sku: 'TEE-WHT-L', title: 'Large / Chalk White', priceOverride: 65.0, attributes: { size: 'L', color: 'Chalk White' }, stock: 22 },
        { sku: 'TEE-BLK-M', title: 'Medium / Ink Black', priceOverride: 65.0, attributes: { size: 'M', color: 'Ink Black' }, stock: 50 },
      ],
    },
    {
      category: apparel.id,
      title: 'Structured Canvas Chore Coat',
      slug: 'structured-canvas-chore-coat',
      description: 'Tough 12oz duck canvas with triple-needle stitching and copper shank hardware. Three patch pockets and inner chest pocket.',
      basePrice: 240.0,
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'CHR-CAN-TAN-M', title: 'Medium / British Tan', priceOverride: 240.0, attributes: { size: 'M', color: 'British Tan' }, stock: 15 },
        { sku: 'CHR-CAN-TAN-L', title: 'Large / British Tan', priceOverride: 240.0, attributes: { size: 'L', color: 'British Tan' }, stock: 11 },
      ],
    },
    {
      category: apparel.id,
      title: 'Fine Poplin Buttondown Shirt',
      slug: 'fine-poplin-buttondown-shirt',
      description: '100s 2-ply Egyptian cotton poplin with a mother-of-pearl button closure and soft rolled collar roll.',
      basePrice: 145.0,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'SHR-POP-SKY-S', title: 'Small / Sky Blue', priceOverride: 145.0, attributes: { size: 'S', color: 'Sky Blue' }, stock: 19 },
        { sku: 'SHR-POP-SKY-M', title: 'Medium / Sky Blue', priceOverride: 145.0, attributes: { size: 'M', color: 'Sky Blue' }, stock: 21 },
      ],
    },

    // Leather Goods
    {
      category: leatherGoods.id,
      title: 'Minimalist Bifold Cardholder',
      slug: 'minimalist-bifold-cardholder',
      description: 'Full-grain Tuscan bridle leather saddle-stitched with waxed linen thread. Holds 8 cards and folded currency with zero bulk.',
      basePrice: 85.0,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'LTH-CRD-BLK', title: 'Onyx Black', priceOverride: 85.0, attributes: { color: 'Onyx Black' }, stock: 30 },
        { sku: 'LTH-CRD-COGNAC', title: 'Cognac Brown', priceOverride: 85.0, attributes: { color: 'Cognac Brown' }, stock: 2 }, // low stock alert
      ],
    },
    {
      category: leatherGoods.id,
      title: 'Structured Leather Briefcase',
      slug: 'structured-leather-briefcase',
      description: 'Architectural silhouette engineered to accommodate a 16-inch laptop. Solid brass hardware with brushed nickel finish.',
      basePrice: 620.0,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'LTH-BRF-ESP', title: 'Espresso', priceOverride: 620.0, attributes: { color: 'Espresso' }, stock: 8 },
        { sku: 'LTH-BRF-BLK', title: 'Matte Black', priceOverride: 620.0, attributes: { color: 'Matte Black' }, stock: 12 },
      ],
    },
    {
      category: leatherGoods.id,
      title: 'Weekender Duffle Bag',
      slug: 'weekender-duffle-bag',
      description: 'Heavy duty military-grade 18oz canvas body flanked by 3mm harness leather straps and YKK Excella zippers.',
      basePrice: 450.0,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'BAG-WKD-OLV', title: 'Olive & Tan', priceOverride: 450.0, attributes: { color: 'Olive/Tan' }, stock: 9 },
      ],
    },
    {
      category: leatherGoods.id,
      title: 'Beveled Edge Leather Belt',
      slug: 'beveled-edge-leather-belt',
      description: 'Single piece of 10oz English bridle leather with hand-burnished edges and a sand-cast solid brass buckle.',
      basePrice: 110.0,
      image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'BLT-32-BLK', title: 'Size 32 / Black', priceOverride: 110.0, attributes: { size: '32', color: 'Black' }, stock: 15 },
        { sku: 'BLT-34-BLK', title: 'Size 34 / Black', priceOverride: 110.0, attributes: { size: '34', color: 'Black' }, stock: 18 },
        { sku: 'BLT-36-BLK', title: 'Size 36 / Black', priceOverride: 110.0, attributes: { size: '36', color: 'Black' }, stock: 7 },
      ],
    },
    {
      category: leatherGoods.id,
      title: 'Passport Folio & Travel Wallet',
      slug: 'passport-folio-travel-wallet',
      description: 'Engineered for seamless transit. Dedicated slots for passport, boarding cards, pen, and SIM ejector tool.',
      basePrice: 125.0,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'LTH-TRV-COGNAC', title: 'Cognac', priceOverride: 125.0, attributes: { color: 'Cognac' }, stock: 14 },
      ],
    },

    // Workspace
    {
      category: workspace.id,
      title: 'Precision Machined Desk Pad',
      slug: 'precision-machined-desk-pad',
      description: 'Micro-textured matte vegan leather surface bonded to an anti-slip natural cork base. Optimized for optical sensors.',
      basePrice: 75.0,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'DSK-PAD-GRY', title: 'Slate Grey / 90x40cm', priceOverride: 75.0, attributes: { size: 'Large', color: 'Slate Grey' }, stock: 45 },
        { sku: 'DSK-PAD-BLK', title: 'Midnight Black / 90x40cm', priceOverride: 75.0, attributes: { size: 'Large', color: 'Midnight Black' }, stock: 50 },
      ],
    },
    {
      category: workspace.id,
      title: 'Solid Walnut Monitor Riser',
      slug: 'solid-walnut-monitor-riser',
      description: 'Continuous grain American black walnut shelf elevated on CNC-machined 6061 bead-blasted aluminum feet.',
      basePrice: 160.0,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'DSK-RSR-WLN', title: 'American Walnut', priceOverride: 160.0, attributes: { wood: 'Walnut' }, stock: 16 },
        { sku: 'DSK-RSR-OAK', title: 'White Oak', priceOverride: 160.0, attributes: { wood: 'Oak' }, stock: 11 },
      ],
    },
    {
      category: workspace.id,
      title: 'Rotary Aluminum Desk Dial',
      slug: 'rotary-aluminum-desk-dial',
      description: 'Weighted rotary control knob for volume, track scrubber, and precision workflow switching with tactile magnetic haptics.',
      basePrice: 135.0,
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'ROT-DIL-SLV', title: 'Anodized Silver', priceOverride: 135.0, attributes: { finish: 'Silver' }, stock: 22 },
        { sku: 'ROT-DIL-BLK', title: 'Space Grey', priceOverride: 135.0, attributes: { finish: 'Space Grey' }, stock: 18 },
      ],
    },
    {
      category: workspace.id,
      title: 'Magnetic Cable Management Block',
      slug: 'magnetic-cable-management-block',
      description: 'Solid billet brass block holding braided cables firmly anchored via internal neodymium magnetic collars.',
      basePrice: 55.0,
      image: 'https://images.unsplash.com/photo-1595303526913-c7037797ebe7?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'MAG-CBL-BRS', title: 'Raw Brass', priceOverride: 55.0, attributes: { material: 'Brass' }, stock: 28 },
      ],
    },
    {
      category: workspace.id,
      title: 'Mechanical Number Pad',
      slug: 'mechanical-number-pad',
      description: 'Gasket-mounted mechanical keypad with Lubed Gateron Oil King linear switches, PBT dye-sub keycaps, and USB-C connectivity.',
      basePrice: 115.0,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'KBD-NUM-WHT', title: 'Retro Beige', priceOverride: 115.0, attributes: { color: 'Retro Beige' }, stock: 19 },
      ],
    },
    {
      category: workspace.id,
      title: 'Architectural Task Lamp',
      slug: 'architectural-task-lamp',
      description: 'Balanced arm desk lamp with high-CRI (98+) flicker-free illumination and stepless touch-sensitive dimmer.',
      basePrice: 290.0,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'LMP-TSK-BLK', title: 'Matte Charcoal', priceOverride: 290.0, attributes: { color: 'Matte Charcoal' }, stock: 8 },
      ],
    },

    // Audio
    {
      category: audio.id,
      title: 'Monolithic Active Bookshelf Monitors',
      slug: 'monolithic-active-bookshelf-monitors',
      description: 'Pair of bi-amplified studio speakers with 5.25-inch woven Kevlar woofers and silk dome tweeters. Balanced XLR & Optical inputs.',
      basePrice: 480.0,
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'AUD-MNR-MATTE', title: 'Matte Black (Pair)', priceOverride: 480.0, attributes: { finish: 'Matte Black' }, stock: 10 },
        { sku: 'AUD-MNR-WHT', title: 'Arctic White (Pair)', priceOverride: 480.0, attributes: { finish: 'Arctic White' }, stock: 5 },
      ],
    },
    {
      category: audio.id,
      title: 'Planar Magnetic Over-Ear Headphones',
      slug: 'planar-magnetic-over-ear-headphones',
      description: 'Open-back audiophile headphones featuring ultra-thin 90mm planar transducers, genuine lambskin pads, and CNC milled aluminum yokes.',
      basePrice: 590.0,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'AUD-HDP-PLN', title: 'Gunmetal & Black', priceOverride: 590.0, attributes: { color: 'Gunmetal' }, stock: 12 },
      ],
    },
    {
      category: audio.id,
      title: 'Portable Solid Aluminum Bluetooth Speaker',
      slug: 'portable-solid-aluminum-bluetooth-speaker',
      description: 'Machined from an extruded unibody aluminum block with IPX7 water resistance and 24-hour battery reserve.',
      basePrice: 195.0,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'AUD-SPK-SLV', title: 'Raw Silver', priceOverride: 195.0, attributes: { finish: 'Silver' }, stock: 24 },
        { sku: 'AUD-SPK-BLK', title: 'Anodized Black', priceOverride: 195.0, attributes: { finish: 'Black' }, stock: 19 },
      ],
    },
    {
      category: audio.id,
      title: 'True Wireless Earphones with ANC',
      slug: 'true-wireless-earphones-with-anc',
      description: 'Dual hybrid drivers with active noise cancellation, transparency mode, and a sandblasted charging capsule.',
      basePrice: 220.0,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'AUD-EAR-BLK', title: 'Graphite', priceOverride: 220.0, attributes: { color: 'Graphite' }, stock: 35 },
      ],
    },
    {
      category: audio.id,
      title: 'Cast Iron Headphone Stand',
      slug: 'cast-iron-headphone-stand',
      description: 'Heavy 1.8kg cast iron pedestal with vegetable-tanned leather headrest cushion to prevent band deformation.',
      basePrice: 85.0,
      image: 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'AUD-STD-IRN', title: 'Raw Cast Iron', priceOverride: 85.0, attributes: { finish: 'Cast Iron' }, stock: 30 },
      ],
    },

    // Living & Ceramics
    {
      category: objects.id,
      title: 'Stoneware Pour-Over Dripper & Carafe',
      slug: 'stoneware-pour-over-dripper-carafe',
      description: 'Wheel-thrown Japanese Hasami clay coffee server with a ribbed dripper designed for precise extraction flow rates.',
      basePrice: 95.0,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'CRM-COF-ASH', title: 'Ash Glaze / 600ml', priceOverride: 95.0, attributes: { glaze: 'Ash Glaze' }, stock: 18 },
        { sku: 'CRM-COF-MATTE', title: 'Matte Chalk / 600ml', priceOverride: 95.0, attributes: { glaze: 'Matte Chalk' }, stock: 14 },
      ],
    },
    {
      category: objects.id,
      title: 'Hand-Poured Soy Wax Scented Candle',
      slug: 'hand-poured-soy-wax-scented-candle',
      description: 'Notes of Hinoki cedar, smoky vetiver, and black pepper. Poured into a reusable matte black ceramic vessel.',
      basePrice: 48.0,
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'CDL-HNK-300G', title: 'Hinoki & Cedar / 300g', priceOverride: 48.0, attributes: { scent: 'Hinoki' }, stock: 45 },
        { sku: 'CDL-VTV-300G', title: 'Smoked Vetiver / 300g', priceOverride: 48.0, attributes: { scent: 'Vetiver' }, stock: 38 },
      ],
    },
    {
      category: objects.id,
      title: 'Cast Bronze Incense Burner',
      slug: 'cast-bronze-incense-burner',
      description: 'Solid lost-wax cast bronze receptacle designed to collect ash cleanly from traditional Japanese bamboo-core sticks.',
      basePrice: 110.0,
      image: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'BRZ-INC-RAW', title: 'Unlacquered Bronze', priceOverride: 110.0, attributes: { material: 'Bronze' }, stock: 15 },
      ],
    },
    {
      category: objects.id,
      title: 'Brushed Stainless Water Pitcher',
      slug: 'brushed-stainless-water-pitcher',
      description: 'Double-walled insulated 18/8 stainless steel carafe with drip-free pouring spout and internal ice guard.',
      basePrice: 80.0,
      image: 'https://images.unsplash.com/photo-1577741314755-048d8525d31e?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'KTC-PTC-15L', title: '1.5 Liters / Brushed Steel', priceOverride: 80.0, attributes: { capacity: '1.5L' }, stock: 22 },
      ],
    },
    {
      category: objects.id,
      title: 'Minimalist Wall Clock in Slate',
      slug: 'minimalist-wall-clock-in-slate',
      description: 'Natural quarried slate disc dial with brushed brass silent sweep hands and German quartz movement.',
      basePrice: 165.0,
      image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'CLK-SLT-30CM', title: '30cm Diameter / Dark Slate', priceOverride: 165.0, attributes: { diameter: '30cm' }, stock: 12 },
      ],
    },
    {
      category: objects.id,
      title: 'Woven Linen Throw Blanket',
      slug: 'woven-linen-throw-blanket',
      description: 'Stone-washed European flax linen throw with subtle eyelash fringes. Pre-shrunk and exceptionally breathable.',
      basePrice: 130.0,
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'LNN-TRW-OAT', title: 'Oatmeal / 140x200cm', priceOverride: 130.0, attributes: { color: 'Oatmeal' }, stock: 17 },
      ],
    },
    {
      category: objects.id,
      title: 'Concrete Planter Vessel',
      slug: 'concrete-planter-vessel',
      description: 'Hand-cast architectural concrete pot with internal drainage saucer and rubber protective pads.',
      basePrice: 55.0,
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'PLT-CNC-MED', title: 'Medium / Basalt Grey', priceOverride: 55.0, attributes: { size: 'Medium' }, stock: 26 },
      ],
    },
    {
      category: objects.id,
      title: 'Solid Brass Tray',
      slug: 'solid-brass-tray',
      description: 'Spun solid brass catchall tray for keys, daily carry objects, or cocktail glassware. Left unlacquered.',
      basePrice: 70.0,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'TRY-BRS-20', title: '20cm Diameter / Spun Brass', priceOverride: 70.0, attributes: { size: '20cm' }, stock: 20 },
      ],
    },
    {
      category: objects.id,
      title: 'Tactile Ceramic Espresso Cups (Set of 2)',
      slug: 'tactile-ceramic-espresso-cups-set-of-2',
      description: 'Unglazed textured exterior with gloss glazed interior rim. Holds 80ml of espresso with optimum crema retention.',
      basePrice: 42.0,
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
      variants: [
        { sku: 'CRM-ESP-SET2', title: 'Charcoal Stoneware / Pair', priceOverride: 42.0, attributes: { set: '2 cups' }, stock: 35 },
      ],
    },
  ];

  console.log(`Inserting ${productsData.length} products with variants and stock ledger records...`);

  const createdVariants: { id: string; price: number; name: string; sku: string }[] = [];

  for (const item of productsData) {
    const product = await prisma.product.create({
      data: {
        categoryId: item.category,
        title: item.title,
        slug: item.slug,
        description: item.description,
        basePrice: item.basePrice,
        status: ProductStatus.ACTIVE,
        images: {
          create: {
            url: item.image,
            altText: item.title,
            displayOrder: 0,
            isThumbnail: true,
          },
        },
      },
    });

    for (const v of item.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          title: v.title,
          priceOverride: v.priceOverride,
          attributes: v.attributes,
          inventory: {
            create: {
              quantityOnHand: v.stock,
              reservedQuantity: 0,
              safetyStockLevel: 5,
            },
          },
        },
        include: { inventory: true },
      });

      if (variant.inventory) {
        await prisma.stockMovement.create({
          data: {
            inventoryId: variant.inventory.id,
            actorId: admin.id,
            quantityDelta: v.stock,
            balanceAfter: v.stock,
            reason: StockMovementReason.INITIAL,
            notes: 'Initial warehouse opening inventory balance',
          },
        });
      }

      createdVariants.push({
        id: variant.id,
        price: v.priceOverride || item.basePrice,
        name: product.title,
        sku: v.sku,
      });
    }
  }

  console.log(`Generated ${createdVariants.length} total product variants.`);

  // 5. Create Realistic Historical Demo Orders
  const sampleAddress = customer1.addresses[0];

  // Order 1: Delivered order
  const order1VariantA = createdVariants[0]; // Raw Denim Jacket
  const order1VariantB = createdVariants[8]; // Bifold Cardholder
  const order1Subtotal = order1VariantA.price * 1 + order1VariantB.price * 1;
  const order1GrandTotal = order1Subtotal + 15.0; // $15 shipping

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-1001',
      userId: customer1.id,
      shippingAddressId: sampleAddress.id,
      status: OrderStatus.DELIVERED,
      subtotal: order1Subtotal,
      shippingCost: 15.0,
      taxTotal: 0.0,
      grandTotal: order1GrandTotal,
      currency: 'USD',
      notes: 'Please leave at front porch.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      items: {
        create: [
          {
            variantId: order1VariantA.id,
            productNameSnapshot: order1VariantA.name,
            variantSkuSnapshot: order1VariantA.sku,
            unitPriceSnapshot: order1VariantA.price,
            quantity: 1,
            lineTotal: order1VariantA.price,
          },
          {
            variantId: order1VariantB.id,
            productNameSnapshot: order1VariantB.name,
            variantSkuSnapshot: order1VariantB.sku,
            unitPriceSnapshot: order1VariantB.price,
            quantity: 1,
            lineTotal: order1VariantB.price,
          },
        ],
      },
      payment: {
        create: {
          method: PaymentMethod.MANUAL_BANK_TRANSFER,
          status: PaymentStatus.PAID,
          amount: order1GrandTotal,
          transactionReference: 'WIRE-TX-984128',
          paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
        },
      },
    },
  });

  // Order 2: Processing order
  const order2Variant = createdVariants[12]; // Precision Desk Pad
  const order2Subtotal = order2Variant.price * 2;
  const order2GrandTotal = order2Subtotal + 0.0; // free shipping

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-1002',
      userId: customer2.id,
      shippingAddressId: customer2.addresses[0].id,
      status: OrderStatus.PROCESSING,
      subtotal: order2Subtotal,
      shippingCost: 0.0,
      taxTotal: 0.0,
      grandTotal: order2GrandTotal,
      currency: 'USD',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      items: {
        create: [
          {
            variantId: order2Variant.id,
            productNameSnapshot: order2Variant.name,
            variantSkuSnapshot: order2Variant.sku,
            unitPriceSnapshot: order2Variant.price,
            quantity: 2,
            lineTotal: order2Subtotal,
          },
        ],
      },
      payment: {
        create: {
          method: PaymentMethod.CASH_ON_DELIVERY,
          status: PaymentStatus.PENDING,
          amount: order2GrandTotal,
        },
      },
    },
  });

  console.log(`Generated demo orders: ${order1.orderNumber}, ${order2.orderNumber}`);
  console.log('CommerceOS Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
