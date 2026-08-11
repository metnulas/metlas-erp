# METLAS ERP Dinamik RBAC ve Permission Management Tasarımı

Durum: **Onaylandı, tenant onboarding ve global platform yetkileri uygulandı**
Sürüm: 1.0  
Kapsam: Role Based Access Control, permission kataloğu, kullanıcı-rol ataması ve tenant izolasyonu

## 1. Amaç ve Tasarım Kararları

Mevcut sistemde `User.role` bir Prisma enum, permission listesi ise `src/server/auth/authorization.ts` içinde sabit bir `Record` olarak tutuluyor. Hedef, rol ve permission tanımlarını veritabanına taşımak; mevcut API güvenliğini bozmadan kademeli geçiş yapmaktır.

Temel kararlar:

- `SUPER_ADMIN` globaldir; `tenantId` taşımaz ve tenant, lisans, paket ve sistem ayarlarını yönetir.
- Normal roller tenant kapsamındadır.
- Tenant kendi rol ve permission tanımlarını oluşturabilir; katalogdaki tanımlar kod içine rol olarak gömülmez.
- Bir kullanıcıya birden fazla rol atanabilir.
- Kullanıcının effective permission kümesi, aktif rollerinin birleşimidir.
- Global Super Admin rolü seed edilir, pasifleştirilemez ve silinemez.
- Tenant onboarding sırasında tenant'a bağlı ayrı bir `SUPER_ADMIN` rolü oluşturulur; bu rol global platform permission'larını alamaz.
- UI kontrolü yalnızca kullanıcı deneyimidir; API, service ve repository kontrolleri yetkili güvenlik katmanlarıdır.
- JWT içine tüm permission listesi yazılmaz. Permission değişiklikleri login beklemeden etkili olmalıdır.
- İlk sürüm process memory cache kullanır; resolver arayüzü Redis gibi paylaşımlı cache'e geçişe hazır olur. Cache başarısızlığında güvenli varsayılan `deny` uygulanır.
- Yeni rol ve permission tanımı eklemek kod değişikliği gerektirmez. Yeni bir uygulama kabiliyeti eklemek için ilgili API/service sınırına bir permission kontrolü eklenmesi gerekir.

## 2. Mevcut Sistem ve Geçiş Sınırları

Mevcut kritik noktalar:

- `prisma/schema.prisma`: `User.role UserRole` enum.
- `src/auth.ts`: JWT içine `userId`, `tenantId`, `role` yazılıyor.
- `src/server/auth/authorization.ts`: `Permission` TypeScript union ve sabit `rolePermissions` var.
- API route’larının çoğu `requirePermission(...)` kullanıyor.
- `src/middleware.ts`: şu anda session token varlığını kontrol ediyor; dinamik permission sorgusu yapmıyor.
- `AuditLog` zaten tenant kapsamlı ve role/permission olayları için yeniden kullanılabilir.

Geçişte mevcut `role` alanı ilk migration’da kaldırılmayacaktır. Yeni ilişkiler doldurulup uygulama yeni resolver’a geçirildikten, veri doğrulaması tamamlandıktan ve rollback penceresi kapandıktan sonra enum alanı ayrı bir migration’da kaldırılacaktır.

## 3. ER Diyagramı

```text
Tenant 1 ───────< User >──────< UserRole >────── 1 Role
  │                                      │           │
  │                                      │           └──< RolePermission >── 1 Permission
  │                                      │                                      │
  │                                      └── tenantId                         └── PermissionGroup
  │
  └──────< AuditLog

Role
- tenantId
- key / name / description
- color / icon
- isSystem / isSuperAdmin / isActive / deletedAt

Permission
- key
- name / description
- groupId
- isSystem / isActive / deletedAt

RolePermission ve UserRole tenantId taşır. İlişki ekleme, silme ve okuma işlemleri service katmanında aynı tenant ile doğrulanır.
```

## 4. Prisma Model Tasarımı

İsimler öneridir; migration öncesi onaylanmalıdır.

### PermissionGroup

```text
id, tenantId?, key, name, description?, sortOrder, isSystem, isActive, deletedAt?, createdAt, updatedAt
```

- Sistem grupları global olabilir.
- `tenantId` doluysa yalnızca ilgili tenant görür; `null` sistem grupları tüm tenant'larca görülebilir.
- `@@unique([tenantId, key])` kullanılır.

### Permission

```text
id, tenantId?, groupId, key, name, description?, isSystem, isActive, deletedAt?, createdAt, updatedAt
```

- Örnek key: `orders.view`, `orders.create`, `routes.manage`.
- `key` stabil API sözleşmesidir; görünen Türkçe isim değişebilir.
- System permission silinmez; pasifleştirme mevcut atamaları etkisiz hale getirir.
- `@@unique([tenantId, key])` ve `@@index([groupId, isActive])`.

### Role

```text
id, tenantId, key, name, description?, color?, icon?, isSystem, isSuperAdmin,
isActive, deletedAt?, createdBy?, updatedBy?, createdAt, updatedAt
```

- `key` tenant içinde unique olur.
- `tenantId=null` ve `isSuperAdmin=true` olan rol globaldir; silinemez ve pasifleştirilemez.
- Global Super Admin yalnızca platform kullanıcısına atanır; normal roller tenant kullanıcılarına atanır.
- `@@unique([tenantId, key])`, `@@index([tenantId, isActive, deletedAt])`.

### RolePermission

```text
id, tenantId, roleId, permissionId, deletedAt?, createdAt, updatedAt
```

- Aynı aktif role-permission çifti bir kez bulunur.
- Yetki kaldırma fiziksel silme yerine `deletedAt` ile audit edilebilir.
- `@@unique([tenantId, roleId, permissionId])`.

### UserRole

```text
id, tenantId, userId, roleId, deletedAt?, assignedBy?, createdAt, updatedAt
```

- Kullanıcıya birden fazla rol atanabilir.
- `@@unique([tenantId, userId, roleId])`.
- Kullanıcı ve rol tenant’ı service katmanında eşleşmeden kayıt oluşturulamaz.

### User değişikliği

```text
role UserRole?       // geçiş dönemi için korunur
permissionVersion Int @default(1)
```

`role` enum alanı geçiş tamamlanana kadar legacy fallback olarak kalır. Final aşamada kaldırılır.

### AuditLog genişletmesi

Mevcut model korunur. Aşağıdaki action değerleri standardize edilir:

- `ROLE_CREATE`
- `ROLE_UPDATE`
- `ROLE_DELETE`
- `ROLE_DEACTIVATE`
- `ROLE_CLONE`
- `ROLE_PERMISSION_ADD`
- `ROLE_PERMISSION_REMOVE`
- `USER_ROLE_ASSIGN`
- `USER_ROLE_REMOVE`
- `PERMISSION_CREATE`
- `PERMISSION_DEACTIVATE`

Metadata içinde eski ve yeni değerler, hedef user/role/permission ID’leri ve değişikliği yapan kullanıcı tutulur. Parola, token ve secret yazılmaz.

## 5. Permission Kataloğu

| Grup | Permission örnekleri |
|---|---|
| Dashboard | `dashboard.view`, `analytics.view` |
| Platform | `platform.view`, `tenants.manage`, `billing.manage`, `settings.manage` |
| Sipariş Yönetimi | `orders.view`, `orders.create`, `orders.edit`, `orders.delete` |
| Müşteri Yönetimi | `customers.view`, `customers.create`, `customers.edit`, `customers.delete` |
| Muhasebe | `finance.view`, `finance.manage` |
| Araçlar | `vehicles.view`, `vehicles.manage` |
| Kurye ve Dağıtım | `routes.view`, `routes.manage`, `deliveries.view`, `deliveries.manage` |
| Raporlar | `reports.view`, `reports.export` |
| Personeller | `personnel.view`, `personnel.manage` |
| Kullanıcı Yönetimi | `users.view`, `users.manage` |
| Roller | `roles.view`, `roles.manage` |
| Ayarlar | `settings.manage` |
| API | `api.access`, `api.manage` |
| Denetim | `audit.view` |

Mevcut permission’lar için ilk eşleme:

| Mevcut | Yeni |
|---|---|
| `customer:read` | `customers.view` |
| `customer:write` | `customers.create`, `customers.edit`, `customers.delete` |
| `order:read` | `orders.view` |
| `order:write` | `orders.create`, `orders.edit`, `orders.delete` |
| `product:read` | `products.view` |
| `product:write` | `products.create`, `products.edit`, `products.delete` |
| `stock:write` | `products.stock.manage` |
| `vehicle:read` | `vehicles.view` |
| `vehicle:write` | `vehicles.manage` |
| `personnel:read` | `personnel.view` |
| `personnel:write` | `personnel.manage` |
| `delivery:read` | `deliveries.view` |
| `delivery:write` | `deliveries.manage` |
| `audit:read` | `audit.view` |

Bu eşleme kodlama öncesi onaylanmalıdır; eski key’lerin kaldırılması doğrudan yapılmayacaktır.

## 6. Hazır Roller

Kurulum/seed sırasında her tenant için oluşturulur:

- `SUPER_ADMIN`: tüm aktif permission’lar; silinemez, pasifleştirilemez.
- `ADMIN`: tenant yönetimi, tüm operasyon ve raporlar.
- `OPERATIONS`: sipariş, müşteri, ürün, araç, personel ve dağıtım operasyonları.
- `COURIER`: kendisine açık teslimat, müşteri konum ve teslim işlemleri.
- `ACCOUNTING`: müşteri hesapları, finans ve rapor görüntüleme.
- `CALL_CENTER`: müşteri ve sipariş oluşturma/görüntüleme.
- `MANAGER`: operasyon ve rapor görüntüleme, yönetim aksiyonları.
- `WAREHOUSE`: ürün, stok ve ilgili sipariş görüntüleme.

Rol şablonları tenant’a kopyalanır; bir tenant’ın rol atamaları diğer tenant’ı etkilemez.

## 7. Yetki Hesaplama ve Cache

Akış:

```text
Request
  -> session userId + tenantId
  -> PermissionResolver(userId, tenantId)
  -> active UserRole kayıtları
  -> active RolePermission kayıtları
  -> active Permission kayıtları
  -> union(permission.key)
  -> requirePermission(key)
```

Cache önerisi:

- İlk uygulama: process içi LRU cache, TTL 60 saniye; cache provider interface'i Redis geçişini kolaylaştırır.
- Cache key: `tenantId:userId:permissionVersion`.
- Rol yetkisi veya kullanıcı rolü değiştiğinde hedef kullanıcıların `permissionVersion` değeri artırılır.
- Çoklu instance production’a geçişte Redis/adapte edilebilir cache kullanılmalıdır.
- Cache miss veya DB hatası `allow` üretmez; kontrollü hata veya `deny` uygulanır.

JWT yalnızca kimlik, tenant ve permission version taşır. Tüm permission listesi JWT’ye konmaz; büyük token, stale yetki ve revocation sorunları önlenir.

## 8. Yetki Katmanları

### UI

`usePermission`, `PermissionGate` ve server-side `can(...)` yardımcıları oluşturulması planlanır. Sidebar, sayfa aksiyonları, butonlar, kartlar ve widget’lar permission key ile görünür olur.

UI’de gizlenen işlem API’de ayrıca kontrol edilir.

### API

Her route methodu açık bir permission key ile korunur:

```text
GET    /api/roles              roles.view
POST   /api/roles              roles.manage
PATCH  /api/roles/:id          roles.manage
DELETE /api/roles/:id          roles.manage
PUT    /api/users/:id/roles    users.manage
```

`requirePermission` dinamik resolver kullanır; mevcut route çağrı noktaları ilk geçişte adapter ile korunur.

### Service ve Repository

API dışından çağrılabilecek service metotları da actor context veya doğrulanmış permission context alır. Repository doğrudan yetki kararının tek sahibi yapılmaz; tenant scope ve veri erişim sınırı repository’de, iş yetkisi service/API’de korunur.

### Middleware

Mevcut middleware Edge uyumluluğu nedeniyle doğrudan Prisma sorgusu yapmaz. Önerilen iki aşamalı davranış:

1. Middleware: session, public route ve kaba route erişim kontrolü.
2. Server page/API/service guard: dinamik permission’ın authoritative kontrolü.

Middleware auth ve permission kontrolü yapar. Permission snapshot JWT içinde imzalı, sınırlı ömürlü ve `permissionVersion` ile birlikte taşınır; değişikliklerde version artırılır ve cache/JWT yenileme akışı tetiklenir. API/service authoritative kontrolü yine yapar. 403 davranışı server page guard ile `/403` sayfasına, API çağrılarında standart `403 FORBIDDEN` JSON'a uygulanır.

## 9. API Uç Noktaları

### Roller

- `GET /api/roles`: tenant rolleri, arama ve aktiflik filtresi.
- `POST /api/roles`: rol oluşturma ve permission ID/key atama.
- `GET /api/roles/:id`: rol, grup bazlı permission listesi.
- `PATCH /api/roles/:id`: metadata ve permission set güncelleme.
- `DELETE /api/roles/:id`: soft delete; Super Admin reddedilir.
- `POST /api/roles/:id/clone`: yeni key/name ile rol kopyalama.
- `POST /api/roles/:id/activate`: pasif rolü aktifleştirme.
- `POST /api/roles/:id/deactivate`: Super Admin reddedilir.

### Permission kataloğu

- `GET /api/permissions`: gruplu katalog.
- `POST /api/permissions`: yalnızca yetkili sistem/tenant yönetimi için; key unique kontrolü.
- `PATCH /api/permissions/:id`: görünen metadata ve aktiflik.

### Kullanıcı rolleri

- `GET /api/users/:id/roles`
- `PUT /api/users/:id/roles`: tam role seti transaction ile değiştirir.
- `POST /api/users/:id/roles/:roleId`
- `DELETE /api/users/:id/roles/:roleId`
- `GET /api/users/:id/permissions`: effective permission önizlemesi.

Tüm endpoint’ler tenant context’i session’dan alır; body/query içinden gelen tenant ID kabul edilmez.

## 10. UI Ekran Taslakları

### Rol Yönetimi `/roles`

```text
[ Rol Yönetimi ]                         [ Yeni Rol Oluştur ]
Arama [................]  Durum [Aktif v]

Rol              Açıklama           Yetki  Durum       İşlemler
SUPER_ADMIN      Sistem yöneticisi  34     Kilitli     Gör / Kopyala
OPERATIONS       Operasyon           18     Aktif       Düzenle / Kopyala / Pasifleştir
```

### Rol Düzenleme `/roles/:id/edit`

```text
Rol adı [................]  Key [................]
Açıklama [.......................................]
Renk [ ]                  İkon [ ]

Sipariş Yönetimi                 [Hepsini Seç] [Hepsini Kaldır]
☑ Siparişleri görüntüle   ☐ Sipariş oluştur
☑ Sipariş düzenle         ☐ Sipariş sil

Muhasebe                         [Hepsini Seç] [Hepsini Kaldır]
☐ Finansı görüntüle       ☐ Finans yönet

[İptal] [Kaydet]
```

Checkbox değişiklikleri kaydetme anına kadar local state’te tutulur. Kaydetme tek transaction’dır; başarısızlıkta eski set korunur.

### Kullanıcı Rol Atama

Kullanıcı detayında aktif roller multi-select veya checkbox listesi olarak gösterilir. Effective permission’lar salt okunur, grup bazlı özetlenir.

## 11. Geçiş ve Migration Planı

Migration kullanıcı onayı olmadan oluşturulmayacaktır.

### Faz 0: Onay ve hazırlık

- Bu doküman ve key eşlemeleri onaylanır.
- Seed stratejisi ve Super Admin kapsamı kesinleştirilir.
- Production backup/PITR kontrol edilir.

### Faz 1: Şema ekleme

- Role, PermissionGroup, Permission, RolePermission, UserRole tabloları eklenir.
- User legacy `role` alanı korunur.
- Audit indexleri ve tenant indexleri eklenir.
- Bu fazda mevcut auth davranışı değiştirilmez.

### Faz 2: Seed ve backfill

- Permission grupları ve katalog seed edilir.
- Her tenant için hazır roller oluşturulur.
- Mevcut `User.role` değerleri aynı key’deki yeni role bağlanır.
- Backfill raporu: eşleşmeyen kullanıcı, eksik rol, duplicate key, tenant tutarsızlığı.

### Faz 3: Dual-read / yeni resolver

- `requirePermission` önce dinamik UserRole resolver’ı kullanır.
- Backfill eksikliği varsa yalnızca kontrollü legacy fallback uygulanır ve loglanır.
- Tüm API route’ları yeni key’lere kademeli geçirilir.

### Faz 4: Yönetim UI/API

- Rol, permission ve kullanıcı rol ekranları açılır.
- Audit event’leri aktif edilir.
- Yetki değişiklikleri cache invalidation ile doğrulanır.

### Faz 5: Legacy kaldırma

- Fallback kullanımının sıfır olduğu doğrulanır.
- `User.role` enum alanı kaldırılır.
- Sabit `rolePermissions` ve eski permission union temizlenir.

Rollback: Faz 1–4 boyunca legacy enum ve seed snapshot korunur. Faz 5 öncesinde rollback mümkündür. Faz 5 sonrasında rollback migration yerine backup restore gerektirebilir.

## 12. Risk Analizi

| Risk | Etki | Önlem |
|---|---|---|
| Legacy role backfill eksikliği | Kullanıcı erişim kaybı | Dual-read, rapor ve rollback |
| Tenant dışı role erişimi | Kritik veri sızıntısı | Session tenant zorunluluğu, service doğrulaması, tenant indexleri |
| Cache stale permission | Eski yetkiyle erişim | TTL, permissionVersion, değişiklikte invalidation |
| JWT’ye büyük permission listesi koyma | Token büyümesi ve stale yetki | JWT’de yalnızca version, DB/cache resolver |
| Super Admin silinmesi | Tenant kilitlenmesi | DB/service koruması ve integration test |
| Middleware’de Prisma kullanımı | Runtime/build kırılması | Edge uyumlu kaba guard, authoritative server guard |
| Permission key değişmesi | Sessiz yetki regresyonu | Key immutable, rename için alias/migration |
| Soft-deleted relation tekrar atanması | Tutarsız yetki | Unique + restore/replace transaction politikası |
| Çoklu instance cache tutarsızlığı | Geç yetki revocation | İlk aşama TTL, production’da Redis invalidation |
| Yeni permission’ın route’a bağlanmaması | Sahte güvenlik hissi | Permission registry ve route coverage testi |

## 13. Test Planı

### Unit

- Permission union hesaplama.
- Duplicate rol/permission deduplication.
- Super Admin koruması.
- Soft-deleted rol ve permission filtreleri.
- Cache hit, miss, expiry ve invalidation.

### Integration

- Rol oluşturma, düzenleme, kopyalama, pasifleştirme, soft delete.
- Permission ekleme/kaldırma.
- Kullanıcıya çoklu rol atama/kaldırma.
- Tenant A rolünün Tenant B tarafından okunamaması.
- Super Admin silme/pasifleştirme reddi.
- Audit kayıtlarının metadata ve actor ile oluşması.
- API 401/403 ve başarılı akışları.

### E2E

- Sidebar permission’a göre menü gizleme.
- Yetkisiz URL erişiminde `/403`.
- Yetkisiz butonun render edilmemesi.
- Rol değişikliğinin yeni request’te cache beklemeden veya TTL sınırında etkili olması.
- Login/session/logout akışının korunması.

## 14. Açık Onay Noktaları

Kodlamaya geçmeden şu kararlar onaylanmalıdır:

1. `SUPER_ADMIN` global olacaktır.
2. Tenant kendi rol ve permission tanımlarını oluşturabilecektir.
3. İlk sürüm process memory cache kullanacaktır; provider soyutlaması Redis'e hazır olacaktır.
4. Middleware auth ve JWT/cache permission snapshot kontrolü yapacaktır.
5. Permission key'leri tamamen yeni noktalı standarda geçirilecektir.
6. Kullanıcı rol atama ekranı bu fazın parçasıdır.

## 15. Beklenen Sonuç

Bu tasarım uygulandığında:

- Yeni rol eklemek kod değişikliği gerektirmez.
- Mevcut permission kataloğundaki yeni bir permission, ilgili guard noktası mevcutsa kod değişmeden role atanabilir.
- Tenant kendi rollerini ve yetki setlerini tenant sınırları içinde yönetebilir.
- API ve service güvenliği UI’dan bağımsız kalır.
- Gelecekte mobil uygulama, API token, WebSocket, kurye uygulaması ve portal istemcileri aynı permission resolver’ı kullanabilir.

Bu doküman onaylanmadan Prisma migration, şema değişikliği veya RBAC kod geçişi başlatılmayacaktır.
