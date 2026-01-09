import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/proposals
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const customerId = searchParams.get('customerId')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const status = searchParams.get('status')

        const where: any = {}

        if (customerId && customerId !== 'all') {
            where.customerId = parseInt(customerId)
        }

        if (startDate) {
            where.proposalDate = { ...where.proposalDate, gte: new Date(startDate) }
        }

        if (endDate) {
            where.proposalDate = { ...where.proposalDate, lte: new Date(endDate) }
        }

        if (status && status !== 'ALL') {
            where.status = status
        }

        const proposals = await db.proposal.findMany({
            where,
            include: {
                customer: { select: { id: true, title: true, email: true } },
                currency: true,
                items: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(proposals)
    } catch (error) {
        console.error('Proposals fetch error:', error)
        return NextResponse.json({ error: 'Teklifler yüklenirken hata oluştu' }, { status: 500 })
    }
}

// POST /api/proposals
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Generate Proposal Number if not provided
        let proposalNumber = body.proposalNumber
        if (!proposalNumber) {
            // Simple auto-increment logic or random unique
            const count = await db.proposal.count()
            const year = new Date().getFullYear()
            proposalNumber = `TKL-${year}-${(count + 1).toString().padStart(3, '0')}`
        }

        const proposal = await db.proposal.create({
            data: {
                proposalNumber,
                customerId: parseInt(body.customerId),
                proposalDate: new Date(body.proposalDate),
                validUntil: body.validUntil ? new Date(body.validUntil) : null,
                currencyId: parseInt(body.currencyId),
                exchangeRate: body.exchangeRate,
                totalAmount: body.totalAmount,
                discountRate: body.discountRate || 0,
                deliveryTime: body.deliveryTime,
                paymentTerms: body.paymentTerms,
                notes: body.notes,
                status: 'DRAFT',
                items: {
                    create: body.items.map((item: any) => ({
                        productName: item.productName,
                        stockCode: item.stockCode,
                        brand: item.brand,
                        quantity: item.quantity,
                        unit: item.unit || 'Adet',
                        unitPrice: item.unitPrice,
                        vatRate: parseInt(item.vatRate || 20),
                        lineTotal: item.lineTotal,
                        description: item.description
                    }))
                }
            }
        })

        return NextResponse.json(proposal)
    } catch (error) {
        console.error('Proposal create error:', error)
        return NextResponse.json({ error: 'Teklif oluşturulurken hata oluştu' }, { status: 500 })
    }
}
