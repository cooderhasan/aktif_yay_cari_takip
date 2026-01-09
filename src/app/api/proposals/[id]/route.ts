import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/proposals/[id]
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const proposal = await db.proposal.findUnique({
            where: { id: parseInt(id) },
            include: {
                customer: true,
                currency: true,
                items: true
            }
        })

        if (!proposal) {
            return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })
        }

        return NextResponse.json(proposal)
    } catch (error) {
        return NextResponse.json({ error: 'Teklif detay hatası' }, { status: 500 })
    }
}

// PUT /api/proposals/[id]
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Update proposal and re-create items
        // Wrapping in transaction for data integrity
        const updatedProposal = await db.$transaction(async (tx) => {
            // 1. Delete existing items
            await tx.proposalItem.deleteMany({
                where: { proposalId: parseInt(id) }
            })

            // 2. Update parent and create new items
            return await tx.proposal.update({
                where: { id: parseInt(id) },
                data: {
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
                    status: body.status, // Allow status update
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
                },
                include: { items: true }
            })
        })

        return NextResponse.json(updatedProposal)
    } catch (error) {
        console.error('Proposal update error:', error)
        return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 })
    }
}

// DELETE /api/proposals/[id]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await db.proposal.delete({
            where: { id: parseInt(id) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Silme hatası' }, { status: 500 })
    }
}
