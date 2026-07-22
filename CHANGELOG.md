# Değişiklik Kaydı

Bu dosya, METLAS ERP'deki kullanıcıyı etkileyen teknik değişiklikleri izler.

## Yayınlanmamış

### Eklendi

- **Customer Modülü (Enterprise Seviye)**
  - Prisma `Customer` modeline `deletedAt`, `createdBy`, `updatedBy` alanları eklendi.
  - `deletedAt` indeksi eklendi.
  - Customer Repository Pattern (`src/features/customers/repositories/`).
  - Customer Service Layer (`src/features/customers/services/`).
  - Zod validasyon şemaları: oluşturma, güncelleme, sorgulama (`src/features/customers/validators/`).
  - REST API: `GET /api/customers` (listeleme, sayfalama, arama, filtreleme), `POST /api/customers` (oluşturma).
  - REST API: `GET /api/customers/[id]` (detay), `PUT /api/customers/[id]` (güncelleme), `DELETE /api/customers/[id]` (soft delete).
  - Customer Listesi sayfası (`/customers`) — arama, filtreleme, sayfalama, sıralama.
  - Yeni Müşteri sayfası (`/customers/new`) — form validasyonu ile oluşturma.
  - Müşteri Detay sayfası (`/customers/[id]`) — iletişim, bakiye, şişe envanteri, notlar.
  - Müşteri Düzenleme sayfası (`/customers/[id]/edit`) — mevcut verilerle form doldurma.
  - Soft Delete: müşteriler kalıcı olarak silinmez, `deletedAt` alanıyla işaretlenir.
- **Shared Altyapı (`src/shared/`)**
  - Paylaşılan tipler: `PaginatedResponse`, `ApiResponse` (`src/shared/types/`).
  - `useDebounce` hook'u (`src/shared/hooks/`).
  - `DataTable` bileşeni: TanStack Table tabanlı, sayfalama, arama destekli (`src/shared/components/`).
  - `Loading` bileşeni: yükleme durumu göstergesi.
  - `EmptyState` bileşeni: veri bulunamadı durumu.
- **Feature Based Structure**
  - `src/features/customers/` dizin yapısı oluşturuldu.
- **Sidebar İyileştirmeleri**
  - Navigasyon öğeleri dinamik `href` ile güncellendi.
  - Aktif sayfa durumu `usePathname` ile belirleniyor.
- **Ortam**
  - `.env` dosyası oluşturuldu (gitignored).
  - `.env.example` şablonu oluşturuldu.

### Değiştirildi

- `prisma/schema.prisma`: Customer modeline soft delete ve audit alanları eklendi.
- `src/components/layout/Sidebar.tsx`: Navigasyon linkleri dinamik yapıldı.

### Düzeltildi

- Zod v4 uyumluluğu: `ZodError.errors` yerine `ZodError.issues` kullanıldı.
- Base-UI uyumluluğu: `asChild` prop'u `render` prop'u ile değiştirildi.

## Önceki Sprints

### Sprint 1 — Dashboard

- Dashboard arayüzü, responsive düzen ve tema desteği.

### Sprint 2 — Altyapı

- Prisma, PostgreSQL, Zod, React Hook Form, TanStack Table, Sonner ve Auth.js bağımlılıkları.
- Çok kiracılı `Tenant` ve `Customer` başlangıç veritabanı şeması.
- İlk SQL migration, Prisma seed ve environment şablonu.
- Veritabanı istemcisi, tenant bağlamı, uygulama hatası ve yapılandırılmış günlükleme temelleri.
