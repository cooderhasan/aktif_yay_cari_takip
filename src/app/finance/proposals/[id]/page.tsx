'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Printer, Pencil, ArrowLeft, Trash2, Mail, Download } from 'lucide-react'
import { useRef } from 'react'

async function getProposal(id: string) {
    const res = await fetch(`/api/proposals/${id}`)
    if (!res.ok) throw new Error('Teklif yüklenemedi')
    return res.json()
}

async function getSettings() {
    const res = await fetch('/api/settings')
    if (!res.ok) throw new Error('Ayarlar yüklenemedi')
    return res.json()
}

export default function ProposalDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: proposal, isLoading: isLoadingProposal } = useQuery({
        queryKey: ['proposal', id],
        queryFn: () => getProposal(id)
    })

    const { data: settings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettings
    })

    const handlePrint = () => {
        window.print()
    }

    const handleDownloadPdf = () => {
        const element = document.getElementById('proposal-content')
        const opt = {
            margin: 0,
            filename: `Teklif-${proposal.proposalNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }

        // @ts-ignore
        if (window.html2pdf) {
            // @ts-ignore
            window.html2pdf().set(opt).from(element).save()
        } else {
            alert('PDF oluşturucu yüklenemedi, lütfen sayfayı yenileyip tekrar deneyin.')
        }
    }

    const handleDelete = async () => {
        if (!confirm('Bu teklifi silmek istediğinize emin misiniz?')) return

        try {
            const res = await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Silinemedi')
            router.push('/finance/proposals')
        } catch (error) {
            alert('Hata: Silme işlemi başarısız')
        }
    }

    if (isLoadingProposal || isLoadingSettings) {
        return <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
    }

    if (!proposal) {
        return <div className="p-8 text-center text-red-500">Teklif bulunamadı.</div>
    }

    return (
        <div className="space-y-6">
            {/* Action Bar - Hidden on Print */}
            <div className="print:hidden flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div className="flex items-center gap-4">
                    <Link href="/finance/proposals">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            Teklif Detayı
                            <Badge variant="outline">{proposal.proposalNumber}</Badge>
                        </h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" /> PDF İndir
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Yazdır
                    </Button>
                    <Link href={`/finance/proposals/${id}/edit`}>
                        <Button variant="secondary">
                            <Pencil className="mr-2 h-4 w-4" /> Düzenle
                        </Button>
                    </Link>
                    <Button variant="destructive" size="icon" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* A4 Preview Container */}
            <div className="flex justify-center bg-slate-100 print:bg-white p-4 md:p-8 print:p-0 min-h-screen">
                <div className={`
                    bg-white shadow-xl print:shadow-none 
                    w-full max-w-[210mm] print:max-w-none 
                    min-h-[297mm] print:min-h-0
                    p-[10mm] md:p-[20mm] print:p-0 
                    flex flex-col justify-between 
                    text-sm leading-relaxed
                `} id="proposal-content">
                    {/* --- REPORT CONTENT START --- */}

                    {/* Header */}
                    <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-start">
                        {/* Left: Logo & Company Info */}
                        <div className="w-1/2">
                            {settings?.logoUrl && (
                                <img
                                    src={settings.logoUrl}
                                    alt="Company Logo"
                                    className="h-16 object-contain mb-4"
                                />
                            )}
                            <h1 className="text-xl font-bold text-slate-900 mb-1">{settings?.companyTitle || settings?.siteTitle}</h1>
                            <div className="text-xs text-slate-500 space-y-0.5">
                                <p>{settings?.companyAddress}</p>
                                <p>{settings?.companyCity} / {settings?.companyDistrict}</p>
                                <p>Tel: {settings?.companyPhone} | E-posta: {settings?.companyEmail}</p>
                                <p>VD: {settings?.companyTaxOffice} | VN: {settings?.companyTaxNumber}</p>
                            </div>
                        </div>

                        {/* Right: Proposal Meta */}
                        <div className="w-1/2 text-right">
                            <h2 className="text-4xl font-light text-slate-300 uppercase tracking-widest mb-4">TEKLİF</h2>
                            <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
                                <span className="text-slate-500 font-medium">Teklif No:</span>
                                <span className="font-bold text-slate-900">{proposal.proposalNumber}</span>

                                <span className="text-slate-500 font-medium">Tarih:</span>
                                <span>{new Date(proposal.proposalDate).toLocaleDateString('tr-TR')}</span>

                                <span className="text-slate-500 font-medium">Geçerlilik:</span>
                                <span>{proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString('tr-TR') : '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Sayın Yetkili</h3>
                        <div className="text-base font-semibold text-slate-900">{proposal.customer?.title}</div>
                        <div className="text-sm text-slate-600 mt-1">
                            {proposal.customer?.address && <p>{proposal.customer.address}</p>}
                            {proposal.customer?.city && <p>{proposal.customer.city} / {proposal.customer?.district}</p>}
                            <div className="mt-2 text-xs text-slate-500">
                                {proposal.customer?.phone && <span>Tel: {proposal.customer.phone} </span>}
                                {proposal.customer?.email && <span>| E-posta: {proposal.customer.email}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-800 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    <th className="py-2 pl-2 w-16">Kod</th>
                                    <th className="py-2">Ürün / Açıklama</th>
                                    <th className="py-2 text-right w-20">Miktar</th>
                                    <th className="py-2 text-right w-24">Birim Fiyat</th>
                                    <th className="py-2 text-right w-24">Toplam</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {proposal.items?.map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 print:hover:bg-transparent">
                                        <td className="py-3 pl-2 font-mono text-xs text-slate-500">{item.stockCode}</td>
                                        <td className="py-3 pr-4">
                                            <div className="font-semibold text-slate-800">{item.productName}</div>
                                            {item.description && (
                                                <div className="text-xs text-slate-500 italic mt-0.5">{item.description}</div>
                                            )}
                                        </td>
                                        <td className="py-3 text-right text-slate-600">
                                            {Number(item.quantity).toLocaleString('tr-TR')} {item.unit}
                                        </td>
                                        <td className="py-3 text-right text-slate-600">
                                            {Number(item.unitPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3 text-right font-medium text-slate-900">
                                            {Number(item.lineTotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals & Notes Layout */}
                    <div className="flex flex-row gap-8 mb-8">
                        {/* Left: Notes & Terms */}
                        <div className="flex-1 space-y-6">
                            {(proposal.deliveryTime || proposal.paymentTerms) && (
                                <div className="bg-slate-50 p-4 rounded-lg print:border print:border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Teklif Şartları</h4>
                                    <div className="grid gap-2 text-sm">
                                        {proposal.deliveryTime && (
                                            <div className="flex gap-2">
                                                <span className="font-semibold w-24">Teslim Süresi:</span>
                                                <span>{proposal.deliveryTime}</span>
                                            </div>
                                        )}
                                        {proposal.paymentTerms && (
                                            <div className="flex gap-2">
                                                <span className="font-semibold w-24">Ödeme:</span>
                                                <span>{proposal.paymentTerms}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {proposal.notes && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Notlar</h4>
                                    <p className="text-sm text-slate-600 whitespace-pre-line">{proposal.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Totals */}
                        <div className="w-64">
                            <div className="space-y-2 text-sm border-t border-slate-200 pt-4">
                                <div className="flex justify-between text-slate-600">
                                    <span>Ara Toplam:</span>
                                    <span>{
                                        proposal.items.reduce((acc: number, item: any) => acc + Number(item.lineTotal), 0)
                                            .toLocaleString('tr-TR', { minimumFractionDigits: 2 })
                                    } {proposal.currency?.code}</span>
                                </div>
                                {Number(proposal.discountRate) > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>İskonto (%{Number(proposal.discountRate)}):</span>
                                        <span>-{(Number(proposal.totalAmount) * (1 - (1 + Number(proposal.discountRate) / 100))).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                        {/* Basit hesap gosterimi, API dogrusunu donmeli ama burada hesaplama zor */}
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-600">
                                    <span>KDV Toplam:</span>
                                    <span>
                                        {(Number(proposal.totalAmount) - proposal.items.reduce((acc: number, item: any) => acc + Number(item.lineTotal), 0))
                                            .toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {proposal.currency?.code}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-t-2 border-slate-800 pt-2 text-lg font-bold text-slate-900">
                                    <span>Genel Toplam:</span>
                                    <span>{Number(proposal.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {proposal.currency?.code}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-8 border-t border-slate-200">
                        <div className="flex justify-between items-end text-xs text-slate-500">
                            <div>
                                <p>Bu teklif {new Date().toLocaleDateString('tr-TR')} tarihinde oluşturulmuştur.</p>
                                <p>Sorularınız için bizimle iletişime geçebilirsiniz.</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-800">{settings?.companyTitle}</p>
                                <p>{settings?.companyEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* --- REPORT CONTENT END --- */}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 10mm;
                        size: A4;
                    }
                    body {
                        background: white;
                    }
                    /* Hide everything else */
                    nav, aside, header, footer, .no-print {
                        display: none !important;
                    }
                }
            `}</style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossOrigin="anonymous" referrerPolicy="no-referrer"></script>
        </div>
    )
}
