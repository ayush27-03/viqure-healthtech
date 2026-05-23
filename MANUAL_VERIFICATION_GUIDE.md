# MANUAL VERIFICATION GUIDE

This guide covers the tasks that still require you to switch tabs to MongoDB Atlas, Postman, or Railway.

## 1. Start the backend locally

In terminal:

```powershell
npm install
npm run seed
npm run dev
```
Expected:

- seed completes without errors
- server starts on `http://localhost:5500`

## 2. MongoDB Atlas verification steps

Open Atlas:

1. go to your cluster
2. open `Browse Collections`
3. open the database used by `MONGODB_URI`

Check these collections after `npm run seed`:

- `admins`
- `users`
- `doctors`
- `categories`
- `slots`
- `products`
- `appointments`
- `orders`
- `deliveries`
- `payments`
- `reviews`
- `notifications`
- `medicalrecords`

What to verify:

- `slots` count is around `18`
- `products` count is `12`
- doctors contain `approved` and `pending` statuses
- at least one order has `status=delivered`
- at least one appointment has `appointmentStatus=COMPLETED` and `paymentStatus=PAID`

## 3. Postman setup

Create an environment:

- `baseUrl = http://localhost:5500/api`
- `adminToken =`
- `doctorToken =`
- `patientToken =`
- `doctorId =`
- `slotId =`
- `appointmentId =`
- `productId =`
- `orderId =`

## 4. Login requests

### Admin login

Request:

- `POST {{baseUrl}}/auth/login`

Body:

```json
{
  "email": "admin@viqure.com",
  "password": "Admin@123",
  "role": "admin"
}
```

Save:

- token as `adminToken`

### Doctor login

Request:

- `POST {{baseUrl}}/auth/login`

Body:

```json
{
  "email": "rakesh.sharma@viqure.com",
  "password": "Doctor@123",
  "role": "doctor"
}
```

Save:

- token as `doctorToken`

### Patient login

Request:

- `POST {{baseUrl}}/auth/login`

Body:

```json
{
  "email": "patient1@viqure.com",
  "password": "Patient@123",
  "role": "patient"
}
```

Save:

- token as `patientToken`

## 5. Slot verification

### Fetch doctor list

- `GET {{baseUrl}}/doctors`

Copy one approved doctor `_id` into `doctorId`.

### Fetch slots

- `GET {{baseUrl}}/slots/doctor/{{doctorId}}`

Expected:

- only future unbooked slots are returned

Atlas check:

1. open `slots`
2. filter by `doctorId`
3. compare with API response count

## 6. Appointment booking test

### Book appointment

- `POST {{baseUrl}}/appointments`
- Header: `Authorization: Bearer {{patientToken}}`

Body:

```json
{
  "doctorId": "{{doctorId}}",
  "slotId": "{{slotId}}"
}
```

Save returned `_id` as `appointmentId`.

Atlas check:

1. open `appointments`
2. confirm new appointment exists
3. open `slots`
4. confirm the selected slot now has `isBooked = true`

### Doctor accept

- `PATCH {{baseUrl}}/appointments/{{appointmentId}}/status`
- Header: `Authorization: Bearer {{doctorToken}}`

Body:

```json
{
  "status": "CONFIRMED"
}
```

### Doctor reject

Repeat with another appointment and:

```json
{
  "status": "REJECTED"
}
```

## 7. Cart and order verification

### Add to cart

- `POST {{baseUrl}}/cart/add`
- Header: `Authorization: Bearer {{patientToken}}`

Body:

```json
{
  "productId": "{{productId}}",
  "quantity": 2
}
```

Repeat the same request once more to verify upsert logic.

Expected:

- quantity increases
- product is not duplicated incorrectly

### Place order

- `POST {{baseUrl}}/orders`
- Header: `Authorization: Bearer {{patientToken}}`

Body:

```json
{
  "shippingAddress": {
    "fullName": "Ayush Test",
    "phone": "+919000000001",
    "addressLine": "12 Sector Road",
    "city": "Noida",
    "state": "UP",
    "pincode": "201301"
  }
}
```

Save returned order id as `orderId`.

Atlas checks:

1. open `orders`
2. confirm `productSnapshot` exists inside each order item
3. open `deliveries`
4. confirm a delivery document was created
5. open `products`
6. verify `inventory.stockQty` decreased by ordered quantity

## 8. Review verification

### Doctor review

- `POST {{baseUrl}}/reviews`
- Header: `Authorization: Bearer {{patientToken}}`

Body:

```json
{
  "targetEntity": "doctor",
  "targetId": "{{doctorId}}",
  "appointmentId": "{{appointmentId}}",
  "rating": 5,
  "comment": "Helpful consultation"
}
```

### Product review

- `POST {{baseUrl}}/reviews`
- Header: `Authorization: Bearer {{patientToken}}`

Body:

```json
{
  "targetEntity": "product",
  "targetId": "{{productId}}",
  "rating": 4,
  "comment": "Product was good"
}
```

Atlas check:

1. open `reviews`
2. confirm `purchaseVerified = true`

## 9. Analytics verification

### Doctor earnings

- `GET {{baseUrl}}/doctor/earnings`
- Header: `Authorization: Bearer {{doctorToken}}`

Verify:

- `totalEarnings`
- `totalAppointments`
- `avgFee`
- `monthly`
- `currentMonthEarnings`
- `previousMonthEarnings`

### Admin analytics

- `GET {{baseUrl}}/admin/analytics`
- Header: `Authorization: Bearer {{adminToken}}`

Verify:

- `consultationRevenue`
- `productRevenue`
- `totalRevenue`
- `monthlyUserGrowth`
- `orderStatusBreakdown`
- `lowStockProducts`

## 10. Railway deployment checklist

Manual steps:

1. create a new Railway project
2. connect the GitHub repo
3. set start command:
   - `npm start`
4. add env vars:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN_SECONDS`
   - `PORT`
   - `CORS_ORIGINS`
5. update Atlas network access:
   - allow Railway egress or temporarily allow `0.0.0.0/0` only if your team accepts the risk
6. deploy
7. open:
   - `https://<railway-domain>/api/health`

Expected:

- JSON response with `success: true`

## 11. Final bug logging format

When you find a bug, record:

- title
- priority: `P0`, `P1`, `P2`
- endpoint or flow
- request body used
- expected result
- actual result
- Atlas evidence if relevant
