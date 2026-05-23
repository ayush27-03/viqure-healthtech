# Server README

## Purpose

This backend powers the ViQure health-tech flows for:

- patient and doctor authentication
- doctor slot management
- appointment booking
- ecommerce cart and order processing
- admin analytics and approvals
- reviews, notifications, and profile APIs

## Setup

At project root:

```powershell
npm install
```

Create `.env` with:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5500
JWT_SECRET=replace_this_in_real_envs
JWT_EXPIRES_IN_SECONDS=604800
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Run

Development:

```powershell
npm run dev
```

Production-style local start:

```powershell
npm start
```

Seed sample data:

```powershell
npm run seed
```

## Seed credentials

- admin: `admin@viqure.com / Admin@123`
- doctor: `rakesh.sharma@viqure.com / Doctor@123`
- patient: `patient1@viqure.com / Patient@123`

## Main route groups

- `/api/auth`
- `/api/admin`
- `/api/doctor`
- `/api/doctors`
- `/api/patients`
- `/api/slots`
- `/api/appointments`
- `/api/products`
- `/api/cart`
- `/api/orders`
- `/api/reviews`
- `/api/categories`
- `/api/notifications`

## Deployment notes

- set `CORS_ORIGINS` to your frontend domain
- verify Atlas network access before Railway deploy
- test `/api/health` first after deployment

## Related docs

- [API docs](../API_DOCS.md)
- [Database schema](../DATABASE_SCHEMA.md)
- [Manual verification guide](../MANUAL_VERIFICATION_GUIDE.md)
