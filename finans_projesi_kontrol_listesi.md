# Finans Projesi - Çoklu Para Birimi ve UX Düzeltmeleri
*(Diğer projelerde uygulanacak kontrol listesi)*

## 1. Dashboard Bakiyeleri (Multi-Currency Fix)
**Sorun:** Farklı para birimindeki carilerin bakiyeleri (TL, USD) dashboard listelerinde hatalı toplanıyordu (örn: 100 USD + 100 TL = 200 birim gibi).
**Çözüm:**
- `api/reports/dashboard/route.ts` içinde bakiyeleri `currency` bazında gruplayarak hesapla.
- Frontend'de her satırın yanında para birimi simgesini (₺, $, €) göster.

## 2. Rapor Tarih Filtresi (End Date Bug)
**Sorun:** Raporda "Bitiş Tarihi" seçildiğinde, o günün sonundaki işlemler rapora dahil olmuyordu (Saat 00:00:00 baz alındığı için).
**Çözüm:**
- `api/reports/statement/route.ts` içinde bitiş tarihini günün sonuna çek:
  ```typescript
  endDateTime.setHours(23, 59, 59, 999)
  ```

## 3. Cari Detay - Kayıp İşlemler (Mixed Currency View)
**Sorun:** Bir cariye yanlışlıkla farklı para biriminde işlem girilirse (örn: USD carisine TL ödeme), detay sayfasında bu işlem gizleniyordu.
**Çözüm:**
- `finance/caries/[id]/page.tsx` içinde ekstre çekerken para birimi filtresini kaldır (`currencyCode: 'ALL'`).
- Tabloda tutarların yanına küçük `span` ile para birimi kodu ekle (örn: `100 TL`, `50 USD`) ki karışıklık fark edilsin.

## 4. Ödeme Ekranı Güvenliği (Currency Selector)
**Sorun:** Cari detayından "Ödeme Ekle" denildiğinde, sistem otomatik olarak carinin varsayılan para birimini alıyordu, kullanıcının değiştirme şansı yoktu.
**Çözüm:**
- `finance/caries/[id]/page.tsx` ve `finance/payments/page.tsx` diyaloglarına **Para Birimi Seçimi** (Select Box) ekle.
- Varsayılanı cariden getir, ama kullanıcının değiştirmesine izin ver.

## 5. Satış Fişi - Serbest Tutar Girişi (Editable Amount)
**Sorun:** Fatura/Satış girerken kullanıcı "Toplam Tutar"ı yazamıyordu, birim fiyatı hesaplamak zorunda kalıyordu.
**Çözüm:**
- `finance/sales/new/page.tsx` içinde "Tutar" hücresini `<Input>` yap.
- Kullanıcı Tutarı değiştirdiğinde Birim Fiyatı tersten hesapla: `BirimFiyat = Tutar / Miktar`.
