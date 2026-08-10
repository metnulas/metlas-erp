# METLAS ERP Proje Durumu

## Version

`METLAS ERP v1.0 Stable` geliştirme protokolü aktif. Proje şu anda **AŞAMA 8 tamamlandı; AŞAMA 9 devam ediyor** durumundadır.

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

**AŞAMA 9 — Finansal çekirdek.**

Kapsam: cari hareketler, tahsilat/ödeme, kasa, giderler, depozito hareketleri ve finansal raporlar.

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

## AŞAMA 8 Durumu

**Durum:** Tamamlandı.

### Tamamlanan alt iş

- Middleware artık yalnızca cookie varlığını kabul etmiyor; NextAuth JWT imzası ve geçerliliği `getToken` ile doğrulanıyor.
- Geçersiz veya süresi dolmuş token'lar API isteklerinde `401`, sayfa isteklerinde login yönlendirmesi alıyor.
- Tenant context içindeki eski authentication geçiş yorumu güncellendi.
- API GET endpoint'lerine rol bazlı read permission kontrolleri eklendi.
- ADMIN, OPERATIONS, COURIER ve ACCOUNTING rolleri için read/write permission matrisi tanımlandı.
- Ürün ayarı, sipariş oluşturma ve teslimat stok düşümleri koşullu atomic güncelleme kullanıyor.
- Sipariş kodu üretimi tenant bazlı `OrderSequence` modeli ve migration ile concurrency-safe hale getirildi.
- Tenant ilişkili `AuditLog` modeli ve migration eklendi.
- Müşteri, sipariş, ürün/stok, araç, personel ve teslimat write işlemleri actor, işlem ve entity bilgisiyle audit ediliyor.
- Audit log listeleme API'si ve `/audit-logs` ekranı eklendi.
- Audit ekranında işlem ve entity filtreleri ile pagination bulunuyor.
- Permission matrisi ve audit service için otomatik testler eklendi.
- `OrderSequence` ve `AuditLog` migration'ları veritabanına uygulandı.

### Doğrulama

- `npm run build`: başarılı.
- `npm run lint`: 0 hata, 2 bilgilendirici kütüphane uyarısı.
- `git diff --check`: başarılı.

### Kalan kapsam

- Tenant izolasyonu otomatik testleri.
- Geniş kapsamlı integration ve E2E testleri sonraki kalite fazında sürdürülecek.

## AŞAMA 9 Durumu

**Durum:** Devam ediyor.

### Tamamlanan alt iş

- Tenant ilişkili `CustomerAccountEntry` modeli ve migration eklendi.
- `CHARGE`, `PAYMENT`, `DEPOSIT_IN` ve `DEPOSIT_OUT` hareket türleri tanımlandı.
- Bakiye ve depozito düşümleri transaction içinde koşullu atomic güncelleniyor.
- Müşteri hareketleri için tenant kapsamlı GET/POST API eklendi.
- Müşteri detayına cari/depozito hareket paneli ve yeni hareket formu eklendi.
- Hareketler actor ve audit log kaydıyla ilişkilendiriliyor.
- Migration Neon veritabanına uygulandı.
- Sipariş detayına Onayla, Dağıtıma Çıkar, Teslim Edildi ve İptal Et hızlı durum aksiyonları eklendi.
- Teslim edildi aksiyonu mevcut stok düşümü ve araç/personel doğrulama akışını kullanıyor.
- Sipariş düzenleme ve dağıtım formlarında yalnızca geçerli sonraki durumlar gösteriliyor; kafa karıştıran geri geçiş hataları önlendi.
- Onaylanan veya dağıtıma çıkarılan siparişlerde boş araç/personel alanları, aynı gün en az işi olan aktif adaylarla otomatik dolduruluyor.
- Manuel araç/personel seçimi korunuyor; otomatik atama yalnızca ilgili alan boşsa çalışıyor.
- Sipariş mobil kartlarında ve masaüstü işlem menüsünde doğrudan durum güncelleme aksiyonu bulunuyor.
- Dashboard'daki sipariş hacmi alanı OpenStreetMap + OSRM uyumlu rota merkeziyle değiştirildi.
- Müşterilere enlem/boylam alanları eklendi; bugünün koordinatlı teslimatları harita ve optimize edilmiş rota için hazırlanıyor.
- Harita için API anahtarı gerekmiyor; OpenStreetMap attribution ve OSRM rota servisi kullanılıyor.
- Müşteri adresleri kaydedilirken Nominatim/OpenStreetMap ile koordinata otomatik çevriliyor; kullanıcı koordinat girmek zorunda değil.
- OSRM Trip API çağrısında rota başlangıç ve bitiş durakları açıkça sabitlendi; public servis kaynaklı `400` hatası giderildi.
- Geocoding sonuçları şehir/ilçe ile doğrulanıyor; detaylı adresler için düşük hassasiyetli şehir merkezi sonuçları reddediliyor.
- Nominatim eşleşmesi yetersiz kaldığında ArcGIS World Geocoder ile sokak/bina seviyesinde ikinci doğrulama yapılıyor; adres bulunamazsa koordinat yazılmıyor.
- Rota OSRM'de `source=first`, `destination=last` ve `roundtrip=false` ile son teslimatta bitiyor; başlangıç noktasına dönüş yapılmıyor.
- Rota merkezine sipariş durum aksiyonları ve sipariş/multi-stop Google Maps yol tarifi bağlantıları eklendi.
- Teslim edilen siparişler aktif OSRM/Google Maps rotasından çıkarılıyor; yeşil geçmiş marker olarak haritada tutuluyor.
- Günlük rota snapshot'ı, duraklar, km, tahmini yakıt, yakıt maliyeti ve teslim ciro metrikleriyle `RouteHistory` modeline kaydediliyor.
- `/route-histories` ekranı ve sidebar bağlantısı eklendi; yakıt varsayımları `ROUTE_FUEL_PRICE_PER_LITER` ve `ROUTE_FUEL_CONSUMPTION_L_PER_100KM` ile ayarlanabiliyor.
- Sipariş UI durumları `Bekleyen dağıtım` ve `Teslim edildi` görünümünde sadeleştirildi; `PENDING`, `CONFIRMED` ve `DELIVERING` iç durumları tek etikette birleştirildi, durum filtresi de gruplanmış hale getirildi.
- Yeni müşteri, ürün, araç ve personel kayıtlarında kodlar sunucu tarafında tenant bazlı otomatik üretiliyor (`MUS-0001`, `URN-0001`, `ARAC-0001`, `PER-0001`); yeni siparişte teslim tarihi varsayılan olarak bugünün tarihi.
- Haritaya tarayıcı konumundan başlayan sürüklenebilir kurye marker'ı eklendi; marker bırakıldığında aktif teslimatlar kurye noktasından yakından uzağa sabit sırayla OSRM rotasına gönderiliyor.
- Aynı müşterinin aynı gündeki birden fazla siparişi marker üzerinde adet rozetiyle gösteriliyor; aktif tekrar siparişi kırmızı marker olarak teslim edilmiş yeşil marker'ın üzerinde kalıyor.

### Kalan kapsam

- Kasa ve gider yönetimi.
- Finansal raporlar ve tahsilat raporları.
- Sipariş teslimiyle cari/depozito otomatik eşleştirme kuralları.

## Tamamlanma

V1 genel tamamlanma: **yaklaşık %85**. Bu oran kod kapsamına dayalı teknik tahmindir; ticari kabul oranı değildir.

## Son Commit

Çalışma ağacında AŞAMA 8 kapanış ve AŞAMA 9 geliştirmeleri mevcut; commit bekliyor.

## Tarih

27 Temmuz 2026
