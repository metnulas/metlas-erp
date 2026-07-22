╔══════════════════════════════════════════════════════════╗
║              METLAS ERP YONETIM KONSOLU                 ║
║                   KULLANIM KILAVUZU                     ║
╚══════════════════════════════════════════════════════════╝

============================================================
1.  BASLANGIC
============================================================

METLAS.bat dosyasina cift tiklayarak yonetici konsolunu
baslatin.

Dosyalar:
  METLAS.bat    - Ana yonetici konsolu (cift tikla)
  metlas.ps1    - PowerShell yardimci modulu (arkaplan)
  metlas.pid    - PID bilgisi (otomatik olusur)
  metlas.log    - Sunucu loglari (otomatik olusur)
  README.txt    - Bu dosya

============================================================
2.  MENU ISLEMLERI
============================================================

 1) Arkaplanda Baslat
    Sunucuyu gizli bir CMD penceresinde baslatir.
    Loglar metlas.log dosyasina yazilir.
    Konsol kullanilabilir durumda kalir.
    Eger sunucu zaten calisiyorsa uyari verir.

 2) Developer Modu
    npm run dev'i ayni pencerede calistirir.
    Canli hata ayiklama icin uygundur.
    Ctrl+C ile durdurulur.
    Durduktan sonra Q=Menu, X=Cikis secenekleri sunulur.

 3) Sunucuyu Durdur
    Calisan sunucu PID uzerinden guvenle durdurulur.
    Tum iliskili Node surecleri de sonlandirilir.

 4) Sunucu Durumu
    Sunucu durumu, PID, port, calisma suresi,
    localhost ve yerel ag adresleri, Node/npm surumleri
    detayli olarak gosterilir.

 5) Tarayiciyi Ac
    Varsayilan tarayicida http://localhost:3000 acilir.

 6) Loglari Goruntule
    metlas.log dosyasini canli olarak izler.
    Cikis icin Ctrl+C kullanin.

 7) npm install
    Proje bagimliliklarini yukler.

 8) Prisma Generate
    Prisma istemcisini olusturur.

 9) Prisma Migrate
    Veritabani migration'larini uygular.

10) Git Pull
    Uzak depodan son degisiklikleri ceker.

11) Git Push
    Commit mesaji ister, ardindan add/commit/push
    islemlerini sirasiyla gerceklestirir.

12) Cikis
    Konsolu sonlandirir.

============================================================
3.  GEREKSINIMLER
============================================================

- Windows 11
- Node.js (npm ile birlikte)
- Git (10-11 numarali islemler icin)

============================================================
4.  DOSYA YAPISI
============================================================

metlas-erp/
  METLAS.bat      <- Yonetici konsolu
  metlas.ps1      <- PowerShell yardimci
  metlas.pid      <- PID dosyasi (otomatik)
  metlas.log      <- Log dosyasi (otomatik)
  README.txt      <- Bu dosya
  package.json    <- Proje tanimi
  node_modules/   <- Bagimliliklar
  prisma/         <- Veritabani semasi
  src/            <- Kaynak kodu
  ...

============================================================
5.  SORUN GIDERME
============================================================

S: Konsol acilmadi / hata verdi.
C: Node.js kurulu oldugundan emin olun:
     node --version
     npm --version

S: "Port 3000 kullanimda" hatasi.
C: Baska bir uygulama portu kullaniyor olabilir:
     netstat -ano | findstr :3000
   Menuden 3) Sunucuyu Durdur ile temizlemeyi deneyin.

S: metlas.log dosyasi cok buyudu.
C: Dosyayi guvenle silebilirsiniz. Bir sonraki
   baslatista yeniden olusur.

S: Git islemleri calismiyor.
C: Git'in kurulu ve yapilandirilmis oldugundan emin olun:
     git --version
     git config --list

============================================================
6.  NOTLAR
============================================================

- Konsol UTF-8 karakter kodlamasi kullanir.
- ANSI renk kodlari Windows 11'de native calisir.
- PowerShell ExecutionPolicy gerektiginde Bypass
  parametresi ile asilir.
- Tüm hatalar kullanici dostu olarak gosterilir.
- PID bilgisi metlas.pid dosyasinda saklanir.

============================================================
          v1.0 - METLAS ERP YONETIM KONSOLU
============================================================
