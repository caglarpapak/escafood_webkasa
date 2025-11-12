## Esca Food Kasa Backend

### Başlangıç

```bash
cp .env.example .env
npm install
npx prisma generate
```

Varsayılan `.env` PostgreSQL bağlantısını `postgresql://postgres:postgres@db:5432/esca_kasa?schema=public` olarak içerir. Geliştirici ortamınıza göre güncelleyin.

### Veritabanı

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Seed işlemi hazır admin kullanıcıları oluşturur:

| E-posta                    | Şifre  |
|---------------------------|--------|
| hayrullah@esca-food.com   | 397139 |
| onur@esca-food.com        | 248624 |

### Çalıştırma

```bash
npm run dev
```

API `http://localhost:4000/api/v1` adresinde yayına alınır.

### Önemli Klasörler

- `src/app.ts` – Express uygulaması ve middleware zinciri
- `src/routes/v1` – Versiyonlu REST endpoint'leri
- `src/services` – İş kuralları ve Prisma işlemleri
- `src/middlewares/upload.ts` – Çek görseli yükleme ve MIME kontrolü
- `src/schedulers/report.scheduler.ts` – Saatlik ve günlük e-posta cron görevleri
- `prisma/schema.prisma` – PostgreSQL şeması (transactions, checks, attachments vb.)
- `prisma/seed.ts` – Başlangıç verileri

### E-posta Görevleri

- Saatlik özet (`0 * * * *`) – Dashboard özetini HTML olarak iletir
- Gün sonu (`59 23 * * *`) – PDF ve CSV ekli rapor gönderir

E-postalar `muhasebe@esca-food.com` adresine yönlendirilir. SMTP bilgileri `.env` dosyasından okunur.

### Test Komutları

- `npm run build` – TypeScript derlemesi
- `npm run prisma:studio` – Prisma Studio arayüzü
- `npm run prisma:migrate` – Migration komutu kısayolu
