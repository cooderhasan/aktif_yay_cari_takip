'use client'

import { useRouter } from 'next/navigation'
import { ProposalForm } from '@/components/finance/ProposalForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function NewProposalPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.error || 'Teklif oluşturulamadı')
            }

            const proposal = await res.json()
            router.push(`/finance/proposals/${proposal.id}`) // Detay/Önizleme sayfasına yönlendir
        } catch (error: any) {
            let errorMsg = 'Hata: Teklif kaydedilemedi.'
            if (error instanceof Error) {
                // Try to parse if it's a fetch response error that we manually threw or constructed ??
                // Actually the cleaner way is to handle the !res.ok block above better.
                errorMsg = error.message
            }
            alert(errorMsg)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/finance/proposals">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Yeni Teklif</h2>
                    <p className="text-muted-foreground text-sm">Yeni bir satış teklifi oluşturun.</p>
                </div>
            </div>

            <ProposalForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
