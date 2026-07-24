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

#### Doğrulama

- TypeScript kontrolü başarılı.
- Production build başarılı.
- ESLint 0 hata, 2 React Compiler uyarısı ile tamamlandı.

## Önceki Sürümler

- Customer, Order, Product, Vehicle, Personnel ve Delivery temel modülleri.
- Multi-tenant Prisma altyapısı, soft delete ve audit alanları.
- NextAuth Credentials/JWT authentication ve temel permission sistemi.
