'use client'

import { useParams, useRouter } from 'next/navigation'
import { ProposalForm } from '@/components/finance/ProposalForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

async function getProposal(id: string) {
    const res = await fetch(`/api/proposals/${id}`)
    if (!res.ok) throw new Error('Teklif yüklenemedi')
    return res.json()
}

export default function EditProposalPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data: proposal, isLoading } = useQuery({
        queryKey: ['proposal', id],
        queryFn: () => getProposal(id)
    })

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/proposals/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) throw new Error('Teklif güncellenemedi')

            router.push(`/finance/proposals/${id}`) // Detay sayfasına geri dön
        } catch (error) {
            alert('Hata: Teklif güncellenemedi.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) return <div>Yükleniyor...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/finance/proposals/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Teklifi Düzenle</h2>
                    <p className="text-muted-foreground text-sm">{proposal?.proposalNumber}</p>
                </div>
            </div>

            {proposal && (
                <ProposalForm
                    initialData={proposal}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    )
}
