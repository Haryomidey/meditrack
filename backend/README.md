# MediTrack Backend

Production-grade, modular REST backend for MediTrack with:

- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- JWT auth + refresh tokens
- RBAC (`Owner`, `Pharmacist`, `SalesStaff`)
- Validation (Zod)
- Offline sync queue processor with conflict handling
- Audit logging

## Quick start

1. `cd backend`
2. `cp .env.example .env` (or create `.env` manually)
3. `npm install`
4. `npm run dev`

Base URL: `http://localhost:4000/api`

## Core endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

- `GET /drugs`
- `POST /drugs`
- `PUT /drugs/:id`
- `DELETE /drugs/:id`

- `GET /sales`
- `POST /sales`
- `PATCH /sales/:id`

- `GET /prescriptions`
- `POST /prescriptions`
- `PUT /prescriptions/:id`
- `DELETE /prescriptions/:id`

- `GET /suppliers`
- `POST /suppliers`
- `PUT /suppliers/:id`
- `DELETE /suppliers/:id`

- `GET /reports/daily`
- `GET /reports/weekly`
- `GET /reports/monthly`
- `GET /reports/low-stock`
- `GET /reports/expiring`

- `POST /sync/queue`
- `GET /audit-logs` (Owner only)

## Notes

- Prescription image upload is supported via multipart key `image`.
- Sync queue supports `SALE`, `DRUG_UPDATE`, `PRESCRIPTION` in timestamp order.
- Conflict responses include stock mismatch details where applicable.
