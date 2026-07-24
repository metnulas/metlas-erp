# METLAS ERP Proje Durumu

## Version

`METLAS ERP v1.0 Stable` geliştirme protokolü aktif. Proje şu anda **AŞAMA 1 — Kod temizliği, UI standardizasyonu ve responsive temel** aşamasındadır.

## Tamamlanan Aşamalar

- Önceki sprint altyapısı: Prisma, PostgreSQL/Neon, Zod, React Hook Form, TanStack Table, NextAuth ve tenant modeli.
- Customer ve Order temel CRUD akışları.
- Product/Stock, Vehicle, Personnel ve Delivery temel akışları.
- Dashboard, Reports ve mobil sidebar erişimi.
- Authentication, JWT session ve temel rol/permission altyapısı.

## AŞAMA 1 Durumu

**Durum:** Büyük ölçüde tamamlandı; bu paket doğrulandı ve commit aşamasında.

### Yapılan değişiklikler

- Ortak `Field`, `Textarea` ve `Select` UI primitive'leri eklendi.
- Product ve Vehicle formları ortak field/select/textarea sistemine geçirildi.
- Order durum label/style haritaları tek ortak sabite taşındı.
- API hata yönetimi için merkezi `handleApiError` yardımcı işlevi eklendi ve stok endpoint'inde kullanıldı.
- Customer repository update işlemine explicit `tenantId` kapsamı eklendi.
- Global `error.tsx` ve `loading.tsx` eklendi.
- Header'daki işlevsiz Profilim, Ayarlar ve statik bildirim öğeleri kaldırıldı.
- Sidebar'a mobil dialog semantiği ve backdrop geçişi eklendi.
- Kullanılmayan scaffold SVG'leri ve runtime log/pid kalıntıları kaldırıldı.
- Log ve pid dosyaları `.gitignore` kapsamına alındı.
- Ürün, araç ve personel listelerine 20 kayıtlık server-side pagination eklendi.
- Bu listelerde arama alanları `useDebounce` ile standardize edildi.
- Müşteri ve sipariş formu not alanları ortak `Textarea` component'ine geçirildi.
- Ürün, araç, personel, dağıtım ve raporlar liste sayfalarına metadata eklendi.
- Tüm API route'larındaki yerel hata handler'ları merkezi `handleApiError` yardımcı işlevine taşındı.

### Doğrulama

- `npx tsc --noEmit`: başarılı.
- `npm run build`: başarılı.
- `npm run lint`: 0 hata, React Hook Form ve TanStack Table kaynaklı 2 bilgilendirici uyarı.

## Kalan AŞAMA 1 işleri

- Teslimat atama formunun ortak `Select`/`Textarea` component'lerine geçirilmesi.
- Mobil gerçek cihaz/viewport kabul testlerinin yapılması.
- Detay sayfaları ve liste ekranlarında kalan görsel tutarsızlıkların temizlenmesi.
- Kalan sayfa metadata'larının modül bazında tamamlanması.

## Bilinen Sorunlar

- Next.js 16 middleware convention için `proxy` deprecation uyarısı veriyor.
- React Compiler, React Hook Form ve TanStack Table kullanımını memoization açısından uyarıyor.
- Kapsamlı unit, integration ve e2e test altyapısı henüz yok.
- Cookie varlığına dayalı middleware kontrolü token imzasını/expiry'sini doğrulamıyor.
- Tahsilat, Kasa ve Ayarlar modülleri henüz uygulanmadı.

## Sonraki Aşama

**AŞAMA 2 — Dashboard'u gerçek operasyon merkezine dönüştürme.**

Kapsam: KPI'lar, hızlı işlemler, kritik stok, bekleyen tahsilatlar için V1 hazırlığı, yaklaşan belge tarihleri, son işlemler ve mobil operasyon görünümü.

## Tamamlanma

V1 genel tamamlanma: **yaklaşık %68**. Bu oran kod kapsamına dayalı teknik tahmindir; ticari kabul oranı değildir.

## Son Commit

`3307b2f` — `refactor: centralize API error handling`

## Tarih

24 Temmuz 2026
