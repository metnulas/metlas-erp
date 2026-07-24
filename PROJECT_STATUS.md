# METLAS ERP Proje Durumu

## Version

`METLAS ERP v1.0 Stable` geliştirme protokolü aktif. Proje şu anda **AŞAMA 2 tamamlandı; AŞAMA 3 bekliyor** durumundadır.

## Tamamlanan Aşamalar

- Önceki sprint altyapısı: Prisma, PostgreSQL/Neon, Zod, React Hook Form, TanStack Table, NextAuth ve tenant modeli.
- Customer ve Order temel CRUD akışları.
- Product/Stock, Vehicle, Personnel ve Delivery temel akışları.
- Dashboard, Reports ve mobil sidebar erişimi.
- Authentication, JWT session ve temel rol/permission altyapısı.

## AŞAMA 1 Durumu

**Durum:** Tamamlandı.

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
- Teslimat atama formu ortak `Select` ve `Textarea` primitive'lerini kullanacak şekilde standardize edildi.
- Müşteri, sipariş ve login sayfalarının metadata'ları tamamlandı.

### Doğrulama

- `npx tsc --noEmit`: başarılı.
- `npm run build`: başarılı.
- `npm run lint`: 0 hata, React Hook Form ve TanStack Table kaynaklı 2 bilgilendirici uyarı.

## AŞAMA 1 Sonuçları

- Liste ekranlarında server-side pagination ve debounced search standardı uygulandı.
- Formlarda ortak field/select/textarea dili uygulandı.
- API hata yönetimi merkezileştirildi.
- Responsive smoke kontrolü: login `200`, oturumsuz dashboard `307`, yetkisiz API `401`.
- Build ve TypeScript başarılı; ESLint yalnızca 2 bilgilendirici kütüphane uyarısı veriyor.

## AŞAMA 2 Durumu

**Durum:** Tamamlandı.

### Yapılan değişiklikler

- Dashboard gerçek veriden bugünkü sipariş, ciro, aktif müşteri ve bekleyen dağıtım KPI'larını gösteriyor.
- Kritik stok ürünleri ve 30 gün içindeki araç/personel belge tarihleri uyarı olarak gösteriliyor.
- Son 5 sipariş ve durumları dashboard'a eklendi.
- Yeni sipariş, dağıtım, stok kontrolü ve müşteri ekleme hızlı işlemleri eklendi.
- Mevcut 7 günlük sipariş grafiği korunarak operasyon merkezi düzenine alındı.
- Dashboard mobilde tek kolon, geniş ekranlarda iki kolonlu operasyon düzeni kullanıyor.

### Sınır

Tahsilat veri modeli henüz bulunmadığı için dashboard'a sahte "bekleyen tahsilat" KPI'ı eklenmedi. Tahsilat modülü tamamlandığında gerçek veriyle bağlanacaktır.

### Doğrulama

- Dashboard authenticated smoke test: HTTP `200`.
- `npx tsc --noEmit`: başarılı.
- `npm run build`: başarılı.
- `npm run lint`: 0 hata, 2 bilgilendirici kütüphane uyarısı.

## Bilinen Sorunlar

- Next.js 16 middleware convention için `proxy` deprecation uyarısı veriyor.
- React Compiler, React Hook Form ve TanStack Table kullanımını memoization açısından uyarıyor.
- Kapsamlı unit, integration ve e2e test altyapısı henüz yok.
- Cookie varlığına dayalı middleware kontrolü token imzasını/expiry'sini doğrulamıyor.
- Tahsilat, Kasa ve Ayarlar modülleri henüz uygulanmadı.

## Sonraki Aşama

**AŞAMA 3 — Müşteri modülünü tamamla.**

Kapsam: sipariş geçmişi, cari hareket bağlantısı, depozito hareketleri, teslimat notları ve tekrar sipariş.

## Tamamlanma

V1 genel tamamlanma: **yaklaşık %68**. Bu oran kod kapsamına dayalı teknik tahmindir; ticari kabul oranı değildir.

## Son Commit

Bu aşamanın commit hash'i commit sonrasında yazılacaktır.

## Tarih

24 Temmuz 2026
