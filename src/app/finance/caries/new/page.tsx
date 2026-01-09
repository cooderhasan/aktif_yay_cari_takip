'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { CariForm } from '@/components/finance/CariForm'

async function createCari(data: any) {
    const res = await fetch('/api/caries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Cari oluşturulamadı')
    }
    return res.json()
}

export default function NewCariPage() {
    const router = useRouter()
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: createCari,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caries'] })
            alert('Cari başarıyla oluşturuldu!')
            router.push('/finance/caries')
        },
        onError: (error) => {
            alert('Hata: ' + error.message)
        }
    })

    const handleSubmit = (data: any) => {
        createMutation.mutate(data)
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Yeni Cari Ekle</h2>
                    <p className="text-muted-foreground">Müşteri, tedarikçi veya personel hesabı oluşturun</p>
                </div>
            </div>

            <CariForm
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
                mode="create"
            />
        </div>
    )
}
