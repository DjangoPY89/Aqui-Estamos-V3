import { NextResponse } from 'next/server';
import { getAvailabilitySettingsAsync, saveAvailabilitySettingsAsync } from '@/lib/availability';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getAvailabilitySettingsAsync();
    return NextResponse.json(
      { success: true, settings },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching availability settings:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener configuraciones de disponibilidad' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = await saveAvailabilitySettingsAsync(body);
    return NextResponse.json(
      {
        success: true,
        message: 'Configuraciones de disponibilidad guardadas con éxito.',
        settings: updated,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error saving availability settings:', error);
    return NextResponse.json(
      { error: error.message || 'Error al guardar configuraciones de disponibilidad' },
      { status: 500 }
    );
  }
}
