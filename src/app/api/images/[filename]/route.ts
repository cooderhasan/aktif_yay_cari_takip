import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function GET(
    request: Request,
    { params }: { params: { filename: string } }
) {
    try {
        const filename = params.filename

        // Define the path where files are stored (same as in upload route)
        // Check both locations to be safe given the environment
        let filepath = path.join(process.cwd(), 'public/uploads', filename)

        if (!existsSync(filepath)) {
            return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 })
        }

        const fileBuffer = await readFile(filepath)

        // Determine content type based on extension
        const ext = path.extname(filename).toLowerCase()
        let contentType = 'application/octet-stream'
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
        if (ext === '.png') contentType = 'image/png'
        if (ext === '.gif') contentType = 'image/gif'
        if (ext === '.webp') contentType = 'image/webp'
        if (ext === '.svg') contentType = 'image/svg+xml'
        if (ext === '.ico') contentType = 'image/x-icon'

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        })
    } catch (error) {
        console.error('Image serve error:', error)
        return NextResponse.json({ error: 'Görüntüleme hatası' }, { status: 500 })
    }
}
