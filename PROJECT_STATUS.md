# METLAS ERP Proje Durumu

## Version

`METLAS ERP v1.0 Stable` geliştirme protokolü aktif. Proje şu anda **AŞAMA 6 tamamlandı; AŞAMA 7 devam ediyor** durumundadır.

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

## AŞAMA 3 Durumu

**Durum:** Tamamlandı.

### Yapılan değişiklikler

- Müşteri detayındaki gereksiz çift müşteri sorgusu kaldırıldı.
- Müşteri detayına son 50 siparişten oluşan sipariş geçmişi eklendi.
- Sipariş geçmişinde durum, tutar, tarih, kalem sayısı ve teslimat notu gösteriliyor.
- Son siparişten tek tıklamayla yeni `PENDING` tekrar sipariş oluşturma aksiyonu eklendi.
- Müşteri detayındaki tekrar sipariş aksiyonu mobilde tam genişlikte kullanılabiliyor.

### Kapsam sınırı

Cari ve depozito hareket defteri mevcut şemada bulunmadığı için bu aşamada yeni migration açılmadı. Gerçek finansal hareket modeli AŞAMA 9 Tahsilatlar kapsamında tasarlanacak.

### Doğrulama

- Müşteri listesi: HTTP `200`.
- Müşteri detay ve sipariş geçmişi: HTTP `200`.
- `npx tsc --noEmit`: başarılı.
- `npm run build`: başarılı.
- `npm run lint`: 0 hata, 2 bilgilendirici kütüphane uyarısı.

## AŞAMA 4 Durumu

**Durum:** Tamamlandı.

### Yapılan değişiklikler

- Sipariş durumları için ileri yönlü geçiş kuralları eklendi; geriye dönüşler engellendi.
- Teslimat servisi aynı durum geçiş kurallarını kullanıyor.
- Sipariş detay GET endpoint'inden gereksiz `order:write` yetkisi kaldırıldı.
- Sipariş formu müşteri, ürün ve durum seçimlerinde ortak `Select` primitive'ini kullanıyor.
- Mevcut araç/personel teslimat ataması ve teslimat notları sipariş detayında korunuyor.
- Tahsilat için sipariş toplamı ve müşteri bağlantısı sonraki finansal modele hazır bırakıldı; henüz sahte ödeme alanı eklenmedi.

### Doğrulama

- Sipariş listesi: HTTP `200`.
- Sipariş detay: HTTP `200`.
- `npx tsc --noEmit`: başarılı.
- `npm run build`: başarılı.
- `npm run lint`: 0 hata, 2 bilgilendirici kütüphane uyarısı.

## Bilinen Sorunlar

- Next.js 16 middleware convention için `proxy` deprecation uyarısı veriyor.
- React Compiler, React Hook Form ve TanStack Table kullanımını memoization açısından uyarıyor.
- Kapsamlı unit, integration ve e2e test altyapısı henüz yok.
- Cookie varlığına dayalı middleware kontrolü token imzasını/expiry'sini doğrulamıyor.
- Tahsilat, Kasa ve Ayarlar modülleri henüz uygulanmadı.
- Marka logosu Sidebar, login ve favicon alanlarına eklendi.

## AŞAMA 5 Durumu

**Durum:** Tamamlandı.

### Yapılan değişiklikler

- Günlük dağıtım ekranına aktif işler, dağıtımda, teslim edildi ve iptal filtreleri eklendi.
- Tarih ve durum filtreleri birlikte çalışıyor.
- Araç/personel ataması ve teslimat notları mobil uyumlu ortak form primitive'leriyle çalışıyor.
- Teslimata geçişte aktif araç ve personel zorunluluğu korunuyor.
- Teslim edildiğinde stok düşümü ve stok hareketi oluşturma akışı korunuyor.
- Dağıtım tarihleri için `YYYY-AA-GG` format validasyonu eklendi.

### Doğrulama

- Dağıtım API: HTTP `200`.
- Dağıtım sayfası: HTTP `200`.
- `npx tsc --noEmit`: başarılı.
- `npm run build`: başarılı.
- `npm run lint`: 0 hata, 2 bilgilendirici kütüphane uyarısı.

## Sonraki Aşama

**AŞAMA 7 — Araçlar.**

Kapsam: belgeler, görevler, detay ekranı ve mobil araç yönetimi.

## AŞAMA 6 Durumu

**Durum:** Tamamlandı.

### Yapılan değişiklikler

- Ürün listesine kullanıcı tarafından açılıp kapanabilen kritik stok filtresi eklendi.
- Kritik stok listesi server-side filtre ve pagination ile çalışıyor.
- Manuel stok işlemleri sistem hareketlerinden ayrıldı; kullanıcı yalnızca alış, iade ve manuel düzeltme yapabiliyor.
- Manuel düzeltmede stok artırma/azaltma yönü açıkça seçilebiliyor.
- Stok hareketleri mobil kart ve masaüstü tablo görünümünde okunabilir hale getirildi.
- Stok hareket türleri Türkçe etiketlerle gösteriliyor.
- Depozitolu ürün bilgisi ürün detayında korunuyor.

### Doğrulama

- Ürün API: HTTP `200`.
- Ürün listesi: HTTP `200`.
- Ürün detay/stok ekranı: HTTP `200`.
- `npx tsc --noEmit`: başarılı.
- `npm run build`: başarılı.
- `npm run lint`: 0 hata, 2 bilgilendirici kütüphane uyarısı.

## AŞAMA 7 Durumu

**Durum:** Tamamlandı.

### Yapılan değişiklikler

- Araç detayında muayene ve sigorta tarihleri için geçmiş, 30 gün içi ve geçerli durumları gösterildi.
- Araç detayına tenant kapsamlı atanmış siparişler bölümü eklendi.
- Araç listesinde süresi geçmiş veya 30 gün içinde dolacak belgeler görünür uyarı olarak gösteriliyor.
- Araç liste ve detay aksiyonları mobil ekranlarda tam genişlik ve kırılabilir düzeni destekliyor.

### Doğrulama

- `npm run build`: başarılı.
- `npm run lint`: 0 hata, 2 bilgilendirici kütüphane uyarısı.
- `git diff --check`: başarılı.

## Tamamlanma

V1 genel tamamlanma: **yaklaşık %70**. Bu oran kod kapsamına dayalı teknik tahmindir; ticari kabul oranı değildir.

## Son Commit

Çalışma ağacında AŞAMA 7 araç detay geliştirmeleri mevcut; henüz commit edilmedi.

## Tarih

24 Temmuz 2026
