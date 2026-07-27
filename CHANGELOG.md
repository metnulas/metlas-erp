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

## Önceki Sürümler

- Customer, Order, Product, Vehicle, Personnel ve Delivery temel modülleri.
- Multi-tenant Prisma altyapısı, soft delete ve audit alanları.
- NextAuth Credentials/JWT authentication ve temel permission sistemi.
