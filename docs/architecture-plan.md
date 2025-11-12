## Esca Food Web Kasa – Mimari Plan

### Genel Yaklaşım
- Monorepo; `backend`, `frontend`, `infrastructure` kök klasörleri.
- Node.js (Express + TypeScript) backend, REST API.
- React 18 (Vite) frontend, TailwindCSS tema, responsive layout.
- PostgreSQL veritabanı; Prisma ORM ile şema yönetimi.
- Docker Compose ile servis orkestrasyonu (api, web, db, mailhog/dev smtp, cron worker).
- Ortak `.env.example` dosyaları, gizli değerler `.env` içinde.

### Dizim Önerisi
- `backend/`
  - `src/app.ts` (Express bootstrap)
  - `src/routes/*`
  - `src/controllers/*`
  - `src/services/*`
  - `src/repositories/*`
  - `src/schedulers/*` (node-cron)
  - `src/lib/` (prisma client, mailer, storage)
  - `prisma/schema.prisma`
  - `uploads/` (çek görselleri; Docker volume)
- `frontend/`
  - `src/pages/*`
  - `src/components/*`
  - `src/features/*`
  - `src/hooks/*`
  - `src/services/api.ts`
  - `src/styles/tailwind.css`
- `infrastructure/`
  - `docker-compose.yml`
  - `Dockerfile.api`
  - `Dockerfile.web`
  - `nginx/default.conf`

### Veritabanı Şeması (Özet)
- `users`: id, email, password_hash, full_name, created_at.
- `bank_accounts`: id, name, iban, balance, is_active.
- `cards`: id, name, bank_account_id, limit, risk, due_day, statement_day.
- `contacts`: id, type (customer/supplier/other), name, tax_no, phone.
- `transactions`: id, txn_no, type, direction, amount, currency (default TRY), account refs, contact_id, description, pos fields (`pos_brut`, `pos_komisyon`, `pos_net`, `pos_efektif_oran`), created_by, txn_date.
- `checks`: id, serial_no, bank, amount, due_date, status, contact_id, attachment_id.
- `check_moves`: id, check_id, action (in/out/payment), related_transaction_id, performed_at.
- `attachments`: id, path, mime_type, size, uploaded_at.
- `tags`: id, name, color.
- `txn_tags`: txn_id, tag_id.

### API Katmanı
- Auth: `/auth/login` JWT üretir.
- Dashboard: `/dashboard` bank, kasa, çek özetleri.
- Transaction endpoint'leri: nakit, banka, pos, kart gider, kart ödemesi, silme.
- Çek endpoint'leri: giriş, çıkış, rapor, ödeme.
- Rapor endpoint'leri: `/reports/daily` PDF/CSV için veri sağlar.
- Middleware: auth, error handler, request validation (Zod/Yup).

### İş Akışları
- POS tahsilatı → brüt giriş + komisyon çıkışı otomatik.
- Kart giderleri → risk artar; kart ödemesi → risk düşer.
- Çek girişi/çıkışı → `check_moves`.
- Silinen kayıt → nodemailer ile hard delete bildirimi.
- Geçmiş tarihli kayıt → anında e-posta.
- Saatlik cron → gün içi özet; gece cron → PDF raporu üretir ve gönderir.

### Güvenlik & Depolama
- JWT (short-lived); refresh yok (v1 basit).
- Password hashing: Argon2.
- Çek görselleri `backend/uploads`, MIME kontrolü (jpeg/png/pdf).
- Multer ile upload, dosya adı: UUID.

### Frontend Yapısı
- Auth context, protected routes.
- Dashboard kartları + tablo; modallar (nakit, banka, kart, çek).
- Rapor sayfası: tarih aralığı, export butonları (CSV, PDF).
- Ayarlar: banka hesapları, kartlar, kullanıcılar, e-posta alıcıları.
- Tailwind tema: `bg-slate-50`, `text-[#1c3360]`, `accent-[#d60f1e]`, font Poppins.
- Mobil alt action bar (5 buton).

### İlk Sprint Hedefleri
1. Backend ve Prisma temel şeması, auth login.
2. Frontend login sayfası + dashboard iskeleti.
3. Docker Compose ile api, web, db ayağa kalkması.
4. Saatlik ve günlük cron stub'ları.

### Açık Sorular
- POS limitler/kesim tarihleri API tasarımı ayrıntısı.
- Banka başlangıç bakiye yönetimi (seed?).
- E-posta şablonları için marka içerik (logo vs?).

