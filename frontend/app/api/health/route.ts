import { NextResponse } from 'next/server'

export const runtime = 'edge'

export function GET() {
  return NextResponse.json({ status: 'ok' })
}

export function HEAD() {
  return new Response(null, { status: 200 })
}