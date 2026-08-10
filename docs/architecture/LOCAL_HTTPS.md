# Yerel HTTPS Geliştirme

iPhone GPS erişimi için geliştirme sunucusu HTTPS üzerinden başlatılmalıdır.

## Başlatma

Proje klasöründe:

```powershell
npm run dev:https
```

Alternatif olarak:

```text
scripts/start-dev-server-https.cmd
```

Telefonda aynı Wi-Fi ağı üzerinden şu adres açılır:

```text
https://192.168.1.40:3000
```

## iPhone Sertifika Uyarısı

Proje, IP adresini içeren yerel self-signed sertifika kullanır. iPhone sertifika uyarısı gösterirse:

1. Safari’de **Ayrıntıları Göster** seçilir.
2. **Bu web sitesini ziyaret et** seçilir.
3. Sertifika güvenilir olarak tanınmıyorsa bilgisayarda `mkcert -CAROOT` komutuyla CA klasörü bulunur.
4. CA klasöründeki `rootCA.pem` dosyası güvenli bir yöntemle iPhone’a aktarılır ve profil olarak yüklenir.
5. **Ayarlar → Genel → Hakkında → Sertifika Güven Ayarları** bölümünde kök sertifika için tam güven açılır.
6. Safari site ayarlarında konum izni **İzin Ver** yapılır.

GPS testi Safari’de yapılmalıdır. Chrome iOS da aynı WebKit altyapısını kullandığı için önce Safari ile izin verilmesi daha güvenilirdir.

## Auth

HTTPS ile login callback adresi de HTTPS olmalıdır. Aktif `.env` dosyasında şu değer bulunmalıdır:

```text
NEXTAUTH_URL="https://192.168.1.40:3000"
```

Bu ayar değiştirildikten sonra geliştirme sunucusu yeniden başlatılmalıdır. Gerçek secret değerleri bu dokümana yazılmaz.
