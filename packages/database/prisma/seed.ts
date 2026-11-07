import { PrismaClient, UserRole, ProductStatus, OrderStatus, PaymentMethod, PaymentStatus, StockMovementReason } from '../src';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CommerceOS Indonesian Oleh-oleh database...');

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
      firstName: 'Bambang',
      lastName: 'Suryono',
      role: UserRole.ADMIN,
    },
  });

  // 2. Create Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@commerceos.dev',
      passwordHash: customerPasswordHash,
      firstName: 'Budi',
      lastName: 'Santoso',
      role: UserRole.CUSTOMER,
      cart: { create: {} },
      addresses: {
        create: {
          fullName: 'Budi Santoso',
          phone: '081234567890',
          streetAddress: 'Jl. Malioboro No. 45, RT 02/RW 03, Sosromenduran',
          city: 'Kota Yogyakarta',
          state: 'DI Yogyakarta',
          postalCode: '55271',
          country: 'ID',
          isDefaultShipping: true,
          isDefaultBilling: true,
        },
      },
    },
    include: { addresses: true },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'siti.aminah@contoh.id',
      passwordHash: customerPasswordHash,
      firstName: 'Siti',
      lastName: 'Aminah',
      role: UserRole.CUSTOMER,
      cart: { create: {} },
      addresses: {
        create: {
          fullName: 'Siti Aminah',
          phone: '082198765432',
          streetAddress: 'Jl. Riau No. 88, Citarum, Kec. Bandung Wetan',
          city: 'Kota Bandung',
          state: 'Jawa Barat',
          postalCode: '40115',
          country: 'ID',
          isDefaultShipping: true,
          isDefaultBilling: true,
        },
      },
    },
    include: { addresses: true },
  });

  console.log('Created Admin and Indonesian Customer accounts.');

  // 3. Create Categories
  const catKudapan = await prisma.category.create({
    data: {
      name: 'Kudapan & Makanan Khas',
      slug: 'kudapan-khas',
      description: 'Aneka kudapan lezat, bolu, bakpia, dan keripik gurih khas berbagai daerah di Indonesia.',
    },
  });

  const catKopi = await prisma.category.create({
    data: {
      name: 'Kopi & Minuman Tradisional',
      slug: 'kopi-minuman',
      description: 'Biji kopi single origin Nusantara, wedang herbal, dan sirup buah segar khas daerah.',
    },
  });

  const catBatik = await prisma.category.create({
    data: {
      name: 'Batik & Wastra Nusantara',
      slug: 'batik-wastra',
      description: 'Kain batik tulis otentik, tenun ikat tradisional, dan songket pusaka warisan budaya.',
    },
  });

  const catKriya = await prisma.category.create({
    data: {
      name: 'Kriya & Kerajinan Kayu/Gerabah',
      slug: 'kriya-kerajinan',
      description: 'Peralatan makan kayu jati food-grade, anyaman rotan, dan kerajinan gerabah tanah liat.',
    },
  });

  const catSambal = await prisma.category.create({
    data: {
      name: 'Sambal & Bumbu Dapur Tradisional',
      slug: 'sambal-bumbu',
      description: 'Sambal ulek khas daerah, rendang siap santap, abon sapi gurih, dan terasi udang rebon asli.',
    },
  });

  console.log('Created Indonesian categories.');

  // Helper product creator
  type ProductSeedInput = {
    title: string;
    slug: string;
    description: string;
    categoryId: string;
    basePrice: number;
    images: string[];
    variants: Array<{
      title: string;
      sku: string;
      priceOverride?: number;
      attributes: Record<string, string>;
      stock: number;
    }>;
  };

  const seedProducts: ProductSeedInput[] = [
    // --- KUDAPAN & MAKANAN KHAS ---
    {
      title: 'Bakpia Kukus Tugu Jogja Original',
      slug: 'bakpia-kukus-tugu-jogja',
      description: 'Kudapan khas Yogyakarta bertekstur lembut dengan isian pasta cokelat dan keju melimpah yang lumer di mulut. Isi 10 pcs per kotak.',
      categoryId: catKudapan.id,
      basePrice: 45000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/2/27/Bakpia_pathuk.jpg',
      ],
      variants: [
        { title: 'Rasa Cokelat Lumer (10 pcs)', sku: 'BKTJ-COK-10', attributes: { rasa: 'Cokelat', isi: '10 pcs' }, stock: 65 },
        { title: 'Rasa Keju Gurih (10 pcs)', sku: 'BKTJ-KEJ-10', attributes: { rasa: 'Keju', isi: '10 pcs' }, stock: 50 },
        { title: 'Rasa Kacang Merah (10 pcs)', sku: 'BKTJ-KCR-10', attributes: { rasa: 'Kacang Merah', isi: '10 pcs' }, stock: 40 },
      ],
    },
    {
      title: 'Bakpia Pathok 25 Khas Yogyakarta Asli',
      slug: 'bakpia-pathok-25-jogja',
      description: 'Bakpia legendaris basah dan kering khas Pathuk Jogja. Dibuat fresh setiap hari dengan resep tradisional sejak 1948. Isi 15 pcs.',
      categoryId: catKudapan.id,
      basePrice: 55000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/3/3c/Bakpia_pathok.jpg',
      ],
      variants: [
        { title: 'Kacang Hijau Klasik (Isi 15)', sku: 'BP25-KCH-15', attributes: { varian: 'Kacang Hijau', kemasan: 'Kotak' }, stock: 80 },
        { title: 'Keju Special (Isi 15)', sku: 'BP25-KEJ-15', priceOverride: 60000, attributes: { varian: 'Keju', kemasan: 'Kotak' }, stock: 45 },
        { title: 'Cokelat Manis (Isi 15)', sku: 'BP25-COK-15', attributes: { varian: 'Cokelat', kemasan: 'Kotak' }, stock: 55 },
      ],
    },
    {
      title: 'Bika Ambon Zulaikha Khas Medan Asli',
      slug: 'bika-ambon-zulaikha-medan',
      description: 'Kue basah bersarang kenyal dan harum daun jeruk purut asli dari Jl. Mojopahit Medan. Tanpa bahan pengawet buatan.',
      categoryId: catKudapan.id,
      basePrice: 85000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/4/43/Kue_bika_ambon.JPG',
      ],
      variants: [
        { title: 'Rasa Original Pandan (Besar)', sku: 'BAZ-ORI-L', attributes: { rasa: 'Pandan Original', ukuran: 'Besar' }, stock: 35 },
        { title: 'Rasa Keju Gurih (Besar)', sku: 'BAZ-KEJ-L', priceOverride: 90000, attributes: { rasa: 'Keju', ukuran: 'Besar' }, stock: 30 },
      ],
    },
    {
      title: 'Bolu Gulung Meranti Medan Special Keju',
      slug: 'bolu-gulung-meranti-medan',
      description: 'Bolu gulung terpopuler se-Kota Medan dengan parutan keju cheddar melimpah ruah di luar dan dalam kue.',
      categoryId: catKudapan.id,
      basePrice: 95000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/a/a4/Bolu_Gulung_Semarang.JPG',
      ],
      variants: [
        { title: 'Bolu Gulung Standard Keju', sku: 'BGM-STD-KEJ', attributes: { rasa: 'Keju', varian: 'Standard' }, stock: 40 },
        { title: 'Bolu Gulung Double Keju Spesial', sku: 'BGM-DBL-KEJ', priceOverride: 110000, attributes: { rasa: 'Double Keju', varian: 'Spesial' }, stock: 25 },
        { title: 'Bolu Gulung Rasa Moka Meses', sku: 'BGM-STD-MOK', attributes: { rasa: 'Moka Meses', varian: 'Standard' }, stock: 30 },
      ],
    },
    {
      title: 'Lapis Talas Sangkuriang Khas Bogor',
      slug: 'lapis-talas-sangkuriang-bogor',
      description: 'Kue lapis berbahan dasar talas asli Bogor dengan taburan keju gurih di atasnya. Tekstur sangat lembut dan wangi.',
      categoryId: catKudapan.id,
      basePrice: 42000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/2/25/Lapis_Legit_Pontianak.jpg',
      ],
      variants: [
        { title: 'Original Keju (500g)', sku: 'LTS-ORI-500', attributes: { rasa: 'Original Keju', berat: '500g' }, stock: 75 },
        { title: 'Full Talas Keju (500g)', sku: 'LTS-FUL-500', attributes: { rasa: 'Full Talas Keju', berat: '500g' }, stock: 60 },
        { title: 'Chocovilla Keju (500g)', sku: 'LTS-CHO-500', attributes: { rasa: 'Chocovilla', berat: '500g' }, stock: 50 },
      ],
    },
    {
      title: 'Lapis Legit Wisman Batavia Premium',
      slug: 'lapis-legit-wisman-batavia',
      description: 'Lapis legit panggang selapis demi selapis menggunakan 100% mentega Wijsman Belanda asli, telur segar, dan rempah spekuk harum.',
      categoryId: catKudapan.id,
      basePrice: 185000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/5/5f/Spekkoek_naturel_en_pandan.jpg',
      ],
      variants: [
        { title: 'Ukuran 20x10 cm (Original Spekuk)', sku: 'LLW-ORI-2010', attributes: { ukuran: '20x10 cm', varian: 'Spekuk' }, stock: 20 },
        { title: 'Ukuran 20x10 cm (Prunes Plum)', sku: 'LLW-PRU-2010', priceOverride: 210000, attributes: { ukuran: '20x10 cm', varian: 'Prunes' }, stock: 15 },
      ],
    },
    {
      title: 'Keripik Tempe Rohani Sanan Khas Malang',
      slug: 'keripik-tempe-rohani-malang',
      description: 'Keripik tempe renyah gurih khas kampung Sanan Malang. Diiris tipis dengan balutan tepung rempah bawang putih sedap. Netto 250g.',
      categoryId: catKudapan.id,
      basePrice: 28000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/2/2a/Keripik_tempe_Lombok.JPG',
      ],
      categoryId: catKudapan.id,
      basePrice: 28000,
      images: [
        'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Rasa Original Bawang (250g)', sku: 'KTR-ORI-250', attributes: { rasa: 'Original Bawang', berat: '250g' }, stock: 120 },
        { title: 'Rasa Pedas Manis (250g)', sku: 'KTR-PDS-250', attributes: { rasa: 'Pedas Manis', berat: '250g' }, stock: 90 },
        { title: 'Rasa Daun Jeruk (250g)', sku: 'KTR-DNJ-250', attributes: { rasa: 'Daun Jeruk', berat: '250g' }, stock: 85 },
      ],
    },
    {
      title: 'Keripik Apel Manalagi Asli Batu Malang',
      slug: 'keripik-apel-manalagi-batu',
      description: 'Keripik buah apel segar dari lereng Gunung Panderman Batu Malang yang digoreng vacuum frying tanpa pemanis buatan. Netto 100g.',
      categoryId: catKudapan.id,
      basePrice: 25000,
      images: [
        'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Kemasan Stand Up Pouch 100g', sku: 'KAM-PCH-100', attributes: { berat: '100g', kemasan: 'Pouch' }, stock: 110 },
        { title: 'Kemasan Paket Hemat 250g', sku: 'KAM-PCH-250', priceOverride: 55000, attributes: { berat: '250g', kemasan: 'Pouch' }, stock: 70 },
      ],
    },
    {
      title: 'Pie Susu Dhian Khas Bali Asli (Isi 50 Pcs)',
      slug: 'pie-susu-dhian-bali-50',
      description: 'Oleh-oleh wajib pulau dewata Bali. Pinggiran pastry renyah gurih dengan fla susu vanila legit yang harum. Isi 50 keping higienis.',
      categoryId: catKudapan.id,
      basePrice: 80000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/e/e3/Pie_Susu_Top_View.jpg',
      ],
      variants: [
        { title: 'Isi 50 pcs Rasa Original Susu', sku: 'PSD-ORI-50', attributes: { rasa: 'Original Susu', isi: '50 pcs' }, stock: 85 },
        { title: 'Isi 50 pcs Rasa Cokelat', sku: 'PSD-COK-50', attributes: { rasa: 'Cokelat', isi: '50 pcs' }, stock: 60 },
        { title: 'Isi 50 pcs Rasa Keju', sku: 'PSD-KEJ-50', priceOverride: 85000, attributes: { rasa: 'Keju', isi: '50 pcs' }, stock: 55 },
      ],
    },
    {
      title: 'Kacang Disco Tari Bali Cap Dewata',
      slug: 'kacang-disco-tari-bali',
      description: 'Kacang tanah pilihan dibalut adonan rempah tepung krispi pedas gurih. Renyah tahan lama dan cocok sebagai camilan keluarga. Netto 400g.',
      categoryId: catKudapan.id,
      basePrice: 38000,
      images: [
        'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Rasa Original Bawang (400g)', sku: 'KDT-ORI-400', attributes: { rasa: 'Original', berat: '400g' }, stock: 95 },
        { title: 'Rasa Ekstra Pedas (400g)', sku: 'KDT-PDS-400', attributes: { rasa: 'Pedas', berat: '400g' }, stock: 80 },
      ],
    },
    {
      title: 'Dodol Picnic Garut Klasik Aneka Rasa',
      slug: 'dodol-picnic-garut-klasik',
      description: 'Dodol Garut legendaris warisan sejak 1949 dengan tekstur kenyal legit berbahan gula aren murni, beras ketan, dan santan kelapa pilihan.',
      categoryId: catKudapan.id,
      basePrice: 35000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/f/f9/Dodol_Garut_Cihampelas_Bandung.JPG',
      ],
      variants: [
        { title: 'Kotak Klasik Campur 500g', sku: 'DPG-MIX-500', attributes: { rasa: 'Campur Aneka Rasa', berat: '500g' }, stock: 100 },
        { title: 'Kotak Rasa Wijen 500g', sku: 'DPG-WIJ-500', attributes: { rasa: 'Wijen', berat: '500g' }, stock: 65 },
      ],
    },
    {
      title: 'Amplang Kuku Macan Ikan Tenggiri Samarinda',
      slug: 'amplang-kuku-macan-samarinda',
      description: 'Kerupuk amplang khas Kalimantan Timur terbuat dari 100% daging ikan tenggiri segar Sungai Mahakam. Renyah, gurih, dan tidak amis.',
      categoryId: catKudapan.id,
      basePrice: 48000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/9/9f/Amplang_from_Kotabaru%2C_South_Kalimantan_2015-05-23_02.jpg',
      ],
      variants: [
        { title: 'Kemasan Plastik Tebal 250g', sku: 'AKM-TNG-250', attributes: { bahan: 'Ikan Tenggiri', berat: '250g' }, stock: 70 },
        { title: 'Kemasan Dus Oleh-oleh 500g', sku: 'AKM-TNG-500', priceOverride: 90000, attributes: { bahan: 'Ikan Tenggiri', berat: '500g' }, stock: 40 },
      ],
    },
    {
      title: 'Brownies Panggang Prima Rasa Bandung',
      slug: 'brownies-panggang-prima-rasa-bandung',
      description: 'Brownies panggang renyah berkerak shiny crust di atas dan fudgy cokelat pekat di dalam. Oleh-oleh legendaris Jl. Kemuning Bandung.',
      categoryId: catKudapan.id,
      basePrice: 70000,
      images: [
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Brownies Panggang Almond', sku: 'BPR-ALM-1', attributes: { topping: 'Almond', jenis: 'Panggang' }, stock: 50 },
        { title: 'Brownies Panggang Tiramisu Keju', sku: 'BPR-TIR-1', priceOverride: 75000, attributes: { topping: 'Keju Tiramisu', jenis: 'Panggang' }, stock: 40 },
      ],
    },
    {
      title: 'Pempek Candy Palembang Paket Komplit 25 Pcs',
      slug: 'pempek-candy-palembang-25',
      description: 'Paket pempek asli Palembang vacuum pack beku: 10 kapal selam kecil, 5 lenjer kecil, 5 adaan, 5 kulit, lengkap dengan Cuko Palembang sedap pedas.',
      categoryId: catKudapan.id,
      basePrice: 165000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/c/c2/Pempek_campur.JPG',
      ],
      variants: [
        { title: 'Paket Campur 25 Pcs + Cuko 500ml', sku: 'PCP-CMP-25', attributes: { isi: '25 Pcs', cuko: 'Pedas Sedang' }, stock: 45 },
        { title: 'Paket Campur 25 Pcs Cuko Ekstra Pedas', sku: 'PCP-PDS-25', attributes: { isi: '25 Pcs', cuko: 'Ekstra Pedas' }, stock: 35 },
      ],
    },
    {
      title: 'Otak-otak Ikan Tenggiri Bakar Bangka Belitung',
      slug: 'otak-otak-ikan-tenggiri-bangka',
      description: 'Otak-otak bakar daun pisang asli Bangka dari ikan tenggiri segar. Lengkap dengan sambal tauco dan sambal terasi asam pedas khas.',
      categoryId: catKudapan.id,
      basePrice: 65000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/1/10/Otak-otak_Jakarta.JPG',
      ],
      variants: [
        { title: 'Isi 10 Pcs Vacuum + 2 Sambal Khas', sku: 'OOB-TNG-10', attributes: { isi: '10 pcs', kemasan: 'Frozen Vacuum' }, stock: 40 },
        { title: 'Isi 20 Pcs Vacuum + 2 Sambal Khas', sku: 'OOB-TNG-20', priceOverride: 125000, attributes: { isi: '20 pcs', kemasan: 'Frozen Vacuum' }, stock: 30 },
      ],
    },

    // --- KOPI & MINUMAN TRADISIONAL ---
    {
      title: 'Kopi Arabika Gayo Aceh Single Origin 250g',
      slug: 'kopi-arabika-gayo-aceh',
      description: 'Biji kopi arabika organik ditanam di dataran tinggi Takengon Aceh Tengah (1.400 mdpl). Notes karamel manis, acidity seimbang, dan aroma rempah harum.',
      categoryId: catKopi.id,
      basePrice: 75000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/a/a5/Biji_Kopi.jpg',
      ],
      variants: [
        { title: 'Biji Kopi Sangrai (Whole Bean) 250g', sku: 'KGA-WHL-250', attributes: { bentuk: 'Biji Kopi Utuh', berat: '250g' }, stock: 90 },
        { title: 'Bubuk Halus (Fine Grind) 250g', sku: 'KGA-FIN-250', attributes: { bentuk: 'Bubuk Halus', berat: '250g' }, stock: 85 },
        { title: 'Bubuk Sedang (Medium Grind) 250g', sku: 'KGA-MED-250', attributes: { bentuk: 'Bubuk Sedang (V60)', berat: '250g' }, stock: 70 },
      ],
    },
    {
      title: 'Kopi Toraja Kalosi Sulawesi Grade 1 250g',
      slug: 'kopi-toraja-kalosi-250g',
      description: 'Kopi arabika dataran tinggi Toraja Kalosi Sulawesi Selatan. Karakter full body mantap dengan aroma herbal rempah dan dark chocolate note.',
      categoryId: catKopi.id,
      basePrice: 80000,
      images: [
        'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Biji Kopi Sangrai (Whole Bean) 250g', sku: 'KTK-WHL-250', attributes: { bentuk: 'Biji Utuh', berat: '250g' }, stock: 75 },
        { title: 'Bubuk Medium (Medium Grind) 250g', sku: 'KTK-MED-250', attributes: { bentuk: 'Bubuk Sedang', berat: '250g' }, stock: 65 },
      ],
    },
    {
      title: 'Kopi Robusta Lampung Tanggamus 250g',
      slug: 'kopi-robusta-lampung-tanggamus',
      description: 'Kopi robusta petik merah dari kaki Gunung Tanggamus Lampung. Tingkat kepekatan kental beraroma cokelat panggang alami tanpa rasa asam.',
      categoryId: catKopi.id,
      basePrice: 45000,
      images: [
        'https://images.unsplash.com/photo-1559525839-8f8ec320b924?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Bubuk Halus Khas Tubruk 250g', sku: 'KRL-TBR-250', attributes: { bentuk: 'Bubuk Halus', berat: '250g' }, stock: 100 },
        { title: 'Biji Kopi Sangrai Medium Dark 250g', sku: 'KRL-WHL-250', attributes: { bentuk: 'Biji Utuh', berat: '250g' }, stock: 80 },
      ],
    },
    {
      title: 'Sirup Markisa Asli Brastagi Noerlen Medan',
      slug: 'sirup-markisa-brastagi-noerlen',
      description: 'Sirup buah markisa murni dari perkebunan Brastagi Tanah Karo. Kental manis segar alami tanpa pewarna dan pengawet kimia. Botol kaca 1000ml.',
      categoryId: catKopi.id,
      basePrice: 65000,
      images: [
        'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Botol Kaca Segel 1000ml', sku: 'SMN-BTL-1000', attributes: { kemasan: 'Botol 1 Liter', varian: 'Markisa Asli' }, stock: 55 },
        { title: 'Paket Hemat 2 Botol (2000ml)', sku: 'SMN-PKT-2000', priceOverride: 120000, attributes: { kemasan: '2 Botol', varian: 'Markisa Asli' }, stock: 30 },
      ],
    },
    {
      title: 'Wedang Uwuh Asli Imogiri Jogja (Isi 10 Pcs)',
      slug: 'wedang-uwuh-asli-imogiri',
      description: 'Minuman herbal rempah khas raja-raja Mataram Yogyakarta: kayu secang merah, cengkeh, kayu manis, jahe kering, dan gula batu kristal.',
      categoryId: catKopi.id,
      basePrice: 25000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/7/76/Wedang_Uwuh_Jawa.jpg',
      ],
      variants: [
        { title: 'Paket Isi 10 Kantong Seduh Komplit', sku: 'WUI-PKT-10', attributes: { isi: '10 Pcs', gula: 'Termasuk Gula Batu' }, stock: 150 },
        { title: 'Paket Jumbo Isi 25 Kantong Seduh', sku: 'WUI-PKT-25', priceOverride: 55000, attributes: { isi: '25 Pcs', gula: 'Termasuk Gula Batu' }, stock: 90 },
      ],
    },

    // --- BATIK & WASTRA NUSANTARA ---
    {
      title: 'Kain Batik Tulis Motif Parang Khas Solo',
      slug: 'kain-batik-tulis-parang-solo',
      description: 'Kain batik tulis canting malam asli karya pengrajin Laweyan Solo di atas mori katun primissima super halus. Ukuran 2.4 x 1.15 meter.',
      categoryId: catBatik.id,
      basePrice: 280000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/f/f5/Batik_pedalaman_-_parang_klithik.JPG',
      ],
      variants: [
        { title: 'Motif Parang Rusak Cokelat Sogan (2.4m)', sku: 'BTS-PRS-24', attributes: { motif: 'Parang Rusak', warna: 'Cokelat Sogan' }, stock: 20 },
        { title: 'Motif Parang Barong Hitam Klasik (2.4m)', sku: 'BTS-PRB-24', priceOverride: 310000, attributes: { motif: 'Parang Barong', warna: 'Hitam Emas' }, stock: 15 },
      ],
    },
    {
      title: 'Kain Tenun Ikat Asli Troso Jepara Tradisional',
      slug: 'kain-tenun-ikat-troso-jepara',
      description: 'Kain tenun ATBM (Alat Tenun Bukan Mesin) asli dari desa Troso Jepara. Ditenun helai demi helai menggunakan benang katun combed berkualitas tinggi.',
      categoryId: catBatik.id,
      basePrice: 195000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/3/3c/Tenun_Ikat_Lombok.JPG',
      ],
      variants: [
        { title: 'Motif Etnik Dayak Merah Marun (2.2m)', sku: 'TIT-ETN-MRH', attributes: { motif: 'Etnik Dayak', warna: 'Marun' }, stock: 25 },
        { title: 'Motif Toraja Biru Navy (2.2m)', sku: 'TIT-TOR-BRU', attributes: { motif: 'Toraja', warna: 'Navy' }, stock: 20 },
      ],
    },
    {
      title: 'Kain Songket Tradisional Khas Palembang',
      slug: 'kain-songket-tradisional-palembang',
      description: 'Kain songket tenun tangan benang tembaga berlapis emas khas Palembang. Berkarakter megah dan biasa digunakan pada upacara adat kebesaran.',
      categoryId: catBatik.id,
      basePrice: 350000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/d/de/Melestarikan_Songket_Palembang.jpg',
      ],
      variants: [
        { title: 'Set Kain + Selendang Songket Merah Emas', sku: 'SKP-ST-MRH', attributes: { warna: 'Merah Emas', set: 'Kain + Selendang' }, stock: 12 },
        { title: 'Set Kain + Selendang Songket Hijau Zamrud', sku: 'SKP-ST-HJU', attributes: { warna: 'Hijau Zamrud', set: 'Kain + Selendang' }, stock: 10 },
      ],
    },
    {
      title: 'Sarung Sutra Sengkang Tenun Wajo Sulawesi',
      slug: 'sarung-sutra-sengkang-wajo',
      description: 'Sarung sutra asli dari kota sutra Sengkang Kabupaten Wajo Sulawesi Selatan. Berkilau alami, lembut dan sejuk dipakai sepanjang hari.',
      categoryId: catBatik.id,
      basePrice: 220000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/3/38/Tenun_Ikat_Kodi%2C_SBD%2C_NTT.jpg',
      ],
      variants: [
        { title: 'Motif Lagosi Tradisional Hitam Emas', sku: 'SSW-LAG-01', attributes: { motif: 'Lagosi', warna: 'Hitam Emas' }, stock: 18 },
        { title: 'Motif Kotak Bugis Marun', sku: 'SSW-KTK-02', attributes: { motif: 'Kotak Bugis', warna: 'Marun' }, stock: 16 },
      ],
    },

    // --- KRIYA & KERAJINAN KAYU/GERABAH ---
    {
      title: 'Piring Kayu Jati Jepara Food Grade Set Isi 3',
      slug: 'piring-kayu-jati-jepara-set',
      description: 'Satu set piring makan berbahan 100% kayu jati solid TPK Perhutani Jepara. Finishing natural beeswax bersertifikasi food-grade aman untuk santapan.',
      categoryId: catKriya.id,
      basePrice: 95000,
      images: [
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584365685547-9a5fb6f3a70c?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Set 3 Piring Diameter 20cm Natural Teak', sku: 'PKJ-SET-20', attributes: { diameter: '20 cm', isi: '3 pcs' }, stock: 45 },
        { title: 'Set 3 Piring Diameter 25cm Natural Teak', sku: 'PKJ-SET-25', priceOverride: 135000, attributes: { diameter: '25 cm', isi: '3 pcs' }, stock: 30 },
      ],
    },
    {
      title: 'Cangkir Gerabah Tanah Liat Kasongan Bantul',
      slug: 'cangkir-gerabah-tanah-liat-kasongan',
      description: 'Cangkir tembikar tradisional buatan tangan pengrajin desa wisata Kasongan Yogyakarta. Memberikan sensasi minum teh tubruk yang lebih nikmat dan wangi.',
      categoryId: catKriya.id,
      basePrice: 45000,
      images: [
        'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Set Cangkir + Tatakan + Tutup Tanah Liat', sku: 'CGK-SET-01', attributes: { isi: 'Cangkir + Tatakan + Tutup', bahan: 'Terracotta' }, stock: 60 },
        { title: 'Teko Gerabah Mini 500ml', sku: 'CGK-TEK-500', priceOverride: 65000, attributes: { isi: 'Teko 500ml', bahan: 'Terracotta' }, stock: 40 },
      ],
    },
    {
      title: 'Tas Anyaman Rotan Bulat Khas Lombok',
      slug: 'tas-anyaman-rotan-bulat-lombok',
      description: 'Tas selempang anyaman rotan bulat ata asli buatan pengrajin desa Beleka Lombok Tengah. Tali kulit sapi asli dengan lapisan kain batik di bagian dalam.',
      categoryId: catKriya.id,
      basePrice: 120000,
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Diameter 20cm Motif Polos Bintang', sku: 'TRL-PLS-20', attributes: { diameter: '20 cm', motif: 'Bintang' }, stock: 35 },
        { title: 'Diameter 20cm Motif Bunga Warna', sku: 'TRL-BNG-20', priceOverride: 135000, attributes: { diameter: '20 cm', motif: 'Bunga' }, stock: 25 },
      ],
    },
    {
      title: 'Cobek Batu Kali Pori Halus Muntilan Asli',
      slug: 'cobek-batu-kali-muntilan-asli',
      description: 'Cobek dan ulekan batu kali asli Gunung Merapi Muntilan Magelang. Tidak berpasir, tidak luntur, dan kokoh untuk mengulek bumbu sambal.',
      categoryId: catKriya.id,
      basePrice: 85000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/d/d6/Cobek.jpg',
      ],
      variants: [
        { title: 'Cobek Diameter 20cm + Ulekan Munthu', sku: 'CBM-20-SET', attributes: { diameter: '20 cm', kelengkapan: 'Termasuk Ulekan' }, stock: 40 },
        { title: 'Cobek Jumbo Diameter 24cm + Ulekan', sku: 'CBM-24-SET', priceOverride: 110000, attributes: { diameter: '24 cm', kelengkapan: 'Termasuk Ulekan' }, stock: 25 },
      ],
    },

    // --- SAMBAL & BUMBU DAPUR TRADISIONAL ---
    {
      title: 'Sambal Bu Rudy Khas Surabaya Set 3 Varian',
      slug: 'sambal-bu-rudy-surabaya-set3',
      description: 'Paket sambal terpopuler khas Surabaya: Sambal Bawang pedas nendang, Sambal Bajak manis gurih, dan Sambal Terasi harum. Botol segel rapat.',
      categoryId: catSambal.id,
      basePrice: 85000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/5/5a/SAMBAL_BAWANG.jpg',
      ],
      variants: [
        { title: 'Paket 3 Botol (Bawang, Bajak, Terasi)', sku: 'SBR-SET-3', attributes: { isi: '3 Botol', varian: 'Mix 3 Varian' }, stock: 95 },
        { title: 'Paket 3 Botol Khusus Sambal Bawang', sku: 'SBR-BWG-3', attributes: { isi: '3 Botol', varian: 'Full Bawang' }, stock: 110 },
      ],
    },
    {
      title: 'Rendang Daging Sapi Payakumbuh Padang Asli',
      slug: 'rendang-daging-sapi-payakumbuh',
      description: 'Rendang daging sapi khas Minangkabau dimasak lambat 8 jam di atas kayu bakar dengan rempah kelapa gongseng hitam medok. Siap saji kemasan retort pouch.',
      categoryId: catSambal.id,
      basePrice: 110000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/7/70/Rendang_daging_sapi_asli_Padang.JPG',
      ],
      variants: [
        { title: 'Rendang Daging Sapi 250g (Isi 5 Potong)', sku: 'RDP-DGS-250', attributes: { berat: '250g', jenis: 'Daging Sapi' }, stock: 65 },
        { title: 'Rendang Paru Kering Krispi 200g', sku: 'RDP-PRU-200', priceOverride: 95000, attributes: { berat: '200g', jenis: 'Paru Sapi' }, stock: 45 },
      ],
    },
    {
      title: 'Abon Sapi Gurih Renyah Mesran Solo',
      slug: 'abon-sapi-mesran-solo',
      description: 'Abon sapi legendaris khas Solo dengan serat daging sapi murni tanpa campuran kelapa parut. Gurih renyah tanpa minyak berlebih. Netto 250g.',
      categoryId: catSambal.id,
      basePrice: 75000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/5/57/Abon_sapi.JPG',
      ],
      variants: [
        { title: 'Abon Sapi Rasa Manis Gurih (250g)', sku: 'ASM-MNS-250', attributes: { rasa: 'Manis Gurih', berat: '250g' }, stock: 70 },
        { title: 'Abon Sapi Rasa Pedas Sedap (250g)', sku: 'ASM-PDS-250', attributes: { rasa: 'Pedas Sedap', berat: '250g' }, stock: 60 },
      ],
    },
    {
      title: 'Terasi Udang Rebon Asli Cirebon Super',
      slug: 'terasi-udang-rebon-cirebon',
      description: 'Terasi kualitas nomor satu terbuat dari 100% udang rebon segar laut Cirebon. Wangi sedap gurih tanpa pewarna sintetis. Kemasan kotak isi 10 batang.',
      categoryId: catSambal.id,
      basePrice: 35000,
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/8/8c/Terasi-dari-lombok.jpg',
      ],
      variants: [
        { title: 'Kotak Isi 10 Batang Terasi Matang (250g)', sku: 'TRC-SUP-250', attributes: { isi: '10 Batang', berat: '250g' }, stock: 85 },
      ],
    },
  ];

  console.log(`Creating ${seedProducts.length} authentic Indonesian products with variants & inventory...`);

  const createdVariants: any[] = [];

  for (const p of seedProducts) {
    const product = await prisma.product.create({
      data: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        categoryId: p.categoryId,
        basePrice: p.basePrice,
        status: ProductStatus.ACTIVE,
        images: {
          create: p.images.map((url, idx) => ({
            url,
            isThumbnail: idx === 0,
            displayOrder: idx,
            altText: p.title,
          })),
        },
      },
    });

    for (const v of p.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          title: v.title,
          sku: v.sku,
          priceOverride: v.priceOverride ?? null,
          attributes: v.attributes,
          inventory: {
            create: {
              quantityOnHand: v.stock,
              safetyStockLevel: 5,
            },
          },
        },
        include: { inventory: true },
      });

      // Initial stock ledger entry
      await prisma.stockMovement.create({
        data: {
          inventoryId: variant.inventory!.id,
          actorId: admin.id,
          quantityDelta: v.stock,
          balanceAfter: v.stock,
          reason: StockMovementReason.INITIAL,
          notes: `Stok awal produk: ${p.title} (${v.title})`,
        },
      });

      createdVariants.push({ ...variant, product });
    }
  }

  console.log(`Created ${seedProducts.length} products with ${createdVariants.length} total variants & initial stock movements.`);

  // 4. Create Demo Orders for Customer 1 (Budi Santoso)
  const vBakpia = createdVariants.find((v) => v.sku === 'BKTJ-COK-10') || createdVariants[0];
  const vKopi = createdVariants.find((v) => v.sku === 'KGA-FIN-250') || createdVariants[1];
  const vSambal = createdVariants.find((v) => v.sku === 'SBR-SET-3') || createdVariants[2];

  // Order 1: Completed & Delivered (COD Paid)
  const order1GrandTotal = 45000 * 2 + 75000 + 0; // Rp 165.000 (with Rp 20.000 shipping -> 185.000)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261105-8812',
      userId: customer1.id,
      shippingAddressId: customer1.addresses[0].id,
      status: OrderStatus.DELIVERED,
      subtotal: 165000,
      shippingCost: 20000,
      taxTotal: 0,
      grandTotal: 185000,
      currency: 'IDR',
      notes: 'Titipkan ke pos satpam cluster jika rumah kosong.',
      items: {
        create: [
          {
            variantId: vBakpia.id,
            productNameSnapshot: vBakpia.product.title,
            variantSkuSnapshot: vBakpia.sku,
            variantAttributesSnapshot: vBakpia.attributes,
            unitPriceSnapshot: 45000,
            quantity: 2,
            lineTotal: 90000,
          },
          {
            variantId: vKopi.id,
            productNameSnapshot: vKopi.product.title,
            variantSkuSnapshot: vKopi.sku,
            variantAttributesSnapshot: vKopi.attributes,
            unitPriceSnapshot: 75000,
            quantity: 1,
            lineTotal: 75000,
          },
        ],
      },
      payment: {
        create: {
          method: PaymentMethod.CASH_ON_DELIVERY,
          status: PaymentStatus.PAID,
          amount: 185000,
          paidAt: new Date(Date.now() - 86400000 * 2),
        },
      },
    },
  });

  // Order 2: Processing (Manual Bank Transfer Paid)
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261106-9214',
      userId: customer1.id,
      shippingAddressId: customer1.addresses[0].id,
      status: OrderStatus.PROCESSING,
      subtotal: 85000 * 2,
      shippingCost: 20000,
      taxTotal: 0,
      grandTotal: 190000,
      currency: 'IDR',
      notes: 'Mohon dibungkus bubble wrap ekstra tebal agar botol tidak pecah.',
      items: {
        create: [
          {
            variantId: vSambal.id,
            productNameSnapshot: vSambal.product.title,
            variantSkuSnapshot: vSambal.sku,
            variantAttributesSnapshot: vSambal.attributes,
            unitPriceSnapshot: 85000,
            quantity: 2,
            lineTotal: 170000,
          },
        ],
      },
      payment: {
        create: {
          method: PaymentMethod.MANUAL_BANK_TRANSFER,
          status: PaymentStatus.PAID,
          amount: 190000,
          transactionReference: 'TRX-BCA-981726354',
          paidAt: new Date(Date.now() - 3600000 * 4),
        },
      },
    },
  });

  console.log('Created realistic demo orders with Indonesian payment tracking.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
