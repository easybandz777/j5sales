import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  return NextResponse.json({
    hasDbUrl: dbUrl !== 'NOT SET',
    dbUrlLength: dbUrl.length,
    dbUrlStart: dbUrl.substring(0, 30),
    dbUrlEnd: dbUrl.substring(dbUrl.length - 20),
    hasNewline: dbUrl.includes('\n'),
    hasCarriageReturn: dbUrl.includes('\r'),
    nodeVersion: process.version,
  });
}
