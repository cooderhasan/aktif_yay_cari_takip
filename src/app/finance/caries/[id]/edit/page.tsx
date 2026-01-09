'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { CariForm } from '@/components/finance/CariForm'

// Cari detayını çekme
async function getCari(id: string) {
    const res = await fetch(`/api/caries/${id}`)
    if (!res.ok) throw new Error('Cari bulunamadı')
    return res.json()
}

// Cari güncelleme
async function updateCari(id: string, data: any) {
    const res = await fetch(`/api/caries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Cari güncellenemedi')
    }
    return res.json()
}

// Cari silme
async function deleteCari(id: string) {
    const res = await fetch(`/api/caries/${id}`, {
        method: 'DELETE'
    })
    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Cari silinemedi')
    }
    return res.json()
}

export default function EditCariPage() {
    const router = useRouter()
    const params = useParams()
    const queryClient = useQueryClient()
    const cariId = params.id as string

    const [formData, setFormData] = useState<any>(null)

    const { data: cari, isLoading } = useQuery({
        queryKey: ['cari', cariId],
        queryFn: () => getCari(cariId),
        enabled: !!cariId
    })

    // Form'u cari verileriyle doldur
    useEffect(() => {
        if (cari) {

        }
    }, [cari])

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateCari(cariId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caries'] })
            alert('Cari başarıyla güncellendi!')
            router.push('/finance/caries')
        },
        onError: (error) => {
            alert('Hata: ' + error.message)
        }
    })

    const deleteMutation = useMutation({
        mutationFn: () => deleteCari(cariId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caries'] })
            alert('Cari silindi!')
            router.push('/finance/caries')
        },
        onError: (error) => {
            alert('Hata: ' + error.message)
        }
    })

    const handleSubmit = (data: any) => {
        updateMutation.mutate(data)
    }

    const handleDelete = () => {
        if (confirm('Bu cariyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            deleteMutation.mutate()
        }
    }

    if (isLoading) {
        return <div className="p-8">Yükleniyor...</div>
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Cari Düzenle</h2>
                        <p className="text-muted-foreground">{cari?.title}</p>
                    </div>
                </div>
                <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteMutation.isPending ? 'Siliniyor...' : 'Cariyi Sil'}
                </Button>
            </div>


            <CariForm
                initialData={cari} // Use cari directly from query as initial data
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}
                mode="edit"
            />


        </div>
    )
}
