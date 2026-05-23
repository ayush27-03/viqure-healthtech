# DATABASE SCHEMA

## users

Purpose:

- stores patient identities and profile data

Key fields:

- `name`
- `email`
- `phone`
- `passwordHash`
- `role`
- `gender`
- `dob`
- `address`
- `isVerified`
- `isActive`
- `lastLogin`
- `avatar`

Relationships:

- referenced by appointments as `patientId`
- referenced by orders as `userId`
- referenced by reviews as `userId`
- referenced by payments as `userId`
- referenced by medical records as `patientId`

## admins

Purpose:

- stores admin login and privilege metadata

Key fields:

- `adminId`
- `name`
- `email`
- `passwordHash`
- `adminRole`
- `permissions`

Relationships:

- admin users operate via protected admin routes

## doctors

Purpose:

- stores doctor auth plus doctor-facing marketplace profile

Key fields:

- `doctorName`
- `email`
- `passwordHash`
- `mobileNumber`
- `licenseNumber`
- `specializations`
- `qualifications`
- `yearsOfExperience`
- `consultationFees`
- `city`
- `description`
- `profileIcon`
- `status`
- `approvalStatus`
- `stats`

Relationships:

- referenced by slots as `doctorId`
- referenced by appointments as `doctorId`
- referenced by reviews as `targetId` when `targetEntity=doctor`
- referenced by medical records as `doctorId`

Important indexes:

- unique `email`
- unique `licenseNumber`
- text index on `doctorName`, `specializations`, `bio`, `city`

## slots

Purpose:

- stores doctor availability for booking

Key fields:

- `doctorId`
- `date`
- `startTime`
- `endTime`
- `isBooked`

Relationships:

- belongs to one doctor
- consumed by appointment booking flow

Important indexes:

- unique compound index on `doctorId + date + startTime + endTime`

## appointments

Purpose:

- stores patient-doctor bookings and consultation outcomes

Key fields:

- `patientId`
- `doctorId`
- `paymentId`
- `consultationFees`
- `appointmentDate`
- `appointmentStartDateTime`
- `appointmentEndDateTime`
- `slotTime`
- `appointmentStatus`
- `paymentStatus`
- `meetingId`
- `doctorRemarks`

Relationships:

- belongs to one patient
- belongs to one doctor
- can reference one payment
- can be referenced by medical records

## categories

Purpose:

- stores both specialty categories and product categories

Key fields:

- `name`
- `slug`
- `type`
- `description`
- `isActive`

Relationships:

- embedded as category snapshot inside products

## products

Purpose:

- stores ecommerce catalog items

Key fields:

- `name`
- `slug`
- `brand`
- `category`
- `images`
- `baseCost`
- `discountFactor`
- `inventory.stockQty`
- `inventory.sku`
- `ratings`
- `estimatedDeliveryDays`
- `isAvailable`

Relationships:

- referenced by cart items
- referenced by order items
- referenced by reviews as `targetId` when `targetEntity=product`

## carts

Purpose:

- stores the current patient cart before checkout

Key fields:

- `userId`
- `items.productId`
- `items.name`
- `items.brand`
- `items.image`
- `items.unitPrice`
- `items.quantity`
- `items.totalPrice`
- `totalAmount`

Relationships:

- one cart per user
- converted into order items during checkout

## orders

Purpose:

- stores purchase records with snapshot pricing

Key fields:

- `userId`
- `items`
- `pricing.subtotal`
- `pricing.deliveryCharge`
- `pricing.finalAmount`
- `status`
- `paymentId`
- `deliveryId`
- `shippingAddress`

Relationships:

- belongs to one user
- can reference one payment
- can reference one delivery

Architectural decision:

- product snapshots are embedded to preserve historical order data even if product info changes later

## deliveries

Purpose:

- stores shipment and delivery lifecycle data for orders

Key fields:

- `orderId`
- `userId`
- `status`
- `deliveryAddress`
- `deliveryCharge`
- `estimatedDeliveryDate`
- `actualDeliveryDate`
- `verificationStatus`

Relationships:

- one delivery per order in the current implementation

## payments

Purpose:

- stores payment records for appointments and store purchases

Key fields:

- `userId`
- `appointmentId`
- `orderId`
- `paymentType`
- `amount`
- `paymentMethod`
- `paymentStatus`
- `transactionId`
- `paidAt`

Relationships:

- belongs to one user
- optionally links to appointment or order

## reviews

Purpose:

- stores doctor and product ratings from patients

Key fields:

- `userId`
- `targetEntity`
- `targetId`
- `rating`
- `comment`
- `purchaseVerified`

Relationships:

- belongs to one user
- points at either a doctor or a product

Important indexes:

- unique compound index on `userId + targetEntity + targetId`

Architectural decision:

- doctor and product reviews share one collection, separated by `targetEntity`

## notifications

Purpose:

- stores user-facing system notifications

Key fields:

- `userId`
- `userModel`
- `title`
- `message`
- `type`
- `refId`
- `refModel`
- `isRead`
- `expiresAt`

Relationships:

- ties user events to appointments, orders, or approvals

Important indexes:

- user/unread lookup index
- TTL index on `expiresAt`

## medicalRecords

Purpose:

- stores patient medical summary plus uploaded medical docs

Key fields:

- `patientId`
- `doctorId`
- `appointmentId`
- `bloodGroup`
- `height`
- `weight`
- `diagnosis`
- `symptoms`
- `treatment`
- `followUpDate`
- `medicalDocuments`

Relationships:

- belongs to one patient
- can be associated with one doctor and one appointment

## Architectural notes

- doctor auth is stored directly in the `doctors` collection
- patient auth is stored in `users`
- admin auth is stored in `admins`
- slots are a separate collection so booking can atomically flip `isBooked`
- orders embed snapshots so historical pricing remains stable
