'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

async function getProposals(search: string) {
    // Basic search filtering implementation can be added to API later
    // For now fetching all
    const res = await fetch(`/api/proposals`)
    if (!res.ok) throw new Error('Teklifler yüklenemedi')
    return res.json()
}

export default function ProposalsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    const { data: proposals, isLoading } = useQuery({
        queryKey: ['proposals'],
        queryFn: () => getProposals(searchTerm)
    })

    const filteredProposals = proposals?.filter((p: any) =>
        p.customer?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.proposalNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT': return <Badge variant="secondary">Taslak</Badge>
            case 'SENT': return <Badge className="bg-blue-500 hover:bg-blue-600">Gönderildi</Badge>
            case 'APPROVED': return <Badge className="bg-green-500 hover:bg-green-600">Onaylandı</Badge>
            case 'REJECTED': return <Badge variant="destructive">Reddedildi</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Teklifler</h2>
                    <p className="text-muted-foreground text-sm">Müşteri tekliflerini yönetin ve takip edin.</p>
                </div>
                <Link href="/finance/proposals/new">
                    <Button size="lg" className="w-full md:w-auto bg-purple-600 hover:bg-purple-700">
                        <Plus className="mr-2 h-4 w-4" /> Yeni Teklif Oluştur
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Teklif No veya Müşteri Ara..."
                            className="pl-8 max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Teklif No</TableHead>
                                <TableHead>Tarih</TableHead>
                                <TableHead>Müşteri</TableHead>
                                <TableHead>Geçerlilik</TableHead>
                                <TableHead className="text-right">Tutar</TableHead>
                                <TableHead className="text-center">Durum</TableHead>
                                <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredProposals?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        Henüz teklif bulunmuyor.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProposals?.map((proposal: any) => (
                                    <TableRow key={proposal.id} className="group cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-mono font-medium text-purple-600">
                                            {proposal.proposalNumber}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(proposal.proposalDate).toLocaleDateString('tr-TR')}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {proposal.customer?.title}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString('tr-TR') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {Number(proposal.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {proposal.currency?.code}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(proposal.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/finance/proposals/${proposal.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
