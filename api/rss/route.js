import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return NextResponse.json({
    status: 'ok',
    message: 'RSS API is responding'
  });
}
