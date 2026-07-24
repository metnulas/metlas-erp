# METLAS ERP Proje Raporu

**İncelenen proje:** `C:\Users\metin\metlas-erp`  
**İnceleme tarihi:** 24 Temmuz 2026  
**Kapsam:** Kaynak kodu, Prisma şeması ve migration'lar, API route'ları, sayfalar, component'ler, yapılandırmalar, dokümantasyon ve çalıştırma kontrolleri.

> Bu rapor kod tabanında doğrulanabilen bulgulara dayanır. Canlı kullanıcı davranışı, üretim trafiği, gerçek performans metrikleri ve Neon altyapısının operasyonel durumu koddan kesin olarak doğrulanamaz.

## 1. Proje Özeti

### Amaç

METLAS ERP, Türkiye'deki damacana ve su dağıtım işletmeleri için çok kiracılı bir operasyon yönetim sistemi olarak tasarlanmıştır. Mevcut kapsam; müşteri, sipariş, ürün/stok, araç, personel ve teslimat operasyonlarını yönetmeyi, dashboard ve temel raporlama sunmayı hedefler.

### Mevcut geliştirme seviyesi

- Customer ve Order modülleri CRUD, doğrulama, soft delete ve tenant kapsamıyla uygulanmış durumdadır.
- Product/Stock, Vehicle, Personnel ve Delivery modülleri uygulanmış, temel operasyon akışları çalışır durumdadır.
- Authentication ve rol/izin altyapısı eklenmiştir.
- Reports sayfası mevcut dashboard özetinin bir görünümüdür; kapsamlı ERP raporlama sistemi değildir.
- Kasa, tahsilat, gider, tedarikçi, ayarlar, audit log ve gelişmiş kullanıcı yönetimi mevcut değildir.
- Build başarılı, TypeScript başarılı, ESLint 0 hata ve 2 uyarı ile tamamlanmıştır.
- Otomatik test altyapısı ve test dosyaları bulunmamaktadır.

### Genel mimari

```text
Next.js App Router page / API route
        |
        v
Service: iş kuralları ve tenant kapsamı
        |
        v
Repository: Prisma veri erişimi
        |
        v
PostgreSQL / Neon
```

Feature-based yapı (`src/features`) kullanılır. Her ana modülde component, validator, service ve repository katmanları bulunur. Authentication NextAuth v4 Credentials provider ve JWT ile yapılır. Tenant ID session içindeki kullanıcıdan alınır.

## 2. Teknolojiler

| Alan | Kullanım |
|---|---|
| Framework | Next.js 16.2.10, App Router, React Server Components |
| Dil | TypeScript, strict mode |
| UI | React 19.2.4, shadcn yapılandırması, Base UI primitive'leri |
| Stil | Tailwind CSS v4, PostCSS, CSS variables, dark mode |
| Form | React Hook Form 7.82, `@hookform/resolvers` |
| Validasyon | Zod 4.4, Türkçe hata mesajları |
| Tablo | TanStack React Table 8.21 |
| Grafik | Recharts 3.10 |
| İkon | Lucide React |
| Bildirim | Sonner |
| ORM | Prisma 6.19.3 |
| Veritabanı | PostgreSQL; `.env` Neon bağlantısı kullanıyor |
| Authentication | NextAuth 4.24 Credentials + JWT |
| Şifreleme | Node.js `scrypt` + `timingSafeEqual` |
| API | Next.js App Router route handlers, JSON response formatı |
| Lint | ESLint 9 + `eslint-config-next` |
| Seed | Prisma seed + `tsx` |
| State yönetimi | Global client state kütüphanesi yok; lokal React state, URL search params, React Hook Form ve NextAuth SessionProvider kullanılıyor |

### Paket ve yapılandırma gözlemleri

- `prisma` ve `shadcn` çalışma zamanı dependency'lerinde bulunuyor; CLI araçları olarak devDependency'ye taşınmaları değerlendirilebilir.
- NextAuth v4 legacy konumdadır; migration kararı alınmadan v5'e geçiş yapılmamalıdır.
- Test paketi ve test script'i yoktur.
- `next.config.ts` yalnızca LAN geliştirme origin'lerini tanımlar.
- Next.js 16 build çıktısında middleware convention deprecation uyarısı görülmüştür; `proxy` convention geçişi değerlendirilmelidir.

## 3. Klasör Yapısı

```text
metlas-erp/
├── prisma/                  Şema, seed ve migration geçmişi
├── public/                  Statik dosyalar; çoğu create-next-app kalıntısı
├── scripts/                 Geliştirme yardımcı script'i
├── src/app/                 Sayfalar, layout ve API route'ları
├── src/components/          Layout, dashboard ve UI primitive'leri
├── src/features/            Domain modülleri
├── src/lib/                 Prisma, env ve genel yardımcılar
├── src/server/              Hata, logger, tenant ve yetki altyapısı
├── src/shared/              Genel component, hook ve tipler
├── .env.example             Ortam değişkeni şablonu
├── AGENTS.md                AI çalışma kuralları ve proje bağlamı
├── PROJECT_MEMORY.md        Ürün vizyonu ve gelecek planı
├── PROJECT_STATUS.md        Sprint durumu
├── CHANGELOG.md             Değişiklik günlüğü
├── README.md / README.txt   Biri başlangıç şablonu, biri proje notları
└── metlas.bat / metlas.ps1  Geliştirme/çalıştırma script'leri
```

### Gereksiz veya temizlenmesi gerekenler

- `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` halen create-next-app kalıntısı görünümündedir; kullanım doğrulanarak silinebilir.
- `README.md` varsayılan Next.js içeriğindeyse proje dokümantasyonu için yetersizdir.
- Kök dizindeki `metlas.log`, `metlas.pid`, `metlas_debug.log`, `metlas_out.log`, `metlas_test.log` runtime çıktısıdır; source control'de tutulmamalıdır.
- `src/components/ui/avatar.tsx` ve `dropdown-menu.tsx` içindeki bazı export'lar kullanılmıyor.
- `useDebounce` ve ortak response tipleri tanımlı ancak beklenen ölçüde kullanılmıyor.

### Eksik yapılar

- `src/features/cash`, `expenses`, `suppliers`, `settings`, `notifications`, `audit` ve kullanıcı/rol yönetimi modülleri yoktur.
- Test, e2e, fixture ve test utility klasörleri yoktur.
- Ortak `error.tsx`, `loading.tsx` ve `not-found.tsx` route seviyesinde sistematik olarak bulunmamaktadır.
- API client, merkezi fetch/error ve ortak form field altyapısı yoktur.

## 4. Sayfalar

Tam route tablosu build sırasında 39 route olarak üretildi. Aşağıdaki oranlar kod kapsamına göre yaklaşık değerlendirmedir; kullanıcı kabul testi veya üretim gereksinim matrisi değildir.

| Sayfa | URL | Amaç | Durum | Eksik/hata/öneri |
|---|---|---|---:|---|
| Dashboard | `/` | Günlük sipariş, müşteri, araç, ciro ve 7 günlük grafik | %75 | 6 DB sorgusu, kapsamlı KPI/filtre/cache yok; oturum hatasında error boundary yok |
| Login | `/login` | Credentials login | %70 | Demo credential metni/default email üretime uygun değil; rate limit ve hesap kilidi yok |
| Customer list | `/customers` | Müşteri arama, filtre, pagination, silme | %85 | Native confirm, arama debounce yok; liste/table filtre davranışı kısmen tekrarlı |
| New customer | `/customers/new` | Müşteri oluşturma | %85 | Gereksiz `use client`; bakiye ve şişe alanlarının rol/işlem kontrolü yok |
| Customer detail | `/customers/[id]` | Müşteri iletişim, bakiye ve şişe özeti | %80 | Aynı kayıt iki kez sorgulanıyor; hareket/tahsilat geçmişi yok |
| Customer edit | `/customers/[id]/edit` | Müşteri güncelleme | %80 | Client fetch, abort controller yok; müşteri bakiyesi doğrudan değiştirilebiliyor |
| Order list | `/orders` | Sipariş arama, filtre, pagination, silme | %85 | 100 müşteri/ürün sınırı formlarda; debounce ve ortak tablo tutarsızlığı |
| New order | `/orders/new` | Kalemli sipariş oluşturma | %85 | Gereksiz `use client`; stok rezervasyonu/limit kontrolü yok |
| Order detail | `/orders/[id]` | Sipariş, kalem, finans ve teslimat ataması | %85 | Double fetch; GET API yanlışlıkla write permission istiyor |
| Order edit | `/orders/[id]/edit` | Sipariş güncelleme | %80 | Client fetch; durum geçişleri tam doğrulanmıyor |
| Product list | `/products` | Ürün, fiyat ve düşük stok listesi | %75 | Pagination yok, `pageSize=100`; debounce yok; custom table tekrar ediyor |
| New product | `/products/new` | Ürün ve başlangıç stoğu oluşturma | %80 | Stok/depozito iş kuralları daha sıkı doğrulanmalı |
| Product detail | `/products/[id]` | Ürün detay ve stok hareketleri | %80 | Stok hareket türleri fazla geniş; history endpoint'i yok |
| Product edit | `/products/[id]/edit` | Ürün güncelleme | %80 | Temel CRUD var; fiyat/depozito kuralları eksik |
| Vehicle list | `/vehicles` | Araç listesi ve arama | %75 | Pagination yok; `isActive`/status tekrarını azaltmak gerekir |
| New vehicle | `/vehicles/new` | Araç oluşturma | %80 | Türk plaka ve belge tarihi doğrulaması yok |
| Vehicle detail | `/vehicles/[id]` | Araç bilgisi ve belgeler | %80 | Bakım, kilometre geçmişi ve müsaitlik takvimi yok |
| Vehicle edit | `/vehicles/[id]/edit` | Araç güncelleme | %80 | Temel CRUD; atama çakışması kontrolü yok |
| Personnel list | `/personnel` | Personel listesi | %75 | Pagination/debounce yok; izin ve puantaj yok |
| New personnel | `/personnel/new` | Personel oluşturma | %80 | Lisans tarihi uyarıları ve çalışan yaşam döngüsü yok |
| Personnel detail | `/personnel/[id]` | Personel ve lisans bilgisi | %80 | Vardiya, performans, izin ve teslimat geçmişi yok |
| Personnel edit | `/personnel/[id]/edit` | Personel güncelleme | %80 | Temel CRUD; atanmış sipariş/iş ilişkisi kontrolü yok |
| Deliveries | `/deliveries` | Tarihe göre teslimat ve araç/personel atama | %70 | Durum geçişi, çakışma, rota ve teslim kanıtı yok; Suspense yok |
| Reports | `/reports` | Dashboard özetinin rapor görünümü | %45 | Tarih aralığı, finans, stok, müşteri ve dışa aktarma raporları yok |

### Ortak sayfa eksikleri

- Sayfa bazlı metadata ve SEO başlıkları eksik.
- Server error boundary ve kullanıcıya anlamlı hata ekranları eksik.
- Liste ekranlarında ürün/araç/personel için ortak DataTable kullanılmıyor.
- Birçok ekran için gerçek boş, hata ve retry durumları sınırlı.

## 5. Modüller

| Modül | Durum | Yaklaşık | Kullanıcı eksikleri | Teknik eksikler |
|---|---|---:|---|---|
| Dashboard | Çalışır temel sürüm | %75 | KPI karşılaştırma, filtre, drill-down, export yok | 6 sorgu, JS gruplama, cache yok |
| Müşteriler | Uygulanmış CRUD | %85 | Tahsilat, cari hareket, şişe hareket geçmişi yok | Bakiye yazımı serbest, repository tenant açığı |
| Siparişler | Uygulanmış CRUD + kalemler | %85 | Rezervasyon, fatura/irsaliye, gelişmiş durum akışı yok | Kod yarış koşulu, item delete/recreate, concurrency yok |
| Ürünler | Temel katalog ve stok | %75 | Barkod, depo, sayım, satın alma, stok transferi yok | Sistem hareket türleri kullanıcıya açık |
| Stok | Temel hareket ve bakiye | %60 | Sayım, lokasyon/depo, maliyet, rapor, audit yok | Check constraint ve concurrency eksik |
| Araçlar | Temel CRUD | %75 | Bakım, yakıt, maliyet, sigorta uyarı workflow'u yok | `isActive` ve status redundant; çakışma kontrolü yok |
| Personel | Temel CRUD | %70 | Puantaj, izin, vardiya, ücret, görev geçmişi yok | Lisans expiry/assignment kontrolü yok |
| Teslimatlar | Atama ve teslim akışı | %65 | Rota, harita, teslim kanıtı, müşteri imzası, mobil courier yok | Geçiş doğrulama ve locking yok |
| Raporlar | Dashboard türevi | %40 | Ticari raporların çoğu yok | Ayrı raporlama/query modeli yok |
| Authentication | Credentials + JWT | %65 | Kullanıcı yönetimi, şifre değişimi, MFA, lockout yok | Middleware token validity kontrol etmiyor |
| Yetkilendirme | 7 write permission | %45 | Read permission, rol yönetimi, kaynak bazlı yetki yok | ACCOUNTING boş, ADMIN/OPERATIONS aynı |
| Kasa/Tahsilat | Yok | %0 | Cari tahsilat, kasa, ödeme, dekont yok | Model/API/UI yok |
| Giderler | Yok | %0 | Gider kaydı ve onay yok | Model/API/UI yok |
| Tedarikçiler/Satın alma | Yok | %0 | Tedarikçi, satın alma, mal kabul yok | Model/API/UI yok |
| Ayarlar | Yok/dead link | %0 | Firma, kullanıcı, sistem ayarları yok | Header linkleri işlevsiz |
| Bildirimler | Yok/decorative bell | %0 | Stok, belge, teslimat uyarısı yok | Notification modeli/servisi yok |
| Audit log | Yok | %0 | Kim ne yaptı görünmüyor | Logger var ama kullanılmıyor; audit tablosu yok |

## 6. Component Analizi

### Kullanılan ana componentler

- Layout: `DashboardLayout`, `Sidebar`, `Header`
- Dashboard: `SalesChart`, `StatCard`
- UI primitive: `Button`, `Input`, `DropdownMenu`, `Avatar`, `Separator`
- Shared: `DataTable`, `Loading`, `EmptyState`
- Feature componentleri: müşteri, sipariş, ürün, araç, personel ve teslimat list/detail/form/filter componentleri.

### Kullanılmayan veya düşük kullanım alanları

- `useDebounce` tanımlı ancak kullanılmıyor.
- Shared response tipleri frontend listelerince yaygın kullanılmıyor.
- `DropdownMenu` içindeki sub-menu, radio, checkbox ve shortcut export'larının çoğu kullanılmıyor.
- `AvatarGroup`, `AvatarGroupCount`, `AvatarBadge` kullanılmıyor.

### Birleştirilebilecek tekrarlar

- Product, Vehicle ve Personnel listeleri aynı custom table/card yapısını tekrar ediyor; ortak generic entity list altyapısı oluşturulabilir.
- Üç formda yerel `Field` helper tekrarlanıyor; ortak form field component'ine taşınabilir.
- Order status label/style map'leri dört farklı yerde tekrarlanıyor.
- Customer ve Order listelerinde fetchData mantığı tekrarlanıyor.
- API route'larında hata yakalama kodu ortaklaştırılmamış.
- Stok düşme mantığı order ve delivery repository'lerinde tekrarlanıyor.

### Performans ve UX riskleri

- Arama input'ları her tuşta URL ve API isteği oluşturuyor.
- TanStack Table client-side sort/filter ile server pagination birlikte kullanıldığı için yalnızca mevcut sayfa sıralanabilir.
- Liste sorguları gereğinden fazla relation include ediyor olabilir.
- Customer/Order detail sayfalarında çift sorgu vardır.
- React Compiler, React Hook Form ve TanStack Table için 2 uyumsuzluk uyarısı veriyor; bunlar build kıran hata değildir.
- Header search ve notification bell görsel olarak var ancak işlevsizdir.

## 7. Veritabanı

### Tablolar ve ilişkiler

- `Tenant`: tenant kökü.
- `User`: tenant'a bağlı kullanıcı, rol ve password hash.
- `Customer`: müşteri ve cari/şişe özet alanları.
- `Order`: müşteri siparişi, finans, durum ve teslimat bağlantıları.
- `OrderItem`: sipariş kalemleri, opsiyonel ürün bağlantısı.
- `Product`: katalog, fiyat ve anlık stok.
- `StockMovement`: ürün stok hareket defteri.
- `Vehicle`: araç ve belge bilgileri.
- `Personnel`: personel ve sürücü lisans bilgileri.

Foreign key'ler çoğunlukla `Restrict`, sipariş kalemleri için `Cascade`, araç/personel/ürün bağlantıları için `SetNull` kullanır.

### Güçlü taraflar

- Tenant foreign key'leri ve tenant kapsamlı index'ler vardır.
- Soft delete alanları ana operasyon entity'lerinde kullanılır.
- Para alanları `Decimal(14,2)` ile tutulur.
- Stok hareketleri ayrı tablo olarak modellenmiştir.
- Migration geçmişi düzenli biçimde 10 migration'a ulaşmıştır.

### Eksik veya riskli alanlar

- User email global unique; tenant bazlı aynı email ihtiyacı varsa tasarım kısıtıdır.
- Customer phone unique değildir; aynı tenant içinde duplicate kayıt oluşabilir.
- Stock ve para değerleri için database CHECK constraint yoktur.
- Order code üretimi atomik değildir.
- `referenceType/referenceId` polymorphic ilişki olduğundan referans bütünlüğü DB tarafından korunmaz.
- Vehicle ve Personnel'de `isActive` ile status kısmen aynı anlamı taşır.
- User için soft delete yerine yalnızca `isActive` vardır; model davranışları tutarsızdır.
- Customer balance ve bottle count alanları için işlem/audit defteri yoktur.
- OrderItem için tekil soft delete veya değişiklik geçmişi yoktur.
- Dashboard ve rapor sorguları için tarih/createdAt index'leri ayrıca değerlendirilebilir.

## 8. API Analizi

| Endpoint | Metotlar | Durum |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth catch-all |
| `/api/customers` | GET, POST | Liste/oluşturma |
| `/api/customers/[id]` | GET, PUT, DELETE | Detay/güncelleme/soft delete |
| `/api/orders` | GET, POST | Liste/oluşturma |
| `/api/orders/[id]` | GET, PUT, DELETE | Detay/güncelleme/soft delete |
| `/api/orders/[id]/delivery` | PUT | Teslimat atama/durum |
| `/api/products` | GET, POST | Ürün liste/oluşturma |
| `/api/products/[id]` | GET, PUT, DELETE | Ürün CRUD |
| `/api/products/[id]/stock` | POST | Stok düzeltme |
| `/api/vehicles` | GET, POST | Araç CRUD başlangıcı |
| `/api/vehicles/[id]` | GET, PUT, DELETE | Araç CRUD |
| `/api/personnel` | GET, POST | Personel CRUD başlangıcı |
| `/api/personnel/[id]` | GET, PUT, DELETE | Personel CRUD |
| `/api/deliveries` | GET | Tarihe göre teslimat listesi |

### Kullanılmayan veya eksik endpointler

- `/api/orders/[id]/delivery` için mevcut atamayı GET etme veya atamayı kaldırma endpoint'i yok.
- Stock movement geçmişi için GET endpoint'i yok.
- Kasa, tahsilat, gider, tedarikçi, kullanıcı, ayar, bildirim ve audit endpoint'leri yok.
- Raporlar için bağımsız filtreli/export edilebilir API yok.
- PATCH kullanımı yok; tüm güncellemeler PUT ile yapılıyor.

### Güvenlik ve kalite bulguları

- GET endpoint'lerinin çoğu açıkça permission kontrolü yapmıyor; middleware session varlığını kontrol etse de rol bazlı read permission yok.
- Orders `[id]` GET route'unda `order:write` istemesi hatalıdır.
- Customer repository update sorgusu `tenantId` olmadan yalnızca ID kullanıyor; tenant izolasyonu açısından kritik bulgudur.
- Rate limiting, request size limiti ve abuse protection yok.
- API hata formatı genel olarak tutarlı olsa da route'lar arasında error handling tekrarlı ve farklıdır.
- Stock adjustment API, sistem tarafından üretilmesi gereken `SALE` ve `ORDER` hareketlerini de kullanıcıya açıyor.

## 9. Yetkilendirme

### Roller

- `ADMIN`: tüm write permission'lar.
- `OPERATIONS`: ADMIN ile aynı write permission'lar.
- `COURIER`: yalnızca `delivery:write`.
- `ACCOUNTING`: hiçbir permission yok.

### Sorunlar

- Read permission tanımlanmamış; rol sahibi kullanıcıların veri okuma kapsamı ayrıştırılmıyor.
- ADMIN ve OPERATIONS pratikte aynı yetkiye sahip.
- ACCOUNTING rolü işlevsel değildir.
- Frontend route'larına rol bazlı erişim koruması yok.
- Middleware JWT imza/expiry doğrulamak yerine cookie varlığını kontrol ediyor.
- Kaynak bazlı yetkilendirme yok; yetkili operasyon kullanıcısı tenant içindeki her kaydı değiştirebilir.
- Başarısız login sonrası lockout, rate limit veya alarm yok.
- Şifre değişimi ve session invalidation akışı yok.

## 10. UI / UX Analizi

### Güçlü taraflar

- Türkçe arayüz ve operasyon odaklı navigation mevcut.
- Desktop/mobile için sidebar overlay, Escape ile kapatma ve body scroll lock uygulanmış.
- Liste ekranlarında mobile card görünümü bulunuyor.
- Dark mode ve responsive Tailwind sınıfları kullanılıyor.
- Loading ve empty state component'leri mevcut.
- Ana işlem akışları müşteri, sipariş, ürün, araç, personel ve teslimat için görünür.

### Kullanımı zorlaştıran noktalar

- Header global search yalnızca görsel; arama yapmıyor.
- Notification bell statik gösterge; bildirim yok.
- Profilim ve Ayarlar menü seçenekleri işlevsiz.
- Silme için native `confirm()` kullanımı tasarım sistemini bozuyor.
- Aramalar debounce olmadan her tuşta istek atıyor.
- Ürün/araç/personel listelerinde 100 kayıt sınırı kullanıcıya açıkça belirtilmiyor.
- Sipariş formunda müşteri/ürün seçimleri `pageSize=100` ile sınırlı; büyük katalogda seçim eksik görünür.
- Bazı formlar ortak UI primitive yerine ham `select`/`textarea` kullanıyor.
- Hata ekranları ve retry akışları tutarlı değil.
- Login ekranında demo hesap bilgisi gösteriliyor.

### Responsive ve erişilebilirlik riskleri

- Mobil navigation iyi bir başlangıçtır; ancak sidebar için tam focus trap yoktur.
- Bazı tablo ekranlarında mobile card ve desktop table iki ayrı markup olarak sürdürüldüğü için davranış farkı oluşabilir.
- Icon-only butonlarda erişilebilir label'lar tek tek doğrulanmalıdır.
- Form field helper ve label yapısı modüller arasında ortak değildir.
- Üretim cihazlarında dokunma alanları, uzun tablo içerikleri ve network error durumları ayrıca kabul testi gerektirir.

## 11. Kod Kalitesi

### Olumlu noktalar

- Feature-based ve katmanlı mimari doğru yöndedir.
- Factory pattern ve repository/service ayrımı test edilebilirliği artırır.
- Zod ile API boundary validasyonu yapılır.
- AppError ve Türkçe hata mesajları tutarlıdır.
- Prisma client singleton standarda uygundur.
- Soft delete ve tenant filtreleri çoğu repository'de sistematik kullanılır.

### Refactor adayları

- Customer/Order detail double fetch kaldırılmalı.
- Ürün/araç/personel listeleri ortak DataTable/entity list ile birleştirilmeli.
- Ortak `Field`, status map, API error handler ve response tipleri çıkarılmalı.
- Sıkıştırılmış tek satırlı component ve route dosyaları formatlanmalı.
- Client edit sayfaları server data loading ile tutarlı hale getirilmeli.
- Stok düşme işlemi tek bir domain service/repository akışına taşınmalı.
- Logger gerçek API/service akışlarına bağlanmalı ve `LOG_LEVEL` uygulanmalı.
- Shared types frontend'de gerçekten kullanılmalı.

### Performans

- Dashboard 6 paralel sorgu çalıştırır ve haftalık grouping'i JavaScript'te yapar.
- Order list full relation include kullanabilir; list/detail select ayrımı yapılmalı.
- Arama istekleri debounce edilmelidir.
- React Hook Form ve TanStack Table için mevcut 2 lint warning bilgilendiricidir; uygun yerlerde manuel memoization ölçülerek uygulanabilir.
- Sayfa ilk yükleme bundle'ları yaklaşık 0.56-1.11 MB uncompressed aralığındadır; büyüyen modüller için izlenmelidir.

## 12. Test ve Çalıştırma Kontrolü

### Doğrulanan kontroller

- `npm run build`: Başarılı.
- TypeScript: Başarılı, type error yok.
- `npm run lint`: Başarılı; 0 hata, 2 React Compiler uyarısı.
- `npx prisma generate`: Başarılı.
- `npx prisma migrate deploy`: Başarılı; 10 migration, bekleyen migration yok.
- `npm run db:seed`: Başarılı; demo tenant, admin, ürün, araç ve sipariş verileri oluşturuldu/upsert edildi.
- Dev server: `http://localhost:3000` üzerinde çalıştırıldı.
- Login: Demo kullanıcıyla session oluşturuldu.
- Authenticated smoke test: `/`, `/customers`, `/orders`, `/products`, `/vehicles`, `/personnel`, `/reports` 200 döndü.
- Unauthenticated smoke test: root route login callback URL ile 307 redirect döndürdü.

### Lint uyarıları

1. `src/features/orders/components/order-form.tsx`: React Hook Form API'si React Compiler tarafından otomatik memoization için uyumsuz görülüyor.
2. `src/shared/components/data-table.tsx`: TanStack Table API'si aynı nedenle uyarı veriyor.

### Runtime log bulguları

- Geliştirme loglarında daha önce login formunda React/DOM `insertBefore` hatası görülmüştür. Tekrar üretimi bu analiz sırasında doğrulanmamıştır; login smoke test'i başarılıdır.
- Neon bağlantısında `PostgreSQL connection: Closed` mesajları görülmüştür. Bu dev/pooled bağlantı davranışı olabilir; üretim ortamında gözlemlenmelidir.
- Next.js 16 middleware convention deprecation uyarısı vardır.

### Test açığı

- Unit test yok.
- Integration test yok.
- E2E test yok.
- API contract test yok.
- Yetki matrisi otomatik test edilmiyor.
- Concurrent order code ve stock testleri yok.

## 13. Eksik Özellikler

Profesyonel ERP için mevcut kodda bulunmayan başlıca özellikler:

- Kasa, tahsilat, ödeme ve cari hareket yönetimi
- Gider, masraf ve onay süreçleri
- Tedarikçi, satın alma ve mal kabul
- Depo/lokasyon, stok sayımı, transfer ve stok rezervasyonu
- Barkod/QR desteği
- Gelişmiş teslimat planlama, rota, harita, GPS ve courier mobil ekranı
- Teslim fotoğrafı, imza, müşteri doğrulaması ve teslim kanıtı
- Fatura, irsaliye, e-Fatura/e-Arşiv/e-İrsaliye entegrasyonları
- Kullanıcı yönetimi, rol/izin yönetimi, şifre değişikliği ve MFA
- Audit log ve değişiklik geçmişi
- Bildirim sistemi: düşük stok, belge süresi, geciken teslimat
- Gelişmiş raporlar, tarih filtreleri, export ve dashboard drill-down
- Müşteri cari hareketleri, tahsilat ve damacana depozito hareket defteri
- Araç bakım/yakıt/maliyet yönetimi
- Personel vardiya, izin, puantaj ve teslimat performansı
- Ayarlar, firma bilgileri, tenant yönetimi ve sistem parametreleri
- Backup, gözlemlenebilirlik, alerting ve operasyonel health check

## 14. Önceliklendirme

### Kritik

1. Customer repository update sorgusuna tenant kapsamı eklenmesi ve tenant izolasyon testleri.
2. Order code üretiminin atomik hale getirilmesi.
3. Stok düşme işleminde concurrency/transaction güvenliğinin güçlendirilmesi.
4. Middleware'de yalnızca cookie varlığı yerine token validity kontrolü.
5. API write/read authorization matrisinin düzeltilmesi.
6. Bakiye, depozito ve stok güncellemelerinin audit edilebilir domain işlemlerine bağlanması.

### Yüksek

1. Durum geçişlerinin state machine ile doğrulanması.
2. Stock movement type'larının kullanıcı ve sistem hareketleri olarak ayrılması.
3. ACCOUNTING rolünün gerçek yetki modeliyle uygulanması.
4. Rate limiting, login lockout ve güvenli üretim credential politikası.
5. Unit/integration/e2e test temelinin kurulması.
6. Dashboard, list ve stock sorgularının performans optimizasyonu.
7. Error boundary, retry ve merkezi hata gözlemlenebilirliği.
8. Next.js middleware/proxy deprecation geçişinin planlanması.

### Orta

1. Ortak DataTable, Field, status map ve API client refactor'ı.
2. Tüm arama alanlarında debounce ve server-side filtre standardı.
3. Liste endpoint'lerinde select/include ayrımı ve pagination standardı.
4. Ürün, araç, personel ve teslimat modüllerinin operasyonel derinleştirilmesi.
5. Raporlama API'si, tarih aralığı ve export.
6. Metadata, erişilebilirlik ve mobil kabul testleri.
7. Logger'ın gerçek request ID ve log level desteğiyle devreye alınması.

### Düşük

1. Create-next-app kalıntılarının temizlenmesi.
2. Dependency sınıflandırması ve bundle bütçesi takibi.
3. Profil/Ayarlar/Bildirim UI'larının tamamlanması.
4. Dokümantasyonun tek, güncel README altında birleştirilmesi.

## 15. Teknik Borç

- Middleware convention Next.js 16'da deprecated durumda.
- NextAuth v4 legacy'dir; geçiş kararı ertelenirse ileride migration maliyeti artabilir.
- Middleware cookie varlığını token doğrulaması yerine kullanıyor.
- Tenant izolasyonu her repository'de aynı güvenlik standardıyla uygulanmıyor.
- Order code read-then-write yarış koşuluna açık.
- Stok düşme mantığı iki yerde tekrar ediyor.
- Vehicle/Personnel status ve `isActive` alanları redundant.
- Customer balance ve bottle count doğrudan mutable özet alanlarıdır; hareket defteri yoktur.
- `deletedAt` davranışı User, OrderItem ve diğer entity'ler arasında tutarsızdır.
- API error handling route'lar arasında farklıdır.
- Shared type'lar ve debounce hook'u kullanılmayan soyutlamalara dönüşmüştür.
- Formlar ve listeler iki farklı veri yükleme/UX modeline ayrılmıştır.
- Log altyapısı tanımlı fakat kullanılmamaktadır.
- Ortam doğrulaması tanımlı fakat uygulama başlangıcında çalıştırılmamaktadır.
- Global search, notifications, profile ve settings gibi UI öğeleri gerçek işlev olmadan görünmektedir.
- Runtime log dosyalarının repository'ye eklenmesi gizlilik, boyut ve bakım riski oluşturur.
- Otomatik test bulunmaması, güvenlik ve ERP finans/stok kurallarının regresyon riskini yükseltir.

## 16. Sonuç ve Puanlama

### Puanlar

| Alan | Puan |
|---|---:|
| Kod Kalitesi | 72/100 |
| UI | 75/100 |
| UX | 65/100 |
| Mobil | 72/100 |
| Performans | 62/100 |
| Güvenlik | 48/100 |
| Bakım Kolaylığı | 64/100 |
| SaaS Hazırlığı | 58/100 |
| Genel Tamamlanma | 68/100 |

### Genel değerlendirme

Proje, erken üretim öncesi veya kontrollü pilot aşaması için anlamlı bir temel oluşturmuştur. Customer, Order, Product/Stock, Vehicle, Personnel ve Delivery akışlarının katmanlı mimari üzerinde toplanması, Prisma migration geçmişi, tenant modeli, Zod doğrulaması ve temel authentication önemli güçlü taraflardır. Build, lint, migration, seed ve temel authenticated route kontrollerinin başarılı olması teknik başlangıcın çalışır olduğunu gösterir.

Buna karşın proje şu an **genel ve sınırsız ticari kullanıma hazır değildir**. En önemli nedenler tenant izolasyonundaki doğrulanmış repository riski, JWT'nin middleware'de gerçek doğrulanmaması, stok ve sipariş concurrency garantilerinin eksikliği, yetki modelinin yetersizliği, finans/cari modüllerin bulunmaması ve otomatik test altyapısının olmamasıdır. ERP'de bakiye, stok, teslimat ve yetkilendirme hataları doğrudan mali ve operasyonel sonuç doğurabileceğinden bu eksikler yalnızca polish seviyesi değildir.

### Ticari kullanıma geçiş koşulları

Pilot öncesinde kritik güvenlik ve veri bütünlüğü maddeleri kapatılmalı; ardından yetki, stok, sipariş ve teslimat için otomatik testler yazılmalıdır. Gerçek ticari kullanım öncesinde kasa/tahsilat, audit log, backup/restore, monitoring, rate limiting, kullanıcı yönetimi, raporlama ve müşteri/teslimat operasyonlarının gereksinim bazlı kabul testleri tamamlanmalıdır.

**Sonuç:** Sağlam bir MVP/operasyon prototipi ve iyi bir modüler temel; ancak finansal doğruluk, güvenlik, gözlemlenebilirlik ve test kapsamı tamamlanmadan production ERP ürünü olarak konumlandırılmamalıdır.
