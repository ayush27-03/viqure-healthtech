# ACTIONABLE ROADMAP

This file converts `TASKS.md` into the exact order of work you should do.

## 1. First fix the backend skeleton

Do this before Postman testing. Right now the project is not wired enough to test the full flow.

### 1.1 Create missing folders/files

Create these folders inside `server`:

- `server/routes` - created
- `server/utils` - created
- `server/middlewares` - created

Create these files first:

- `server/utils/response.util.js` - created
- `server/utils/jwt.util.js` - created
- `server/utils/notification.util.js` - created
- `server/middlewares/auth.middleware.js` - created
- `server/middlewares/role.middleware.js` - created

### 1.2 Fix broken imports and model paths

Your controllers currently import paths like:

- `../models/User.model` - completed
- `../models/Doctor.model` - completed
- `../utils/response.util` - completed

But your actual models are inside `server/models` and are named like:

- `user.model.js`
- `doctor.model.js`
- `appointments.model.js`

Decide one structure and make it consistent.

Recommended:

- keep models in `server/models` - kept
- keep controllers where they are for now - kept
- update controller imports to point to `../server/models/...` - updated
- update util imports to point to `../server/utils/...` - updated

### 1.3 Fix immediate syntax/runtime errors

Fix these first:

- `controllers/auth.controller.js`
  - remove stray `j` after `require("../models/Admin.model");` - there was no stray `j`
- `server/server.js`
  - change invalid line:
    - `return res.status(400).json({ message: "Invalid doctor id" , type: json});`
  - replace with valid JSON response
- install missing dependency if used:
  - `uuid`
>> I have written return res.status(200).json(doctor);

### 1.4 Mount real API routes

In `server/server.js`, add route mounting for:

- auth
- admin
- doctors
- slots
- appointments
- products
- cart
- orders
- reviews

Do not start with frontend pages. Finish backend routes first.

## 2. Normalize your data model

This is the most important design decision.

### 2.1 Choose how doctors and admins authenticate

Right now the code mixes two approaches:

- doctor/admin stored in `User`
- doctor/admin stored in separate collections

Recommended approach for fastest completion:

- `User` stores login identity for patient/admin
- `Doctor` is a separate collection for doctor login plus doctor profile

If you use this:

- keep patient login from `User`
- keep admin login from either:
  - separate `Admin` model, or
  - `User` with role `admin`

Pick one and apply it everywhere.

### 2.2 Make password field naming consistent

Your `User` model has:

- `passwordHash`

But auth controller currently reads:

- `password`

Pick one naming convention and update:

- model
- seed script
- register controller
- login controller

Recommended: use `passwordHash` everywhere.

### 2.3 Fix appointment schema mismatch

`appointments.model.js` requires fields like:

- `appointmentDate`
- `slotTime`

But `appointment.controller.js` currently does not set them.

When creating an appointment, save:

- `appointmentDate = slot.date`
- `slotTime = startTime + " - " + endTime`
- `appointmentStartDateTime`
- `appointmentEndDateTime`

### 2.4 Fix review schema mismatch

`reviews.model.js` uses:

- `userId`

But `review.controller.js` uses:

- `patientId`

Make them match everywhere.

Recommended:

- use `userId` in schema and controller
- still check that the logged-in role is patient before allowing review creation

## 3. Build the missing models if controllers depend on them

Check if these exist and create them if missing:

- `Slot`
- any model used by routes you plan to test immediately

Do not build every optional feature first. Only build what the assignment needs.

Priority order:

1. `Slot`
2. auth helpers
3. appointment flow support
4. cart/order support
5. review verification support

## 4. Rewrite seed.js properly

Your current `seed.js` is too small for the assignment.

## 4.1 What the seed must create

Create seed data for:

- 1 admin
- 2 approved doctors
- 1 pending doctor
- 3 patients
- specialty categories
- product categories
- doctor slots
- 6 to 9 products across 3 categories
- 1 completed appointment
- 1 pending appointment
- 1 delivered order
- 1 pending order
- 1 medical record if required by your teammate

## 4.2 Suggested data set

Use realistic but simple data:

- doctors:
  - cardiology
  - dermatology
  - pediatrics
- product categories:
  - supplements
  - skincare
  - devices
- products:
  - 2 or 3 in each category

## 4.3 Seed order

Insert in this order:

1. categories
2. users/admins/doctors
3. doctor profiles if separate from login
4. slots
5. products
6. appointments
7. carts/orders
8. reviews if needed

## 4.4 After each seed run verify in Atlas

Check these collections manually:

- users
- admins
- doctors
- categories
- slots
- products
- appointments
- orders
- reviews

## 5. Build auth routes first

Make these routes work before anything else:

- `POST /api/auth/register/patient`
- `POST /api/auth/register/doctor`
- `POST /api/auth/login`
- `GET /api/auth/me`

Optional:

- `POST /api/auth/logout`

## 5.1 What to test in Postman

Create a Postman folder: `Auth`

Add requests for:

1. patient register success
2. patient register duplicate email
3. doctor register success
4. doctor register duplicate email
5. doctor register duplicate license
6. patient login success
7. doctor login pending rejection
8. doctor login approved success
9. admin login success
10. wrong password failure
11. invalid role failure
12. `/me` with token success
13. `/me` without token failure

## 6. Build doctor approval flow

This is needed before doctor login can fully work.

Make these admin routes work:

- `GET /api/admin/doctors`
- `PATCH /api/admin/doctors/:id/approve`
- `PATCH /api/admin/doctors/:id/reject`

## 6.1 What to test

In Postman:

1. login as admin
2. fetch pending doctors
3. approve one doctor
4. login as that approved doctor
5. reject another doctor
6. confirm rejected doctor cannot login

## 7. Build slots flow

Doctor should be able to create and delete slots.

Routes to build/test:

- `POST /api/slots`
- `GET /api/slots/doctor/:doctorId`
- `DELETE /api/slots/:id`

## 7.1 What to test

1. doctor creates 3 to 5 slots
2. verify new slot docs in Atlas
3. fetch doctor slots as patient
4. try creating duplicate slot and expect conflict
5. delete unbooked slot
6. confirm booked slot cannot be deleted

## 8. Build appointment booking flow

Routes to build/test:

- `POST /api/appointments`
- `GET /api/appointments/patient`
- `GET /api/appointments/doctor`
- `GET /api/appointments/:id`
- `PATCH /api/appointments/:id/status`
- `PATCH /api/appointments/:id/remarks`

## 8.1 Exact booking test sequence

1. login as patient
2. fetch available slots for approved doctor
3. pick one `slotId`
4. book appointment with `doctorId` and `slotId`
5. verify appointment doc created
6. verify slot `isBooked` became `true`
7. try booking same slot again and expect failure
8. login as doctor
9. fetch doctor appointments
10. mark appointment `CONFIRMED`
11. mark appointment `COMPLETED`
12. add doctor remarks

## 9. Write doctor earnings aggregation

This task should be done only after appointment data exists.

Expected output:

- total earnings
- total paid completed appointments
- average consultation fee
- monthly earnings trend

What to verify:

- only `COMPLETED` + `PAID` appointments count
- pending/unpaid appointments should not count

## 10. Build product APIs

Routes to build/test:

- `GET /api/products`
- `GET /api/products/:idOrSlug`
- `POST /api/products`
- `PATCH /api/products/:id`
- `PATCH /api/products/:id/deactivate`

## 10.1 Product test checklist

1. list all products
2. filter by category
3. filter by price
4. search by name
5. get one product by id
6. get one product by slug
7. admin creates product
8. admin updates product
9. admin deactivates product

## 11. Build cart flow

Routes to build/test:

- `POST /api/cart`
- `GET /api/cart`
- `DELETE /api/cart/:productId`

## 11.1 Cart test checklist

1. add product to cart
2. add same product again and verify quantity updates
3. add second product
4. fetch cart
5. remove one product
6. try adding more than stock and expect failure

## 12. Build order flow

Routes to build/test:

- `POST /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/admin/orders/:id/status`

## 12.1 Exact order test sequence

1. login as patient
2. add products to cart
3. place order with shipping address
4. verify order doc in Atlas
5. verify cart is emptied
6. verify product inventory decreased
7. login as admin
8. update order status to `confirmed`
9. update to `shipped`
10. update to `delivered`

## 13. Verify review purchase logic

You specifically have a task about `purchaseVerified`.

Decide the rule clearly:

- product review:
  - true if patient has a delivered order containing that product
- doctor review:
  - true if patient completed an appointment with that doctor

## 13.1 What to build

When creating review:

1. check if patient is eligible
2. set `purchaseVerified`
3. reject review if business rule requires completed purchase/appointment

## 13.2 What to test

1. patient with completed appointment reviews doctor
2. patient without completed appointment tries review and fails
3. patient with delivered order reviews product
4. patient without delivered order tries review and fails or gets unverified depending on your rule

## 14. Write admin analytics pipeline

Build admin analytics after the data is seeded.

Expected metrics:

- total patients
- total approved doctors
- total pending doctors
- total appointments
- completed appointments
- total orders
- total revenue
- monthly trend

Optional useful extras:

- low stock products
- delivered vs pending orders
- revenue split by consultation vs products

## 15. Test all admin routes

Create a Postman folder: `Admin`

Test:

1. doctor list
2. doctor approval
3. doctor rejection
4. patient list
5. analytics
6. category create
7. category deactivate
8. appointments list
9. orders list
10. payment list if implemented
11. product create/update/deactivate

## 16. Full platform walkthrough

Do this only after all major APIs work.

### 16.1 Patient walkthrough

1. register/login
2. view doctors
3. view slots
4. book appointment
5. browse products
6. add to cart
7. place order
8. review doctor/product if eligible

### 16.2 Doctor walkthrough

1. login after approval
2. create slots
3. view appointments
4. confirm/complete appointment
5. add remarks
6. check earnings

### 16.3 Admin walkthrough

1. login
2. approve doctor
3. view patients
4. view analytics
5. manage products
6. update order statuses

## 17. Maintain a bug list while testing

Create a simple file like `BUGS.md`.

For each bug write:

- title
- severity: high / medium / low
- route/page
- steps to reproduce
- expected result
- actual result

Prioritize:

1. auth bugs
2. booking bugs
3. inventory/order bugs
4. analytics bugs
5. UI bugs

## 18. Best working order for you

Do not jump around randomly. Follow this order:

1. fix server structure and imports
2. fix auth model consistency
3. create routes and middleware
4. rewrite `seed.js`
5. test auth in Postman
6. implement admin approval flow
7. implement slot flow
8. implement appointment flow
9. implement earnings pipeline
10. implement products
11. implement cart
12. implement orders
13. implement review verification
14. implement admin analytics
15. run full admin route tests
16. run full platform walkthrough
17. write final bug list

## 19. What to do today first

If you want the shortest path forward, do exactly this next:

1. fix import paths and missing utility files
2. create auth middleware and response helpers
3. mount auth/admin/slot/appointment/product/cart/order routes
4. fix model/controller mismatches
5. expand `seed.js`
6. test auth routes in Postman

If auth is not fully working, do not move to cart/orders/analytics yet.
