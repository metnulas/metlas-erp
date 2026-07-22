# METLAS ERP Proje Durumu

## Genel Durum

- Sprint 1 — Dashboard: Tamamlandı.
- Sprint 2 — Profesyonel altyapı: Devam ediyor.

## Tamamlananlar

- Dashboard arayüzü, responsive düzen ve tema desteği.
- Prisma veri modeli için çok kiracılı `Tenant` ve `Customer` tasarımı.
- PostgreSQL bağlantısı için `.env.example` şablonu.
- İlk migration ve seed altyapısı.
- `src/lib/db`, hata, logger ve tenant bağlamı temel yapısı.

## Bekleyenler

- Gerçek PostgreSQL bağlantı bilgisiyle migration ve seed çalıştırılması.
- Customer repository, service, API ve ekranları.
- Tekrar kullanılabilir tablo, form, toast, loading ve empty state bileşenleri.
- Auth.js ile gerçek oturum ve tenant bağlamı.

## Bağlantı Notu

Gerçek `DATABASE_URL` henüz paylaşılmadı. Bu nedenle veritabanı migration'ı uygulanmadı; yalnızca güvenli şema ve migration dosyası hazırlandı.
