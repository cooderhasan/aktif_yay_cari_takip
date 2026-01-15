import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const timestamp = new Date().toISOString()

        // Fetch all data in parallel
        const [
            currencies,
            exchangeRates,
            settings,
            caries,
            invoices,
            invoiceItems,
            salesSlips,
            salesItems,
            payments,
            cashTransactions,
            proposals,
            proposalItems,
            auditLogs
        ] = await Promise.all([
            db.currency.findMany(),
            db.exchangeRate.findMany(),
            db.settings.findMany(),
            db.cari.findMany(),
            db.invoice.findMany(),
            db.invoiceItem.findMany(),
            db.salesSlip.findMany(),
            db.salesItem.findMany(),
            db.payment.findMany(),
            db.cashTransaction.findMany(),
            db.proposal.findMany(),
            db.proposalItem.findMany(),
            db.auditLog.findMany()
        ])

        const backupData = {
            metadata: {
                timestamp,
                version: '1.0'
            },
            data: {
                currencies,
                exchangeRates,
                settings,
                caries,
                invoices,
                invoiceItems,
                salesSlips,
                salesItems,
                payments,
                cashTransactions,
                proposals,
                proposalItems,
                auditLogs
            }
        }

        return new NextResponse(JSON.stringify(backupData), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.json"`
            }
        })

    } catch (error) {
        console.error('Backup export failed:', error)
        return NextResponse.json({ error: 'Yedek oluşturulamadı' }, { status: 500 })
    }
}
