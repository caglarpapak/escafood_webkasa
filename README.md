# escafood_webkasa

🚀 Esca Food firmasının günlük nakit, banka, kart, çek işlemlerini kaydedip raporlayabileceği, mobil uyumlu web kasa yazılımı.

---

## Lokal çalıştırma

Frontend + backend tek komutla:

```bash
npm install
npm run dev
```

- **Frontend:** http://localhost:5173 (Vite)
- **Backend API:** http://localhost:4000

Veritabanı için önce migration çalıştırın:

```bash
npm run db:migrate
```

---

## Vercel’e deploy (frontend)

Bu proje **iki parçalı**: React frontend + Express API. Vercel sadece **frontend**’i host eder; API’yi ayrı bir yerde çalıştırmanız gerekir.

### 1. Backend’i (API) nereye deploy edeceksiniz?

Backend’i şu servislerden birinde çalıştırın (örnekler):

- **Railway** – https://railway.app  
- **Render** – https://render.com  
- **Fly.io** – https://fly.io  

Backend’i deploy ettikten sonra **API’nin adresi** örneğin:  
`https://escafood-api.railway.app` veya `https://escafood-api.onrender.com`

### 2. Vercel’de projeyi bağlama

1. GitHub repo’yu Vercel’e import edin (Vercel Dashboard → Add New → Project → Import Git Repository).
2. **Root Directory:** boş bırakın (proje kökü).
3. **Build Command:** `npm run build` (zaten `vercel.json` ile ayarlı).
4. **Environment Variables** ekleyin:
   - `VITE_API_BASE_URL` = Backend API adresi (örn. `https://escafood-api.railway.app`)
5. Deploy’a tıklayın.

Böylece Vercel sadece `npm run build` ile üretilen **frontend**’i (Vite → `dist`) yayınlar; tüm API istekleri `VITE_API_BASE_URL` ile belirttiğiniz backend’e gider.

### 3. Backend’de CORS

Backend’inizin Vercel domain’ine izin vermesi gerekir. `server` klasöründe CORS ayarında production’da Vercel domain’inizi (örn. `https://escafood-webkasa.vercel.app`) `origin` olarak ekleyin.

---

## Özet

| Ortam        | Frontend                    | Backend (API)      |
|-------------|-----------------------------|--------------------|
| **Lokal**   | `npm run dev` (tek komut)   | Aynı komutla 4000  |
| **Vercel**  | Vercel’de build + deploy    | Railway/Render vb. |
