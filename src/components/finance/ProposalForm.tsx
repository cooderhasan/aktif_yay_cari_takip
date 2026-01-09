'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, Save, Calculator, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface ProposalItem {
    stockCode: string
    productName: string
    quantity: number
    unit: string
    unitPrice: number
    vatRate: number
    lineTotal: number
    description: string
}

interface ProposalFormProps {
    initialData?: any
    onSubmit: (data: any) => void
    isSubmitting: boolean
}

export function ProposalForm({ initialData, onSubmit, isSubmitting }: ProposalFormProps) {
    const router = useRouter()

    // Form State
    const [formData, setFormData] = useState({
        customerId: initialData?.customerId?.toString() || '',
        proposalDate: initialData?.proposalDate ? new Date(initialData.proposalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        validUntil: initialData?.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : '',
        currencyId: initialData?.currencyId?.toString() || '1', // Default TL
        exchangeRate: initialData?.exchangeRate || 1,
        discountRate: initialData?.discountRate || 0,
        deliveryTime: initialData?.deliveryTime || '',
        paymentTerms: initialData?.paymentTerms || '',
        notes: initialData?.notes || '',
        status: initialData?.status || 'DRAFT'
    })

    const [items, setItems] = useState<ProposalItem[]>(initialData?.items?.map((i: any) => ({
        stockCode: i.stockCode || '',
        productName: i.productName || '',
        quantity: Number(i.quantity),
        unit: i.unit || 'Adet',
        unitPrice: Number(i.unitPrice),
        vatRate: Number(i.vatRate),
        lineTotal: Number(i.lineTotal),
        description: i.description || ''
    })) || [{
        stockCode: '',
        productName: '',
        quantity: 1,
        unit: 'Adet',
        unitPrice: 0,
        vatRate: 20,
        lineTotal: 0,
        description: ''
    }])

    // Calculations
    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
        const discountAmount = subtotal * (Number(formData.discountRate) / 100)

        // Bu basit hesaplama. KDV'yi her satır için ayrı hesaplayıp toplamak daha doğru olabilir.
        // Ancak genelde iskontodan sonra KDV eklenir veya satır bazlı gider.
        // Burada satır bazlı KDV toplamını alalım.

        const totalVat = items.reduce((sum, item) => {
            // Line total üzerinden iskonto düşülecekse mantık değişir. 
            // Genelde: (BirimFiyat * Miktar) üzerinden KDV hesaplanır.
            // İskonto genelde tüm toplama uygulanıyorsa KDV matrahı değişir.
            // Basitlik için: Genel İskonto varsa bunu satırlara dağıtmak zor.
            // Kabul: Genel İskonto ARA TOPLAMdan düşülür, KDV kalana eklenir.
            // Veya: Satır toplamları KDV Dahil/Hariç karmaşası.
            // Bizim sistemde lineTotal = quantity * unitPrice. (KDV HARİÇ varsayıyoruz genelde ticari yazılımlarda)

            const lineAmount = item.lineTotal // KDV Hariç Tutar
            const vatAmount = lineAmount * (item.vatRate / 100)
            return sum + vatAmount
        }, 0)

        // Eğer genel iskonto varsa KDV'yi de etkilemeli mi?
        // Türkiye: İskonto düşüldükten sonra KDV hesaplanır.
        // Yani effectiveVat = totalVat * (1 - discountRate/100)
        const effectiveVat = totalVat * (1 - (Number(formData.discountRate) / 100))

        const grandTotal = (subtotal - discountAmount) + effectiveVat

        return { subtotal, discountAmount, effectiveVat, grandTotal }
    }

    const totals = calculateTotals()

    // Handlers
    const handleItemChange = (index: number, field: keyof ProposalItem, value: any) => {
        const newItems = [...items]
        const item = { ...newItems[index], [field]: value }

        // Recalculate line total
        if (field === 'quantity' || field === 'unitPrice') {
            item.lineTotal = item.quantity * item.unitPrice
        }

        newItems[index] = item
        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, {
            stockCode: '',
            productName: '',
            quantity: 1,
            unit: 'Adet',
            unitPrice: 0,
            vatRate: 20,
            lineTotal: 0,
            description: ''
        }])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    // Fetch Data
    const { data: customers } = useQuery({
        queryKey: ['customers'],
        queryFn: () => fetch('/api/caries?type=CUSTOMER').then(res => res.json())
    })

    const { data: currencies } = useQuery({
        queryKey: ['currencies'],
        queryFn: () => fetch('/api/currencies').then(res => res.json())
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.customerId) {
            alert('Lütfen bir müşteri seçiniz.')
            return
        }

        if (items.length === 0) {
            alert('Lütfen en az bir ürün/hizmet ekleyiniz.')
            return
        }

        onSubmit({
            ...formData,
            items,
            totalAmount: totals.grandTotal
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Teklif Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>Müşteri</Label>
                        <Select
                            value={formData.customerId}
                            onValueChange={(val) => setFormData({ ...formData, customerId: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Müşteri Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers?.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Teklif Tarihi</Label>
                        <Input
                            type="date"
                            value={formData.proposalDate}
                            onChange={(e) => setFormData({ ...formData, proposalDate: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Geçerlilik Tarihi</Label>
                        <Input
                            type="date"
                            value={formData.validUntil}
                            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Para Birimi</Label>
                        <Select
                            value={formData.currencyId}
                            onValueChange={(val) => setFormData({ ...formData, currencyId: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies?.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.code}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Döviz Kuru</Label>
                        <Input
                            type="number"
                            step="0.0001"
                            value={formData.exchangeRate}
                            onChange={(e) => setFormData({ ...formData, exchangeRate: Number(e.target.value) })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Items Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Ürün ve Hizmetler</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" /> Satır Ekle
                    </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Stok Kodu</TableHead>
                                <TableHead className="min-w-[300px]">Ürün/Hizmet Adı</TableHead>
                                <TableHead className="w-[100px]">Miktar</TableHead>
                                <TableHead className="w-[120px]">Birim</TableHead>
                                <TableHead className="w-[140px]">Birim Fiyat</TableHead>
                                <TableHead className="w-[100px]">KDV %</TableHead>
                                <TableHead className="w-[150px] text-right">Tutar</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Input
                                            value={item.stockCode}
                                            onChange={(e) => handleItemChange(index, 'stockCode', e.target.value)}
                                            placeholder="KOD-01"
                                            className="h-9 w-full"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <Input
                                                value={item.productName}
                                                onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                                placeholder="Ürün adı..."
                                                className="h-9 w-full font-medium"
                                            />
                                            <Input
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                placeholder="Açıklama (opsiyonel)"
                                                className="h-8 text-xs text-muted-foreground w-full"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                            className="h-9 w-full text-center"
                                            min="0"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={item.unit}
                                            onValueChange={(val) => handleItemChange(index, 'unit', val)}
                                        >
                                            <SelectTrigger className="h-9 w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Adet">Adet</SelectItem>
                                                <SelectItem value="Kg">Kg</SelectItem>
                                                <SelectItem value="Mt">Mt</SelectItem>
                                                <SelectItem value="Lt">Lt</SelectItem>
                                                <SelectItem value="Saat">Saat</SelectItem>
                                                <SelectItem value="Koli">Koli</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                                className="h-9 w-full text-right pr-2"
                                                min="0"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={item.vatRate}
                                            onChange={(e) => handleItemChange(index, 'vatRate', Number(e.target.value))}
                                            className="h-9 w-full text-center"
                                            min="0"
                                            max="100"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-sm">
                                        <div className="py-2 px-1 bg-slate-50 rounded border border-slate-100">
                                            {item.lineTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Footer & Totals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Koşullar ve Notlar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Teslim Süresi</Label>
                                <Input
                                    value={formData.deliveryTime}
                                    onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                                    placeholder="Örn: 3 İş Günü"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Ödeme Şartları</Label>
                                <Input
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                    placeholder="Örn: %50 Peşin"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Genel Notlar</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Teklifin sonuna eklenecek notlar..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Özet</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ara Toplam:</span>
                            <span className="font-medium">{totals.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm gap-2">
                            <span className="text-muted-foreground whitespace-nowrap">İskonto (%):</span>
                            <Input
                                type="number"
                                className="h-7 w-20 text-right"
                                value={formData.discountRate}
                                onChange={(e) => setFormData({ ...formData, discountRate: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex justify-between text-sm text-red-600">
                            <span>- İndirim Tutarı:</span>
                            <span>{totals.discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">KDV Toplam:</span>
                            <span>{totals.effectiveVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="border-t pt-4 flex justify-between items-center">
                            <span className="font-bold text-lg">Genel Toplam:</span>
                            <span className="font-bold text-xl text-purple-600">
                                {totals.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Kaydediliyor...' : 'Teklifi Kaydet'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </form>
    )
}
