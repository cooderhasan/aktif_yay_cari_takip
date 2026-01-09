'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, ArrowLeft } from 'lucide-react'

interface CariFormProps {
    initialData?: any
    onSubmit: (data: any) => void
    isSubmitting: boolean
    mode: 'create' | 'edit'
}

export function CariForm({ initialData, onSubmit, isSubmitting, mode }: CariFormProps) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: '',
        type: 'CUSTOMER',
        phone: '',
        email: '',
        address: '',
        city: '',
        district: '',
        taxNumber: '',
        taxOffice: '',
        notes: '',
        defaultCurrencyCode: 'TL',
        isActive: true,
        salary: '',
        openingBalance: '0'
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                type: initialData.type || 'CUSTOMER',
                phone: initialData.phone || '',
                email: initialData.email || '',
                address: initialData.address || '',
                city: initialData.city || '',
                district: initialData.district || '',
                taxNumber: initialData.taxNumber || '',
                taxOffice: initialData.taxOffice || '',
                notes: initialData.notes || '',
                defaultCurrencyCode: initialData.defaultCurrency?.code || initialData.defaultCurrencyCode || 'TL',
                isActive: initialData.isActive ?? true,
                salary: initialData.salary ? initialData.salary.toString() : '',
                openingBalance: initialData.openingBalance ? initialData.openingBalance.toString() : '0'
            })
        }
    }, [initialData])

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim()) {
            alert('Ünvan zorunludur')
            return
        }
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
                {/* Temel Bilgiler */}
                <Card>
                    <CardHeader>
                        <CardTitle>Temel Bilgiler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Ünvan / Ad Soyad *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Cari Türü</Label>
                                <select
                                    id="type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.type}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                    disabled={mode === 'edit'} // Tür değişimi genelde sorun yaratabilir, şimdilik edit'te kapalı olsun veya açık olabilir
                                >
                                    <option value="CUSTOMER">Müşteri</option>
                                    <option value="SUPPLIER">Tedarikçi</option>
                                    <option value="EMPLOYEE">Personel</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="currency">Para Birimi</Label>
                                <select
                                    id="currency"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.defaultCurrencyCode}
                                    onChange={(e) => handleChange('defaultCurrencyCode', e.target.value)}
                                >
                                    <option value="TL">TL</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                        </div>

                        {mode === 'create' && (
                            <div className="grid gap-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <Label htmlFor="openingBalance" className="text-orange-700 font-semibold">Açılış Bakiyesi</Label>
                                <Input
                                    id="openingBalance"
                                    type="number"
                                    step="0.01"
                                    value={formData.openingBalance}
                                    onChange={(e) => handleChange('openingBalance', e.target.value)}
                                    className="border-orange-300"
                                />
                                <p className="text-xs text-orange-600">
                                    Pozitif giriniz. Müşteri & Personel için borç, Tedarikçi için alacak olarak kaydedilir.
                                </p>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="isActive">Durum</Label>
                            <select
                                id="isActive"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.isActive ? 'true' : 'false'}
                                onChange={(e) => handleChange('isActive', e.target.value === 'true')}
                            >
                                <option value="true">Aktif</option>
                                <option value="false">Pasif</option>
                            </select>
                        </div>

                        {/* Personel Maaşı - Sadece EMPLOYEE tipi için */}
                        {formData.type === 'EMPLOYEE' && (
                            <div className="grid gap-2 p-4 bg-violet-50 rounded-lg border border-violet-200">
                                <Label htmlFor="salary" className="text-violet-700 font-semibold">Aylık Maaş (₺)</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    step="0.01"
                                    value={formData.salary}
                                    onChange={(e) => handleChange('salary', e.target.value)}
                                    placeholder="50000.00"
                                    className="border-violet-300"
                                />
                                <p className="text-xs text-violet-600">Ay sonu maaş tahakkukunda kullanılacaktır.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* İletişim Bilgileri */}
                <Card>
                    <CardHeader>
                        <CardTitle>İletişim Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="0532 123 45 67"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="ornek@email.com"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Adres</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Sokak, Mahalle, No"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="city">Şehir</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    placeholder="İstanbul"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="district">İlçe</Label>
                                <Input
                                    id="district"
                                    value={formData.district}
                                    onChange={(e) => handleChange('district', e.target.value)}
                                    placeholder="Kadıköy"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Vergi Bilgileri */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vergi Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="taxNumber">Vergi No / TC Kimlik</Label>
                                <Input
                                    id="taxNumber"
                                    value={formData.taxNumber}
                                    onChange={(e) => handleChange('taxNumber', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                                <Input
                                    id="taxOffice"
                                    value={formData.taxOffice}
                                    onChange={(e) => handleChange('taxOffice', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notlar */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notlar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Cari hakkında notlar..."
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    İptal
                </Button>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </div>
        </form>
    )
}
