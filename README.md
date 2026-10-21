# 🎰 Sistem Cabutan Bertuah Multi-Event (Lucky Draw Pro)

Sistem Cabutan Bertuah berasaskan web yang moden, responsif, beranimasi tinggi, dan sedia untuk di-deploy ke **Vercel** dengan sokongan backend **Supabase (Free Tier)** atau mod **Local Storage (Demo Tanpa Setup)**.

---

## 🌟 Ciri-Ciri Utama

1. **Sokongan Multi-Program / Multi-Event:**
   - Cipta majlis baharu (contoh: "Majlis Anugerah Cemerlang 2026", "Malam Gala Syarikat").
   - Kustomisasi gambar latar belakang (Wallpaper Pentas), logo majlis, dan warna tema.
2. **Pengurusan Peserta:**
   - Import senarai peserta melalui fail CSV / Excel (`Nama, No Tiket, Jabatan`).
   - Muat turun contoh template CSV dengan satu klik.
   - Status automatik `Belum Menang` dan `Dah Menang` (peserta yang menang tidak akan diundi lagi).
3. **Logik Cabutan 74 Hadiah:**
   - **Mod 1 (Cabutan Pukal / Batch Draw - 10 Serentak):** Untuk Hadiah Ke-74 hingga Ke-34 (Saguhati / Sampingan). Paparan 10 kad beranimasi dengan butang pengesahan (Confirm) dan butang ganti (Re-spin individu) jika peserta tiada di majlis.
   - **Mod 2 (Cabutan Single / 1-by-1 Draw):** Untuk Hadiah Ke-33 hingga Ke-1 (Hadiah Utama / Grand Prizes). Animasi dramatik pusingan nama/nombor, kesan drum roll, dan letupan confetti dwi-meriam.
4. **Kesan Bunyi (Web Audio API Synthesizer):**
   - Bunyi detik mekanikal pusingan nombor pantas.
   - Bunyi *drumroll* debaran untuk Hadiah Utama.
   - Bunyi *fanfare* kemenangan yang megah tanpa perlukan fail audio luar (berfungsi 100% luar talian).
5. **Senarai Pemenang & Cetakan:**
   - Paparan keputusan rasmi dikelompokkan mengikut kategori.
   - Fungsi eksport ke CSV / Excel dan format cetakan PDF A4.

---

## 🚀 Cara Menjalankan Projek Secara Tempatan (Local Development)

Projek ini telah disediakan di:
```bash
cd C:\Users\LPNPP-RIDHZUAN\.gemini\antigravity-ide\scratch\lucky-draw-system
```

1. **Pasang Dependensi (jika belum):**
   ```bash
   npm install
   ```

2. **Jalankan Dev Server:**
   ```bash
   npm run dev
   ```
   Buka pelayar web di: [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Konfigurasi Supabase (Langkah demi Langkah)

Sistem ini mempunyai ciri **Dua Mod Automatik**:
- Jika kunci Supabase **tidak diisi**, sistem beroperasi secara lancar menggunakan **Local Storage** (siap dengan 120 peserta sampel dan 74 hadiah untuk demo serta-merta!).
- Untuk menyambung ke Supabase Cloud:

1. Daftar akaun percuma di [Supabase.com](https://supabase.com).
2. Cipta projek baharu (Free Tier).
3. Buka menu **SQL Editor** di Supabase Dashboard, salin dan jalankan skrip dari fail:
   [`supabase/schema.sql`](file:///C:/Users/LPNPP-RIDHZUAN/.gemini/antigravity-ide/scratch/lucky-draw-system/supabase/schema.sql)
4. Pergi ke **Project Settings -> API** di Supabase, dan salin:
   - `Project URL`
   - `anon public key`
5. Buka fail `.env.local` dan masukkan kunci tersebut:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ☁️ Panduan Deployment ke Vercel (Domain Percuma)

1. **Muat naik kod ke GitHub:**
   ```bash
   git add .
   git commit -m "Sistem Cabutan Bertuah Multi-Event siap"
   git remote add origin https://github.com/username/lucky-draw-system.git
   git push -u origin main
   ```
2. **Deploy di Vercel:**
   - Log masuk ke [Vercel.com](https://vercel.com) dengan akaun GitHub anda.
   - Klik **"Add New..." -> "Project"**.
   - Pilih repositori `lucky-draw-system`.
   - Di bahagian **Environment Variables**, masukkan:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Klik **Deploy**. Dalam masa ~1 minit, sistem anda aktif di URL percuma seperti `https://lucky-draw-system.vercel.app`!
