'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Save, Settings, LogOut, Globe, FileImage, CloudCog, Upload, Loader2 } from 'lucide-react'

// Settings fetch
async function getSettings() {
    const res = await fetch('/api/settings')
    if (!res.ok) throw new Error('Ayarlar yuklenemedi')
    return res.json()
}

// Settings update
async function updateSettings(data: any) {
    const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Ayarlar guncellenemedi')
    return res.json()
}

export default function SettingsPage() {
    const router = useRouter()
    const queryClient = useQueryClient()

    const [formData, setFormData] = useState({
        siteTitle: '',
        siteDescription: '',
        faviconUrl: '',
        logoUrl: '',



    })

    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: getSettings
    })

    useEffect(() => {
        if (settings) {
            setFormData({
                siteTitle: settings.siteTitle || '',
                siteDescription: settings.siteDescription || '',
                faviconUrl: settings.faviconUrl || '',
                logoUrl: settings.logoUrl || '',



            })
        }
    }, [settings])

    const updateMutation = useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] })
            alert('Ayarlar kaydedildi!')
        },
        onError: (error) => {
            alert('Hata: ' + error.message)
        }
    })

    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [uploadingFavicon, setUploadingFavicon] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'faviconUrl') => {
        const file = e.target.files?.[0]
        if (!file) return

        if (field === 'logoUrl') setUploadingLogo(true)
        else setUploadingFavicon(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Yükleme başarısız')

            const data = await res.json()
            setFormData(prev => ({ ...prev, [field]: data.url }))
        } catch (error) {
            alert('Dosya yüklenirken hata oluştu')
        } finally {
            if (field === 'logoUrl') setUploadingLogo(false)
            else setUploadingFavicon(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate(formData)
    }

    const handleLogout = async () => {
        await fetch('/api/auth/login', { method: 'DELETE' })
        router.push('/login')
        router.refresh()
    }

    if (isLoading) {
        return <div className="p-4 md:p-8">Yukleniyor...</div>
    }

    return (
        <div className="space-y-6 p-4 md:p-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ayarlar</h2>
                    <p className="text-muted-foreground text-sm md:text-base">Site yapilandirmasi ve hesap yonetimi</p>
                </div>
                <Button variant="destructive" onClick={handleLogout} className="w-full md:w-auto">
                    <LogOut className="mr-2 h-4 w-4" /> Cikis Yap
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Site Bilgileri */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Site Bilgileri
                        </CardTitle>
                        <CardDescription>
                            Sitenizin basligi ve aciklamasi
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="siteTitle">Site Basligi</Label>
                            <Input
                                id="siteTitle"
                                value={formData.siteTitle}
                                onChange={(e) => setFormData(prev => ({ ...prev, siteTitle: e.target.value }))}
                                placeholder="Finans ERP"
                            />
                            <p className="text-xs text-muted-foreground">
                                Tarayici sekmesinde gorunecek baslik
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="siteDescription">Site Aciklamasi</Label>
                            <Input
                                id="siteDescription"
                                value={formData.siteDescription}
                                onChange={(e) => setFormData(prev => ({ ...prev, siteDescription: e.target.value }))}
                                placeholder="Finansal Yonetim Sistemi"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Firma Logosu */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileImage className="h-5 w-5" />
                            Firma Logosu
                        </CardTitle>
                        <CardDescription>
                            Sol menüde görünecek firma logosu
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            <div className="flex items-center gap-4">
                                {formData.logoUrl ? (
                                    <div className="relative group">
                                        <div className="p-2 border rounded-lg bg-white">
                                            <img
                                                src={formData.logoUrl}
                                                alt="Logo"
                                                className="h-16 max-w-[200px] object-contain"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                                        >
                                            <LogOut className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground bg-muted/50">
                                        <FileImage className="h-8 w-8 opacity-50" />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <Label htmlFor="logoUpload" className="cursor-pointer">
                                        <div className="flex items-center gap-2 w-full p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                            <Upload className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                {uploadingLogo ? 'Yükleniyor...' : 'Bilgisayardan logo seç...'}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            id="logoUpload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'logoUrl')}
                                            disabled={uploadingLogo}
                                        />
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Önerilen boyut: 150x40 piksel. PNG veya JPG.
                                    </p>
                                </div>
                            </div>

                            {/* Eski URL girişi - Gelişmiş seçenek olarak gizlenebilir veya küçük gösterilebilir */}
                            <div className="text-xs">
                                <span className="text-muted-foreground cursor-pointer hover:underline" onClick={() => {
                                    const el = document.getElementById('logoUrlInput');
                                    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                                }}>Manuel URL Gir (Gelişmiş)</span>
                                <Input
                                    id="logoUrlInput"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                                    placeholder="https://..."
                                    className="mt-1 h-8 text-xs hidden"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>





                {/* Favicon */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileImage className="h-5 w-5" />
                            Favicon
                        </CardTitle>
                        <CardDescription>
                            Tarayici sekmesinde gorunecek ikon
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            <div className="flex items-center gap-4">
                                {formData.faviconUrl ? (
                                    <div className="relative group">
                                        <div className="p-2 border rounded-lg bg-white">
                                            <img
                                                src={formData.faviconUrl}
                                                alt="Favicon"
                                                className="w-8 h-8 object-contain"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setFormData(prev => ({ ...prev, faviconUrl: '' }))}
                                        >
                                            <LogOut className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="h-12 w-12 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground bg-muted/50">
                                        <FileImage className="h-6 w-6 opacity-50" />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <Label htmlFor="faviconUpload" className="cursor-pointer">
                                        <div className="flex items-center gap-2 w-full p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                            <Upload className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                {uploadingFavicon ? 'Yükleniyor...' : 'Bilgisayardan ikon seç...'}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            id="faviconUpload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'faviconUrl')}
                                            disabled={uploadingFavicon}
                                        />
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Favicon dosyası (kare format, örn: 32x32)
                                    </p>
                                </div>
                            </div>

                            <div className="text-xs">
                                <span className="text-muted-foreground cursor-pointer hover:underline" onClick={() => {
                                    const el = document.getElementById('faviconUrlInput');
                                    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                                }}>Manuel URL Gir (Gelişmiş)</span>
                                <Input
                                    id="faviconUrlInput"
                                    value={formData.faviconUrl}
                                    onChange={(e) => setFormData(prev => ({ ...prev, faviconUrl: e.target.value }))}
                                    placeholder="/favicon.ico"
                                    className="mt-1 h-8 text-xs hidden"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={updateMutation.isPending} className="w-full md:w-auto">
                        <Save className="mr-2 h-4 w-4" />
                        {updateMutation.isPending ? 'Kaydediliyor...' : 'Ayarlari Kaydet'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
