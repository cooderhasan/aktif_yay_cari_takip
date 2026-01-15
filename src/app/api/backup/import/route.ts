import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { data } = body

        if (!data) {
            return NextResponse.json({ error: 'Geçersiz yedek dosyası' }, { status: 400 })
        }

        // Transaction to ensure atomicity: wipe all then recreate all
        await db.$transaction(async (tx) => {
            // 1. DELETE EVERYTHING (Reverse dependency order)
            // Child tables first
            await tx.proposalItem.deleteMany()
            await tx.salesItem.deleteMany()
            await tx.invoiceItem.deleteMany()

            // Transaction tables
            await tx.payment.deleteMany()
            await tx.cashTransaction.deleteMany()
            await tx.salesSlip.deleteMany()
            await tx.invoice.deleteMany()
            await tx.proposal.deleteMany()

            // Master tables
            await tx.cari.deleteMany()
            await tx.exchangeRate.deleteMany()

            // Core tables (Settings, Currency, Logs)
            await tx.settings.deleteMany()
            await tx.auditLog.deleteMany()
            // Note: We might want to keep Currencies if they are hardcoded/seeded, but for full restore we wipe.
            // However, Cari needs Currency. So we delete Currency last.
            await tx.currency.deleteMany()

            // 2. RESTORE EVERYTHING (Dependency order)
            // Core tables
            if (data.currencies?.length) await tx.currency.createMany({ data: data.currencies })
            if (data.settings?.length) await tx.settings.createMany({ data: data.settings })
            if (data.auditLogs?.length) await tx.auditLog.createMany({ data: data.auditLogs })

            // Master tables
            // ExchangeRate needs Currency
            if (data.exchangeRates?.length) await tx.exchangeRate.createMany({ data: data.exchangeRates })

            // Cari needs Currency
            if (data.caries?.length) await tx.cari.createMany({ data: data.caries })

            // Transaction tables
            // These need Cari and Currency
            if (data.proposals?.length) await tx.proposal.createMany({ data: data.proposals })
            if (data.invoices?.length) await tx.invoice.createMany({ data: data.invoices })
            if (data.salesSlips?.length) await tx.salesSlip.createMany({ data: data.salesSlips })
            if (data.payments?.length) await tx.payment.createMany({ data: data.payments })
            if (data.cashTransactions?.length) await tx.cashTransaction.createMany({ data: data.cashTransactions })

            // Items
            if (data.proposalItems?.length) await tx.proposalItem.createMany({ data: data.proposalItems })
            if (data.invoiceItems?.length) await tx.invoiceItem.createMany({ data: data.invoiceItems })
            if (data.salesItems?.length) await tx.salesItem.createMany({ data: data.salesItems })
        })

        return NextResponse.json({ success: true, message: 'Yedek başarıyla geri yüklendi' })

    } catch (error) {
        console.error('Backup restore failed:', error)
        return NextResponse.json({ error: 'Geri yükleme başarısız: ' + (error as any).message }, { status: 500 })
    }
}
