# 🚀 Inofa Mobile Backend API  
Backend untuk aplikasi mobile Inofa, dibangun menggunakan **Node.js**, **Express**, dan **SQLite**.  
API ini menyediakan fitur developer-client matching, manajemen profil, portofolio, project, pencarian developer, dan integrasi WhatsApp.

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

---

# 📁 Struktur Folder

