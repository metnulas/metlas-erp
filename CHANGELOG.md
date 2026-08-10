# Değişiklik Kaydı

METLAS ERP V1 geliştirmelerinde kullanıcıyı ve sistemi etkileyen değişiklikler.

## Yayınlanmamış

### AŞAMA 1 — Kod temizliği ve UI standardizasyonu

#### Eklendi

- Ortak `Field`, `Textarea` ve `Select` UI component'leri.
- Ortak Order status label/style sabitleri.
- Merkezi API hata işleme yardımcı işlevi.
- Global error boundary ve loading ekranı.

#### Değiştirildi

- Product ve Vehicle formları ortak form primitive'lerini kullanıyor.
- Order ve Delivery ekranlarında status görünümleri ortaklaştırıldı.
- Header'daki henüz uygulanmamış Profilim, Ayarlar ve Bildirimler öğeleri kaldırıldı.
- Sidebar mobil dialog semantiği ve backdrop davranışı iyileştirildi.
- Customer repository update sorgusu tenant ID ile sınırlandırıldı.
- Runtime log/pid dosyaları ignore kapsamına alındı.

#### Temizlendi

- Kullanılmayan create-next-app public SVG dosyaları kaldırıldı.
- Runtime log ve pid kalıntıları kaldırıldı.
- Stok endpoint'i merkezi API error handler kullanacak şekilde sadeleştirildi.
- Ürün, araç ve personel listelerine server-side pagination ve debounced search eklendi.
- Müşteri ve sipariş formu not alanları ortak `Textarea` component'ine geçirildi.
- Ürün, araç, personel, dağıtım ve rapor sayfalarına metadata eklendi.
- Tüm API route'larının hata yönetimi merkezi `handleApiError` ile standardize edildi.
- Teslimat atama formu ortak `Select` ve `Textarea` primitive'lerine geçirildi.
- Müşteri, sipariş ve login sayfaları için eksik metadata'lar eklendi.
- AŞAMA 1 tamamlandı; sonraki aşama Dashboard operasyon merkezi çalışmasıdır.

### AŞAMA 2 — Dashboard operasyon merkezi

- Dashboard KPI'ları gerçek sipariş, müşteri, araç, personel ve ciro verilerine genişletildi.
- Kritik stok ve yaklaşan araç/personel belge uyarıları eklendi.
- Son siparişler ve durumları dashboard'a eklendi.
- Yeni sipariş, dağıtım, stok kontrolü ve müşteri ekleme hızlı işlemleri eklendi.
- Dashboard responsive operasyon merkezi düzenine geçirildi.
- Tahsilat modeli henüz olmadığı için tahsilat KPI'ı eklenmedi.

### Marka Görseli

- METLAS ERP logosu `public/metlas-logo.png` olarak eklendi.
- Logo Sidebar, login ekranı ve favicon metadata'sında kullanılmaya başlandı.

### AŞAMA 3 — Müşteri modülü operasyon tamamlaması

- Müşteri detayına son 50 siparişin geçmişi eklendi.
- Sipariş durumu, tutarı, tarihi, kalem sayısı ve teslimat notları gösteriliyor.
- Son siparişten tek tıklamayla tekrar sipariş oluşturma aksiyonu eklendi.
- Müşteri detayındaki gereksiz çift sorgu kaldırıldı.
- Cari/depozito hareket defteri migration'ı Tahsilatlar aşamasına bırakıldı.

### AŞAMA 4 — Sipariş operasyon akışı

- Sipariş ve teslimat durumları için ileri yönlü geçiş kuralları eklendi.
- Sipariş detay GET endpoint'inin gereksiz write yetkisi kaldırıldı.
- Sipariş formu ortak Select primitive'ini kullanacak şekilde standardize edildi.
- Araç/personel ataması, teslimat notları ve sipariş toplamları Tahsilatlar aşamasına bağlantı noktası olarak korundu.

### AŞAMA 5 — Dağıtım operasyonu

- Günlük dağıtım ekranına aktif işler, dağıtımda, teslim edildi ve iptal filtreleri eklendi.
- Tarih ve durum filtreleri birlikte çalışacak şekilde düzenlendi.
- Araç/personel ataması ve teslimat notları mobil uyumlu ortak form yapısıyla korundu.
- Teslimat tarihleri için format validasyonu eklendi.
- Dağıtım ve teslim stok düşümü akışları doğrulandı.

### AŞAMA 6 — Ürünler ve stok

- Ürün listesine kritik stok filtresi eklendi.
- Kritik stok sorgusu server-side pagination ile çalışıyor.
- Manuel stok hareketleri alış, iade ve düzeltme türleriyle sınırlandırıldı.
- Manuel stok düzeltmesinde artırma/azaltma yönü seçilebilir hale getirildi.
- Stok hareketleri mobil kart ve masaüstü tablo görünümünde standardize edildi.
- Stok hareket türleri Türkçe etiketlerle gösteriliyor.

#### Doğrulama

- TypeScript kontrolü başarılı.
- Production build başarılı.
- ESLint 0 hata, 2 React Compiler uyarısı ile tamamlandı.

### AŞAMA 7 — Araçlar

- Araç detayında muayene ve sigorta tarihleri için süre durumu etiketleri eklendi.
- Araca atanmış siparişler müşteri, teslim tarihi ve durum bilgileriyle gösteriliyor.
- Atanmış sipariş sorgusu repository/service katmanlarından tenant kapsamıyla yürütülüyor.

#### Doğrulama

- `npm run build`: başarılı.
- `npm run lint`: 0 hata, 2 React Compiler uyarısı.
- `git diff --check`: başarılı.
- AŞAMA 7 `9cf4498` commit'i ile tamamlandı.

### AŞAMA 8 — Güvenlik ve veri bütünlüğü

- Middleware'deki cookie-varlığı kontrolü kaldırıldı.
- Sayfa ve API erişimlerinde NextAuth JWT imzası ve geçerliliği doğrulanıyor.
- Tenant context içindeki eski authentication geçiş yorumu güncellendi.
- API GET endpoint'lerine read permission kontrolleri eklendi.
- Rol bazlı read/write permission matrisi ADMIN, OPERATIONS, COURIER ve ACCOUNTING için ayrıştırıldı.
- Ürün, sipariş ve teslimat stok düşümlerinde koşullu atomic update kullanılıyor.
- Tenant bazlı concurrency-safe `OrderSequence` modeli ve migration eklendi.
- Tenant ilişkili `AuditLog` modeli ve migration eklendi.
- Müşteri, sipariş, ürün/stok, araç, personel ve teslimat write işlemlerine audit kayıtları bağlandı.
- Audit yazma hataları ana operasyonu bozmayacak şekilde logger ile kaydediliyor.
- `/audit-logs` ekranı ve tenant kapsamlı audit GET API'si eklendi.
- Audit filtreleri, pagination ve temel permission/tenant servis testleri eklendi.
- `OrderSequence` ve `AuditLog` migration'ları Neon veritabanına uygulandı.

#### AŞAMA 8 Sonucu

- AŞAMA 8 güvenlik ve veri bütünlüğü kapsamı tamamlandı.
- Sonraki geliştirme odağı finansal çekirdektir.

### AŞAMA 9 — Finansal çekirdek (devam ediyor)

- `CustomerAccountEntry` modeli ile cari/depozito hareket defteri eklendi.
- Borç, tahsilat, depozito giriş ve depozito çıkış hareketleri destekleniyor.
- Bakiye ve depozito güncellemeleri transaction ve koşullu atomic kontrol ile korunuyor.
- Müşteri detayına hareket listeleme ve yeni hareket ekleme paneli eklendi.
- Cari hareket API'si tenant ve permission kapsamıyla eklendi.
- Sipariş detayına tek tıkla Onayla, Dağıtıma Çıkar, Teslim Edildi ve İptal Et aksiyonları eklendi.
- Hızlı durum aksiyonlarında teslimat ve iptal için onay adımı bulunuyor.
- Sipariş durum seçimleri mevcut akışa göre filtrelenerek geçersiz geri geçiş seçenekleri kaldırıldı.
- Geçiş hataları izin verilen sonraki durumları açıklayacak şekilde iyileştirildi.
- Onaylanan ve dağıtıma çıkarılan siparişlerde en az işi olan aktif araç/personel otomatik atanıyor.
- Manuel araç/personel seçimi otomatik atamanın önceliğini koruyor.
- Sipariş kartı ve masaüstü işlem menüsünden doğrudan durum güncelleme eklendi.
- Dashboard'daki sipariş hacmi bölümü OpenStreetMap + OSRM uyumlu günlük rota merkezine dönüştürüldü.
- Müşteri koordinat alanları ve bugünkü teslimat rota veri akışı eklendi.
- Harita altyapısı OpenStreetMap + Leaflet + OSRM olarak standardize edildi; API anahtarı gerekmiyor.
- Müşteri adreslerini otomatik koordinata çevirmek için Nominatim geocoding akışı eklendi; Google API anahtarı gerekmiyor.
- OSRM Trip API isteğinde `source=first&destination=last` parametreleri kullanılarak public rota servisinin `400` hatası giderildi.
- Geocoding sonuçları şehir/ilçe eşleşmesiyle doğrulanıyor ve detaylı adreslerde düşük hassasiyetli şehir merkezi sonuçları kullanılmıyor.
- Nominatim sonucu bulunamadığında ArcGIS World Geocoder ile sokak/bina seviyesinde ikinci geocoding sağlayıcısı kullanılıyor; eşleşme yoksa yanlış koordinat kaydedilmiyor.
- OSRM rota başlangıç ve bitiş durakları sabitlenerek rota son teslimatta bitiriliyor; başlangıç noktasına dönüş kaldırıldı.
- Rota merkezindeki sipariş kartlarına durum güncelleme ve Google Maps yol tarifi butonları eklendi.
- Teslim edilen siparişler aktif günlük rotadan çıkarılıyor, yeşil marker olarak haritada kalıyor.
- Günlük rota snapshot'ı ve `RouteHistory` migration'ı eklendi.
- `/route-histories` ekranında günlük mesafe, tahmini yakıt/yakıt maliyeti ve teslim ciro bilgileri gösteriliyor.
- Yakıt varsayımları `ROUTE_FUEL_PRICE_PER_LITER` ve `ROUTE_FUEL_CONSUMPTION_L_PER_100KM` ortam değişkenlerine taşındı.
- Sipariş durum arayüzü `Bekleyen dağıtım` ve `Teslim edildi` olarak sadeleştirildi; `Onaylandı` ve `Bekliyor` seçenekleri kaldırıldı.
- Müşteri, ürün, araç ve personel kodları yeni kayıtlarda otomatik üretiliyor; yeni sipariş teslim tarihi bugünün tarihiyle başlıyor.
- Haritaya sürüklenebilir kurye marker'ı eklendi; rota kurye konumundan başlayıp teslimatları yakından uzağa sıralıyor.
- Aynı müşterinin aynı gün içindeki tekrar siparişleri marker üzerinde adet sayısıyla gösteriliyor; aktif sipariş kırmızı olarak öne alınıyor.

#### Doğrulama

- `npm run build`: başarılı.
- `npm run lint`: 0 hata, 2 React Compiler uyarısı.
- `git diff --check`: başarılı.
- `npm test`: 2 test başarılı.

## Önceki Sürümler

- Customer, Order, Product, Vehicle, Personnel ve Delivery temel modülleri.
- Multi-tenant Prisma altyapısı, soft delete ve audit alanları.
- NextAuth Credentials/JWT authentication ve temel permission sistemi.
