# Vercel Deployment Checklist

## ✅ Fixed Issues
- ✅ Created `api/index.js` (CommonJS entry point)
- ✅ Routes all traffic through single entry point
- ✅ Removed individual serverless functions
- ✅ Build generates `dist/server.js` correctly
- ✅ Removed dangerous `vercel-build` script

## 🚀 Deploy Steps

### 1. Set Environment Variables di Vercel Dashboard

**Wajib:**
- `DATABASE_URL` - Supabase connection pooler URL (port 6543)
  ```
  postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
- `JWT_SECRET` - JWT secret dari .env kamu

**Opsional:**
- `NODE_ENV` = `production`

### 2. Deploy via Vercel CLI
```bash
vercel
```

Atau push ke GitHub dan connect ke Vercel untuk auto-deploy.

### 3. Test Endpoints setelah deploy

```bash
# Health check
curl https://your-app.vercel.app/health

# Register
curl -X POST https://your-app.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"developer"}'

# Login
curl -X POST https://your-app.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🔍 Troubleshooting

### Jika masih crash:
1. Buka **Vercel Dashboard** → **Deployments** → klik deployment terakhir
2. Klik tab **Functions** atau **Logs**
3. Cari error:
   - `Cannot find module` → path issue
   - `PrismaClientInitializationError` → DATABASE_URL salah/tidak ada
   - `Unexpected token` → ESM/CommonJS mismatch
   - `ZodError` → environment variable tidak lengkap

### Common Errors:

**Error: Cannot find module '../dist/server.js'**
→ Build tidak jalan. Pastikan `npm run build` berhasil lokal.

**Error: Can't reach database**
→ DATABASE_URL di Vercel belum diset atau salah format.

**Error: Invalid JWT secret**
→ JWT_SECRET di Vercel belum diset.

## 📝 Notes

- **File Upload**: Vercel serverless filesystem ephemeral. Untuk production, migrate ke Supabase Storage atau S3.
- **Cold Start**: First request bisa 1-2 detik karena Prisma initialization.
- **Connection Pooling**: Wajib pakai Supabase pooler URL (port 6543) untuk serverless.
