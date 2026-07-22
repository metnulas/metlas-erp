# METLAS ERP Proje Durumu

## Genel Durum

- Sprint 1 — Dashboard: Tamamlandı.
- Sprint 2 — Profesyonel altyapı ve Customer modülü: Tamamlandı.

## Tamamlananlar

### Sprint 1 — Dashboard

- Dashboard arayüzü, responsive düzen ve tema desteği.

### Sprint 2 — Altyapı

- Prisma, PostgreSQL, Zod, React Hook Form, TanStack Table, Sonner ve Auth.js bağımlılıkları.
- Çok kiracılı `Tenant` ve `Customer` başlangıç veritabanı şeması.
- İlk SQL migration, Prisma seed ve environment şablonu.
- Veritabanı istemcisi, tenant bağlamı, uygulama hatası ve yapılandırılmış günlükleme temelleri.

### Customer Modülü (Enterprise Seviye)

- **Veritabanı**: Soft delete (`deletedAt`), audit alanları (`createdBy`, `updatedBy`), indeks optimizasyonu.
- **Repository Pattern**: Prisma tabanlı, tenant izolasyonlu veri erişim katmanı.
- **Service Layer**: İş mantığı, validasyon, hata yönetimi.
- **Zod Validation**: Oluşturma, güncelleme, sorgulama şemaları.
- **REST API**:
  - `GET /api/customers` — Listeleme, sayfalama, arama, filtreleme, sıralama.
  - `POST /api/customers` — Oluşturma (müşteri kodu benzersizliği kontrolü).
  - `GET /api/customers/[id]` — Detay.
  - `PUT /api/customers/[id]` — Güncelleme.
  - `DELETE /api/customers/[id]` — Soft delete.
- **UI Bileşenleri**: DataTable, CustomerForm, CustomerDetail, CustomerFilters.
- **Sayfalar**: Liste, Yeni, Detay, Düzenleme.
- **Sidebar**: Dinamik linkler, aktif sayfa durumu.
- **Shared Altyapı**: Tipler, hook'lar, tekrar kullanılabilir bileşenler.
- **Build**: `npm run build` ve `npm run lint` başarıyla geçiyor.

## Yapılacaklar (Sonraki Sprint)

- Auth.js ile gerçek oturum ve tenant bağlamı.
- Ürün/Proje modülü.
- Sipariş modülü.
- Araç modülü.
- Personel modülü.
- Kasa modülü.
- Raporlama modülü.
- Gerçek PostgreSQL bağlantısıyla migration ve seed çalıştırılması.

## Bağlantı Notu

`.env` dosyası oluşturuldu. Gerçek `DATABASE_URL` girildiğinde `npx prisma migrate dev` ile migration uygulanabilir.
