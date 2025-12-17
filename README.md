# 🚀 Inofa Mobile Backend API  
Backend untuk aplikasi mobile Inofa, dibangun menggunakan **TypeScript**, **Express**, **Prisma ORM**, dan **PostgreSQL (Supabase)**.  
API ini menyediakan fitur developer-client matching, manajemen profil, portofolio, project, pencarian developer, dan integrasi WhatsApp.

**✨ Deployed as Vercel Serverless Functions**

---

## 📌 Fitur Utama

### 🔐 Authentication
- Register  
- Login  
- JWT token-based authentication  

### 🧭 Role System
- Role: `developer` atau `client`  
- User wajib memilih role setelah register  

### 🧑‍💼 Profile Management
- Create profile  
- Update profile (partial update supported)  
- Delete profile  
- WhatsApp number normalization  
- Store skills (JSON array)  

### 🧰 Portfolio (Developer Only)
- Tambah portfolio  
- Lihat portfolio sendiri  
- Hapus portfolio  

### 📂 Projects (Client Only)
- Posting project  
- Lihat project sendiri  
- Developer bisa melihat daftar semua project + filter  

### 🔍 Developer Search
- Search berdasarkan skill  
- Lihat detail developer + portfolio  
- Lihat semua developer + filter  

### 💬 WhatsApp Integration
- Generate WhatsApp link otomatis dari nomor profil  
- Format normalisasi: `08xxxx → 628xxxx`  

### 📤 Upload Image
- Using multer

---

## 📦 Tech Stack

- **TypeScript** - Type-safe development
- **Express** - Web framework
- **Prisma ORM** - Type-safe database access
- **PostgreSQL (Supabase)** - Cloud database
- **Zod** - Schema validation
- **Vercel** - Serverless deployment
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload

---

## 🚀 Setup & Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase Database

1. Buat project di [Supabase](https://supabase.com)
2. Dapatkan connection string dari: **Settings > Database > Connection String (URI)**
3. Copy `.env.example` ke `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
   JWT_SECRET="your_jwt_secret_here"
   ```

### 3. Setup Prisma & Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema ke database
npm run prisma:push
```

### 4. Run Development Server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:4000`

---

## 🌐 Deploy ke Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Setup Environment Variables di Vercel

Di Vercel dashboard, tambahkan:
- `DATABASE_URL` = Connection string Supabase lengkap
- `JWT_SECRET` = JWT secret key kamu

### 3. Deploy
```bash
vercel
```

Atau push ke GitHub dan connect ke Vercel untuk auto-deploy.

---


