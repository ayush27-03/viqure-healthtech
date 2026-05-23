# ACTIONABLE ROADMAP

This file converts `TASKS.md` into the exact order of work you should do.

## 1. First fix the backend skeleton

Do this before Postman testing. Right now the project is not wired enough to test the full flow.

### 1.1 Create missing folders/files

Create these folders inside `server`:

- `server/routes` - created
- `server/utils` - created
- `server/middlewares` - created
- `server/controllers` - created during cleanup

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

Status: routes mounted and controllers wired for core APIs (auth, admin, doctors, slots, appointments, products, cart, orders, reviews).
Notes: auth helpers (`server/utils/jwt.util.js`, `server/utils/response.util.js`, `server/middlewares/auth.middleware.js`, `server/middlewares/role.middleware.js`) implemented minimally to allow local testing. Backend structure has been normalized so controllers also live under `server/controllers`. Some controllers still require model/schema alignment (see 2.x tasks).

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

## 20. Additional tasks added later

These are the newer assignment items that need to be folded into the original execution plan.

Do not treat them as separate workstreams. Attach them to the phases below.

New task groups:

1. larger seed data and fetch verification
2. richer doctor earnings and appointment flow testing
3. larger product catalog and inventory validation
4. admin analytics and admin route audit
5. production deployment and handover deliverables
6. documentation deliverables
7. final client-style walkthrough and bug triage

## 21. Expanded seeding work

Your old seed target is no longer enough.

### 21.1 Doctor slots

Seed:

- 15 to 20 total slots
- spread across at least 2 approved doctors
- use multiple dates
- use realistic 20 to 30 minute intervals

What to verify:

1. slot docs appear in Atlas
2. `GET /api/slots/doctor/:doctorId` only returns unbooked future slots
3. duplicate slot insertions are blocked by unique key or controller conflict handling

### 21.2 Product seed expansion

Seed:

- 12 products minimum
- 3 categories:
  - medicines
  - devices
  - supplements

For each product include:

- name
- slug
- brand
- category snapshot
- base cost
- discount factor
- stock quantity
- SKU
- estimated delivery days
- image URL placeholder if real image unavailable

What to verify:

1. all products appear in Atlas
2. category-based filtering works
3. inventory numbers are realistic and non-zero

## 22. Doctor booking and earnings test expansion

These are now explicit deliverables, not optional checks.

### 22.1 Appointment acceptance and rejection flow

In Postman test this exact sequence:

1. patient books appointment
2. doctor fetches doctor appointments
3. doctor marks one appointment `CONFIRMED`
4. doctor marks a different appointment `REJECTED`
5. patient fetches patient appointments and sees updated statuses
6. ensure unauthorized patient cannot change doctor-side statuses

Failure cases to test:

1. doctor tries updating another doctor's appointment
2. patient tries setting `CONFIRMED`
3. invalid status payload
4. non-existent appointment id

### 22.2 Doctor earnings pipeline

Minimum output required:

- total earnings
- total completed paid consultations
- average consultation fee
- monthly grouped earnings

Extra useful outputs:

- most recent paid consultation date
- current month earnings
- previous month earnings

Validation rules:

- only `COMPLETED` appointments count
- only `PAID` payment status counts
- rejected, cancelled, and pending appointments must not count

## 23. Cart, order, and inventory verification expansion

### 23.1 Cart upsert validation

Your task now explicitly mentions product snapshot embedding.

What to verify in Postman and Atlas:

1. adding a product first time creates a cart line item
2. adding the same product again increments quantity instead of duplicating incorrectly
3. `unitPrice` and `totalPrice` update correctly
4. cart stores product reference plus enough product data to render the cart

### 23.2 Order snapshot validation

For `POST /api/orders`, confirm:

1. order embeds product snapshot fields
2. snapshot contains:
   - name
   - brand
   - image
   - MRP
   - selling price
3. order pricing block is filled correctly
4. cart is deleted or emptied after order creation

### 23.3 Inventory decrement validation

After placing test orders:

1. open Atlas
2. compare product `inventory.stockQty` before and after order
3. confirm decrement equals ordered quantity
4. verify no decrement happens when order creation fails

## 24. Admin analytics and audit expansion

### 24.1 Platform-wide analytics pipeline

Your analytics task is now broader.

Required metrics:

- total patients
- total approved doctors
- total pending doctors
- total appointments
- total completed appointments
- total orders
- consultation revenue
- product revenue
- combined platform revenue
- monthly user growth

Recommended breakdowns:

- new patients per month
- new doctors per month
- orders by status
- low-stock products

### 24.2 Full admin route audit

Create a dedicated Postman folder: `Admin Audit`

Audit these routes one by one:

1. doctor list
2. doctor approval
3. doctor rejection
4. patient list
5. analytics
6. payments
7. appointments list
8. orders list
9. category create
10. category deactivate
11. admin product create
12. admin product update
13. admin product deactivate

For each route record:

- request used
- expected response
- actual response
- issues found

## 25. Notifications, profiles, and support APIs

These are now explicitly part of the task list.

### 25.1 Profile APIs

Build and test:

- patient profile fetch
- patient profile update
- doctor profile fetch
- doctor profile update

Fields to support:

- address
- avatar if upload flow exists
- doctor bio/description
- city
- experience
- fees

### 25.2 Notification APIs

Build and test:

- fetch notifications
- mark one as read
- mark all as read

What to verify:

1. appointment events create notifications
2. doctor approval creates notifications
3. order status updates create notifications
4. unread count changes correctly

## 26. Production and delivery tasks

These are now end-stage deliverables and should happen only after local/Postman stability.

### 26.1 Railway production setup

Checklist:

1. create Railway backend project
2. add all required environment variables
3. configure production MongoDB URI
4. whitelist Railway access in Atlas if needed
5. deploy backend
6. verify `/api/health` on production

### 26.2 CORS finalization

Before final signoff:

1. add production frontend URL to CORS allowlist
2. keep localhost dev URL allowed for development
3. retest auth and protected endpoints from production frontend

### 26.3 Final live Postman pass

Run the same high-value tests against the live server:

1. login
2. doctor approval
3. slot creation
4. booking
5. cart add
6. order placement
7. analytics

## 27. Final documentation and handover

These are no longer optional polish items. They are assignment outputs.

### 27.1 `DATABASE_SCHEMA.md`

Write one section per collection:

- purpose
- key fields
- references/relationships
- important indexes
- why the collection exists

Collections to document at minimum:

- users
- admins
- doctors
- slots
- appointments
- categories
- products
- carts
- orders
- payments
- reviews
- notifications
- medical records

### 27.2 `API_DOCS.md`

Document:

- base URL
- auth format
- each endpoint
- expected body
- response examples
- common errors

### 27.3 Server README

Include:

- project purpose
- setup steps
- env vars
- seed instructions
- local run commands
- deployment link

### 27.4 Final walkthrough and bug triage

During the 3-hour team walkthrough:

1. act as the client
2. follow the user journeys end to end
3. note every bug live
4. classify each bug:
   - `P0`: blocks a core flow
   - `P1`: serious but workaround exists
   - `P2`: minor issue or polish gap

### 27.5 Handover checklist

Before closing the project:

1. verify repo access ownership
2. verify production credentials are stored securely
3. hand over env variables through secure channel only
4. export final Postman collection
5. verify roadmap, docs, and bug list are committed


