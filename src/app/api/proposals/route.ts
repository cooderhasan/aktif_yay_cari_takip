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

        // Validation
        if (!body.customerId) {
            return NextResponse.json({ error: 'Müşteri seçimi zorunludur.' }, { status: 400 })
        }

        const customerIdInt = parseInt(body.customerId)
        if (isNaN(customerIdInt)) {
            return NextResponse.json({ error: 'Geçersiz müşteri ID.' }, { status: 400 })
        }

        // Generate Proposal Number if not provided
        let proposalNumber = body.proposalNumber
        if (!proposalNumber) {
            const year = new Date().getFullYear()
            const yearPrefix = `TKL-${year}-`

            // Find the last proposal of this year
            const lastProposal = await db.proposal.findFirst({
                where: {
                    proposalNumber: {
                        startsWith: yearPrefix
                    }
                },
                orderBy: {
                    proposalNumber: 'desc'
                }
            })

            let nextNumber = 1
            if (lastProposal) {
                const parts = lastProposal.proposalNumber.split('-')
                if (parts.length === 3) {
                    const lastSeq = parseInt(parts[2])
                    if (!isNaN(lastSeq)) {
                        nextNumber = lastSeq + 1
                    }
                }
            }

            proposalNumber = `${yearPrefix}${nextNumber.toString().padStart(3, '0')}`
        }

        // Create Proposal
        const proposal = await db.proposal.create({
            data: {
                proposalNumber,
                customerId: customerIdInt,
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
    } catch (error: any) {
        console.error('Proposal create error:', error)
        // Return duplicate error specifically
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Bu teklif numarası zaten mevcut, lütfen tekrar deneyin.' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Teklif oluşturulurken hata oluştu' }, { status: 500 })
    }
}
