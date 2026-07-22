Next.js tabanlı akıllı eczane yönetim sistemi.

## Hızlı Kurulum (GitHub'dan indirenler için)

**Gereksinimler:** Node.js 20+, Docker Desktop

```bash
git clone <repo-url>
cd smart_pharmacy
npm install
copy .env.example .env.local   # Windows
# cp .env.example .env.local   # Mac/Linux

docker compose up -d oracle    # Oracle hazır olana kadar 2-5 dk bekleyin
docker compose ps              # "healthy" görünmeli

npm run db:setup               # tablolar + örnek veri
npm run dev                    # http://localhost:3000/login
```

> Port **1521** bilgisayarınızda zaten Oracle kullanıyorsa sorun olmaz. Docker Oracle **1522** portunda çalışır (`.env.example` buna göre ayarlı).

## Veritabanı

- **Oracle Database** (`oracledb` driver)
- **10 tablo**: users, diseases, active_ingredients, medicines, medicine_ingredients, user_diseases, user_allergies, user_medicines, medicine_schedules, disease_medicines
- **Prisma schema** (`prisma/schema.prisma`) şema dokümantasyonu içindir. Prisma Client resmi olarak Oracle desteklemediği için migration'lar SQL dosyaları ile uygulanır.

## Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. `.env.local` dosyasını `.env.example` üzerinden oluşturun.

3. Oracle veritabanını başlatın:

```bash
docker compose up -d oracle
```

4. Migration ve seed:

```bash
npm run db:setup
```

5. Uygulamayı çalıştırın:

```bash
npm run dev
```

## Demo Kullanıcılar

| Kullanıcı | Şifre |
|-----------|-------|
| ahmet_yilmaz | Password123! |
| ayse_kaya | Password123! |
| mehmet_demir | Password123! |

## API Endpoints

- `POST /api/auth/register` — Kayıt
- `POST /api/auth/login` — Giriş (JWT httpOnly cookie)
- `GET /api/users` — Kullanıcı listesi (auth gerekli)
- `GET /api/medicines?search=` — İlaç arama
- `GET /api/diseases?search=` — Hastalık arama
- `GET /api/allergies` — Kullanıcı alerjileri

## Dil Desteği

TR / EN — cookie tabanlı locale (`locale=tr|en`)
=======
# pharmindex-smart-pharmacy-system
>>>>>>> 9434dbf015ed66e44dc14df486872df4fde79ba4
