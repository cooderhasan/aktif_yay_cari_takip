import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const currencies = await db.currency.findMany({
            orderBy: { id: 'asc' }
        })
        return NextResponse.json(currencies)
    } catch (error) {
        return NextResponse.json({ error: 'Para birimleri yüklenemedi' }, { status: 500 })
    }
}
