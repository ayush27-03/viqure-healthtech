***

Correct API base URL: `http://localhost:5500/api`

Important architecture note: Viqure uses a unified MongoDB model. There is no separate Doctor, Patient, Cart, Slot, or Payment collection. Doctors and customers are both `User` documents separated by `role`; carts and doctor time slots are embedded inside `User`; payment data is embedded inside `Order` and `Appointment`.

## SECTION 1 - DATA DOCUMENTATION

### 1.1 Collections Overview

| Collection Name | Purpose | Approximate Size in Demo DB | Notes for Frontend |
|---|---:|---:|---|
| User | Stores all admins, customers, and doctors. | 26 documents: 1 admin, 15 customers, 10 doctors | Filter by `role` to separate `CUSTOMER`, `DOCTOR`, and `ADMIN`. Cart is embedded at `cart[]`. Doctor profile, approval, rating, availability, and time slots are embedded at `detailsOfHealthCareProfessional`. |
| Category | Product category metadata. | 6 documents | Used for shop category filters and product cards. Products reference categories through `Product.categoryId`. |
| Product | Pharmacy catalog items, pricing, inventory, batches, images, and specifications. | About 30 documents | Product card, product detail, cart, checkout, low-stock admin UI. Prices live in `pricing`; stock and expiry batches live in `inventory`. |
| Order | Pharmacy purchase orders and shipment/payment state. | 15 documents | Order items contain embedded `productSnapshot` data so history remains stable even if product details later change. Payment and shipping are embedded here. |
| Appointment | Doctor appointment bookings, payment, meeting, feedback, shared documents, and reported issues. | 15 documents | Links a customer user to a doctor user. Payment details, feedback, documents, cancellation, and issue data are embedded. |
| Review | Reviews for doctors or products. | 20 documents: 10 doctor, 10 product | Polymorphic target: use `targetType` plus `targetId`. `targetType=DOCTOR` points to `User._id`; `targetType=PRODUCT` points to `Product._id`. |
| MedicalRecord | Patient medical documents. | 15 documents | Records can be linked to a patient, doctor, and optionally an appointment. Used by patient profile and doctor dashboard medical history. |

### 1.2 Attribute Reference Tables

#### User

| Attribute Path | Data Type | Valid Values / Constraints | Required? | Frontend Use Case |
|---|---|---|---|---|
| `_id` | ObjectId | MongoDB document id | Yes | Stable user id in auth context and references. |
| `email` | String | Unique, lowercase, valid email | Yes | Login identifier, account display. |
| `phone` | String | Optional, regex `+?[1-9]\d{9,14}` | No | Profile contact, checkout contact. |
| `passwordHash` | String | Selected out by default | Yes | Never used by frontend. |
| `role` | String enum | `CUSTOMER`, `DOCTOR`, `ADMIN` | Yes | Store in auth context; drives routing and conditional UI. |
| `gender` | String enum | `MALE`, `FEMALE`, `OTHER` | No | Profile form. |
| `dob` | Date | ISO date | No | Profile form. |
| `profile.firstName` | String | Trimmed | No | User name, doctor card name. |
| `profile.lastName` | String | Trimmed | No | User name, doctor card name. |
| `addresses[]` | Embedded array | Address object, currently `_id: false` | No | Address book and checkout address picker. |
| `addresses.type` | String enum | `HOME`, `WORK`, `OTHER`; default `HOME` | No | Address label chip. |
| `addresses.street` | String | Free text | No | Address display. |
| `addresses.city` | String | Free text | No | Doctor city filter, address display. |
| `addresses.state` | String | Free text | No | Address display. |
| `addresses.pincode` | String | Free text | No | Checkout delivery address. |
| `cart[]` | Embedded array | Cart item object, currently `_id: false` | No | Cart state; there is no Cart collection. |
| `cart.productId` | ObjectId ref | References `Product._id` | No | Product details in cart. |
| `cart.quantity` | Number | Minimum `1`, default `1` | No | Quantity stepper in cart. |
| `detailsOfHealthCareProfessional` | Embedded object | Present for doctors, null/default otherwise | No | Doctor listing/detail/dashboard fields. |
| `detailsOfHealthCareProfessional.medicalLicense` | String | Unique sparse | No | Admin doctor approval review. |
| `detailsOfHealthCareProfessional.approvalStatus` | String enum | `PENDING`, `APPROVED`, `REJECTED`; default `PENDING` | No | Admin approval status badge; login gating for doctors. |
| `detailsOfHealthCareProfessional.consultationFee` | Number | Minimum `0`, default `0` | No | Doctor card and appointment payment calculation. |
| `detailsOfHealthCareProfessional.qualifications[]` | String array | Free text | No | Specialty/qualification chips on doctor cards. |
| `detailsOfHealthCareProfessional.yearsOfExperience` | Number | Minimum `0`, default `0` | No | Doctor profile summary. |
| `detailsOfHealthCareProfessional.bio` | String | Max 500 chars | No | Doctor detail page bio. |
| `detailsOfHealthCareProfessional.averageRating` | Number | Default `0` | No | Star rating on doctor listing. |
| `detailsOfHealthCareProfessional.timeSlots[]` | Embedded array | Time slot object, currently `_id: false` | No | Appointment booking calendar; there is no Slot collection. |
| `detailsOfHealthCareProfessional.timeSlots.date` | Date | Required in slot object | Yes for each slot | Calendar day. |
| `detailsOfHealthCareProfessional.timeSlots.startTime` | String | Example `10:00` | No | Slot button label. |
| `detailsOfHealthCareProfessional.timeSlots.endTime` | String | Example `10:30` | No | Slot button label. |
| `detailsOfHealthCareProfessional.timeSlots.isBooked` | Boolean | Default `false` | No | Disable/grey out booked slots. |
| `detailsOfHealthCareProfessional.isAvailable` | Boolean | Default `true` | No | Availability badge and doctor filter. |
| `detailsOfHealthCareProfessional.stats.rating` | Number | 0 to 5, default `0` | No | Doctor dashboard and card rating. |
| `detailsOfHealthCareProfessional.stats.totalRatings` | Number | Default `0` | No | Rating count label. |
| `detailsOfHealthCareProfessional.stats.totalAppointments` | Number | Default `0` | No | Doctor dashboard metric. |
| `isVerified` | Boolean | Default `false` | No | Verified badge on doctor card/profile. |
| `isActive` | Boolean | Default `true` | No | Admin user status toggle. |
| `lastLoginAt` | Date | ISO date | No | Admin/user audit display. |
| `avatar` | String/null | URL string or null | No | Profile avatar image. |
| `fcmToken` | String/null | Push token or null | No | Notification registration, not displayed. |
| `createdAt` | Date | Auto timestamp | Yes | Admin/user audit display. |
| `updatedAt` | Date | Auto timestamp | Yes | Admin/user audit display. |

Embedded structure:

```json
{
  "addresses": [
    {
      "type": "HOME",
      "street": "221B Green Park",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110016"
    }
  ],
  "cart": [
    {
      "productId": "64f1a2b3c4d5e6f7a8b9c101",
      "quantity": 2
    }
  ],
  "detailsOfHealthCareProfessional": {
    "medicalLicense": "DMC-778812",
    "approvalStatus": "APPROVED",
    "consultationFee": 700,
    "qualifications": ["MBBS", "MD Cardiology"],
    "yearsOfExperience": 12,
    "bio": "Cardiologist focused on preventive cardiac care.",
    "averageRating": 4.7,
    "timeSlots": [
      {
        "date": "2026-06-20T00:00:00.000Z",
        "startTime": "10:00",
        "endTime": "10:30",
        "isBooked": false
      }
    ],
    "isAvailable": true,
    "stats": {
      "rating": 4.7,
      "totalRatings": 128,
      "totalAppointments": 460
    }
  }
}
```

#### Category

| Attribute Path | Data Type | Valid Values / Constraints | Required? | Frontend Use Case |
|---|---|---|---|---|
| `_id` | ObjectId | MongoDB document id | Yes | Category filter value. |
| `name` | String | Unique, trimmed | Yes | Category tab/card label. |
| `icon` | String | Trimmed icon key or URL | No | Category icon in shop nav. |
| `description` | String | Trimmed | No | Category detail/help text. |
| `isActive` | Boolean | Default `true` | No | Admin enable/disable category; public lists show active categories. |
| `createdAt` | Date | Auto timestamp | Yes | Admin audit. |
| `updatedAt` | Date | Auto timestamp | Yes | Admin audit. |

#### Product

| Attribute Path | Data Type | Valid Values / Constraints | Required? | Frontend Use Case |
|---|---|---|---|---|
| `_id` | ObjectId | MongoDB document id | Yes | Product detail route and cart product id. |
| `name` | String | Required, trimmed | Yes | Product card title. |
| `categoryId` | ObjectId ref | References `Category._id` | Yes | Category filter and breadcrumb. |
| `description` | String | Trimmed | No | Product detail description. |
| `images[]` | String array | Trimmed URLs | No | Product gallery/card image. |
| `pricing.mrp` | Number | Minimum `0`, default `0` | No | Strikethrough MRP. |
| `pricing.purchasePrice` | Number | Minimum `0`, default `0` | No | Admin margin view only. |
| `pricing.basePrice` | Number | Minimum `0`, default `0` | No | Admin/catalog pricing. |
| `pricing.discountPercentage` | Number | 0 to 100, default `0` | No | Discount badge and price display. |
| `pricing.taxRate` | Number | Minimum `0`, default `0` | No | Product tax display/admin form. |
| `pricing.finalPrice` | Number | Minimum `0`, default `0` | No | Product card price and checkout total. |
| `inventory.sku` | String | Unique sparse, trimmed | No | Admin inventory SKU. |
| `inventory.supplier` | String | Trimmed | No | Brand/supplier display and order snapshot brand. |
| `inventory.warehouse` | String | Trimmed | No | Admin warehouse view. |
| `inventory.stockCount` | Number | Minimum `0`, default `0` | No | In-stock/out-of-stock state. |
| `inventory.reorderLevel` | Number | Minimum `0`, default `10` | No | Admin low-stock alert. |
| `inventory.batches[]` | Embedded array | Batch object | No | Admin expiry and stock batch table. |
| `inventory.batches.batchNumber` | String | Trimmed | No | Batch label. |
| `inventory.batches.expiryDate` | Date | ISO date | No | Expiry badge/warning. |
| `inventory.batches.quantity` | Number | Minimum `0` | No | Batch stock count. |
| `specifications` | Mixed object | Any JSON object | No | Product details facts table. |
| `isActive` | Boolean | Default `true` | No | Soft delete and public visibility. |
| `createdAt` | Date | Auto timestamp | Yes | Admin audit. |
| `updatedAt` | Date | Auto timestamp | Yes | Admin audit. |

#### Order

| Attribute Path | Data Type | Valid Values / Constraints | Required? | Frontend Use Case |
|---|---|---|---|---|
| `_id` | ObjectId | MongoDB document id | Yes | Order detail/track route. |
| `userId` | ObjectId ref | References `User._id` | Yes | Customer order history. |
| `items[]` | Embedded array | Order item object | No | Order summary and invoice. |
| `items.productId` | ObjectId ref | References `Product._id` | Yes | Link back to product detail. |
| `items.productSnapshot.name` | String | Trimmed | No | Historical product name. |
| `items.productSnapshot.brand` | String | Trimmed | No | Historical product brand/supplier. |
| `items.productSnapshot.image` | String | Trimmed URL | No | Historical item thumbnail. |
| `items.productSnapshot.mrp` | Number | Minimum `0` | No | Historical MRP. |
| `items.productSnapshot.sellingPrice` | Number | Minimum `0` | No | Historical selling price. |
| `items.quantity` | Number | Minimum `1`, default `1` | No | Quantity display. |
| `items.unitPrice` | Number | Minimum `0` | Yes | Line-item unit price. |
| `items.totalPrice` | Number | Minimum `0` | Yes | Line-item total. |
| `items.discount` | Number | Minimum `0`, default `0` | No | Discount display. |
| `pricing.subtotal` | Number | Minimum `0`, default `0` | No | Checkout/order subtotal. |
| `pricing.deliveryCharge` | Number | Minimum `0`, default `0` | No | Delivery charge row. |
| `pricing.discount` | Number | Minimum `0`, default `0` | No | Order-level discount row. |
| `pricing.finalAmount` | Number | Minimum `0` | Yes | Payment total. |
| `pricing.currency` | String | Default `INR` | No | Currency label. |
| `status` | String enum | `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`, `failed`, `returned` | No | Order status badge and actions. |
| `paymentDetails.transactionId` | String | Free text | No | Payment reference. |
| `paymentDetails.method` | String | Example `COD`, `UPI`, `CARD` | No | Payment method label. |
| `paymentDetails.status` | String enum | `PENDING`, `SUCCESS`, `FAILED` | No | Payment badge. |
| `paymentDetails.paymentDate` | Date | ISO date | No | Payment date display. |
| `shipmentDetails.status` | String enum | `PENDING`, `DISPATCHED`, `DELIVERED`, `FAILED`, `RETURNED`; schema default has lowercase `pending` mismatch | No | Shipment timeline state. |
| `shipmentDetails.courier.name` | String | Trimmed | No | Courier display. |
| `shipmentDetails.courier.trackingNumber` | String | Trimmed | No | Tracking number display. |
| `shipmentDetails.courier.contact` | String | Trimmed | No | Courier contact. |
| `shipmentDetails.deliveryAddress.fullName` | String | Trimmed | No | Delivery address display. |
| `shipmentDetails.deliveryAddress.phone` | String | Trimmed | No | Delivery contact. |
| `shipmentDetails.deliveryAddress.addressLine` | String | Trimmed | No | Delivery address display. |
| `shipmentDetails.deliveryAddress.city` | String | Trimmed | No | Delivery address display. |
| `shipmentDetails.deliveryAddress.state` | String | Trimmed | No | Delivery address display. |
| `shipmentDetails.deliveryAddress.pincode` | String | Trimmed | No | Delivery address display. |
| `shipmentDetails.otp` | String | Trimmed | No | Admin/delivery verification, do not show casually. |
| `shipmentDetails.otpVerification.status` | String enum | `VERIFIED`, `UNVERIFIED`; default `UNVERIFIED` | No | Delivery verification state. |
| `shipmentDetails.otpVerification.verifiedAt` | Date/null | Default null | No | Delivery verification timestamp. |
| `shipmentDetails.estimatedDeliveryDate` | Date | ISO date | No | ETA display. |
| `shipmentDetails.actualDeliveryDate` | Date/null | Default null | No | Delivered date. |
| `shipmentDetails.lastUpdatedAt` | Date | Default `Date.now` | No | Tracking last updated label. |
| `createdAt` | Date | Auto timestamp | Yes | Order placed date. |
| `updatedAt` | Date | Auto timestamp | Yes | Order update date. |

#### Appointment

| Attribute Path | Data Type | Valid Values / Constraints | Required? | Frontend Use Case |
|---|---|---|---|---|
| `_id` | ObjectId | MongoDB document id | Yes | Appointment detail route. |
| `patientId` | ObjectId ref | References `User._id` where role is `CUSTOMER` | Yes | Patient appointment history. |
| `doctorId` | ObjectId ref | References `User._id` where role is `DOCTOR` | Yes | Doctor dashboard and appointment detail. |
| `schedule.scheduledAt` | Date | Required | Yes | Calendar date. |
| `schedule.slotTime` | String | Example `10:00 - 10:30` | No | Appointment time label. |
| `schedule.startDateTime` | Date | ISO date | No | Calendar/time calculations. |
| `schedule.endDateTime` | Date | ISO date | No | Calendar/time calculations. |
| `meeting.meetingId` | String | Trimmed | No | Video meeting reference. |
| `meeting.meetingLink` | String | Trimmed URL | No | Join-call button. |
| `meeting.consultationType` | String enum | `VIDEO`, `PHONE`, `IN_PERSON`; default `VIDEO` | No | Appointment mode badge. |
| `financials.consultationFee` | Number | Minimum `0`, default `0` | No | Fee display. |
| `financials.taxAmount` | Number | Minimum `0`, default `0` | No | Payment breakdown. |
| `financials.totalAmount` | Number | Minimum `0`, default `0` | No | Payment total. |
| `financials.refundableAmount` | Number | Minimum `0`, default `0` | No | Cancellation/refund display. |
| `paymentDetails.transactionId` | String | Unique sparse | No | Payment reference. |
| `paymentDetails.status` | String enum | `PENDING`, `PAID`, `FAILED`, `REFUNDED`; default `PENDING` | No | Payment badge. |
| `paymentDetails.currency` | String | Default `INR` | No | Currency label. |
| `paymentDetails.paidAt` | Date | ISO date | No | Paid timestamp. |
| `appointmentStatus` | String enum | `BOOKED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `REJECTED`; default `BOOKED` | No | Appointment status badge colour and actions. |
| `reason` | String | Max 500 chars | No | Booking reason display. |
| `notes` | String | Max 1000 chars | No | Appointment notes. |
| `cancellation.cancelledBy` | ObjectId ref | References `User._id` | No | Cancellation audit. |
| `cancellation.cancelReason` | String | Trimmed | No | Cancelled reason text. |
| `cancellation.cancelledAt` | Date | ISO date | No | Cancellation timestamp. |
| `documentsShared[]` | Embedded array | Document object | No | Shared document list. |
| `documentsShared.uploadedBy` | ObjectId ref | References `User._id` | No | Uploader label. |
| `documentsShared.documentURL` | String | Trimmed URL | No | Download/open document. |
| `documentsShared.documentType` | String | Trimmed | No | Document type label. |
| `documentsShared.uploadedAt` | Date | Default `Date.now` | No | Uploaded timestamp. |
| `doctorRemarks.text` | String | Max 2000 chars | No | Doctor notes after consultation. |
| `doctorRemarks.mode` | String enum | `File`, `Text` | No | Render text vs file mode. |
| `feedback.rating` | Number | 0 to 5 | No | Completed appointment rating. |
| `feedback.comment` | String | Max 1000 chars | No | Patient feedback text. |
| `reportedIssue.issue` | String | Trimmed | No | Issue text in admin dashboard. |
| `reportedIssue.reportedAt` | Date | Default `Date.now` | No | Issue timestamp. |
| `reportedIssue.status` | String enum | `OPEN`, `RESOLVED`; default `OPEN` | No | Issue status badge. |
| `reportedIssue.resolution` | String | Trimmed | No | Admin resolution text. |
| `createdAt` | Date | Auto timestamp | Yes | Booking created date. |
| `updatedAt` | Date | Auto timestamp | Yes | Appointment update date. |

#### Review

| Attribute Path | Data Type | Valid Values / Constraints | Required? | Frontend Use Case |
|---|---|---|---|---|
| `_id` | ObjectId | MongoDB document id | Yes | Review update/delete/like actions. |
| `reviewerId` | ObjectId ref | References `User._id` | Yes | Reviewer avatar/name. |
| `targetType` | String enum | `DOCTOR`, `PRODUCT` | Yes | Select doctor/product review page. |
| `targetId` | ObjectId | Points to `User._id` when `DOCTOR`; points to `Product._id` when `PRODUCT` | Yes | Fetch reviews for doctor profile or product detail. |
| `rating` | Number | 1 to 5 | Yes | Stars. |
| `reviewText` | String | Trimmed | No | Review body. |
| `isVerified` | Boolean | Default `false` | No | Verified purchase/consultation badge. |
| `likes` | Number | Minimum `0`, default `0` | No | Like counter. |
| `createdAt` | Date | Auto timestamp | Yes | Review date. |
| `updatedAt` | Date | Auto timestamp | Yes | Edited date. |

#### MedicalRecord

| Attribute Path | Data Type | Valid Values / Constraints | Required? | Frontend Use Case |
|---|---|---|---|---|
| `_id` | ObjectId | MongoDB document id | Yes | Medical record detail/action id. |
| `patientId` | ObjectId ref | References `User._id` | Yes | Patient medical record list. |
| `doctorId` | ObjectId ref | References `User._id` | No | Doctor attribution. |
| `appointmentId` | ObjectId ref | References `Appointment._id` | No | Link record to consultation. |
| `documentType` | String enum | `PRESCRIPTION`, `LAB_REPORT`, `OTHER` | Yes | Record type icon/filter. |
| `fileUrl` | String | Trimmed, required | Yes | Open/download document. |
| `uploadedAt` | Date | Default `Date.now` | No | Uploaded timestamp. |
| `notes` | String | Trimmed | No | Record notes. |
| `isConfidential` | Boolean | Default `false` | No | Confidential lock/badge. |
| `createdAt` | Date | Auto timestamp | Yes | Audit. |
| `updatedAt` | Date | Auto timestamp | Yes | Audit. |

### 1.3 Collection Relationships

`User.cart[].productId` -> `Product._id` (ObjectId ref inside embedded cart item)  
Used when: Displaying cart items and calculating checkout totals.  
Frontend fetch pattern: `GET /api/users/me/cart` after login. The cart is embedded in the authenticated user's document.

`User.detailsOfHealthCareProfessional.timeSlots[]` -> embedded time slot documents, not a separate Slot collection  
Used when: Rendering doctor availability and booking appointments.  
Frontend fetch pattern: `GET /api/users/doctors/:id` for public doctor detail or `GET /api/doctors/me/slots` for doctor self dashboard.

`Product.categoryId` -> `Category._id` (ObjectId ref)  
Used when: Filtering products by category and showing category names/icons.  
Frontend fetch pattern: `GET /api/categories`, then `GET /api/products?categoryId=:id`.

`Order.userId` -> `User._id` (ObjectId ref)  
Used when: Displaying order history on user profile page.  
Frontend fetch pattern: `GET /api/orders`; backend scopes customers to their own orders.

`Order.items[].productId` -> `Product._id` (ObjectId ref)  
Used when: Linking historical order items back to product detail pages.  
Frontend fetch pattern: `GET /api/orders/:id`.

`Order.items[].productSnapshot` -> embedded product snapshot  
Used when: Showing stable order history even if product name/image/price changes later.  
Frontend fetch pattern: Use snapshot fields from the order response for order history cards.

`Appointment.patientId` -> `User._id` (ObjectId ref)  
Used when: Patient views appointment history.  
Frontend fetch pattern: `GET /api/appointments`.

`Appointment.doctorId` -> `User._id` (ObjectId ref)  
Used when: Doctor views consultation list and patient appointment details.  
Frontend fetch pattern: `GET /api/doctors/me/appointments` or `GET /api/appointments`.

`Appointment.documentsShared[]` -> embedded document list  
Used when: Patient or doctor shares files inside an appointment thread.  
Frontend fetch pattern: `POST /api/appointments/:id/documents`; response returns the updated embedded documents array.

`Review.reviewerId` -> `User._id` (ObjectId ref)  
Used when: Showing reviewer avatar/name on review cards.  
Frontend fetch pattern: `GET /api/reviews?targetType=DOCTOR&targetId=:id`.

`Review.targetId` -> `User._id` or `Product._id` (polymorphic ObjectId; check `targetType`)  
Used when: Displaying reviews on doctor profile or product detail page.  
Frontend fetch pattern: `GET /api/reviews?targetType=PRODUCT&targetId=:id`.

`MedicalRecord.patientId` -> `User._id` (ObjectId ref)  
Used when: Patient views medical records.  
Frontend fetch pattern: `GET /api/medical-records`.

`MedicalRecord.doctorId` -> `User._id` (ObjectId ref)  
Used when: Showing which doctor uploaded/authored a record.  
Frontend fetch pattern: `GET /api/medical-records?patientId=:id` for doctor/admin contexts.

`MedicalRecord.appointmentId` -> `Appointment._id` (ObjectId ref)  
Used when: Linking prescriptions/lab reports to a specific consultation.  
Frontend fetch pattern: read `appointmentId` from a record and deep-link to `GET /api/appointments/:id`.




## SECTION 2 - API DOCUMENTATION

All endpoint responses are JSON. Errors are normalized by the global error middleware as:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

Use this auth header for protected routes:

```http
Authorization: Bearer <token>
```

Shared realistic sample ids used below:

```json
{
  "customerId": "64f1a2b3c4d5e6f7a8b9c001",
  "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
  "productId": "64f1a2b3c4d5e6f7a8b9c101",
  "categoryId": "64f1a2b3c4d5e6f7a8b9c201",
  "appointmentId": "64f1a2b3c4d5e6f7a8b9c301",
  "orderId": "64f1a2b3c4d5e6f7a8b9c401",
  "reviewId": "64f1a2b3c4d5e6f7a8b9c501",
  "medicalRecordId": "64f1a2b3c4d5e6f7a8b9c601"
}
```

### 2.1 Auth

---

**POST /api/auth/register**

| Field | Value |
|---|---|
| Controller Function | `register` in `auth.controller.js` |
| Auth Required | No |
| Role Required | No |
| Description | Registers a customer or doctor; doctors start as `PENDING` and cannot log in until approved. |

**Request**

Request Body:

```json
{
  "email": "dr.amit.sharma@viqure.in",
  "phone": "+919810000110",
  "password": "DoctorPass@123",
  "role": "DOCTOR",
  "gender": "MALE",
  "dob": "1984-04-12",
  "profile": {
    "firstName": "Amit",
    "lastName": "Sharma"
  },
  "detailsOfHealthCareProfessional": {
    "medicalLicense": "DMC-778812",
    "consultationFee": 700,
    "qualifications": ["MBBS", "MD Cardiology"],
    "yearsOfExperience": 12,
    "bio": "Cardiologist focused on preventive cardiac care."
  }
}
```

**Response - Success**

```json
{
  "success": true,
  "message": "Registration submitted. Awaiting admin approval.",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c010",
      "email": "dr.amit.sharma@viqure.in",
      "phone": "+919810000110",
      "role": "DOCTOR",
      "gender": "MALE",
      "dob": "1984-04-12T00:00:00.000Z",
      "profile": {
        "firstName": "Amit",
        "lastName": "Sharma"
      },
      "addresses": [],
      "cart": [],
      "detailsOfHealthCareProfessional": {
        "medicalLicense": "DMC-778812",
        "approvalStatus": "PENDING",
        "consultationFee": 700,
        "qualifications": ["MBBS", "MD Cardiology"],
        "yearsOfExperience": 12,
        "bio": "Cardiologist focused on preventive cardiac care.",
        "averageRating": 0,
        "timeSlots": [],
        "isAvailable": false,
        "stats": {
          "rating": 0,
          "totalRatings": 0,
          "totalAppointments": 0
        }
      },
      "isVerified": false,
      "isActive": true,
      "lastLoginAt": null,
      "avatar": null,
      "fcmToken": null,
      "createdAt": "2026-06-17T14:30:00.000Z",
      "updatedAt": "2026-06-17T14:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.viqure-demo-token"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing `email`, `password`, or `role`; role is not `CUSTOMER` or `DOCTOR`. |
| 409 | Email already exists. |

**Frontend Usage Note:**

> Register Customer and Register Doctor forms call this endpoint. Store `data.token` and `data.user.role` in auth context/localStorage; role controls CUSTOMER vs DOCTOR vs ADMIN views.

---

**POST /api/auth/login**

| Field | Value |
|---|---|
| Controller Function | `login` in `auth.controller.js` |
| Auth Required | No |
| Role Required | No |
| Description | Authenticates a user and returns sanitized user data plus JWT token. |

**Request**

Request Body:

```json
{
  "email": "rhea.mehta@example.com",
  "password": "custom_pass123"
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c001",
      "email": "rhea.mehta@example.com",
      "phone": "+919810000201",
      "role": "CUSTOMER",
      "gender": "FEMALE",
      "dob": "1994-08-19T00:00:00.000Z",
      "profile": {
        "firstName": "Rhea",
        "lastName": "Mehta"
      },
      "addresses": [
        {
          "type": "HOME",
          "street": "221B Green Park",
          "city": "Delhi",
          "state": "Delhi",
          "pincode": "110016"
        }
      ],
      "cart": [
        {
          "productId": "64f1a2b3c4d5e6f7a8b9c101",
          "quantity": 2
        }
      ],
      "detailsOfHealthCareProfessional": null,
      "isVerified": false,
      "isActive": true,
      "lastLoginAt": "2026-06-17T14:32:20.000Z",
      "avatar": null,
      "fcmToken": null,
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-17T14:32:20.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.viqure-demo-token"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing email or password. |
| 401 | Invalid email or password. |
| 403 | Account inactive or doctor account is not approved. |

**Frontend Usage Note:**

> Login page calls this endpoint. Store token, user `_id`, and `role`; the frontend must use `role` to conditionally render CUSTOMER, DOCTOR, and ADMIN experiences.

---

**GET /api/auth/me**

| Field | Value |
|---|---|
| Controller Function | `getMe` in `auth.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Returns the authenticated user's current sanitized profile. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c001",
    "email": "rhea.mehta@example.com",
    "phone": "+919810000201",
    "role": "CUSTOMER",
    "gender": "FEMALE",
    "dob": "1994-08-19T00:00:00.000Z",
    "profile": {
      "firstName": "Rhea",
      "lastName": "Mehta"
    },
    "addresses": [
      {
        "type": "HOME",
        "street": "221B Green Park",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110016"
      }
    ],
    "cart": [],
    "detailsOfHealthCareProfessional": null,
    "isVerified": false,
    "isActive": true,
    "lastLoginAt": "2026-06-17T14:32:20.000Z",
    "avatar": null,
    "fcmToken": null,
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-17T14:35:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 403 | Account is deactivated. |

**Frontend Usage Note:**

> App bootstrap and protected route guards call this endpoint to refresh auth state after page reload.

---

**PATCH /api/auth/me**

| Field | Value |
|---|---|
| Controller Function | `updateMe` in `auth.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Updates allowed self-profile fields: phone, gender, dob, profile, addresses, avatar, and fcmToken. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "phone": "+919810000202",
  "profile": {
    "firstName": "Rhea",
    "lastName": "Kapoor"
  },
  "avatar": "https://cdn.viqure.in/avatars/rhea-kapoor.jpg",
  "addresses": [
    {
      "type": "HOME",
      "street": "221B Green Park",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110016"
    }
  ]
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c001",
    "email": "rhea.mehta@example.com",
    "phone": "+919810000202",
    "role": "CUSTOMER",
    "gender": "FEMALE",
    "dob": "1994-08-19T00:00:00.000Z",
    "profile": {
      "firstName": "Rhea",
      "lastName": "Kapoor"
    },
    "addresses": [
      {
        "type": "HOME",
        "street": "221B Green Park",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110016"
      }
    ],
    "cart": [],
    "detailsOfHealthCareProfessional": null,
    "isVerified": false,
    "isActive": true,
    "lastLoginAt": "2026-06-17T14:32:20.000Z",
    "avatar": "https://cdn.viqure.in/avatars/rhea-kapoor.jpg",
    "fcmToken": null,
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-17T14:40:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Validation error in updated fields. |
| 401 | Missing, invalid, or expired token. |

**Frontend Usage Note:**

> UserProfilePage uses this for profile edits; role, password, and doctor approval fields cannot be changed here.

---

**PATCH /api/auth/change-password**

| Field | Value |
|---|---|
| Controller Function | `changePassword` in `auth.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Changes the authenticated user's password after verifying the current password. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "currentPassword": "custom_pass123",
  "newPassword": "NewViqurePass@2026"
}
```

**Response - Success**

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing current or new password. |
| 401 | Current password is incorrect or token is invalid. |

**Frontend Usage Note:**

> UserProfilePage account/security tab calls this endpoint.

### 2.2 Users / Profile

---

**POST /api/users/me/addresses**

| Field | Value |
|---|---|
| Controller Function | `addAddress` in `user.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Adds an embedded address to the authenticated user's `addresses[]` array. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "type": "HOME",
  "street": "221B Green Park",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110016"
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c001",
    "email": "rhea.mehta@example.com",
    "phone": "+919810000201",
    "role": "CUSTOMER",
    "gender": "FEMALE",
    "dob": "1994-08-19T00:00:00.000Z",
    "profile": {
      "firstName": "Rhea",
      "lastName": "Mehta"
    },
    "addresses": [
      {
        "type": "HOME",
        "street": "221B Green Park",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110016"
      }
    ],
    "cart": [],
    "detailsOfHealthCareProfessional": null,
    "isVerified": false,
    "isActive": true,
    "lastLoginAt": "2026-06-17T14:32:20.000Z",
    "avatar": null,
    "fcmToken": null,
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-17T14:41:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing street, city, state, or pincode. |
| 401 | Missing, invalid, or expired token. |

**Frontend Usage Note:**

> UserProfilePage and CheckoutPage address form call this endpoint. Addresses are embedded in `User.addresses[]`.

---

**PATCH /api/users/me/addresses/:addressId**

⚠️  STATUS: Controller not yet refactored. Endpoint defined but may return errors until backend rewrite is complete. Use mock data on frontend until this is resolved.

| Field | Value |
|---|---|
| Controller Function | `updateAddress` in `user.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Intended to update an embedded address by id, but `AddressSchema` is declared with `_id: false`, so real address ids are not generated. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:addressId - Intended MongoDB ObjectId of the embedded address, but current schema does not create it.
```

Request Body:

```json
{
  "type": "WORK",
  "street": "4th Floor, Cyber Hub Tower B",
  "city": "Gurugram",
  "state": "Haryana",
  "pincode": "122002"
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c001",
    "email": "rhea.mehta@example.com",
    "phone": "+919810000201",
    "role": "CUSTOMER",
    "profile": {
      "firstName": "Rhea",
      "lastName": "Mehta"
    },
    "addresses": [
      {
        "type": "WORK",
        "street": "4th Floor, Cyber Hub Tower B",
        "city": "Gurugram",
        "state": "Haryana",
        "pincode": "122002"
      }
    ],
    "cart": [],
    "detailsOfHealthCareProfessional": null,
    "isVerified": false,
    "isActive": true,
    "avatar": null,
    "fcmToken": null,
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-17T14:42:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 404 | Address not found; likely with current schema because embedded addresses have no `_id`. |

**Frontend Usage Note:**

> Treat address editing as blocked until backend either enables address `_id` or updates by array index/full address replacement.

---

**DELETE /api/users/me/addresses/:addressId**

⚠️  STATUS: Controller not yet refactored. Endpoint defined but may return errors until backend rewrite is complete. Use mock data on frontend until this is resolved.

| Field | Value |
|---|---|
| Controller Function | `deleteAddress` in `user.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Intended to remove an embedded address by id, but `AddressSchema` is declared with `_id: false`. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:addressId - Intended MongoDB ObjectId of the embedded address, but current schema does not create it.
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c001",
    "email": "rhea.mehta@example.com",
    "phone": "+919810000201",
    "role": "CUSTOMER",
    "profile": {
      "firstName": "Rhea",
      "lastName": "Mehta"
    },
    "addresses": [],
    "cart": [],
    "detailsOfHealthCareProfessional": null,
    "isVerified": false,
    "isActive": true,
    "avatar": null,
    "fcmToken": null,
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-17T14:43:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 404 | Address cannot be matched because embedded addresses currently have no `_id`. |

**Frontend Usage Note:**

> Do not rely on delete-by-address-id yet; the address lives inside the User document.

### 2.3 Doctors

---

**GET /api/users/doctors**

| Field | Value |
|---|---|
| Controller Function | `listDoctors` in `user.controller.js` |
| Auth Required | No |
| Role Required | No |
| Description | Publicly lists approved, active doctors with optional city, rating, and availability filters. |

**Request**

Query Parameters:

```text
city (String, optional) - filter by addresses.city
minRating (Number, optional) - minimum doctor average rating
isAvailable (Boolean string, optional) - "true" or "false"
page (Number, optional, default: 1) - pagination
limit (Number, optional, default: 20) - results per page
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c010",
      "email": "dr.amit.sharma@viqure.in",
      "phone": "+919810000110",
      "role": "DOCTOR",
      "gender": "MALE",
      "dob": "1984-04-12T00:00:00.000Z",
      "profile": {
        "firstName": "Amit",
        "lastName": "Sharma"
      },
      "addresses": [
        {
          "type": "WORK",
          "street": "Heart Care Clinic, Saket",
          "city": "Delhi",
          "state": "Delhi",
          "pincode": "110017"
        }
      ],
      "detailsOfHealthCareProfessional": {
        "medicalLicense": "DMC-778812",
        "approvalStatus": "APPROVED",
        "consultationFee": 700,
        "qualifications": ["MBBS", "MD Cardiology"],
        "yearsOfExperience": 12,
        "bio": "Cardiologist focused on preventive cardiac care.",
        "averageRating": 4.7,
        "timeSlots": [
          {
            "date": "2026-06-20T00:00:00.000Z",
            "startTime": "10:00",
            "endTime": "10:30",
            "isBooked": false
          }
        ],
        "isAvailable": true,
        "stats": {
          "rating": 4.7,
          "totalRatings": 128,
          "totalAppointments": 460
        }
      },
      "isVerified": true,
      "isActive": true,
      "lastLoginAt": "2026-06-16T09:15:00.000Z",
      "avatar": "https://cdn.viqure.in/doctors/amit-sharma.jpg",
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-16T09:15:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c011",
      "email": "dr.sonia.verma@viqure.in",
      "phone": "+919810000111",
      "role": "DOCTOR",
      "gender": "FEMALE",
      "dob": "1988-11-03T00:00:00.000Z",
      "profile": {
        "firstName": "Sonia",
        "lastName": "Verma"
      },
      "addresses": [
        {
          "type": "WORK",
          "street": "Child Wellness Centre, Indiranagar",
          "city": "Bengaluru",
          "state": "Karnataka",
          "pincode": "560038"
        }
      ],
      "detailsOfHealthCareProfessional": {
        "medicalLicense": "KMC-551204",
        "approvalStatus": "APPROVED",
        "consultationFee": 600,
        "qualifications": ["MBBS", "DCH"],
        "yearsOfExperience": 9,
        "bio": "Pediatrician with focus on child nutrition and preventive care.",
        "averageRating": 4.8,
        "timeSlots": [
          {
            "date": "2026-06-20T00:00:00.000Z",
            "startTime": "12:00",
            "endTime": "12:30",
            "isBooked": true
          }
        ],
        "isAvailable": true,
        "stats": {
          "rating": 4.8,
          "totalRatings": 96,
          "totalAppointments": 320
        }
      },
      "isVerified": true,
      "isActive": true,
      "lastLoginAt": "2026-06-16T11:20:00.000Z",
      "avatar": "https://cdn.viqure.in/doctors/sonia-verma.jpg",
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-16T11:20:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid query value causes cast/validation error. |

**Frontend Usage Note:**

> HomepageDoctorListing calls this endpoint. Doctor card fields come from `User.profile`, `User.avatar`, `User.addresses`, and `User.detailsOfHealthCareProfessional`.

---

**GET /api/users/doctors/:id**

| Field | Value |
|---|---|
| Controller Function | `getDoctorById` in `user.controller.js` |
| Auth Required | No |
| Role Required | No |
| Description | Returns public details for one approved doctor. |

**Request**

Path Parameters:

```text
:id - MongoDB ObjectId of the doctor User document
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c010",
    "email": "dr.amit.sharma@viqure.in",
    "phone": "+919810000110",
    "role": "DOCTOR",
    "gender": "MALE",
    "dob": "1984-04-12T00:00:00.000Z",
    "profile": {
      "firstName": "Amit",
      "lastName": "Sharma"
    },
    "addresses": [
      {
        "type": "WORK",
        "street": "Heart Care Clinic, Saket",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110017"
      }
    ],
    "detailsOfHealthCareProfessional": {
      "medicalLicense": "DMC-778812",
      "approvalStatus": "APPROVED",
      "consultationFee": 700,
      "qualifications": ["MBBS", "MD Cardiology"],
      "yearsOfExperience": 12,
      "bio": "Cardiologist focused on preventive cardiac care.",
      "averageRating": 4.7,
      "timeSlots": [
        {
          "date": "2026-06-20T00:00:00.000Z",
          "startTime": "10:00",
          "endTime": "10:30",
          "isBooked": false
        },
        {
          "date": "2026-06-20T00:00:00.000Z",
          "startTime": "11:00",
          "endTime": "11:30",
          "isBooked": true
        }
      ],
      "isAvailable": true,
      "stats": {
        "rating": 4.7,
        "totalRatings": 128,
        "totalAppointments": 460
      }
    },
    "isVerified": true,
    "isActive": true,
    "lastLoginAt": "2026-06-16T09:15:00.000Z",
    "avatar": "https://cdn.viqure.in/doctors/amit-sharma.jpg",
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-16T09:15:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid id format. |
| 404 | Doctor is not found or is not approved. |

**Frontend Usage Note:**

> AppointmentBookingPage and doctor profile/detail page call this endpoint to render doctor metadata and available embedded slots.

---

**PATCH /api/doctors/me/profile**

| Field | Value |
|---|---|
| Controller Function | `updateDoctorProfile` in `doctor.controller.js` |
| Auth Required | Yes |
| Role Required | DOCTOR |
| Description | Lets an approved doctor update public profile details and availability. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "bio": "Cardiologist focused on preventive care, hypertension, and lipid management.",
  "qualifications": ["MBBS", "MD Cardiology", "FACC"],
  "yearsOfExperience": 13,
  "consultationFee": 750,
  "isAvailable": true
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c010",
    "email": "dr.amit.sharma@viqure.in",
    "phone": "+919810000110",
    "role": "DOCTOR",
    "gender": "MALE",
    "dob": "1984-04-12T00:00:00.000Z",
    "profile": {
      "firstName": "Amit",
      "lastName": "Sharma"
    },
    "addresses": [],
    "cart": [],
    "detailsOfHealthCareProfessional": {
      "medicalLicense": "DMC-778812",
      "approvalStatus": "APPROVED",
      "consultationFee": 750,
      "qualifications": ["MBBS", "MD Cardiology", "FACC"],
      "yearsOfExperience": 13,
      "bio": "Cardiologist focused on preventive care, hypertension, and lipid management.",
      "averageRating": 4.7,
      "timeSlots": [],
      "isAvailable": true,
      "stats": {
        "rating": 4.7,
        "totalRatings": 128,
        "totalAppointments": 460
      }
    },
    "isVerified": true,
    "isActive": true,
    "lastLoginAt": "2026-06-17T10:00:00.000Z",
    "avatar": "https://cdn.viqure.in/doctors/amit-sharma.jpg",
    "fcmToken": null,
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-17T14:44:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not a doctor. |
| 400 | Validation error. |

**Frontend Usage Note:**

> DoctorDashboard profile settings call this endpoint; approval status and medical license are not editable here.

---

**GET /api/doctors/me/slots**

| Field | Value |
|---|---|
| Controller Function | `getMySlots` in `doctor.controller.js` |
| Auth Required | Yes |
| Role Required | DOCTOR |
| Description | Returns the authenticated doctor's embedded time slot array. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "date": "2026-06-20T00:00:00.000Z",
      "startTime": "10:00",
      "endTime": "10:30",
      "isBooked": false
    },
    {
      "date": "2026-06-20T00:00:00.000Z",
      "startTime": "11:00",
      "endTime": "11:30",
      "isBooked": true
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not a doctor. |

**Frontend Usage Note:**

> DoctorDashboard availability editor calls this endpoint. Time slots are embedded at `User.detailsOfHealthCareProfessional.timeSlots[]`, not stored in a Slot collection.

---

**POST /api/doctors/me/slots**

| Field | Value |
|---|---|
| Controller Function | `addTimeSlots` in `doctor.controller.js` |
| Auth Required | Yes |
| Role Required | DOCTOR |
| Description | Pushes one or more embedded time slots into the authenticated doctor's profile. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "slots": [
    {
      "date": "2026-06-21T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "09:30"
    },
    {
      "date": "2026-06-21T00:00:00.000Z",
      "startTime": "09:30",
      "endTime": "10:00"
    }
  ]
}
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "date": "2026-06-21T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "09:30",
      "isBooked": false
    },
    {
      "date": "2026-06-21T00:00:00.000Z",
      "startTime": "09:30",
      "endTime": "10:00",
      "isBooked": false
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | `slots` is missing, empty, or not an array. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not a doctor. |

**Frontend Usage Note:**

> DoctorDashboard adds availability here. The response is the updated embedded `timeSlots[]` array.

---

**DELETE /api/doctors/me/slots/:slotId**

⚠️  STATUS: Controller not yet refactored. Endpoint defined but may return errors until backend rewrite is complete. Use mock data on frontend until this is resolved.

| Field | Value |
|---|---|
| Controller Function | `removeTimeSlot` in `doctor.controller.js` |
| Auth Required | Yes |
| Role Required | DOCTOR |
| Description | Intended to delete one unbooked embedded slot, but `TimeSlotSchema` is declared with `_id: false`, so slot ids are not generated. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:slotId - Intended MongoDB ObjectId of embedded slot, but current schema does not create it.
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "date": "2026-06-21T00:00:00.000Z",
      "startTime": "09:30",
      "endTime": "10:00",
      "isBooked": false
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Slot is already booked. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not a doctor. |
| 404 | Slot not found; likely with current schema because embedded slots have no `_id`. |

**Frontend Usage Note:**

> Hide or mock delete-slot behavior until backend adds slot ids or a delete-by-date/time API. Slots live inside the User document.

---

**GET /api/doctors/me/appointments**

| Field | Value |
|---|---|
| Controller Function | `getMyAppointments` in `doctor.controller.js` |
| Auth Required | Yes |
| Role Required | DOCTOR |
| Description | Lists appointments for the authenticated doctor, optionally filtered by status. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Query Parameters:

```text
status (String, optional) - valid values: BOOKED, CONFIRMED, COMPLETED, CANCELLED, REJECTED
page (Number, optional, default: 1) - pagination
limit (Number, optional, default: 20) - results per page
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c301",
      "patientId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c001",
        "profile": {
          "firstName": "Rhea",
          "lastName": "Mehta"
        },
        "email": "rhea.mehta@example.com",
        "phone": "+919810000201"
      },
      "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
      "schedule": {
        "scheduledAt": "2026-06-20T00:00:00.000Z",
        "slotTime": "10:00 - 10:30",
        "startDateTime": "2026-06-20T10:00:00.000Z",
        "endDateTime": "2026-06-20T10:30:00.000Z"
      },
      "meeting": {
        "meetingId": "MTG-2026-0001",
        "meetingLink": "https://meet.viqure.in/MTG-2026-0001",
        "consultationType": "VIDEO"
      },
      "financials": {
        "consultationFee": 700,
        "taxAmount": 126,
        "totalAmount": 826,
        "refundableAmount": 0
      },
      "paymentDetails": {
        "transactionId": "TXN-APT-2026-0001",
        "status": "PAID",
        "currency": "INR",
        "paidAt": "2026-06-17T14:50:00.000Z"
      },
      "appointmentStatus": "CONFIRMED",
      "reason": "Chest discomfort follow-up.",
      "notes": "Patient reports mild discomfort after exercise.",
      "cancellation": null,
      "documentsShared": [],
      "doctorRemarks": {
        "text": "",
        "mode": "Text"
      },
      "feedback": {
        "rating": 0,
        "comment": ""
      },
      "reportedIssue": null,
      "createdAt": "2026-06-17T14:45:00.000Z",
      "updatedAt": "2026-06-17T14:50:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c302",
      "patientId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c002",
        "profile": {
          "firstName": "Karan",
          "lastName": "Malhotra"
        },
        "email": "karan.malhotra@example.com",
        "phone": "+919810000202"
      },
      "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
      "schedule": {
        "scheduledAt": "2026-06-21T00:00:00.000Z",
        "slotTime": "09:00 - 09:30",
        "startDateTime": "2026-06-21T09:00:00.000Z",
        "endDateTime": "2026-06-21T09:30:00.000Z"
      },
      "meeting": {
        "meetingId": "MTG-2026-0002",
        "meetingLink": "https://meet.viqure.in/MTG-2026-0002",
        "consultationType": "VIDEO"
      },
      "financials": {
        "consultationFee": 700,
        "taxAmount": 126,
        "totalAmount": 826,
        "refundableAmount": 826
      },
      "paymentDetails": {
        "transactionId": "",
        "status": "PENDING",
        "currency": "INR",
        "paidAt": null
      },
      "appointmentStatus": "BOOKED",
      "reason": "Blood pressure review.",
      "notes": "",
      "cancellation": null,
      "documentsShared": [],
      "doctorRemarks": {
        "text": "",
        "mode": "Text"
      },
      "feedback": {
        "rating": 0,
        "comment": ""
      },
      "reportedIssue": null,
      "createdAt": "2026-06-17T15:00:00.000Z",
      "updatedAt": "2026-06-17T15:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not a doctor. |

**Frontend Usage Note:**

> DoctorDashboard calls this endpoint for appointment queue, status tabs, and patient details.

---

**GET /api/doctors/me/earnings**

| Field | Value |
|---|---|
| Controller Function | `getEarningsDashboard` in `doctor.controller.js` |
| Auth Required | Yes |
| Role Required | DOCTOR |
| Description | Aggregates paid appointment earnings for the authenticated doctor. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "totalEarnings": 4200,
    "totalAppointments": 6,
    "breakdownByStatus": [
      {
        "_id": "COMPLETED",
        "totalEarnings": 3500,
        "totalTax": 630,
        "count": 5
      },
      {
        "_id": "CONFIRMED",
        "totalEarnings": 700,
        "totalTax": 126,
        "count": 1
      }
    ]
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not a doctor. |

**Frontend Usage Note:**

> DoctorDashboard revenue cards and charts call this endpoint.

### 2.4 Products & Categories

---

**GET /api/categories**

| Field | Value |
|---|---|
| Controller Function | `listCategories` in `category.controller.js` |
| Auth Required | No |
| Role Required | No |
| Description | Lists active categories sorted by name. |

**Request**

Query Parameters:

```text
includeInactive (String, optional) - intended admin-only flag, but route is public and does not attach req.user.
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c201",
      "name": "Pain Relief",
      "icon": "pill",
      "description": "Analgesics and pain management medicines.",
      "isActive": true,
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-15T10:30:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c202",
      "name": "Vitamins & Supplements",
      "icon": "capsule",
      "description": "Daily vitamins, minerals, and health supplements.",
      "isActive": true,
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-15T10:30:00.000Z"
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 500 | Unexpected database error. |

**Frontend Usage Note:**

> ShopPage calls this endpoint to render category tabs/filters.

---

**GET /api/categories/:id**

| Field | Value |
|---|---|
| Controller Function | `getCategoryById` in `category.controller.js` |
| Auth Required | No |
| Role Required | No |
| Description | Returns one category by id. |

**Request**

Path Parameters:

```text
:id - MongoDB ObjectId of the Category
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c201",
    "name": "Pain Relief",
    "icon": "pill",
    "description": "Analgesics and pain management medicines.",
    "isActive": true,
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-15T10:30:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid id format. |
| 404 | Category not found. |

**Frontend Usage Note:**

> ProductDetailPage may call this if category metadata was not included in the product response.

---

**POST /api/categories**

| Field | Value |
|---|---|
| Controller Function | `createCategory` in `category.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Creates a new product category. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "name": "Women Wellness",
  "icon": "heart-pulse",
  "description": "Products for women's preventive health and wellness.",
  "isActive": true
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c203",
    "name": "Women Wellness",
    "icon": "heart-pulse",
    "description": "Products for women's preventive health and wellness.",
    "isActive": true,
    "createdAt": "2026-06-17T15:05:00.000Z",
    "updatedAt": "2026-06-17T15:05:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing name. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 409 | Category name already exists. |

**Frontend Usage Note:**

> AdminDashboard catalog management calls this endpoint.

---

**PATCH /api/categories/:id**

| Field | Value |
|---|---|
| Controller Function | `updateCategory` in `category.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Updates category fields. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Category
```

Request Body:

```json
{
  "name": "Pain Relief",
  "icon": "pill",
  "description": "Analgesics, pain management medicines, and topical relief products.",
  "isActive": true
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c201",
    "name": "Pain Relief",
    "icon": "pill",
    "description": "Analgesics, pain management medicines, and topical relief products.",
    "isActive": true,
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-17T15:06:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid id or validation error. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | Category not found. |

**Frontend Usage Note:**

> AdminDashboard category edit modal calls this endpoint.

---

**DELETE /api/categories/:id**

| Field | Value |
|---|---|
| Controller Function | `deleteCategory` in `category.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Deletes a category, or soft-deactivates it when products reference it. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Category
```

**Response - Success**

```json
{
  "success": true,
  "message": "Category has linked products; deactivated instead of deleted.",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c201",
    "name": "Pain Relief",
    "icon": "pill",
    "description": "Analgesics and pain management medicines.",
    "isActive": false,
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-17T15:07:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid id format. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | Category not found. |

**Frontend Usage Note:**

> AdminDashboard should refresh category/product filters after this; linked categories may become inactive rather than disappearing.

---

**GET /api/products**

| Field | Value |
|---|---|
| Controller Function | `listProducts` in `product.controller.js` |
| Auth Required | No |
| Role Required | No |
| Description | Lists active products with search, category, price, stock, sort, and pagination filters. |

**Request**

Query Parameters:

```text
q (String, optional) - search by product name
categoryId (String, optional) - Category ObjectId
minPrice (Number, optional) - minimum pricing.finalPrice
maxPrice (Number, optional) - maximum pricing.finalPrice
inStock (String, optional) - "true" filters stockCount > 0
sort (String, optional) - price_asc, price_desc, name_asc
page (Number, optional, default: 1) - pagination
limit (Number, optional, default: 20) - results per page
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c101",
      "name": "Dolo 650",
      "categoryId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c201",
        "name": "Pain Relief",
        "icon": "pill"
      },
      "description": "Paracetamol 650 mg tablet for fever and mild pain.",
      "images": ["https://cdn.viqure.in/products/pr-dol-650.jpg"],
      "pricing": {
        "mrp": 32,
        "purchasePrice": 18,
        "basePrice": 29,
        "discountPercentage": 0,
        "taxRate": 5,
        "finalPrice": 29
      },
      "inventory": {
        "sku": "PR-DOL-650",
        "supplier": "Micro Labs Ltd",
        "warehouse": "WH-NOIDA-01",
        "stockCount": 500,
        "reorderLevel": 50,
        "batches": [
          {
            "batchNumber": "BT-DOL-001",
            "expiryDate": "2027-06-01T00:00:00.000Z",
            "quantity": 500
          }
        ]
      },
      "specifications": {
        "dosage": "1 tablet every 4-6 hours",
        "saltComposition": "Paracetamol 650mg",
        "form": "Tablet",
        "packSize": "15 tablets"
      },
      "isActive": true,
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-15T10:30:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c102",
      "name": "Zincovit Tablet",
      "categoryId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c202",
        "name": "Vitamins & Supplements",
        "icon": "capsule"
      },
      "description": "Daily multivitamin and multimineral supplement.",
      "images": ["https://cdn.viqure.in/products/vs-zincovit.jpg"],
      "pricing": {
        "mrp": 120,
        "purchasePrice": 82,
        "basePrice": 110,
        "discountPercentage": 10,
        "taxRate": 12,
        "finalPrice": 99
      },
      "inventory": {
        "sku": "VS-ZIN-001",
        "supplier": "Apex Laboratories",
        "warehouse": "WH-NOIDA-01",
        "stockCount": 180,
        "reorderLevel": 30,
        "batches": [
          {
            "batchNumber": "BT-ZIN-004",
            "expiryDate": "2028-01-01T00:00:00.000Z",
            "quantity": 180
          }
        ]
      },
      "specifications": {
        "form": "Tablet",
        "packSize": "15 tablets",
        "usage": "Daily supplement"
      },
      "isActive": true,
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 20,
    "pages": 2
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid category id or numeric query value. |

**Frontend Usage Note:**

> ShopPage calls this endpoint for product grid, filters, search, sort, and pagination.

---

**GET /api/products/:id**

| Field | Value |
|---|---|
| Controller Function | `getProductById` in `product.controller.js` |
| Auth Required | No |
| Role Required | No |
| Description | Returns one active product with populated category summary. |

**Request**

Path Parameters:

```text
:id - MongoDB ObjectId of the Product
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c101",
    "name": "Dolo 650",
    "categoryId": {
      "_id": "64f1a2b3c4d5e6f7a8b9c201",
      "name": "Pain Relief",
      "icon": "pill"
    },
    "description": "Paracetamol 650 mg tablet for fever and mild pain.",
    "images": ["https://cdn.viqure.in/products/pr-dol-650.jpg"],
    "pricing": {
      "mrp": 32,
      "purchasePrice": 18,
      "basePrice": 29,
      "discountPercentage": 0,
      "taxRate": 5,
      "finalPrice": 29
    },
    "inventory": {
      "sku": "PR-DOL-650",
      "supplier": "Micro Labs Ltd",
      "warehouse": "WH-NOIDA-01",
      "stockCount": 500,
      "reorderLevel": 50,
      "batches": [
        {
          "batchNumber": "BT-DOL-001",
          "expiryDate": "2027-06-01T00:00:00.000Z",
          "quantity": 500
        }
      ]
    },
    "specifications": {
      "dosage": "1 tablet every 4-6 hours",
      "saltComposition": "Paracetamol 650mg",
      "form": "Tablet",
      "packSize": "15 tablets"
    },
    "isActive": true,
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-15T10:30:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid id format. |
| 404 | Product not found or inactive. |

**Frontend Usage Note:**

> ProductDetailPage calls this endpoint and uses `pricing.finalPrice`, `pricing.mrp`, `inventory.stockCount`, images, and specifications.

---

**POST /api/products**

| Field | Value |
|---|---|
| Controller Function | `createProduct` in `product.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Creates a product after verifying the referenced category exists. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "name": "Volini Pain Relief Spray",
  "categoryId": "64f1a2b3c4d5e6f7a8b9c201",
  "description": "Topical spray for muscle and joint pain relief.",
  "images": ["https://cdn.viqure.in/products/pr-volini-spray.jpg"],
  "pricing": {
    "mrp": 210,
    "purchasePrice": 145,
    "basePrice": 199,
    "discountPercentage": 5,
    "taxRate": 12,
    "finalPrice": 189
  },
  "inventory": {
    "sku": "PR-VOL-SPRAY",
    "supplier": "Sun Pharma",
    "warehouse": "WH-NOIDA-01",
    "stockCount": 75,
    "reorderLevel": 15,
    "batches": [
      {
        "batchNumber": "BT-VOL-010",
        "expiryDate": "2028-01-01T00:00:00.000Z",
        "quantity": 75
      }
    ]
  },
  "specifications": {
    "form": "Spray",
    "packSize": "60g",
    "usage": "External use only"
  },
  "isActive": true
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c103",
    "name": "Volini Pain Relief Spray",
    "categoryId": "64f1a2b3c4d5e6f7a8b9c201",
    "description": "Topical spray for muscle and joint pain relief.",
    "images": ["https://cdn.viqure.in/products/pr-volini-spray.jpg"],
    "pricing": {
      "mrp": 210,
      "purchasePrice": 145,
      "basePrice": 199,
      "discountPercentage": 5,
      "taxRate": 12,
      "finalPrice": 189
    },
    "inventory": {
      "sku": "PR-VOL-SPRAY",
      "supplier": "Sun Pharma",
      "warehouse": "WH-NOIDA-01",
      "stockCount": 75,
      "reorderLevel": 15,
      "batches": [
        {
          "batchNumber": "BT-VOL-010",
          "expiryDate": "2028-01-01T00:00:00.000Z",
          "quantity": 75
        }
      ]
    },
    "specifications": {
      "form": "Spray",
      "packSize": "60g",
      "usage": "External use only"
    },
    "isActive": true,
    "createdAt": "2026-06-17T15:10:00.000Z",
    "updatedAt": "2026-06-17T15:10:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing name/categoryId or validation error. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | Referenced category does not exist. |

**Frontend Usage Note:**

> AdminDashboard product creation form calls this endpoint.

---

**PATCH /api/products/:id**

| Field | Value |
|---|---|
| Controller Function | `updateProduct` in `product.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Updates product fields and validates changed category ids. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Product
```

Request Body:

```json
{
  "pricing": {
    "mrp": 210,
    "purchasePrice": 145,
    "basePrice": 199,
    "discountPercentage": 8,
    "taxRate": 12,
    "finalPrice": 183
  },
  "inventory": {
    "sku": "PR-VOL-SPRAY",
    "supplier": "Sun Pharma",
    "warehouse": "WH-NOIDA-01",
    "stockCount": 90,
    "reorderLevel": 15,
    "batches": [
      {
        "batchNumber": "BT-VOL-011",
        "expiryDate": "2028-01-01T00:00:00.000Z",
        "quantity": 90
      }
    ]
  }
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c103",
    "name": "Volini Pain Relief Spray",
    "categoryId": "64f1a2b3c4d5e6f7a8b9c201",
    "description": "Topical spray for muscle and joint pain relief.",
    "images": ["https://cdn.viqure.in/products/pr-volini-spray.jpg"],
    "pricing": {
      "mrp": 210,
      "purchasePrice": 145,
      "basePrice": 199,
      "discountPercentage": 8,
      "taxRate": 12,
      "finalPrice": 183
    },
    "inventory": {
      "sku": "PR-VOL-SPRAY",
      "supplier": "Sun Pharma",
      "warehouse": "WH-NOIDA-01",
      "stockCount": 90,
      "reorderLevel": 15,
      "batches": [
        {
          "batchNumber": "BT-VOL-011",
          "expiryDate": "2028-01-01T00:00:00.000Z",
          "quantity": 90
        }
      ]
    },
    "specifications": {
      "form": "Spray",
      "packSize": "60g",
      "usage": "External use only"
    },
    "isActive": true,
    "createdAt": "2026-06-17T15:10:00.000Z",
    "updatedAt": "2026-06-17T15:12:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid id or validation error. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | Product or referenced category not found. |

**Frontend Usage Note:**

> AdminDashboard product editor calls this endpoint.

---

**PATCH /api/products/:id/stock**

| Field | Value |
|---|---|
| Controller Function | `updateStock` in `product.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Updates stock absolutely via `stockCount` or relatively via `adjustBy`. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Product
```

Request Body:

```json
{
  "adjustBy": -5
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c103",
    "name": "Volini Pain Relief Spray",
    "categoryId": "64f1a2b3c4d5e6f7a8b9c201",
    "description": "Topical spray for muscle and joint pain relief.",
    "images": ["https://cdn.viqure.in/products/pr-volini-spray.jpg"],
    "pricing": {
      "mrp": 210,
      "purchasePrice": 145,
      "basePrice": 199,
      "discountPercentage": 8,
      "taxRate": 12,
      "finalPrice": 183
    },
    "inventory": {
      "sku": "PR-VOL-SPRAY",
      "supplier": "Sun Pharma",
      "warehouse": "WH-NOIDA-01",
      "stockCount": 85,
      "reorderLevel": 15,
      "batches": [
        {
          "batchNumber": "BT-VOL-011",
          "expiryDate": "2028-01-01T00:00:00.000Z",
          "quantity": 90
        }
      ]
    },
    "specifications": {
      "form": "Spray",
      "packSize": "60g",
      "usage": "External use only"
    },
    "isActive": true,
    "createdAt": "2026-06-17T15:10:00.000Z",
    "updatedAt": "2026-06-17T15:13:00.000Z"
  },
  "lowStockAlert": false
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing `stockCount`/`adjustBy`, negative result, or invalid id. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | Product not found. |

**Frontend Usage Note:**

> AdminDashboard inventory controls call this endpoint; show warning when `lowStockAlert` is true.

---

**GET /api/products/low-stock**

| Field | Value |
|---|---|
| Controller Function | `getLowStockProducts` in `product.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Lists active products where `inventory.stockCount <= inventory.reorderLevel`. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c104",
      "name": "OneTouch Select Test Strips",
      "categoryId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c204",
        "name": "Diabetes Care"
      },
      "description": "Blood glucose test strips for OneTouch glucometers.",
      "images": ["https://cdn.viqure.in/products/dc-onetouch-strips.jpg"],
      "pricing": {
        "mrp": 1150,
        "purchasePrice": 850,
        "basePrice": 1050,
        "discountPercentage": 5,
        "taxRate": 12,
        "finalPrice": 998
      },
      "inventory": {
        "sku": "DC-OTS-050",
        "supplier": "LifeScan",
        "warehouse": "WH-NOIDA-01",
        "stockCount": 8,
        "reorderLevel": 20,
        "batches": [
          {
            "batchNumber": "BT-OTS-003",
            "expiryDate": "2027-06-01T00:00:00.000Z",
            "quantity": 8
          }
        ]
      },
      "specifications": {
        "packSize": "50 strips",
        "usage": "Blood glucose monitoring"
      },
      "isActive": true,
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-17T15:15:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c105",
      "name": "Electral ORS Orange",
      "categoryId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c205",
        "name": "Digestive Care"
      },
      "description": "Oral rehydration salts for dehydration management.",
      "images": ["https://cdn.viqure.in/products/dg-electral-orange.jpg"],
      "pricing": {
        "mrp": 24,
        "purchasePrice": 12,
        "basePrice": 22,
        "discountPercentage": 0,
        "taxRate": 5,
        "finalPrice": 22
      },
      "inventory": {
        "sku": "DG-ORS-ORA",
        "supplier": "FDC Ltd",
        "warehouse": "WH-NOIDA-01",
        "stockCount": 10,
        "reorderLevel": 25,
        "batches": [
          {
            "batchNumber": "BT-ORS-009",
            "expiryDate": "2027-06-01T00:00:00.000Z",
            "quantity": 10
          }
        ]
      },
      "specifications": {
        "form": "Powder sachet",
        "flavour": "Orange"
      },
      "isActive": true,
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-17T15:15:00.000Z"
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |

**Frontend Usage Note:**

> AdminDashboard inventory alert table calls this endpoint.

---

**DELETE /api/products/:id**

| Field | Value |
|---|---|
| Controller Function | `deleteProduct` in `product.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Soft-deactivates a product by setting `isActive` to false. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Product
```

**Response - Success**

```json
{
  "success": true,
  "message": "Product deactivated",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c103",
    "name": "Volini Pain Relief Spray",
    "categoryId": "64f1a2b3c4d5e6f7a8b9c201",
    "description": "Topical spray for muscle and joint pain relief.",
    "images": ["https://cdn.viqure.in/products/pr-volini-spray.jpg"],
    "pricing": {
      "mrp": 210,
      "purchasePrice": 145,
      "basePrice": 199,
      "discountPercentage": 8,
      "taxRate": 12,
      "finalPrice": 183
    },
    "inventory": {
      "sku": "PR-VOL-SPRAY",
      "supplier": "Sun Pharma",
      "warehouse": "WH-NOIDA-01",
      "stockCount": 85,
      "reorderLevel": 15,
      "batches": [
        {
          "batchNumber": "BT-VOL-011",
          "expiryDate": "2028-01-01T00:00:00.000Z",
          "quantity": 90
        }
      ]
    },
    "specifications": {
      "form": "Spray",
      "packSize": "60g",
      "usage": "External use only"
    },
    "isActive": false,
    "createdAt": "2026-06-17T15:10:00.000Z",
    "updatedAt": "2026-06-17T15:16:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid id format. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | Product not found. |

**Frontend Usage Note:**

> AdminDashboard should remove inactive products from public catalog state after this response.

### 2.5 Cart

---

**GET /api/users/me/cart**

| Field | Value |
|---|---|
| Controller Function | `getCart` in `user.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Returns the authenticated user's embedded cart populated with products. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "productId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c101",
        "name": "Dolo 650",
        "categoryId": "64f1a2b3c4d5e6f7a8b9c201",
        "description": "Paracetamol 650 mg tablet for fever and mild pain.",
        "images": ["https://cdn.viqure.in/products/pr-dol-650.jpg"],
        "pricing": {
          "mrp": 32,
          "purchasePrice": 18,
          "basePrice": 29,
          "discountPercentage": 0,
          "taxRate": 5,
          "finalPrice": 29
        },
        "inventory": {
          "sku": "PR-DOL-650",
          "supplier": "Micro Labs Ltd",
          "warehouse": "WH-NOIDA-01",
          "stockCount": 500,
          "reorderLevel": 50,
          "batches": [
            {
              "batchNumber": "BT-DOL-001",
              "expiryDate": "2027-06-01T00:00:00.000Z",
              "quantity": 500
            }
          ]
        },
        "specifications": {
          "dosage": "1 tablet every 4-6 hours",
          "saltComposition": "Paracetamol 650mg",
          "form": "Tablet",
          "packSize": "15 tablets"
        },
        "isActive": true,
        "createdAt": "2026-06-15T10:30:00.000Z",
        "updatedAt": "2026-06-15T10:30:00.000Z"
      },
      "quantity": 2
    },
    {
      "productId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c102",
        "name": "Zincovit Tablet",
        "categoryId": "64f1a2b3c4d5e6f7a8b9c202",
        "description": "Daily multivitamin and multimineral supplement.",
        "images": ["https://cdn.viqure.in/products/vs-zincovit.jpg"],
        "pricing": {
          "mrp": 120,
          "purchasePrice": 82,
          "basePrice": 110,
          "discountPercentage": 10,
          "taxRate": 12,
          "finalPrice": 99
        },
        "inventory": {
          "sku": "VS-ZIN-001",
          "supplier": "Apex Laboratories",
          "warehouse": "WH-NOIDA-01",
          "stockCount": 180,
          "reorderLevel": 30,
          "batches": [
            {
              "batchNumber": "BT-ZIN-004",
              "expiryDate": "2028-01-01T00:00:00.000Z",
              "quantity": 180
            }
          ]
        },
        "specifications": {
          "form": "Tablet",
          "packSize": "15 tablets",
          "usage": "Daily supplement"
        },
        "isActive": true,
        "createdAt": "2026-06-15T10:30:00.000Z",
        "updatedAt": "2026-06-15T10:30:00.000Z"
      },
      "quantity": 1
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |

**Frontend Usage Note:**

> CartPage calls this endpoint. Cart is embedded inside `User.cart[]`; response returns the embedded array, not a Cart resource.

---

**POST /api/users/me/cart**

| Field | Value |
|---|---|
| Controller Function | `addToCart` in `user.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Adds a product to the authenticated user's embedded cart or increments quantity if present. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "productId": "64f1a2b3c4d5e6f7a8b9c101",
  "quantity": 2
}
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "productId": "64f1a2b3c4d5e6f7a8b9c101",
      "quantity": 2
    },
    {
      "productId": "64f1a2b3c4d5e6f7a8b9c102",
      "quantity": 1
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing productId. |
| 401 | Missing, invalid, or expired token. |

**Frontend Usage Note:**

> ProductDetailPage and ShopPage call this for "Add to cart". The response returns updated `User.cart[]`; refetch cart for populated product details.

---

**PATCH /api/users/me/cart/:productId**

| Field | Value |
|---|---|
| Controller Function | `updateCartItem` in `user.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Updates quantity for one embedded cart item by product id. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:productId - MongoDB ObjectId of the Product in User.cart[]
```

Request Body:

```json
{
  "quantity": 3
}
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "productId": "64f1a2b3c4d5e6f7a8b9c101",
      "quantity": 3
    },
    {
      "productId": "64f1a2b3c4d5e6f7a8b9c102",
      "quantity": 1
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Quantity missing or less than 1. |
| 401 | Missing, invalid, or expired token. |
| 404 | Product is not in cart. |

**Frontend Usage Note:**

> CartPage quantity stepper calls this endpoint. Data lives inside the User document.

---

**DELETE /api/users/me/cart/:productId**

| Field | Value |
|---|---|
| Controller Function | `removeFromCart` in `user.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Removes one product from the authenticated user's embedded cart. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:productId - MongoDB ObjectId of the Product in User.cart[]
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "productId": "64f1a2b3c4d5e6f7a8b9c102",
      "quantity": 1
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |

**Frontend Usage Note:**

> CartPage remove item button calls this endpoint. The response returns updated `User.cart[]`.

---

**DELETE /api/users/me/cart**

| Field | Value |
|---|---|
| Controller Function | `clearCart` in `user.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Clears the authenticated user's embedded cart. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

**Response - Success**

```json
{
  "success": true,
  "data": []
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |

**Frontend Usage Note:**

> CheckoutPage may call this after manual checkout cleanup, but `POST /api/orders/checkout` already clears the embedded cart.

### 2.6 Orders

---

**POST /api/orders/checkout**

| Field | Value |
|---|---|
| Controller Function | `checkout` in `order.controller.js` |
| Auth Required | Yes |
| Role Required | CUSTOMER |
| Description | Builds an order from the customer's embedded cart, decrements product stock, snapshots items, and clears the cart. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "deliveryAddress": {
    "fullName": "Rhea Mehta",
    "phone": "+919810000201",
    "addressLine": "221B Green Park",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110016"
  },
  "paymentMethod": "COD"
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c401",
    "userId": "64f1a2b3c4d5e6f7a8b9c001",
    "items": [
      {
        "productId": "64f1a2b3c4d5e6f7a8b9c101",
        "productSnapshot": {
          "name": "Dolo 650",
          "brand": "Micro Labs Ltd",
          "image": "https://cdn.viqure.in/products/pr-dol-650.jpg",
          "mrp": 32,
          "sellingPrice": 29
        },
        "quantity": 2,
        "unitPrice": 29,
        "totalPrice": 58,
        "discount": 0
      }
    ],
    "pricing": {
      "subtotal": 58,
      "deliveryCharge": 49,
      "discount": 0,
      "finalAmount": 107,
      "currency": "INR"
    },
    "status": "pending",
    "paymentDetails": {
      "transactionId": "",
      "method": "COD",
      "status": "PENDING",
      "paymentDate": null
    },
    "shipmentDetails": {
      "status": "PENDING",
      "courier": {
        "name": "",
        "trackingNumber": "",
        "contact": ""
      },
      "deliveryAddress": {
        "fullName": "Rhea Mehta",
        "phone": "+919810000201",
        "addressLine": "221B Green Park",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110016"
      },
      "otp": "",
      "otpVerification": {
        "status": "UNVERIFIED",
        "verifiedAt": null
      },
      "estimatedDeliveryDate": "2026-06-22T15:20:00.000Z",
      "actualDeliveryDate": null,
      "lastUpdatedAt": "2026-06-17T15:20:00.000Z"
    },
    "createdAt": "2026-06-17T15:20:00.000Z",
    "updatedAt": "2026-06-17T15:20:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing delivery address or cart is empty. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not customer. |
| 409 | Insufficient product stock. |

**Frontend Usage Note:**

> CheckoutPage calls this endpoint. It consumes `User.cart[]` and returns an Order; after success, clear cart state locally because backend empties the embedded cart.

---

**GET /api/orders**

| Field | Value |
|---|---|
| Controller Function | `listOrders` in `order.controller.js` |
| Auth Required | Yes |
| Role Required | CUSTOMER or ADMIN |
| Description | Customers see their own orders; admins see all orders with optional status filter. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Query Parameters:

```text
status (String, optional) - pending, confirmed, shipped, delivered, cancelled, failed, returned
page (Number, optional, default: 1) - pagination
limit (Number, optional, default: 20) - results per page
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c401",
      "userId": "64f1a2b3c4d5e6f7a8b9c001",
      "items": [
        {
          "productId": "64f1a2b3c4d5e6f7a8b9c101",
          "productSnapshot": {
            "name": "Dolo 650",
            "brand": "Micro Labs Ltd",
            "image": "https://cdn.viqure.in/products/pr-dol-650.jpg",
            "mrp": 32,
            "sellingPrice": 29
          },
          "quantity": 2,
          "unitPrice": 29,
          "totalPrice": 58,
          "discount": 0
        }
      ],
      "pricing": {
        "subtotal": 58,
        "deliveryCharge": 49,
        "discount": 0,
        "finalAmount": 107,
        "currency": "INR"
      },
      "status": "pending",
      "paymentDetails": {
        "transactionId": "",
        "method": "COD",
        "status": "PENDING",
        "paymentDate": null
      },
      "shipmentDetails": {
        "status": "PENDING",
        "courier": {
          "name": "",
          "trackingNumber": "",
          "contact": ""
        },
        "deliveryAddress": {
          "fullName": "Rhea Mehta",
          "phone": "+919810000201",
          "addressLine": "221B Green Park",
          "city": "Delhi",
          "state": "Delhi",
          "pincode": "110016"
        },
        "otp": "",
        "otpVerification": {
          "status": "UNVERIFIED",
          "verifiedAt": null
        },
        "estimatedDeliveryDate": "2026-06-22T15:20:00.000Z",
        "actualDeliveryDate": null,
        "lastUpdatedAt": "2026-06-17T15:20:00.000Z"
      },
      "createdAt": "2026-06-17T15:20:00.000Z",
      "updatedAt": "2026-06-17T15:20:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c402",
      "userId": "64f1a2b3c4d5e6f7a8b9c001",
      "items": [
        {
          "productId": "64f1a2b3c4d5e6f7a8b9c102",
          "productSnapshot": {
            "name": "Zincovit Tablet",
            "brand": "Apex Laboratories",
            "image": "https://cdn.viqure.in/products/vs-zincovit.jpg",
            "mrp": 120,
            "sellingPrice": 99
          },
          "quantity": 1,
          "unitPrice": 99,
          "totalPrice": 99,
          "discount": 0
        }
      ],
      "pricing": {
        "subtotal": 99,
        "deliveryCharge": 49,
        "discount": 0,
        "finalAmount": 148,
        "currency": "INR"
      },
      "status": "delivered",
      "paymentDetails": {
        "transactionId": "TXN-ORD-2026-0002",
        "method": "UPI",
        "status": "SUCCESS",
        "paymentDate": "2026-06-12T12:00:00.000Z"
      },
      "shipmentDetails": {
        "status": "DELIVERED",
        "courier": {
          "name": "Delhivery",
          "trackingNumber": "DLV-2026-0002",
          "contact": "+911244000000"
        },
        "deliveryAddress": {
          "fullName": "Rhea Mehta",
          "phone": "+919810000201",
          "addressLine": "221B Green Park",
          "city": "Delhi",
          "state": "Delhi",
          "pincode": "110016"
        },
        "otp": "482913",
        "otpVerification": {
          "status": "VERIFIED",
          "verifiedAt": "2026-06-15T18:00:00.000Z"
        },
        "estimatedDeliveryDate": "2026-06-15T00:00:00.000Z",
        "actualDeliveryDate": "2026-06-15T18:00:00.000Z",
        "lastUpdatedAt": "2026-06-15T18:00:00.000Z"
      },
      "createdAt": "2026-06-12T12:00:00.000Z",
      "updatedAt": "2026-06-15T18:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |

**Frontend Usage Note:**

> OrderHistoryPage and AdminDashboard orders table call this endpoint.

---

**GET /api/orders/:id**

| Field | Value |
|---|---|
| Controller Function | `getOrderById` in `order.controller.js` |
| Auth Required | Yes |
| Role Required | Order owner CUSTOMER or ADMIN |
| Description | Returns one order when the user owns it or is admin. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Order
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c401",
    "userId": "64f1a2b3c4d5e6f7a8b9c001",
    "items": [
      {
        "productId": "64f1a2b3c4d5e6f7a8b9c101",
        "productSnapshot": {
          "name": "Dolo 650",
          "brand": "Micro Labs Ltd",
          "image": "https://cdn.viqure.in/products/pr-dol-650.jpg",
          "mrp": 32,
          "sellingPrice": 29
        },
        "quantity": 2,
        "unitPrice": 29,
        "totalPrice": 58,
        "discount": 0
      }
    ],
    "pricing": {
      "subtotal": 58,
      "deliveryCharge": 49,
      "discount": 0,
      "finalAmount": 107,
      "currency": "INR"
    },
    "status": "pending",
    "paymentDetails": {
      "transactionId": "",
      "method": "COD",
      "status": "PENDING",
      "paymentDate": null
    },
    "shipmentDetails": {
      "status": "PENDING",
      "courier": {
        "name": "",
        "trackingNumber": "",
        "contact": ""
      },
      "deliveryAddress": {
        "fullName": "Rhea Mehta",
        "phone": "+919810000201",
        "addressLine": "221B Green Park",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110016"
      },
      "otp": "",
      "otpVerification": {
        "status": "UNVERIFIED",
        "verifiedAt": null
      },
      "estimatedDeliveryDate": "2026-06-22T15:20:00.000Z",
      "actualDeliveryDate": null,
      "lastUpdatedAt": "2026-06-17T15:20:00.000Z"
    },
    "createdAt": "2026-06-17T15:20:00.000Z",
    "updatedAt": "2026-06-17T15:20:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid order id. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not owner and not admin. |
| 404 | Order not found. |

**Frontend Usage Note:**

> OrderHistoryPage detail drawer calls this endpoint.

---

**GET /api/orders/:id/track**

| Field | Value |
|---|---|
| Controller Function | `trackOrder` in `order.controller.js` |
| Auth Required | Yes |
| Role Required | Intended order owner CUSTOMER or ADMIN |
| Description | Returns lightweight shipment tracking data. |

Implementation warning: the controller selects `status shipmentDetails pricing.finalAmount createdAt` but later checks `order.userId`; because `userId` is not selected, ownership enforcement may be ineffective until backend adds `userId` to the select list.

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Order
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "status": "shipped",
    "shipment": {
      "status": "DISPATCHED",
      "courier": {
        "name": "Delhivery",
        "trackingNumber": "DLV-2026-0002",
        "contact": "+911244000000"
      },
      "deliveryAddress": {
        "fullName": "Rhea Mehta",
        "phone": "+919810000201",
        "addressLine": "221B Green Park",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110016"
      },
      "otp": "482913",
      "otpVerification": {
        "status": "UNVERIFIED",
        "verifiedAt": null
      },
      "estimatedDeliveryDate": "2026-06-22T00:00:00.000Z",
      "actualDeliveryDate": null,
      "lastUpdatedAt": "2026-06-17T16:00:00.000Z"
    },
    "placedAt": "2026-06-17T15:20:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid order id. |
| 401 | Missing, invalid, or expired token. |
| 403 | Intended when user does not own order, but current select may bypass this. |
| 404 | Order not found. |

**Frontend Usage Note:**

> OrderHistoryPage tracking panel calls this endpoint. Do not expose other users' order ids in frontend routes.

---

**PATCH /api/orders/:id/cancel**

| Field | Value |
|---|---|
| Controller Function | `cancelOrder` in `order.controller.js` |
| Auth Required | Yes |
| Role Required | Order owner CUSTOMER or ADMIN |
| Description | Cancels a pending/confirmed order and restocks inventory. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Order
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c401",
    "userId": "64f1a2b3c4d5e6f7a8b9c001",
    "items": [
      {
        "productId": "64f1a2b3c4d5e6f7a8b9c101",
        "productSnapshot": {
          "name": "Dolo 650",
          "brand": "Micro Labs Ltd",
          "image": "https://cdn.viqure.in/products/pr-dol-650.jpg",
          "mrp": 32,
          "sellingPrice": 29
        },
        "quantity": 2,
        "unitPrice": 29,
        "totalPrice": 58,
        "discount": 0
      }
    ],
    "pricing": {
      "subtotal": 58,
      "deliveryCharge": 49,
      "discount": 0,
      "finalAmount": 107,
      "currency": "INR"
    },
    "status": "cancelled",
    "paymentDetails": {
      "transactionId": "",
      "method": "COD",
      "status": "PENDING",
      "paymentDate": null
    },
    "shipmentDetails": {
      "status": "FAILED",
      "courier": {
        "name": "",
        "trackingNumber": "",
        "contact": ""
      },
      "deliveryAddress": {
        "fullName": "Rhea Mehta",
        "phone": "+919810000201",
        "addressLine": "221B Green Park",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110016"
      },
      "otp": "",
      "otpVerification": {
        "status": "UNVERIFIED",
        "verifiedAt": null
      },
      "estimatedDeliveryDate": "2026-06-22T15:20:00.000Z",
      "actualDeliveryDate": null,
      "lastUpdatedAt": "2026-06-17T15:20:00.000Z"
    },
    "createdAt": "2026-06-17T15:20:00.000Z",
    "updatedAt": "2026-06-17T15:25:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Order is not pending or confirmed. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not owner and not admin. |
| 404 | Order not found. |

**Frontend Usage Note:**

> OrderHistoryPage cancel button calls this for cancellable orders.

---

**PATCH /api/orders/:id/return**

| Field | Value |
|---|---|
| Controller Function | `returnOrder` in `order.controller.js` |
| Auth Required | Yes |
| Role Required | Order owner CUSTOMER or ADMIN |
| Description | Marks a delivered order as returned. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Order
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c402",
    "userId": "64f1a2b3c4d5e6f7a8b9c001",
    "items": [
      {
        "productId": "64f1a2b3c4d5e6f7a8b9c102",
        "productSnapshot": {
          "name": "Zincovit Tablet",
          "brand": "Apex Laboratories",
          "image": "https://cdn.viqure.in/products/vs-zincovit.jpg",
          "mrp": 120,
          "sellingPrice": 99
        },
        "quantity": 1,
        "unitPrice": 99,
        "totalPrice": 99,
        "discount": 0
      }
    ],
    "pricing": {
      "subtotal": 99,
      "deliveryCharge": 49,
      "discount": 0,
      "finalAmount": 148,
      "currency": "INR"
    },
    "status": "returned",
    "paymentDetails": {
      "transactionId": "TXN-ORD-2026-0002",
      "method": "UPI",
      "status": "SUCCESS",
      "paymentDate": "2026-06-12T12:00:00.000Z"
    },
    "shipmentDetails": {
      "status": "RETURNED",
      "courier": {
        "name": "Delhivery",
        "trackingNumber": "DLV-2026-0002",
        "contact": "+911244000000"
      },
      "deliveryAddress": {
        "fullName": "Rhea Mehta",
        "phone": "+919810000201",
        "addressLine": "221B Green Park",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110016"
      },
      "otp": "482913",
      "otpVerification": {
        "status": "VERIFIED",
        "verifiedAt": "2026-06-15T18:00:00.000Z"
      },
      "estimatedDeliveryDate": "2026-06-15T00:00:00.000Z",
      "actualDeliveryDate": "2026-06-15T18:00:00.000Z",
      "lastUpdatedAt": "2026-06-17T15:30:00.000Z"
    },
    "createdAt": "2026-06-12T12:00:00.000Z",
    "updatedAt": "2026-06-17T15:30:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Order is not delivered. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not owner and not admin. |
| 404 | Order not found. |

**Frontend Usage Note:**

> OrderHistoryPage return button calls this only for delivered orders.

---

**PATCH /api/orders/:id/confirm**

| Field | Value |
|---|---|
| Controller Function | `confirmOrder` in `order.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Admin confirms a pending order and marks non-COD payment as successful. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Order
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c401",
    "userId": "64f1a2b3c4d5e6f7a8b9c001",
    "items": [
      {
        "productId": "64f1a2b3c4d5e6f7a8b9c101",
        "productSnapshot": {
          "name": "Dolo 650",
          "brand": "Micro Labs Ltd",
          "image": "https://cdn.viqure.in/products/pr-dol-650.jpg",
          "mrp": 32,
          "sellingPrice": 29
        },
        "quantity": 2,
        "unitPrice": 29,
        "totalPrice": 58,
        "discount": 0
      }
    ],
    "pricing": {
      "subtotal": 58,
      "deliveryCharge": 49,
      "discount": 0,
      "finalAmount": 107,
      "currency": "INR"
    },
    "status": "confirmed",
    "paymentDetails": {
      "transactionId": "",
      "method": "COD",
      "status": "PENDING",
      "paymentDate": null
    },
    "shipmentDetails": {
      "status": "PENDING",
      "courier": {
        "name": "",
        "trackingNumber": "",
        "contact": ""
      },
      "deliveryAddress": {
        "fullName": "Rhea Mehta",
        "phone": "+919810000201",
        "addressLine": "221B Green Park",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110016"
      },
      "otp": "",
      "otpVerification": {
        "status": "UNVERIFIED",
        "verifiedAt": null
      },
      "estimatedDeliveryDate": "2026-06-22T15:20:00.000Z",
      "actualDeliveryDate": null,
      "lastUpdatedAt": "2026-06-17T15:20:00.000Z"
    },
    "createdAt": "2026-06-17T15:20:00.000Z",
    "updatedAt": "2026-06-17T15:35:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Order is not pending. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | Order not found. |

**Frontend Usage Note:**

> AdminDashboard order management uses this transition before shipping.

---

**PATCH /api/orders/:id/ship**

| Field | Value |
|---|---|
| Controller Function | `shipOrder` in `order.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Admin marks a confirmed order as shipped and stores courier data plus delivery OTP. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Order
```

Request Body:

```json
{
  "courier": {
    "name": "Delhivery",
    "trackingNumber": "DLV-2026-0003",
    "contact": "+911244000000"
  }
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c401",
    "userId": "64f1a2b3c4d5e6f7a8b9c001",
    "items": [
      {
        "productId": "64f1a2b3c4d5e6f7a8b9c101",
        "productSnapshot": {
          "name": "Dolo 650",
          "brand": "Micro Labs Ltd",
          "image": "https://cdn.viqure.in/products/pr-dol-650.jpg",
          "mrp": 32,
          "sellingPrice": 29
        },
        "quantity": 2,
        "unitPrice": 29,
        "totalPrice": 58,
        "discount": 0
      }
    ],
    "pricing": {
      "subtotal": 58,
      "deliveryCharge": 49,
      "discount": 0,
      "finalAmount": 107,
      "currency": "INR"
    },
    "status": "shipped",
    "paymentDetails": {
      "transactionId": "",
      "method": "COD",
      "status": "PENDING",
      "paymentDate": null
    },
    "shipmentDetails": {
      "status": "DISPATCHED",
      "courier": {
        "name": "Delhivery",
        "trackingNumber": "DLV-2026-0003",
        "contact": "+911244000000"
      },
      "deliveryAddress": {
        "fullName": "Rhea Mehta",
        "phone": "+919810000201",
        "addressLine": "221B Green Park",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110016"
      },
      "otp": "482913",
      "otpVerification": {
        "status": "UNVERIFIED",
        "verifiedAt": null
      },
      "estimatedDeliveryDate": "2026-06-22T15:20:00.000Z",
      "actualDeliveryDate": null,
      "lastUpdatedAt": "2026-06-17T15:40:00.000Z"
    },
    "createdAt": "2026-06-17T15:20:00.000Z",
    "updatedAt": "2026-06-17T15:40:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing courier name or order is not confirmed. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | Order not found. |

**Frontend Usage Note:**

> AdminDashboard shipping form calls this endpoint; store returned tracking number/OTP for admin view.

---

**PATCH /api/orders/:id/deliver**

| Field | Value |
|---|---|
| Controller Function | `deliverOrder` in `order.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Admin marks a shipped order delivered after OTP verification. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Order
```

Request Body:

```json
{
  "otp": "482913"
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c401",
    "userId": "64f1a2b3c4d5e6f7a8b9c001",
    "items": [
      {
        "productId": "64f1a2b3c4d5e6f7a8b9c101",
        "productSnapshot": {
          "name": "Dolo 650",
          "brand": "Micro Labs Ltd",
          "image": "https://cdn.viqure.in/products/pr-dol-650.jpg",
          "mrp": 32,
          "sellingPrice": 29
        },
        "quantity": 2,
        "unitPrice": 29,
        "totalPrice": 58,
        "discount": 0
      }
    ],
    "pricing": {
      "subtotal": 58,
      "deliveryCharge": 49,
      "discount": 0,
      "finalAmount": 107,
      "currency": "INR"
    },
    "status": "delivered",
    "paymentDetails": {
      "transactionId": "",
      "method": "COD",
      "status": "SUCCESS",
      "paymentDate": "2026-06-17T16:00:00.000Z"
    },
    "shipmentDetails": {
      "status": "DELIVERED",
      "courier": {
        "name": "Delhivery",
        "trackingNumber": "DLV-2026-0003",
        "contact": "+911244000000"
      },
      "deliveryAddress": {
        "fullName": "Rhea Mehta",
        "phone": "+919810000201",
        "addressLine": "221B Green Park",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110016"
      },
      "otp": "482913",
      "otpVerification": {
        "status": "VERIFIED",
        "verifiedAt": "2026-06-17T16:00:00.000Z"
      },
      "estimatedDeliveryDate": "2026-06-22T15:20:00.000Z",
      "actualDeliveryDate": "2026-06-17T16:00:00.000Z",
      "lastUpdatedAt": "2026-06-17T16:00:00.000Z"
    },
    "createdAt": "2026-06-17T15:20:00.000Z",
    "updatedAt": "2026-06-17T16:00:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing/invalid OTP or order is not shipped. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | Order not found. |

**Frontend Usage Note:**

> AdminDashboard delivery confirmation UI calls this endpoint.

### 2.7 Appointments

---

**POST /api/appointments**

⚠️  STATUS: Controller not yet refactored. Endpoint defined but may return errors until backend rewrite is complete. Use mock data on frontend until this is resolved.

| Field | Value |
|---|---|
| Controller Function | `bookAppointment` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | CUSTOMER |
| Description | Intended to book a doctor's open embedded time slot and mark that slot booked, but the slot schema has `_id: false` while controller requires `slotId`. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
  "slotId": "64f1a2b3c4d5e6f7a8b9c701",
  "reason": "Chest discomfort follow-up.",
  "consultationType": "VIDEO"
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c301",
    "patientId": "64f1a2b3c4d5e6f7a8b9c001",
    "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
    "schedule": {
      "scheduledAt": "2026-06-20T00:00:00.000Z",
      "slotTime": "10:00 - 10:30",
      "startDateTime": "2026-06-20T10:00:00.000Z",
      "endDateTime": "2026-06-20T10:30:00.000Z"
    },
    "meeting": {
      "meetingId": "",
      "meetingLink": "",
      "consultationType": "VIDEO"
    },
    "financials": {
      "consultationFee": 700,
      "taxAmount": 126,
      "totalAmount": 826,
      "refundableAmount": 826
    },
    "paymentDetails": {
      "transactionId": "",
      "status": "PENDING",
      "currency": "INR",
      "paidAt": null
    },
    "appointmentStatus": "BOOKED",
    "reason": "Chest discomfort follow-up.",
    "notes": "",
    "cancellation": null,
    "documentsShared": [],
    "doctorRemarks": {
      "text": "",
      "mode": "Text"
    },
    "feedback": {
      "rating": 0,
      "comment": ""
    },
    "reportedIssue": null,
    "createdAt": "2026-06-17T16:05:00.000Z",
    "updatedAt": "2026-06-17T16:05:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing doctorId/slotId or invalid fields. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not a customer. |
| 404 | Doctor or slot not found; current schema likely causes slot not found. |
| 409 | Slot is already booked. |

**Frontend Usage Note:**

> AppointmentBookingPage will call this after slot selection. Creating an appointment should also set `User.detailsOfHealthCareProfessional.timeSlots[].isBooked = true`, but this is blocked until slots have stable identifiers.

---

**GET /api/appointments**

| Field | Value |
|---|---|
| Controller Function | `listAppointments` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Role-aware appointment list: customers see their own, doctors see their own, admins see all. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Query Parameters:

```text
status (String, optional) - BOOKED, CONFIRMED, COMPLETED, CANCELLED, REJECTED
page (Number, optional, default: 1) - pagination
limit (Number, optional, default: 20) - results per page
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c301",
      "patientId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c001",
        "profile": {
          "firstName": "Rhea",
          "lastName": "Mehta"
        },
        "email": "rhea.mehta@example.com",
        "phone": "+919810000201"
      },
      "doctorId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c010",
        "profile": {
          "firstName": "Amit",
          "lastName": "Sharma"
        },
        "email": "dr.amit.sharma@viqure.in",
        "detailsOfHealthCareProfessional": {
          "consultationFee": 700
        }
      },
      "schedule": {
        "scheduledAt": "2026-06-20T00:00:00.000Z",
        "slotTime": "10:00 - 10:30",
        "startDateTime": "2026-06-20T10:00:00.000Z",
        "endDateTime": "2026-06-20T10:30:00.000Z"
      },
      "meeting": {
        "meetingId": "MTG-2026-0001",
        "meetingLink": "https://meet.viqure.in/MTG-2026-0001",
        "consultationType": "VIDEO"
      },
      "financials": {
        "consultationFee": 700,
        "taxAmount": 126,
        "totalAmount": 826,
        "refundableAmount": 0
      },
      "paymentDetails": {
        "transactionId": "TXN-APT-2026-0001",
        "status": "PAID",
        "currency": "INR",
        "paidAt": "2026-06-17T14:50:00.000Z"
      },
      "appointmentStatus": "CONFIRMED",
      "reason": "Chest discomfort follow-up.",
      "notes": "Patient reports mild discomfort after exercise.",
      "cancellation": null,
      "documentsShared": [],
      "doctorRemarks": {
        "text": "",
        "mode": "Text"
      },
      "feedback": {
        "rating": 0,
        "comment": ""
      },
      "reportedIssue": null,
      "createdAt": "2026-06-17T14:45:00.000Z",
      "updatedAt": "2026-06-17T14:50:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c303",
      "patientId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c001",
        "profile": {
          "firstName": "Rhea",
          "lastName": "Mehta"
        },
        "email": "rhea.mehta@example.com",
        "phone": "+919810000201"
      },
      "doctorId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c011",
        "profile": {
          "firstName": "Sonia",
          "lastName": "Verma"
        },
        "email": "dr.sonia.verma@viqure.in",
        "detailsOfHealthCareProfessional": {
          "consultationFee": 600
        }
      },
      "schedule": {
        "scheduledAt": "2026-06-10T00:00:00.000Z",
        "slotTime": "12:00 - 12:30",
        "startDateTime": "2026-06-10T12:00:00.000Z",
        "endDateTime": "2026-06-10T12:30:00.000Z"
      },
      "meeting": {
        "meetingId": "MTG-2026-0003",
        "meetingLink": "https://meet.viqure.in/MTG-2026-0003",
        "consultationType": "VIDEO"
      },
      "financials": {
        "consultationFee": 600,
        "taxAmount": 108,
        "totalAmount": 708,
        "refundableAmount": 0
      },
      "paymentDetails": {
        "transactionId": "TXN-APT-2026-0003",
        "status": "PAID",
        "currency": "INR",
        "paidAt": "2026-06-10T10:00:00.000Z"
      },
      "appointmentStatus": "COMPLETED",
      "reason": "Child nutrition consultation.",
      "notes": "Diet plan discussed.",
      "cancellation": null,
      "documentsShared": [],
      "doctorRemarks": {
        "text": "Increase hydration and continue multivitamin for 30 days.",
        "mode": "Text"
      },
      "feedback": {
        "rating": 5,
        "comment": "Very patient and clear."
      },
      "reportedIssue": null,
      "createdAt": "2026-06-10T09:00:00.000Z",
      "updatedAt": "2026-06-10T12:45:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |

**Frontend Usage Note:**

> UserProfilePage, DoctorDashboard, and AdminDashboard use this endpoint for appointment history/status views.

---

**GET /api/appointments/:id**

| Field | Value |
|---|---|
| Controller Function | `getAppointmentById` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | Appointment patient, appointment doctor, or ADMIN |
| Description | Returns one appointment if the requester is allowed to view it. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Appointment
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c301",
    "patientId": {
      "_id": "64f1a2b3c4d5e6f7a8b9c001",
      "profile": {
        "firstName": "Rhea",
        "lastName": "Mehta"
      },
      "email": "rhea.mehta@example.com",
      "phone": "+919810000201"
    },
    "doctorId": {
      "_id": "64f1a2b3c4d5e6f7a8b9c010",
      "profile": {
        "firstName": "Amit",
        "lastName": "Sharma"
      },
      "email": "dr.amit.sharma@viqure.in",
      "detailsOfHealthCareProfessional": {
        "consultationFee": 700
      }
    },
    "schedule": {
      "scheduledAt": "2026-06-20T00:00:00.000Z",
      "slotTime": "10:00 - 10:30",
      "startDateTime": "2026-06-20T10:00:00.000Z",
      "endDateTime": "2026-06-20T10:30:00.000Z"
    },
    "meeting": {
      "meetingId": "MTG-2026-0001",
      "meetingLink": "https://meet.viqure.in/MTG-2026-0001",
      "consultationType": "VIDEO"
    },
    "financials": {
      "consultationFee": 700,
      "taxAmount": 126,
      "totalAmount": 826,
      "refundableAmount": 0
    },
    "paymentDetails": {
      "transactionId": "TXN-APT-2026-0001",
      "status": "PAID",
      "currency": "INR",
      "paidAt": "2026-06-17T14:50:00.000Z"
    },
    "appointmentStatus": "CONFIRMED",
    "reason": "Chest discomfort follow-up.",
    "notes": "Patient reports mild discomfort after exercise.",
    "cancellation": null,
    "documentsShared": [],
    "doctorRemarks": {
      "text": "",
      "mode": "Text"
    },
    "feedback": {
      "rating": 0,
      "comment": ""
    },
    "reportedIssue": null,
    "createdAt": "2026-06-17T14:45:00.000Z",
    "updatedAt": "2026-06-17T14:50:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid appointment id. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not the patient, doctor, or admin. |
| 404 | Appointment not found. |

**Frontend Usage Note:**

> Appointment detail drawer/page calls this endpoint.

---

**PATCH /api/appointments/:id/confirm**

| Field | Value |
|---|---|
| Controller Function | `confirmAppointment` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | DOCTOR |
| Description | Doctor confirms their own booked appointment. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Appointment
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c301",
    "patientId": "64f1a2b3c4d5e6f7a8b9c001",
    "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
    "schedule": {
      "scheduledAt": "2026-06-20T00:00:00.000Z",
      "slotTime": "10:00 - 10:30",
      "startDateTime": "2026-06-20T10:00:00.000Z",
      "endDateTime": "2026-06-20T10:30:00.000Z"
    },
    "meeting": {
      "meetingId": "",
      "meetingLink": "",
      "consultationType": "VIDEO"
    },
    "financials": {
      "consultationFee": 700,
      "taxAmount": 126,
      "totalAmount": 826,
      "refundableAmount": 0
    },
    "paymentDetails": {
      "transactionId": "TXN-APT-2026-0001",
      "status": "PAID",
      "currency": "INR",
      "paidAt": "2026-06-17T14:50:00.000Z"
    },
    "appointmentStatus": "CONFIRMED",
    "reason": "Chest discomfort follow-up.",
    "notes": "",
    "cancellation": null,
    "documentsShared": [],
    "doctorRemarks": {
      "text": "",
      "mode": "Text"
    },
    "feedback": {
      "rating": 0,
      "comment": ""
    },
    "reportedIssue": null,
    "createdAt": "2026-06-17T14:45:00.000Z",
    "updatedAt": "2026-06-17T16:10:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Appointment is not in `BOOKED` status. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not doctor or not assigned doctor. |
| 404 | Appointment not found. |

**Frontend Usage Note:**

> DoctorDashboard appointment queue uses this status action.

---

**PATCH /api/appointments/:id/reject**

| Field | Value |
|---|---|
| Controller Function | `rejectAppointment` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | DOCTOR |
| Description | Doctor rejects their own booked appointment and frees the associated slot by date/time matching. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Appointment
```

Request Body:

```json
{
  "reason": "Incomplete medical history form submitted."
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c301",
    "patientId": "64f1a2b3c4d5e6f7a8b9c001",
    "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
    "schedule": {
      "scheduledAt": "2026-06-20T00:00:00.000Z",
      "slotTime": "10:00 - 10:30",
      "startDateTime": "2026-06-20T10:00:00.000Z",
      "endDateTime": "2026-06-20T10:30:00.000Z"
    },
    "meeting": {
      "meetingId": "",
      "meetingLink": "",
      "consultationType": "VIDEO"
    },
    "financials": {
      "consultationFee": 700,
      "taxAmount": 126,
      "totalAmount": 826,
      "refundableAmount": 826
    },
    "paymentDetails": {
      "transactionId": "",
      "status": "PENDING",
      "currency": "INR",
      "paidAt": null
    },
    "appointmentStatus": "REJECTED",
    "reason": "Chest discomfort follow-up.",
    "notes": "",
    "cancellation": null,
    "documentsShared": [],
    "doctorRemarks": {
      "text": "Incomplete medical history form submitted.",
      "mode": "Text"
    },
    "feedback": {
      "rating": 0,
      "comment": ""
    },
    "reportedIssue": null,
    "createdAt": "2026-06-17T14:45:00.000Z",
    "updatedAt": "2026-06-17T16:15:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Appointment is not in `BOOKED` status. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not doctor or not assigned doctor. |
| 404 | Appointment not found. |

**Frontend Usage Note:**

> DoctorDashboard reject action calls this; refresh doctor slots because the embedded time slot may be reopened.

---

**PATCH /api/appointments/:id/cancel**

| Field | Value |
|---|---|
| Controller Function | `cancelAppointment` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | Appointment patient, appointment doctor, or ADMIN |
| Description | Cancels a booked/confirmed appointment and stores cancellation metadata. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Appointment
```

Request Body:

```json
{
  "cancelReason": "Patient is unavailable at this time."
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c301",
    "patientId": "64f1a2b3c4d5e6f7a8b9c001",
    "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
    "schedule": {
      "scheduledAt": "2026-06-20T00:00:00.000Z",
      "slotTime": "10:00 - 10:30",
      "startDateTime": "2026-06-20T10:00:00.000Z",
      "endDateTime": "2026-06-20T10:30:00.000Z"
    },
    "meeting": {
      "meetingId": "MTG-2026-0001",
      "meetingLink": "https://meet.viqure.in/MTG-2026-0001",
      "consultationType": "VIDEO"
    },
    "financials": {
      "consultationFee": 700,
      "taxAmount": 126,
      "totalAmount": 826,
      "refundableAmount": 0
    },
    "paymentDetails": {
      "transactionId": "TXN-APT-2026-0001",
      "status": "REFUNDED",
      "currency": "INR",
      "paidAt": "2026-06-17T14:50:00.000Z"
    },
    "appointmentStatus": "CANCELLED",
    "reason": "Chest discomfort follow-up.",
    "notes": "",
    "cancellation": {
      "cancelledBy": "64f1a2b3c4d5e6f7a8b9c001",
      "cancelReason": "Patient is unavailable at this time.",
      "cancelledAt": "2026-06-17T16:20:00.000Z"
    },
    "documentsShared": [],
    "doctorRemarks": {
      "text": "",
      "mode": "Text"
    },
    "feedback": {
      "rating": 0,
      "comment": ""
    },
    "reportedIssue": null,
    "createdAt": "2026-06-17T14:45:00.000Z",
    "updatedAt": "2026-06-17T16:20:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Appointment is not `BOOKED` or `CONFIRMED`. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not patient, doctor, or admin. |
| 404 | Appointment not found. |

**Frontend Usage Note:**

> Patient appointment history and DoctorDashboard cancel actions call this; refresh slots after cancellation.

---

**PATCH /api/appointments/:id/complete**

| Field | Value |
|---|---|
| Controller Function | `completeAppointment` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | DOCTOR |
| Description | Doctor marks a confirmed appointment completed and can add remarks/notes. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Appointment
```

Request Body:

```json
{
  "doctorRemarks": {
    "text": "Continue medication for 14 days and repeat lipid profile after 6 weeks.",
    "mode": "Text"
  },
  "notes": "Patient advised low-salt diet and daily walking."
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c301",
    "patientId": "64f1a2b3c4d5e6f7a8b9c001",
    "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
    "schedule": {
      "scheduledAt": "2026-06-20T00:00:00.000Z",
      "slotTime": "10:00 - 10:30",
      "startDateTime": "2026-06-20T10:00:00.000Z",
      "endDateTime": "2026-06-20T10:30:00.000Z"
    },
    "meeting": {
      "meetingId": "MTG-2026-0001",
      "meetingLink": "https://meet.viqure.in/MTG-2026-0001",
      "consultationType": "VIDEO"
    },
    "financials": {
      "consultationFee": 700,
      "taxAmount": 126,
      "totalAmount": 826,
      "refundableAmount": 0
    },
    "paymentDetails": {
      "transactionId": "TXN-APT-2026-0001",
      "status": "PAID",
      "currency": "INR",
      "paidAt": "2026-06-17T14:50:00.000Z"
    },
    "appointmentStatus": "COMPLETED",
    "reason": "Chest discomfort follow-up.",
    "notes": "Patient advised low-salt diet and daily walking.",
    "cancellation": null,
    "documentsShared": [],
    "doctorRemarks": {
      "text": "Continue medication for 14 days and repeat lipid profile after 6 weeks.",
      "mode": "Text"
    },
    "feedback": {
      "rating": 0,
      "comment": ""
    },
    "reportedIssue": null,
    "createdAt": "2026-06-17T14:45:00.000Z",
    "updatedAt": "2026-06-17T16:25:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Appointment is not `CONFIRMED`. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not the assigned doctor. |
| 404 | Appointment not found. |

**Frontend Usage Note:**

> DoctorDashboard completion form calls this and updates appointment status badge to completed.

---

**PATCH /api/appointments/:id/payment**

| Field | Value |
|---|---|
| Controller Function | `recordPayment` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | Appointment patient CUSTOMER |
| Description | Records appointment payment success for the patient. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Appointment
```

Request Body:

```json
{
  "transactionId": "TXN-APT-2026-0001"
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c301",
    "patientId": "64f1a2b3c4d5e6f7a8b9c001",
    "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
    "schedule": {
      "scheduledAt": "2026-06-20T00:00:00.000Z",
      "slotTime": "10:00 - 10:30",
      "startDateTime": "2026-06-20T10:00:00.000Z",
      "endDateTime": "2026-06-20T10:30:00.000Z"
    },
    "meeting": {
      "meetingId": "",
      "meetingLink": "",
      "consultationType": "VIDEO"
    },
    "financials": {
      "consultationFee": 700,
      "taxAmount": 126,
      "totalAmount": 826,
      "refundableAmount": 0
    },
    "paymentDetails": {
      "transactionId": "TXN-APT-2026-0001",
      "status": "PAID",
      "currency": "INR",
      "paidAt": "2026-06-17T16:30:00.000Z"
    },
    "appointmentStatus": "BOOKED",
    "reason": "Chest discomfort follow-up.",
    "notes": "",
    "cancellation": null,
    "documentsShared": [],
    "doctorRemarks": {
      "text": "",
      "mode": "Text"
    },
    "feedback": {
      "rating": 0,
      "comment": ""
    },
    "reportedIssue": null,
    "createdAt": "2026-06-17T14:45:00.000Z",
    "updatedAt": "2026-06-17T16:30:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing transactionId. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not the appointment patient. |
| 404 | Appointment not found. |

**Frontend Usage Note:**

> AppointmentBookingPage payment success handler calls this after payment gateway callback.

---

**POST /api/appointments/:id/documents**

| Field | Value |
|---|---|
| Controller Function | `shareDocument` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | Appointment patient or doctor |
| Description | Adds an embedded shared document to an appointment. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Appointment
```

Request Body:

```json
{
  "documentURL": "https://cdn.viqure.in/appointments/appt-301/ecg-report.pdf",
  "documentType": "ECG_REPORT"
}
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "uploadedBy": "64f1a2b3c4d5e6f7a8b9c001",
      "documentURL": "https://cdn.viqure.in/appointments/appt-301/ecg-report.pdf",
      "documentType": "ECG_REPORT",
      "uploadedAt": "2026-06-17T16:35:00.000Z"
    },
    {
      "uploadedBy": "64f1a2b3c4d5e6f7a8b9c010",
      "documentURL": "https://cdn.viqure.in/appointments/appt-301/prescription.pdf",
      "documentType": "PRESCRIPTION",
      "uploadedAt": "2026-06-17T16:45:00.000Z"
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing documentURL. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not patient or doctor for appointment. |
| 404 | Appointment not found. |

**Frontend Usage Note:**

> Appointment detail page document upload uses this endpoint. Documents are embedded in `Appointment.documentsShared[]`.

---

**POST /api/appointments/:id/feedback**

| Field | Value |
|---|---|
| Controller Function | `leaveFeedback` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | CUSTOMER |
| Description | Patient leaves feedback on a completed appointment and updates doctor average rating. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Appointment
```

Request Body:

```json
{
  "rating": 5,
  "comment": "Dr. Amit explained the treatment plan clearly and answered every question."
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c301",
    "patientId": "64f1a2b3c4d5e6f7a8b9c001",
    "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
    "schedule": {
      "scheduledAt": "2026-06-20T00:00:00.000Z",
      "slotTime": "10:00 - 10:30",
      "startDateTime": "2026-06-20T10:00:00.000Z",
      "endDateTime": "2026-06-20T10:30:00.000Z"
    },
    "meeting": {
      "meetingId": "MTG-2026-0001",
      "meetingLink": "https://meet.viqure.in/MTG-2026-0001",
      "consultationType": "VIDEO"
    },
    "financials": {
      "consultationFee": 700,
      "taxAmount": 126,
      "totalAmount": 826,
      "refundableAmount": 0
    },
    "paymentDetails": {
      "transactionId": "TXN-APT-2026-0001",
      "status": "PAID",
      "currency": "INR",
      "paidAt": "2026-06-17T14:50:00.000Z"
    },
    "appointmentStatus": "COMPLETED",
    "reason": "Chest discomfort follow-up.",
    "notes": "Patient advised low-salt diet and daily walking.",
    "cancellation": null,
    "documentsShared": [],
    "doctorRemarks": {
      "text": "Continue medication for 14 days and repeat lipid profile after 6 weeks.",
      "mode": "Text"
    },
    "feedback": {
      "rating": 5,
      "comment": "Dr. Amit explained the treatment plan clearly and answered every question."
    },
    "reportedIssue": null,
    "createdAt": "2026-06-17T14:45:00.000Z",
    "updatedAt": "2026-06-17T16:50:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing rating or appointment is not completed. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not the patient. |
| 404 | Appointment not found. |

**Frontend Usage Note:**

> UserProfilePage completed appointment feedback form calls this; doctor listing rating may change after successful response.

---

**POST /api/appointments/:id/report-issue**

| Field | Value |
|---|---|
| Controller Function | `reportIssue` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | Appointment patient or doctor |
| Description | Adds an embedded reported issue to an appointment. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Appointment
```

Request Body:

```json
{
  "issue": "Video link did not open for the first five minutes."
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "issue": "Video link did not open for the first five minutes.",
    "reportedAt": "2026-06-17T16:55:00.000Z",
    "status": "OPEN",
    "resolution": ""
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing issue text. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not patient or doctor for appointment. |
| 404 | Appointment not found. |

**Frontend Usage Note:**

> Appointment detail issue report form calls this; AdminDashboard issues list reads these embedded reported issues.

---

**PATCH /api/appointments/:id/resolve-issue**

| Field | Value |
|---|---|
| Controller Function | `resolveIssue` in `appointment.controller.js` |
| Auth Required | Yes |
| Role Required | Intended ADMIN; current route only requires any authenticated user |
| Description | Marks an appointment reported issue resolved and stores a resolution note. |

Implementation warning: route lacks `restrictTo('ADMIN')` and controller does not check role, despite the comment saying admin only.

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Appointment
```

Request Body:

```json
{
  "resolution": "Support team shared a new meeting link and consultation was completed."
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "issue": "Video link did not open for the first five minutes.",
    "reportedAt": "2026-06-17T16:55:00.000Z",
    "status": "RESOLVED",
    "resolution": "Support team shared a new meeting link and consultation was completed."
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | No issue exists on appointment. |
| 401 | Missing, invalid, or expired token. |
| 404 | Appointment not found. |

**Frontend Usage Note:**

> AdminDashboard issue resolution UI should call this, but treat backend role enforcement as pending.

### 2.8 Reviews

---

**GET /api/reviews**

| Field | Value |
|---|---|
| Controller Function | `listReviews` in `review.controller.js` |
| Auth Required | No |
| Role Required | No |
| Description | Lists reviews for a doctor or product target and returns aggregate rating summary. |

**Request**

Query Parameters:

```text
targetType (String, required) - DOCTOR or PRODUCT
targetId (String, required) - User._id for doctor or Product._id for product
page (Number, optional, default: 1) - pagination
limit (Number, optional, default: 20) - results per page
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c501",
      "reviewerId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c001",
        "profile": {
          "firstName": "Rhea",
          "lastName": "Mehta"
        },
        "avatar": "https://cdn.viqure.in/avatars/rhea.jpg"
      },
      "targetType": "DOCTOR",
      "targetId": "64f1a2b3c4d5e6f7a8b9c010",
      "rating": 5,
      "reviewText": "Dr. Amit explained my condition clearly and the prescription helped.",
      "isVerified": true,
      "likes": 14,
      "createdAt": "2026-06-11T10:00:00.000Z",
      "updatedAt": "2026-06-11T10:00:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c502",
      "reviewerId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c002",
        "profile": {
          "firstName": "Karan",
          "lastName": "Malhotra"
        },
        "avatar": null
      },
      "targetType": "DOCTOR",
      "targetId": "64f1a2b3c4d5e6f7a8b9c010",
      "rating": 4,
      "reviewText": "Good consultation and practical advice.",
      "isVerified": true,
      "likes": 6,
      "createdAt": "2026-06-12T10:00:00.000Z",
      "updatedAt": "2026-06-12T10:00:00.000Z"
    }
  ],
  "summary": {
    "averageRating": 4.5,
    "totalReviews": 2
  },
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing targetType or targetId. |

**Frontend Usage Note:**

> ProductDetailPage and doctor profile page call this endpoint; use `targetType` to choose correct target collection.

---

**POST /api/reviews**

| Field | Value |
|---|---|
| Controller Function | `createReview` in `review.controller.js` |
| Auth Required | Yes |
| Role Required | CUSTOMER |
| Description | Creates a review for a doctor or product and marks it verified if the customer completed an appointment or delivered order. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "targetType": "PRODUCT",
  "targetId": "64f1a2b3c4d5e6f7a8b9c101",
  "rating": 5,
  "reviewText": "Dolo 650 worked quickly for fever and delivery was fast."
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c503",
    "reviewerId": "64f1a2b3c4d5e6f7a8b9c001",
    "targetType": "PRODUCT",
    "targetId": "64f1a2b3c4d5e6f7a8b9c101",
    "rating": 5,
    "reviewText": "Dolo 650 worked quickly for fever and delivery was fast.",
    "isVerified": true,
    "likes": 0,
    "createdAt": "2026-06-17T17:00:00.000Z",
    "updatedAt": "2026-06-17T17:00:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing targetType, targetId, rating, or invalid targetType. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not customer. |
| 404 | Target doctor or product not found. |
| 409 | Customer already reviewed this target. |

**Frontend Usage Note:**

> ProductDetailPage and completed appointment review forms call this endpoint.

---

**PATCH /api/reviews/:id**

| Field | Value |
|---|---|
| Controller Function | `updateReview` in `review.controller.js` |
| Auth Required | Yes |
| Role Required | Review owner CUSTOMER |
| Description | Lets the original reviewer edit rating or review text. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Review
```

Request Body:

```json
{
  "rating": 4,
  "reviewText": "Helpful consultation and clear prescription."
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c501",
    "reviewerId": "64f1a2b3c4d5e6f7a8b9c001",
    "targetType": "DOCTOR",
    "targetId": "64f1a2b3c4d5e6f7a8b9c010",
    "rating": 4,
    "reviewText": "Helpful consultation and clear prescription.",
    "isVerified": true,
    "likes": 14,
    "createdAt": "2026-06-11T10:00:00.000Z",
    "updatedAt": "2026-06-17T17:05:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid review id or rating validation error. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not review owner. |
| 404 | Review not found. |

**Frontend Usage Note:**

> Review edit UI calls this endpoint for the logged-in customer’s own reviews.

---

**DELETE /api/reviews/:id**

| Field | Value |
|---|---|
| Controller Function | `deleteReview` in `review.controller.js` |
| Auth Required | Yes |
| Role Required | Review owner CUSTOMER or ADMIN |
| Description | Deletes a review if requester is owner or admin. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Review
```

**Response - Success**

```json
{
  "success": true,
  "message": "Review deleted"
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid review id. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not owner and not admin. |
| 404 | Review not found. |

**Frontend Usage Note:**

> Customer profile review management and AdminDashboard moderation call this endpoint.

---

**PATCH /api/reviews/:id/like**

| Field | Value |
|---|---|
| Controller Function | `likeReview` in `review.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Increments the review `likes` counter. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the Review
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c501",
    "reviewerId": "64f1a2b3c4d5e6f7a8b9c001",
    "targetType": "DOCTOR",
    "targetId": "64f1a2b3c4d5e6f7a8b9c010",
    "rating": 5,
    "reviewText": "Dr. Amit explained my condition clearly and the prescription helped.",
    "isVerified": true,
    "likes": 15,
    "createdAt": "2026-06-11T10:00:00.000Z",
    "updatedAt": "2026-06-17T17:10:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid review id. |
| 401 | Missing, invalid, or expired token. |
| 404 | Review not found. |

**Frontend Usage Note:**

> Review card like button calls this endpoint.

### 2.9 Medical Records

---

**POST /api/medical-records**

| Field | Value |
|---|---|
| Controller Function | `createRecord` in `medicalRecord.controller.js` |
| Auth Required | Yes |
| Role Required | CUSTOMER, DOCTOR, or ADMIN |
| Description | Creates a medical record; customers can upload for themselves, doctors can upload for patients, and appointment data can resolve patient/doctor ids. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Request Body:

```json
{
  "patientId": "64f1a2b3c4d5e6f7a8b9c001",
  "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
  "appointmentId": "64f1a2b3c4d5e6f7a8b9c301",
  "documentType": "PRESCRIPTION",
  "fileUrl": "https://cdn.viqure.in/records/RX-2026-0001.pdf",
  "notes": "Amlodipine 5mg prescription. Valid for 30 days.",
  "isConfidential": false
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c601",
    "patientId": "64f1a2b3c4d5e6f7a8b9c001",
    "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
    "appointmentId": "64f1a2b3c4d5e6f7a8b9c301",
    "documentType": "PRESCRIPTION",
    "fileUrl": "https://cdn.viqure.in/records/RX-2026-0001.pdf",
    "uploadedAt": "2026-06-17T17:15:00.000Z",
    "notes": "Amlodipine 5mg prescription. Valid for 30 days.",
    "isConfidential": false,
    "createdAt": "2026-06-17T17:15:00.000Z",
    "updatedAt": "2026-06-17T17:15:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing documentType/fileUrl, patientId cannot resolve, or doctor upload lacks patientId. |
| 401 | Missing, invalid, or expired token. |
| 404 | Referenced appointment not found. |

**Frontend Usage Note:**

> UserProfilePage medical records and DoctorDashboard upload flow call this endpoint.

---

**GET /api/medical-records**

| Field | Value |
|---|---|
| Controller Function | `listRecords` in `medicalRecord.controller.js` |
| Auth Required | Yes |
| Role Required | Any authenticated |
| Description | Role-aware list of medical records with optional patient and document type filters. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Query Parameters:

```text
patientId (String, optional) - admin/doctor filter
documentType (String, optional) - PRESCRIPTION, LAB_REPORT, OTHER
page (Number, optional, default: 1) - pagination
limit (Number, optional, default: 20) - results per page
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c601",
      "patientId": "64f1a2b3c4d5e6f7a8b9c001",
      "doctorId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c010",
        "profile": {
          "firstName": "Amit",
          "lastName": "Sharma"
        },
        "email": "dr.amit.sharma@viqure.in"
      },
      "appointmentId": "64f1a2b3c4d5e6f7a8b9c301",
      "documentType": "PRESCRIPTION",
      "fileUrl": "https://cdn.viqure.in/records/RX-2026-0001.pdf",
      "uploadedAt": "2026-06-17T17:15:00.000Z",
      "notes": "Amlodipine 5mg prescription. Valid for 30 days.",
      "isConfidential": false,
      "createdAt": "2026-06-17T17:15:00.000Z",
      "updatedAt": "2026-06-17T17:15:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c602",
      "patientId": "64f1a2b3c4d5e6f7a8b9c001",
      "doctorId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c010",
        "profile": {
          "firstName": "Amit",
          "lastName": "Sharma"
        },
        "email": "dr.amit.sharma@viqure.in"
      },
      "appointmentId": "64f1a2b3c4d5e6f7a8b9c301",
      "documentType": "LAB_REPORT",
      "fileUrl": "https://cdn.viqure.in/records/LR-2026-0001.pdf",
      "uploadedAt": "2026-06-17T17:20:00.000Z",
      "notes": "Lipid profile report uploaded for follow-up.",
      "isConfidential": true,
      "createdAt": "2026-06-17T17:20:00.000Z",
      "updatedAt": "2026-06-17T17:20:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |

**Frontend Usage Note:**

> UserProfilePage medical record timeline and DoctorDashboard patient records call this endpoint.

---

**GET /api/medical-records/:id**

| Field | Value |
|---|---|
| Controller Function | `getRecordById` in `medicalRecord.controller.js` |
| Auth Required | Yes |
| Role Required | Record patient, record doctor, or ADMIN |
| Description | Returns one medical record if the requester has access. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the MedicalRecord
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c601",
    "patientId": "64f1a2b3c4d5e6f7a8b9c001",
    "doctorId": {
      "_id": "64f1a2b3c4d5e6f7a8b9c010",
      "profile": {
        "firstName": "Amit",
        "lastName": "Sharma"
      },
      "email": "dr.amit.sharma@viqure.in"
    },
    "appointmentId": "64f1a2b3c4d5e6f7a8b9c301",
    "documentType": "PRESCRIPTION",
    "fileUrl": "https://cdn.viqure.in/records/RX-2026-0001.pdf",
    "uploadedAt": "2026-06-17T17:15:00.000Z",
    "notes": "Amlodipine 5mg prescription. Valid for 30 days.",
    "isConfidential": false,
    "createdAt": "2026-06-17T17:15:00.000Z",
    "updatedAt": "2026-06-17T17:15:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid record id. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not patient, doctor, or admin. |
| 404 | Medical record not found. |

**Frontend Usage Note:**

> Medical record detail modal calls this endpoint.

---

**PATCH /api/medical-records/:id**

| Field | Value |
|---|---|
| Controller Function | `updateRecord` in `medicalRecord.controller.js` |
| Auth Required | Yes |
| Role Required | Uploading doctor or ADMIN |
| Description | Updates notes, confidentiality, or document type on a medical record. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the MedicalRecord
```

Request Body:

```json
{
  "notes": "Updated: repeat lipid profile after 6 weeks.",
  "isConfidential": true,
  "documentType": "PRESCRIPTION"
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c601",
    "patientId": "64f1a2b3c4d5e6f7a8b9c001",
    "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
    "appointmentId": "64f1a2b3c4d5e6f7a8b9c301",
    "documentType": "PRESCRIPTION",
    "fileUrl": "https://cdn.viqure.in/records/RX-2026-0001.pdf",
    "uploadedAt": "2026-06-17T17:15:00.000Z",
    "notes": "Updated: repeat lipid profile after 6 weeks.",
    "isConfidential": true,
    "createdAt": "2026-06-17T17:15:00.000Z",
    "updatedAt": "2026-06-17T17:25:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid id or enum validation error. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not uploading doctor or admin. |
| 404 | Medical record not found. |

**Frontend Usage Note:**

> DoctorDashboard or AdminDashboard medical record edit UI calls this endpoint.

---

**DELETE /api/medical-records/:id**

| Field | Value |
|---|---|
| Controller Function | `deleteRecord` in `medicalRecord.controller.js` |
| Auth Required | Yes |
| Role Required | Record patient, uploading doctor, or ADMIN |
| Description | Deletes a medical record if requester has access. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the MedicalRecord
```

**Response - Success**

```json
{
  "success": true,
  "message": "Medical record deleted"
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid record id. |
| 401 | Missing, invalid, or expired token. |
| 403 | User is not patient, doctor, or admin. |
| 404 | Medical record not found. |

**Frontend Usage Note:**

> UserProfilePage and DoctorDashboard delete controls call this endpoint.

### 2.10 Admin

---

**GET /api/admin/doctors/pending**

| Field | Value |
|---|---|
| Controller Function | `listPendingDoctors` in `admin.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Lists doctors awaiting approval. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c012",
      "email": "dr.neha.rao@viqure.in",
      "phone": "+919810000112",
      "role": "DOCTOR",
      "gender": "FEMALE",
      "dob": "1990-05-11T00:00:00.000Z",
      "profile": {
        "firstName": "Neha",
        "lastName": "Rao"
      },
      "addresses": [],
      "cart": [],
      "detailsOfHealthCareProfessional": {
        "medicalLicense": "MMC-990112",
        "approvalStatus": "PENDING",
        "consultationFee": 650,
        "qualifications": ["MBBS", "MD Dermatology"],
        "yearsOfExperience": 7,
        "bio": "Dermatologist focused on acne and hair health.",
        "averageRating": 0,
        "timeSlots": [],
        "isAvailable": false,
        "stats": {
          "rating": 0,
          "totalRatings": 0,
          "totalAppointments": 0
        }
      },
      "isVerified": false,
      "isActive": true,
      "lastLoginAt": null,
      "avatar": null,
      "fcmToken": null,
      "createdAt": "2026-06-17T12:00:00.000Z",
      "updatedAt": "2026-06-17T12:00:00.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c013",
      "email": "dr.rahul.iyer@viqure.in",
      "phone": "+919810000113",
      "role": "DOCTOR",
      "gender": "MALE",
      "dob": "1987-02-18T00:00:00.000Z",
      "profile": {
        "firstName": "Rahul",
        "lastName": "Iyer"
      },
      "addresses": [],
      "cart": [],
      "detailsOfHealthCareProfessional": {
        "medicalLicense": "KMC-883210",
        "approvalStatus": "PENDING",
        "consultationFee": 600,
        "qualifications": ["MBBS", "MS ENT"],
        "yearsOfExperience": 10,
        "bio": "ENT specialist for sinus and hearing concerns.",
        "averageRating": 0,
        "timeSlots": [],
        "isAvailable": false,
        "stats": {
          "rating": 0,
          "totalRatings": 0,
          "totalAppointments": 0
        }
      },
      "isVerified": false,
      "isActive": true,
      "lastLoginAt": null,
      "avatar": null,
      "fcmToken": null,
      "createdAt": "2026-06-17T12:10:00.000Z",
      "updatedAt": "2026-06-17T12:10:00.000Z"
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |

**Frontend Usage Note:**

> AdminDashboard doctor approvals queue calls this endpoint.

---

**PATCH /api/admin/doctors/:id/approve**

| Field | Value |
|---|---|
| Controller Function | `approveDoctor` in `admin.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Approves a doctor, verifies them, activates account, and sets availability true. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the doctor User
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c012",
    "email": "dr.neha.rao@viqure.in",
    "phone": "+919810000112",
    "role": "DOCTOR",
    "gender": "FEMALE",
    "dob": "1990-05-11T00:00:00.000Z",
    "profile": {
      "firstName": "Neha",
      "lastName": "Rao"
    },
    "addresses": [],
    "cart": [],
    "detailsOfHealthCareProfessional": {
      "medicalLicense": "MMC-990112",
      "approvalStatus": "APPROVED",
      "consultationFee": 650,
      "qualifications": ["MBBS", "MD Dermatology"],
      "yearsOfExperience": 7,
      "bio": "Dermatologist focused on acne and hair health.",
      "averageRating": 0,
      "timeSlots": [],
      "isAvailable": true,
      "stats": {
        "rating": 0,
        "totalRatings": 0,
        "totalAppointments": 0
      }
    },
    "isVerified": true,
    "isActive": true,
    "lastLoginAt": null,
    "avatar": null,
    "fcmToken": null,
    "createdAt": "2026-06-17T12:00:00.000Z",
    "updatedAt": "2026-06-17T17:30:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Doctor already approved or invalid id. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | Doctor not found. |

**Frontend Usage Note:**

> AdminDashboard approval action calls this; approved doctors can log in afterward.

---

**PATCH /api/admin/doctors/:id/reject**

| Field | Value |
|---|---|
| Controller Function | `rejectDoctor` in `admin.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Rejects a doctor, marks unavailable, and deactivates account. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the doctor User
```

Request Body:

```json
{
  "reason": "Medical license could not be verified."
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c012",
    "email": "dr.neha.rao@viqure.in",
    "phone": "+919810000112",
    "role": "DOCTOR",
    "gender": "FEMALE",
    "dob": "1990-05-11T00:00:00.000Z",
    "profile": {
      "firstName": "Neha",
      "lastName": "Rao"
    },
    "addresses": [],
    "cart": [],
    "detailsOfHealthCareProfessional": {
      "medicalLicense": "MMC-990112",
      "approvalStatus": "REJECTED",
      "consultationFee": 650,
      "qualifications": ["MBBS", "MD Dermatology"],
      "yearsOfExperience": 7,
      "bio": "Dermatologist focused on acne and hair health.",
      "averageRating": 0,
      "timeSlots": [],
      "isAvailable": false,
      "stats": {
        "rating": 0,
        "totalRatings": 0,
        "totalAppointments": 0
      }
    },
    "isVerified": false,
    "isActive": false,
    "lastLoginAt": null,
    "avatar": null,
    "fcmToken": null,
    "createdAt": "2026-06-17T12:00:00.000Z",
    "updatedAt": "2026-06-17T17:35:00.000Z"
  },
  "reason": "Medical license could not be verified."
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Invalid id. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | Doctor not found. |

**Frontend Usage Note:**

> AdminDashboard rejection action calls this and should display/store the reason client-side if needed, since schema has no rejection reason field.

---

**GET /api/admin/users**

| Field | Value |
|---|---|
| Controller Function | `listUsers` in `admin.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Lists users with optional role, active status, email search, and pagination. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Query Parameters:

```text
role (String, optional) - CUSTOMER, DOCTOR, ADMIN
isActive (String, optional) - "true" or "false"
q (String, optional) - email search
page (Number, optional, default: 1) - pagination
limit (Number, optional, default: 20) - results per page
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c001",
      "email": "rhea.mehta@example.com",
      "phone": "+919810000201",
      "role": "CUSTOMER",
      "gender": "FEMALE",
      "dob": "1994-08-19T00:00:00.000Z",
      "profile": {
        "firstName": "Rhea",
        "lastName": "Mehta"
      },
      "addresses": [],
      "cart": [],
      "detailsOfHealthCareProfessional": null,
      "isVerified": false,
      "isActive": true,
      "lastLoginAt": "2026-06-17T14:32:20.000Z",
      "avatar": null,
      "fcmToken": null,
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-17T14:32:20.000Z"
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c010",
      "email": "dr.amit.sharma@viqure.in",
      "phone": "+919810000110",
      "role": "DOCTOR",
      "gender": "MALE",
      "dob": "1984-04-12T00:00:00.000Z",
      "profile": {
        "firstName": "Amit",
        "lastName": "Sharma"
      },
      "addresses": [],
      "cart": [],
      "detailsOfHealthCareProfessional": {
        "medicalLicense": "DMC-778812",
        "approvalStatus": "APPROVED",
        "consultationFee": 700,
        "qualifications": ["MBBS", "MD Cardiology"],
        "yearsOfExperience": 12,
        "bio": "Cardiologist focused on preventive cardiac care.",
        "averageRating": 4.7,
        "timeSlots": [],
        "isAvailable": true,
        "stats": {
          "rating": 4.7,
          "totalRatings": 128,
          "totalAppointments": 460
        }
      },
      "isVerified": true,
      "isActive": true,
      "lastLoginAt": "2026-06-16T09:15:00.000Z",
      "avatar": "https://cdn.viqure.in/doctors/amit-sharma.jpg",
      "fcmToken": null,
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-16T09:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 26,
    "page": 1,
    "limit": 20,
    "pages": 2
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |

**Frontend Usage Note:**

> AdminDashboard user management table calls this endpoint.

---

**PATCH /api/admin/users/:id/status**

| Field | Value |
|---|---|
| Controller Function | `setUserStatus` in `admin.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Activates or deactivates a user account. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Path Parameters:

```text
:id - MongoDB ObjectId of the User
```

Request Body:

```json
{
  "isActive": false
}
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c001",
    "email": "rhea.mehta@example.com",
    "phone": "+919810000201",
    "role": "CUSTOMER",
    "gender": "FEMALE",
    "dob": "1994-08-19T00:00:00.000Z",
    "profile": {
      "firstName": "Rhea",
      "lastName": "Mehta"
    },
    "addresses": [],
    "cart": [],
    "detailsOfHealthCareProfessional": null,
    "isVerified": false,
    "isActive": false,
    "lastLoginAt": "2026-06-17T14:32:20.000Z",
    "avatar": null,
    "fcmToken": null,
    "createdAt": "2026-06-15T10:30:00.000Z",
    "updatedAt": "2026-06-17T17:40:00.000Z"
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 400 | Missing `isActive` or invalid id. |
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |
| 404 | User not found. |

**Frontend Usage Note:**

> AdminDashboard user status toggle calls this endpoint.

---

**GET /api/admin/analytics**

| Field | Value |
|---|---|
| Controller Function | `getAnalytics` in `admin.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Returns platform metrics for users, bookings, revenue, catalog, approvals, and issues. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 26,
      "customers": 15,
      "doctors": 10,
      "active": 24
    },
    "bookings": {
      "totalAppointments": 15,
      "completedAppointments": 5,
      "totalOrders": 15
    },
    "revenue": {
      "productRevenue": 45280,
      "appointmentRevenue": 18540,
      "totalRevenue": 63820
    },
    "catalog": {
      "activeProducts": 30
    },
    "pendingApprovals": 2,
    "openIssues": 3
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |

**Frontend Usage Note:**

> AdminDashboard KPI cards and charts call this endpoint.

---

**GET /api/admin/payments**

| Field | Value |
|---|---|
| Controller Function | `getPaymentRecords` in `admin.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Returns consolidated order and appointment payment records. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Query Parameters:

```text
page (Number, optional, default: 1) - pagination offset applied separately to orders and appointments
limit (Number, optional, default: 20) - results per payment list
```

**Response - Success**

```json
{
  "success": true,
  "data": {
    "orderPayments": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c401",
        "userId": "64f1a2b3c4d5e6f7a8b9c001",
        "paymentDetails": {
          "transactionId": "TXN-ORD-2026-0002",
          "method": "UPI",
          "status": "SUCCESS",
          "paymentDate": "2026-06-12T12:00:00.000Z"
        },
        "pricing": {
          "finalAmount": 148
        },
        "createdAt": "2026-06-12T12:00:00.000Z"
      }
    ],
    "appointmentPayments": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c301",
        "patientId": "64f1a2b3c4d5e6f7a8b9c001",
        "doctorId": "64f1a2b3c4d5e6f7a8b9c010",
        "paymentDetails": {
          "transactionId": "TXN-APT-2026-0001",
          "status": "PAID",
          "currency": "INR",
          "paidAt": "2026-06-17T14:50:00.000Z"
        },
        "financials": {
          "totalAmount": 826
        },
        "createdAt": "2026-06-17T14:45:00.000Z"
      }
    ]
  }
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |

**Frontend Usage Note:**

> AdminDashboard payment reconciliation table calls this endpoint.

---

**GET /api/admin/issues**

| Field | Value |
|---|---|
| Controller Function | `listReportedIssues` in `admin.controller.js` |
| Auth Required | Yes |
| Role Required | ADMIN |
| Description | Lists appointments that contain reported issues, optionally filtered by issue status. |

**Request**

Headers:

```http
Authorization: Bearer <token>
```

Query Parameters:

```text
status (String, optional) - OPEN or RESOLVED
```

**Response - Success**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c301",
      "patientId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c001",
        "profile": {
          "firstName": "Rhea",
          "lastName": "Mehta"
        },
        "email": "rhea.mehta@example.com"
      },
      "doctorId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c010",
        "profile": {
          "firstName": "Amit",
          "lastName": "Sharma"
        },
        "email": "dr.amit.sharma@viqure.in"
      },
      "reportedIssue": {
        "issue": "Video link did not open for the first five minutes.",
        "reportedAt": "2026-06-17T16:55:00.000Z",
        "status": "OPEN",
        "resolution": ""
      },
      "schedule": {
        "scheduledAt": "2026-06-20T00:00:00.000Z"
      }
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c302",
      "patientId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c002",
        "profile": {
          "firstName": "Karan",
          "lastName": "Malhotra"
        },
        "email": "karan.malhotra@example.com"
      },
      "doctorId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c011",
        "profile": {
          "firstName": "Sonia",
          "lastName": "Verma"
        },
        "email": "dr.sonia.verma@viqure.in"
      },
      "reportedIssue": {
        "issue": "Prescription PDF was not downloadable.",
        "reportedAt": "2026-06-16T14:00:00.000Z",
        "status": "RESOLVED",
        "resolution": "Prescription was regenerated and link was replaced."
      },
      "schedule": {
        "scheduledAt": "2026-06-16T00:00:00.000Z"
      }
    }
  ]
}
```

**Response - Error Cases**

| Status Code | When it happens |
|---:|---|
| 401 | Missing, invalid, or expired token. |
| 403 | Authenticated user is not admin. |

**Frontend Usage Note:**

> AdminDashboard support/issues panel calls this endpoint.




## SECTION 3 - FRONTEND INTEGRATION GUIDE

Subject to change as per the frontend lead's workflow.

### 3.1 Axios Base Configuration

Use `http://localhost:5500/api`, not port 5000.

`axiosConfig.js`:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5500/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("viqure_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("viqure_token");
      localStorage.removeItem("viqure_user");
      localStorage.removeItem("viqure_role");

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3.2 Auth Flow - Step by Step

1. User submits login form with `email` and `password`.
2. Frontend calls `POST /api/auth/login`.
3. Backend returns:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c001",
      "email": "rhea.mehta@example.com",
      "role": "CUSTOMER",
      "profile": {
        "firstName": "Rhea",
        "lastName": "Mehta"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.viqure-demo-token"
  }
}
```

4. Store:

```javascript
localStorage.setItem("viqure_token", response.data.data.token);
localStorage.setItem("viqure_user", JSON.stringify(response.data.data.user));
localStorage.setItem("viqure_role", response.data.data.user.role);
```

5. Put the same user object in React auth context.
6. Axios request interceptor injects `Authorization: Bearer <token>` automatically.
7. Protected routes check for token and role. If no token, redirect to `/login`.
8. On any `401` response, response interceptor clears token/user/role and redirects to `/login`.
9. For doctors, login can return `403` until `detailsOfHealthCareProfessional.approvalStatus` becomes `APPROVED`.
10. The frontend must keep `role` in auth context and use it to render CUSTOMER, DOCTOR, or ADMIN views.

### 3.3 Role-Based UI Decisions

| Role | Pages Accessible | Pages Blocked | Conditional Components |
|---|---|---|---|
| CUSTOMER | Login, Customer Register, HomepageDoctorListing, ShopPage, ProductDetailPage, CartPage, CheckoutPage, AppointmentBookingPage, UserProfilePage, OrderHistoryPage | AdminDashboard, DoctorDashboard, doctor slot management | Cart icon, checkout buttons, book appointment button, patient appointment history, medical records, review forms |
| DOCTOR | Login, DoctorDashboard, doctor profile settings, doctor appointment list, doctor earnings, medical record upload | CartPage, CheckoutPage, AdminDashboard, customer registration-only flows | Availability/slots editor, appointment confirm/reject/complete actions, doctor earnings cards |
| ADMIN | Login, AdminDashboard, user management, doctor approvals, catalog management, orders, payments, issues, analytics | CartPage, CheckoutPage, AppointmentBookingPage as customer | Doctor approve/reject buttons, product/category create/edit, order lifecycle controls, user active toggle |

### 3.4 Known Gap Resolution Table

| Frontend Component / File | Gap / Issue | Resolution | Relevant Endpoint |
|---|---|---|---|
| `axiosConfig.js` | Wrong port, using 5000 instead of 5500 | Set `baseURL` to `http://localhost:5500/api` | All endpoints |
| Login page | Missing or not wired | Implement login form and store `token`, `user`, and `role` | `POST /api/auth/login` |
| Register Customer | Needs correct unified user model | Send `role: "CUSTOMER"` to auth register | `POST /api/auth/register` |
| Register Doctor | Needs doctor fields and approval awareness | Send `role: "DOCTOR"` and `detailsOfHealthCareProfessional`; show pending approval state | `POST /api/auth/register`, `PATCH /api/admin/doctors/:id/approve` |
| HomepageDoctorListing | Frontend expected Doctor model | Use `User` documents filtered by backend where `role=DOCTOR` and approved | `GET /api/users/doctors` |
| ShopPage | Product/category integration missing | Fetch categories and paginated products | `GET /api/categories`, `GET /api/products` |
| ProductDetailPage | Product detail and reviews not wired | Fetch product by id and reviews with `targetType=PRODUCT` | `GET /api/products/:id`, `GET /api/reviews` |
| CartPage | Frontend expected separate Cart model | Use embedded `User.cart[]` endpoints under `/users/me/cart` | `GET/POST/PATCH/DELETE /api/users/me/cart` |
| CheckoutPage | Needs order from embedded cart | Add products to embedded cart, then checkout; backend clears cart | `POST /api/orders/checkout` |
| AppointmentBookingPage | Frontend expected separate Slot model | Slots are embedded in doctor User document; current booking by `slotId` is blocked because slots have no `_id` | `GET /api/users/doctors/:id`, `POST /api/appointments` |
| UserProfilePage | Needs auth/profile/orders/appointments/medical records | Use auth me, profile update, role-aware appointments/orders/records | `GET /api/auth/me`, `PATCH /api/auth/me`, `GET /api/orders`, `GET /api/appointments`, `GET /api/medical-records` |
| OrderHistoryPage | Needs order history and tracking | Use role-aware orders list and order tracking/detail | `GET /api/orders`, `GET /api/orders/:id`, `GET /api/orders/:id/track` |
| AdminDashboard | Needs unified admin data | Use admin endpoints for analytics, users, approvals, payments, issues, products, categories | `/api/admin/*`, `/api/products/*`, `/api/categories/*` |
| DoctorDashboard | Needs doctor profile, slots, appointments, earnings | Use doctor self-service endpoints; avoid delete-slot until backend refactor | `/api/doctors/me/*` |
| Frontend model imports | Imported non-existent Doctor/Patient/Cart/Slot/Payment models | Remove frontend model assumptions. Only backend collections are User, Category, Product, Order, Appointment, Review, MedicalRecord | All endpoints |

### 3.5 Embedded Document Usage Patterns

#### Cart embedded in User

Fetch cart:

```javascript
const { data } = await api.get("/users/me/cart");
const cartItems = data.data;
```

Add item:

```javascript
await api.post("/users/me/cart", {
  productId: "64f1a2b3c4d5e6f7a8b9c101",
  quantity: 2
});
```

Update quantity:

```javascript
await api.patch("/users/me/cart/64f1a2b3c4d5e6f7a8b9c101", {
  quantity: 3
});
```

Remove item:

```javascript
await api.delete("/users/me/cart/64f1a2b3c4d5e6f7a8b9c101");
```

There is no standalone `/api/cart` resource. Cart data is stored on the authenticated `User` document at `cart[]`, so frontend state should treat the cart as user-owned session data. `GET /api/users/me/cart` returns populated products; write operations return the updated embedded array with product ids.

Cart item shape:

```json
{
  "productId": {
    "_id": "64f1a2b3c4d5e6f7a8b9c101",
    "name": "Dolo 650",
    "pricing": {
      "mrp": 32,
      "finalPrice": 29
    },
    "inventory": {
      "stockCount": 500
    },
    "images": ["https://cdn.viqure.in/products/pr-dol-650.jpg"]
  },
  "quantity": 2
}
```

#### TimeSlots embedded in User.detailsOfHealthCareProfessional.timeSlots

Fetch available slots for a doctor:

```javascript
const { data } = await api.get("/users/doctors/64f1a2b3c4d5e6f7a8b9c010");
const slots = data.data.detailsOfHealthCareProfessional.timeSlots;
```

Slot object shape:

```json
{
  "date": "2026-06-20T00:00:00.000Z",
  "startTime": "10:00",
  "endTime": "10:30",
  "isBooked": false
}
```

Render `isBooked: true` as disabled/greyed out and prevent click.

Current backend gap: appointment booking expects `slotId`, but `TimeSlotSchema` uses `{ _id: false }`. Until backend refactors this, frontend should use mock booking data or backend-provided temporary slot identifiers. The intended behavior is: creating an appointment also changes the matching embedded slot to `isBooked: true`; cancellation/rejection reopens it.

#### Doctor Profile embedded in User.detailsOfHealthCareProfessional

Doctor card field paths:

| UI Piece | Field Path |
|---|---|
| Doctor id | `_id` |
| Full name | `profile.firstName` + `profile.lastName` |
| Avatar | `avatar` |
| Verified badge | `isVerified` |
| City | `addresses[0].city` |
| Qualifications | `detailsOfHealthCareProfessional.qualifications[]` |
| Experience | `detailsOfHealthCareProfessional.yearsOfExperience` |
| Bio snippet | `detailsOfHealthCareProfessional.bio` |
| Consultation fee | `detailsOfHealthCareProfessional.consultationFee` |
| Average rating | `detailsOfHealthCareProfessional.averageRating` |
| Total ratings | `detailsOfHealthCareProfessional.stats.totalRatings` |
| Availability badge | `detailsOfHealthCareProfessional.isAvailable` |
| Approval status | `detailsOfHealthCareProfessional.approvalStatus` |
| Slots | `detailsOfHealthCareProfessional.timeSlots[]` |

### 3.6 Pagination Pattern

Send:

```text
page=1
limit=20
```

List endpoints using this pattern:

```text
GET /api/users/doctors
GET /api/products
GET /api/orders
GET /api/appointments
GET /api/doctors/me/appointments
GET /api/reviews
GET /api/medical-records
GET /api/admin/users
```

Response envelope:

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c101",
      "name": "Dolo 650"
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 20,
    "pages": 2
  }
}
```

Load More pattern:

```javascript
const nextPage = pagination.page + 1;
const canLoadMore = pagination.page < pagination.pages;

if (canLoadMore) {
  const response = await api.get("/products", {
    params: { page: nextPage, limit: pagination.limit }
  });
  setItems((current) => [...current, ...response.data.data]);
  setPagination(response.data.pagination);
}
```

Page number pattern:

```javascript
const response = await api.get("/products", {
  params: { page: selectedPage, limit: 20 }
});

setItems(response.data.data);
setPagination(response.data.pagination);
```


## SECTION 4 - QUICK REFERENCE CARD

### All Endpoints

| Method | Path | Auth | Role | What it does |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | No | Register customer or doctor |
| POST | `/api/auth/login` | No | No | Login and return token/user |
| GET | `/api/auth/me` | Yes | Any | Get current user |
| PATCH | `/api/auth/me` | Yes | Any | Update current user profile |
| PATCH | `/api/auth/change-password` | Yes | Any | Change password |
| GET | `/api/users/doctors` | No | No | List approved doctors |
| GET | `/api/users/doctors/:id` | No | No | Get approved doctor detail |
| POST | `/api/users/me/addresses` | Yes | Any | Add embedded address |
| PATCH | `/api/users/me/addresses/:addressId` | Yes | Any | Update embedded address; currently blocked by `_id: false` |
| DELETE | `/api/users/me/addresses/:addressId` | Yes | Any | Delete embedded address; currently blocked by `_id: false` |
| GET | `/api/users/me/cart` | Yes | Any | Get embedded cart |
| POST | `/api/users/me/cart` | Yes | Any | Add to embedded cart |
| PATCH | `/api/users/me/cart/:productId` | Yes | Any | Update cart quantity |
| DELETE | `/api/users/me/cart/:productId` | Yes | Any | Remove cart item |
| DELETE | `/api/users/me/cart` | Yes | Any | Clear cart |
| PATCH | `/api/doctors/me/profile` | Yes | DOCTOR | Update doctor profile |
| GET | `/api/doctors/me/slots` | Yes | DOCTOR | Get own embedded slots |
| POST | `/api/doctors/me/slots` | Yes | DOCTOR | Add embedded slots |
| DELETE | `/api/doctors/me/slots/:slotId` | Yes | DOCTOR | Delete slot; currently blocked by `_id: false` |
| GET | `/api/doctors/me/appointments` | Yes | DOCTOR | Doctor appointments |
| GET | `/api/doctors/me/earnings` | Yes | DOCTOR | Doctor earnings |
| GET | `/api/categories` | No | No | List categories |
| GET | `/api/categories/:id` | No | No | Get category |
| POST | `/api/categories` | Yes | ADMIN | Create category |
| PATCH | `/api/categories/:id` | Yes | ADMIN | Update category |
| DELETE | `/api/categories/:id` | Yes | ADMIN | Delete/deactivate category |
| GET | `/api/products` | No | No | List products |
| GET | `/api/products/:id` | No | No | Get product |
| POST | `/api/products` | Yes | ADMIN | Create product |
| PATCH | `/api/products/:id` | Yes | ADMIN | Update product |
| PATCH | `/api/products/:id/stock` | Yes | ADMIN | Update stock |
| GET | `/api/products/low-stock` | Yes | ADMIN | Low-stock products |
| DELETE | `/api/products/:id` | Yes | ADMIN | Soft-delete product |
| POST | `/api/orders/checkout` | Yes | CUSTOMER | Checkout embedded cart |
| GET | `/api/orders` | Yes | CUSTOMER/ADMIN | List orders |
| GET | `/api/orders/:id` | Yes | Owner/ADMIN | Get order |
| GET | `/api/orders/:id/track` | Yes | Intended owner/ADMIN | Track order |
| PATCH | `/api/orders/:id/cancel` | Yes | Owner/ADMIN | Cancel order |
| PATCH | `/api/orders/:id/return` | Yes | Owner/ADMIN | Return order |
| PATCH | `/api/orders/:id/confirm` | Yes | ADMIN | Confirm order |
| PATCH | `/api/orders/:id/ship` | Yes | ADMIN | Ship order |
| PATCH | `/api/orders/:id/deliver` | Yes | ADMIN | Deliver order |
| POST | `/api/appointments` | Yes | CUSTOMER | Book appointment; currently blocked by slot id issue |
| GET | `/api/appointments` | Yes | Any | Role-aware appointment list |
| GET | `/api/appointments/:id` | Yes | Participant/ADMIN | Get appointment |
| PATCH | `/api/appointments/:id/confirm` | Yes | DOCTOR | Confirm appointment |
| PATCH | `/api/appointments/:id/reject` | Yes | DOCTOR | Reject appointment |
| PATCH | `/api/appointments/:id/cancel` | Yes | Participant/ADMIN | Cancel appointment |
| PATCH | `/api/appointments/:id/complete` | Yes | DOCTOR | Complete appointment |
| PATCH | `/api/appointments/:id/payment` | Yes | Patient | Record payment |
| POST | `/api/appointments/:id/documents` | Yes | Participant | Share document |
| POST | `/api/appointments/:id/feedback` | Yes | CUSTOMER | Leave feedback |
| POST | `/api/appointments/:id/report-issue` | Yes | Participant | Report issue |
| PATCH | `/api/appointments/:id/resolve-issue` | Yes | Intended ADMIN | Resolve issue |
| GET | `/api/reviews` | No | No | List target reviews |
| POST | `/api/reviews` | Yes | CUSTOMER | Create review |
| PATCH | `/api/reviews/:id` | Yes | Owner | Update review |
| DELETE | `/api/reviews/:id` | Yes | Owner/ADMIN | Delete review |
| PATCH | `/api/reviews/:id/like` | Yes | Any | Like review |
| POST | `/api/medical-records` | Yes | Any | Create medical record |
| GET | `/api/medical-records` | Yes | Any | Role-aware records list |
| GET | `/api/medical-records/:id` | Yes | Patient/Doctor/ADMIN | Get record |
| PATCH | `/api/medical-records/:id` | Yes | Doctor/ADMIN | Update record |
| DELETE | `/api/medical-records/:id` | Yes | Patient/Doctor/ADMIN | Delete record |
| GET | `/api/admin/doctors/pending` | Yes | ADMIN | Pending doctors |
| PATCH | `/api/admin/doctors/:id/approve` | Yes | ADMIN | Approve doctor |
| PATCH | `/api/admin/doctors/:id/reject` | Yes | ADMIN | Reject doctor |
| GET | `/api/admin/users` | Yes | ADMIN | List users |
| PATCH | `/api/admin/users/:id/status` | Yes | ADMIN | Activate/deactivate user |
| GET | `/api/admin/analytics` | Yes | ADMIN | Platform analytics |
| GET | `/api/admin/payments` | Yes | ADMIN | Payment records |
| GET | `/api/admin/issues` | Yes | ADMIN | Reported issues |

### All Valid Enum Values

| Field | Collection | Valid Values |
|---|---|---|
| `role` | User | `CUSTOMER`, `DOCTOR`, `ADMIN` |
| `gender` | User | `MALE`, `FEMALE`, `OTHER` |
| `addresses.type` | User | `HOME`, `WORK`, `OTHER` |
| `detailsOfHealthCareProfessional.approvalStatus` | User | `PENDING`, `APPROVED`, `REJECTED` |
| `order.status` | Order | `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`, `failed`, `returned` |
| `order.paymentDetails.status` | Order | `PENDING`, `SUCCESS`, `FAILED` |
| `order.shipmentDetails.status` | Order | `PENDING`, `DISPATCHED`, `DELIVERED`, `FAILED`, `RETURNED` |
| `order.shipmentDetails.otpVerification.status` | Order | `VERIFIED`, `UNVERIFIED` |
| `appointment.meeting.consultationType` | Appointment | `VIDEO`, `PHONE`, `IN_PERSON` |
| `appointment.paymentDetails.status` | Appointment | `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| `appointment.appointmentStatus` | Appointment | `BOOKED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `REJECTED` |
| `appointment.doctorRemarks.mode` | Appointment | `File`, `Text` |
| `appointment.reportedIssue.status` | Appointment | `OPEN`, `RESOLVED` |
| `review.targetType` | Review | `DOCTOR`, `PRODUCT` |
| `medicalRecord.documentType` | MedicalRecord | `PRESCRIPTION`, `LAB_REPORT`, `OTHER` |

Base URL: `http://localhost:5500/api`

Token header: `Authorization: Bearer <token>`

Collections used by frontend: `User`, `Category`, `Product`, `Order`, `Appointment`, `Review`, `MedicalRecord`

---



