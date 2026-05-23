# API DOCS

Base URL:

- local: `http://localhost:5500/api`
- production: replace with your Railway backend URL

Authentication:

- header: `Authorization: Bearer <token>`
- token comes from `POST /auth/login` or register responses

## Health

- `GET /health`
- returns server status and timestamp

## Auth

- `POST /auth/register/patient`
- body:
```json
{
  "name": "Ayush Test",
  "email": "patient1@viqure.com",
  "password": "Patient@123",
  "phone": "+919000000001",
  "gender": "male",
  "dob": "2003-03-27"
}
```

- `POST /auth/register/doctor`
- body:
```json
{
  "doctorName": "Dr. Demo",
  "email": "doctor@viqure.com",
  "password": "Doctor@123",
  "mobileNumber": "+919111111111",
  "gender": "male",
  "dob": "1989-05-12",
  "city": "Noida",
  "description": "Test doctor",
  "licenseNumber": "MCI-NOIDA-999",
  "yearsOfExperience": 6,
  "consultationFees": 700,
  "specializations": ["Cardiology"]
}
```

- `POST /auth/login`
- body:
```json
{
  "email": "patient1@viqure.com",
  "password": "Patient@123",
  "role": "patient"
}
```

- `GET /auth/me`
- auth required

- `POST /auth/logout`
- auth required

## Doctors

- `GET /doctors`
- query: `page`, `limit`

- `GET /doctors/search`
- query: `specialty`, `city`, `minRating`, `maxFees`, `sort`, `q`, `page`, `limit`

- `GET /doctors/:id`

- `GET /doctor/me`
- doctor auth required

- `PATCH /doctor/me`
- doctor auth required

- `GET /doctor/earnings`
- doctor auth required

## Patients

- `GET /patients/me`
- patient auth required

- `PATCH /patients/me`
- patient auth required

- `GET /patients/me/medical-records`
- patient auth required

- `PATCH /patients/me/medical-records`
- patient auth required
- example body:
```json
{
  "bloodGroup": "B+",
  "height": 174,
  "weight": 71,
  "diagnosis": "Mild hypertension",
  "symptoms": ["fatigue"],
  "treatment": "Reduce sodium intake"
}
```

## Slots

- `POST /slots`
- doctor auth required
- body:
```json
{
  "slots": [
    { "date": "2026-05-20", "startTime": "10:00", "endTime": "10:30" },
    { "date": "2026-05-20", "startTime": "10:30", "endTime": "11:00" }
  ]
}
```

- `GET /slots/doctor/:doctorId`
- query: optional `date=YYYY-MM-DD`

- `DELETE /slots/:id`
- doctor auth required

## Appointments

- `POST /appointments`
- auth required
- body:
```json
{
  "doctorId": "<doctorId>",
  "slotId": "<slotId>"
}
```

- `GET /appointments/patient`
- auth required

- `GET /appointments/doctor`
- auth required

- `GET /appointments/doctor/earnings`
- auth required

- `GET /appointments/:id`
- auth required

- `PATCH /appointments/:id/status`
- auth required
- body:
```json
{
  "status": "CONFIRMED"
}
```

- `PATCH /appointments/:id/remarks`
- doctor auth required
- body:
```json
{
  "remarks": "Continue medicines for 5 days",
  "remarksMode": "Text"
}
```

## Products

- `GET /products`
- query: `category`, `minPrice`, `maxPrice`, `brand`, `q`, `sort`, `page`, `limit`

- `GET /products/:idOrSlug`

- `POST /products`
- admin auth required

- `PATCH /products/:id`
- admin auth required

- `PATCH /products/:id/deactivate`
- admin auth required

## Cart

- `POST /cart`
- auth required

- `POST /cart/add`
- auth required
- body:
```json
{
  "productId": "<productId>",
  "quantity": 2
}
```

- `GET /cart`
- auth required

- `DELETE /cart/:productId`
- auth required

## Orders

- `POST /orders`
- auth required
- body:
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

- `GET /orders/:id`
- auth required

- `PATCH /orders/:id/status`
- admin auth required

- `PATCH /admin/orders/:id/status`
- admin auth required

## Reviews

- `POST /reviews`
- patient auth required
- doctor review body:
```json
{
  "targetEntity": "doctor",
  "targetId": "<doctorId>",
  "appointmentId": "<completedAppointmentId>",
  "rating": 5,
  "comment": "Very helpful"
}
```
- product review body:
```json
{
  "targetEntity": "product",
  "targetId": "<productId>",
  "rating": 4,
  "comment": "Arrived in good condition"
}
```

- `GET /reviews/:targetEntity/:targetId`

## Categories

- `GET /categories`
- query: optional `type=product` or `type=specialty`

## Notifications

- `GET /notifications`
- auth required

- `PATCH /notifications/:id/read`
- auth required

- `PATCH /notifications/read-all`
- auth required

## Admin

- `GET /admin/doctors`
- `PATCH /admin/doctors/:id/approve`
- `PATCH /admin/doctors/:id/reject`
- `GET /admin/patients`
- `GET /admin/analytics`
- `GET /admin/payments`
- `GET /admin/appointments`
- `GET /admin/orders`
- `POST /admin/categories`
- `PATCH /admin/categories/:id/deactivate`

## Common error patterns

- `400`: invalid payload, invalid status, slot unavailable, stock mismatch
- `401`: missing or invalid token
- `403`: role not allowed
- `404`: record not found
- `409`: duplicate registration, duplicate slot, duplicate review
