import { NextRequest, NextResponse } from 'next/server';
import {
  DESTINATION_CITIES,
  calculateShippingOptions,
} from '../../../../lib/storefront-helpers';

/**
 * RajaOngkir-Compatible Shipping Cost API Route (/api/shipping/cost)
 * - Jika RAJAONGKIR_API_KEY tersedia di environment, otomatis memanggil endpoint resmi RajaOngkir Starter API.
 * - Jika tanpa API Key, menggunakan mesin tarif domestik RajaOngkir-compatible gratis (mendukung JNE, J&T, SiCepat, Pos Indonesia)
 *   berdasarkan kota asal UMKM, kota tujuan, berat paket (kg), dan subsidi gratis ongkir.
 */

const RAJAONGKIR_CITY_MAP: Record<string, { city_id: string; province: string; city_name: string }> = {
  jakarta: { city_id: '152', province: 'DKI Jakarta', city_name: 'Jakarta Pusat' },
  bandung: { city_id: '23', province: 'Jawa Barat', city_name: 'Bandung' },
  bogor: { city_id: '78', province: 'Jawa Barat', city_name: 'Bogor' },
  yogyakarta: { city_id: '501', province: 'DI Yogyakarta', city_name: 'Yogyakarta' },
  jogja: { city_id: '501', province: 'DI Yogyakarta', city_name: 'Yogyakarta' },
  semarang: { city_id: '399', province: 'Jawa Tengah', city_name: 'Semarang' },
  solo: { city_id: '445', province: 'Jawa Tengah', city_name: 'Surakarta (Solo)' },
  surabaya: { city_id: '444', province: 'Jawa Timur', city_name: 'Surabaya' },
  malang: { city_id: '256', province: 'Jawa Timur', city_name: 'Malang' },
  denpasar: { city_id: '114', province: 'Bali', city_name: 'Denpasar' },
  bali: { city_id: '114', province: 'Bali', city_name: 'Denpasar' },
  medan: { city_id: '278', province: 'Sumatera Utara', city_name: 'Medan' },
  palembang: { city_id: '327', province: 'Sumatera Selatan', city_name: 'Palembang' },
  padang: { city_id: '318', province: 'Sumatera Barat', city_name: 'Padang' },
  makassar: { city_id: '254', province: 'Sulawesi Selatan', city_name: 'Makassar' },
  balikpapan: { city_id: '19', province: 'Kalimantan Timur', city_name: 'Balikpapan' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const originKey = (searchParams.get('origin') || 'yogyakarta').toLowerCase();
  const destinationKey = (searchParams.get('destination') || 'jakarta').toLowerCase();
  const weightGrams = Math.max(250, Number(searchParams.get('weight') || 1000));
  const subtotal = Number(searchParams.get('subtotal') || 0);

  const originMeta = RAJAONGKIR_CITY_MAP[originKey] || RAJAONGKIR_CITY_MAP.yogyakarta;
  const destMeta = RAJAONGKIR_CITY_MAP[destinationKey] || RAJAONGKIR_CITY_MAP.jakarta;

  const apiKey = process.env.RAJAONGKIR_API_KEY;

  // 1. Optional Live RajaOngkir API Call if RAJAONGKIR_API_KEY is configured
  if (apiKey) {
    try {
      const formBody = new URLSearchParams({
        origin: originMeta.city_id,
        destination: destMeta.city_id,
        weight: String(weightGrams),
        courier: 'jne',
      });

      const roRes = await fetch('https://api.rajaongkir.com/starter/cost', {
        method: 'POST',
        headers: {
          key: apiKey,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });

      if (roRes.ok) {
        const roJson = await roRes.json();
        const jneCosts = roJson?.rajaongkir?.results?.[0]?.costs || [];
        if (jneCosts.length > 0) {
          const isFreeEligible = subtotal >= 150000;
          const mappedOptions = jneCosts.map((c: any, idx: number) => {
            const rawVal = c.cost?.[0]?.value || 18000;
            const isReg = c.service.includes('REG') || c.service.includes('OKE');
            return {
              id: `jne-${c.service.toLowerCase()}-${idx}`,
              courier: 'JNE Express',
              service: `${c.service} (${c.description})`,
              cost: isFreeEligible && isReg ? 0 : rawVal,
              originalCost: rawVal,
              etd: `${c.cost?.[0]?.etd || '2-3'} Hari`,
              badge: isFreeEligible && isReg ? 'Gratis Ongkir' : undefined,
              courierCode: 'jne',
            };
          });

          return NextResponse.json({
            provider: 'RajaOngkir Official API',
            origin: originMeta,
            destination: destMeta,
            weightGrams,
            weightKg: Math.max(1, Math.ceil(weightGrams / 1000)),
            options: mappedOptions,
          });
        }
      }
    } catch {
      // Fallback to built-in RajaOngkir tariff matrix below
    }
  }

  // 2. Built-in Free RajaOngkir-Compatible Tariff Engine (JNE, J&T, SiCepat, Pos Indonesia)
  const options = calculateShippingOptions(subtotal, destinationKey, originKey, weightGrams);
  const destCityObj =
    DESTINATION_CITIES.find((c) => c.id === destinationKey) || DESTINATION_CITIES[0];

  return NextResponse.json({
    provider: 'RajaOngkir Domestic Tariff API',
    origin: originMeta,
    destination: {
      city_id: destMeta.city_id,
      city_name: destCityObj.name,
      province: destMeta.province,
    },
    weightGrams,
    weightKg: Math.max(1, Math.ceil(weightGrams / 1000)),
    options,
  });
}
