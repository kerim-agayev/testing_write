import { NextResponse } from 'next/server';
import { KRONOTOPLAR } from '@/lib/kronotop/data';

export async function GET() {
  return NextResponse.json(KRONOTOPLAR);
}
