# METLAS ERP Engineering Constitution v1.0

Bu belge, METLAS ERP'nin uzun ömürlü ve production kalitesinde geliştirilmesi için kalıcı mühendislik kurallarını tanımlar.

## 1. Proje Felsefesi

METLAS ERP küçük bir demo değil, binlerce firma, kullanıcı ve milyonlarca siparişi destekleyecek ticari bir SaaS ERP olarak geliştirilir.

- Kısa vadeli çözümler yerine ölçeklenebilir çözümler tercih edilir.
- Çalışan özellikler gereksiz yere yeniden yazılmaz.
- Her değişiklik minimum riskle yapılır.

## 2. Mimari

Mevcut mimari korunur:

- Next.js App Router
- React ve TypeScript
- Prisma ve PostgreSQL
- Repository Pattern
- Feature Service
- API Layer
- Multi-tenant yapı
- JWT Session ve NextAuth

Yeni özellikler mevcut klasör ve katman düzenine uygun geliştirilir.

## 3. Kod Kalitesi

- Production kalitesinde, okunabilir kod yazılır.
- Kod tekrarı ve magic number kullanılmaz.
- SOLID prensipleri uygulanır.
- Repository ve Service katmanları korunur.
- Her fonksiyon tek bir sorumluluğa sahip olur.
- Gereksiz abstraction ve büyük refactor yapılmaz.

## 4. Dosya Güvenliği

Çalışan component, API, repository, service ve Prisma modeli gereksiz yere değiştirilmez. Aynı görev için çok sayıda dosya değiştirilmez; yalnızca gerekli dosyalara dokunulur.

## 5. Auth Güvenliği

Kritik dosyalar:

- `src/auth.ts`
- `src/middleware.ts`
- `src/app/login`
- `src/lib/auth*`
- Cookie, session ve JWT ayarları

Bu dosyalarda büyük değişiklik yapılmadan önce nedeni açıklanır. Auth sistemi yeniden yazılmaz; cookie isimleri ve session mantığı gereksiz yere değiştirilmez.

## 6. Middleware ve Public Dosyalar

Middleware yalnızca korunan sayfaları kontrol eder. Şu yollar public kalır:

- `/login`
- `/api/auth`
- `/_next`
- `/favicon.ico`
- `/robots.txt`
- `/sitemap.xml`
- Tüm image, CSS, JS ve font dosyaları

## 7. Multi-Tenant Güvenlik

- Her sorgu `tenantId` ile sınırlandırılır.
- Tenant isolation korunur.
- Soft delete korunur.
- Repository tenant kontrolünü kaybetmez.

## 8. Database

- Prisma schema gereksiz değiştirilmez.
- Migration kullanıcı onayı olmadan oluşturulmaz.
- Foreign key ve cascade davranışları korunur.
- Transaction gerektiren işlemlerde transaction kullanılır.
- Cari ve depozito hareketleri atomic çalışır.

## 9. UI ve Responsive Tasarım

Desktop, tablet ve telefon desteklenir. Mevcut Tailwind ve UI component dili korunur. Dark mode, erişilebilirlik, keyboard navigation ve responsive davranış bozulmaz.

## 10. Dashboard ve Route Center

Dashboard mümkün olduğunca server component ve verimli sorgular kullanır. Gereksiz render, N+1 sorgu ve gereksiz include oluşturulmaz.

Route Center altyapısı korunur:

- OSRM
- Leaflet
- OpenStreetMap
- Nominatim
- ArcGIS fallback

## 11. API Standardı

Başarılı response:

```json
{ "success": true, "data": {} }
```

Başarısız response:

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Mesaj" } }
```

Endpoint formatı ve mevcut API sözleşmesi korunur.

## 12. Hata Giderme

Sorun tahmin edilmez:

1. Log toplanır.
2. Gerçek hata yeniden üretilir.
3. Kök neden bulunur.
4. Minimum değişiklik yapılır.
5. Aynı akış tekrar test edilir.
6. Sonuç raporlanır.

## 13. Test Standardı

Her kod değişikliğinden sonra:

```powershell
npm run build
npm run lint
npm test
npx tsc --noEmit
```

İlgili görevlerde ayrıca login, logout, session, middleware, cookie, dashboard, API, route ve mobil erişim test edilir.

## 14. Git Standardı

Büyük özelliklerden sonra açıklayıcı commit oluşturulur ve remote branch'e gönderilir. Commit öncesi `git status`, `git diff`, `git log` ve hedef dosya kapsamı kontrol edilir. Secret ve gerçek `.env` dosyaları commit edilmez.

Örnek commit mesajları:

- `feat: route optimization`
- `fix: login middleware`
- `feat: accounting module`
- `fix: session persistence`

## 15. Görev Sonu Raporu

Her görev sonunda şu başlıklar raporlanır:

- Değiştirilen dosyalar
- Değişiklik nedenleri
- Risk durumu
- Build sonucu
- Lint sonucu
- Type-check sonucu
- Test sonucu
- Rollback gereksinimi
- Gelecek önerileri

## 16. En Önemli Kural

Çalışan kod bozulmaz. Gereksiz refactor yapılmaz. Kritik mimari kullanıcı onayı olmadan değiştirilmez. Her karar METLAS ERP'nin uzun yıllar geliştirilecek profesyonel bir SaaS ürünü olduğu kabulüyle verilir.
