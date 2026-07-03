# ViQure Healthtech — Technical Assessment & Completion Plan

**Prepared:** 30 June 2026
**Scope of request:** Verified progress audit · effort & timeline for a full Ant Design UI/UX revamp · full frontend↔backend integration · deployment · what exactly is needed (and how) to complete every facet of the PRD.
**Constraint stated by you:** ~4 working days, solo, with the deadline on the 5th day.

---

## 0. Read this first (TL;DR)

Two things are true at once, and both matter:

1. **The backend is genuinely well-engineered.** Clean route→controller→model layering, `catchAsync` wrapping, central `ApiError`, JWT + RBAC, helmet/CORS/rate-limiting, and complete business logic for appointments, orders, products, reviews, medical records and admin analytics. As an *API*, it is roughly **70% of the PRD**.

2. **The product does not actually work end-to-end, and the headline reason is not "missing integrations" — it is that large parts of the *frontend* are still wired to a different (old mock) API contract than the real backend exposes.** Login is broken, the entire appointment/booking flow calls endpoints that don't exist, and most of the admin dashboard calls the wrong paths/verbs. On top of that, all four PRD-mandated external integrations (payment, video, email/SMS, maps) are absent or faked.

**Honest verdict on the 4-day deadline:** "Complete" — full AntD replacement + full integration + all four external integrations + deployment + the testing the PRD demands — is realistically **~50–60 engineer-days (≈ 10–12 working weeks solo)**. That does **not** fit in 4 days. Section 8 is therefore the most important part of this document: a ruthlessly prioritized 4-day plan that gets you to a *credible, demoable, honestly-handed-over* state, plus a clearly labelled "Phase 2" list to disclose to the client.

> You selected **full Ant Design replacement** as the target. Section 3 scopes that fully (it's the right long-term call). But it cannot be done inside 4 days alongside the integration work, so the 4-day plan downgrades it to a **theme + high-visibility-shell** pass and pushes the full replacement to Phase 2. That is a deliberate, stated compromise — not an oversight.

---

## 1. Method — what was actually checked

This assessment is based on reading the real source in `D:\viqure`, not just the prior `StatusUpdate.md`. Verified by reading:

- **Backend:** `app.js`, `server.js`, all 10 route files, all 10 controllers, the `User`/`Appointment`/`Order` models, `auth.middleware.js`, `upload.middleware.js`, `jwt.util.js`, `helpers.js`.
- **Frontend:** `App.jsx`, `axiosConfig.js`, `AuthContext.jsx`, all shared components, and the key pages (`Login`, `Homepage`, `DoctorBooking`, `Appointments`, `Checkout`, `Cart`, `Shop`, admin pages, profiles, settings). Every `axiosInstance.*()` call was extracted and compared against the mounted routes.
- **Config:** both `package.json` files, `tailwind.config.js`, `vite.config.js`, `postcss.config.js`, CSS files.
- **PRD:** `ViQure-PRD.md` (mapped requirement-by-requirement below).

Where a finding is stated as fact, it is anchored to a file/line.

---

## 2. Verified current progress

### 2.1 Revised scorecard (this differs from the earlier StatusUpdate)

| Dimension | Honest completion | Note |
|---|---|---|
| Backend API capability | **~70%** | Solid and coherent; missing the 4 integrations, notifications, validation lib, geo, OTP/reset, real file storage, tests. |
| Frontend screens exist (visually) | **~85–90%** | Every PRD screen is present and routed. |
| Frontend **correctly wired** to the real backend | **~50–55%** | E-commerce + auth/profile + doctor discovery work. Appointments/booking, most of admin, doctor slot mgmt, documents, notifications do **not**. |
| **True end-to-end functional completeness vs PRD deliverables** | **~45–55%** | Because the most important clinical flow (book → consult) and admin management don't connect. |
| UI/UX vs "clean, modern, healthcare-oriented" (PRD §5) | **~40%** | Functional Tailwind UI, but ad-hoc, inconsistent tokens, no component system. |

### 2.2 PRD module-by-module (verified)

| PRD area | Status | Evidence / why |
|---|---|---|
| Auth: JWT, bcrypt, RBAC | ✅ Solid | `auth.middleware.js`, `jwt.util.js`, `auth.controller.js`. |
| Auth: **Login actually works** | 🔴 **Broken** | `Login.jsx:23-25` posts only `{ email }` — **password is never sent**; backend requires both (`auth.controller.js:92`). No one can log in through the UI against the real API. |
| Auth: OTP login / forgot-reset password | 🔴 Missing | Only password path exists; no OTP, no reset. |
| User: profile, addresses, cart | ✅ Wired | `/auth/me`, `/users/me/addresses`, `/users/me/cart*` all match. |
| Doctor discovery + filters | 🟡 Partial | Category/rating/availability work; **distance filter absent** — search is a city regex (`user.controller.js:20`), no coordinates on `AddressSchema`. |
| Appointment booking flow | 🔴 **Broken wiring** | `DoctorBooking.jsx` calls `/booking/calculate-cost` and `/appointment-requests` — **neither route exists**; the real endpoint is `POST /api/appointments`. |
| Appointment management | 🔴 **Broken wiring** | `Appointments.jsx` calls `/appointment-requests/*` and `/appointments/patient/:roleId`, reads flat fields (`appointmentStartDateTime`, `consultationFees`), uses `user.roleId` (never set) and `response.data.filter` (envelope is `{success,data}`). Backend uses `/appointments` + JWT identity + nested `schedule.*`/`financials.*`. |
| Video consultation | 🔴 Faked | `Appointments.jsx:497` falls back to `https://meet.viqure.com/${_id}` (dead domain). `meeting.meetingId/meetingLink` schema fields are never populated. |
| E-commerce: catalog→cart→checkout→orders | ✅ Wired | `Shop`, `ProductDetail`, `Cart`, `Checkout`, `Orders`, `OrderDetail` all hit real routes. |
| **Online payment** | 🔴 ~COD only | `order.controller.js:76` sets payment status to `PENDING` on **both** branches of the COD ternary — payment is a literal no-op. No Razorpay/Stripe SDK. `recordPayment` trusts an arbitrary `transactionId` with no signature check. |
| Order lifecycle + inventory | ✅ Solid | confirm→ship→deliver(OTP)→cancel/return + stock decrement/restock all real. |
| Reviews & ratings | ✅ Built | `review.*` + doctor rating recompute (`appointment.controller.js:302`). |
| Admin: approve/reject doctors, users, analytics, payments, issues | ✅ **Backend built**, 🔴 **frontend mis-wired** | Backend has `/admin/doctors/pending`, `PATCH /admin/doctors/:id/approve`, `/admin/analytics`, etc. Frontend calls `/admin/stats` (≠ `/admin/analytics`, different shape), `/admin/products` & `/admin/categories` (don't exist — real paths are `/products`, `/categories`), `/admin/pending-doctors` (≠ `/admin/doctors/pending`), and uses **PUT** where backend uses **PATCH**. |
| Admin: product management | ✅ Backend / 🔴 frontend path | CRUD lives at `/products` (admin-guarded), not `/admin/products`. |
| Admin: content management (PRD 2.4) | 🔴 Missing | Only category management exists. |
| In-app notifications | 🔴 Broken | `NotificationBell.jsx` polls `/admin/notifications*` every 30s — **no such model/controller/route**. Also a shape bug: it does `response.data.filter` on a `{success,data}` envelope. |
| Email & SMS | 🔴 Missing | No nodemailer/Twilio. Delivery OTP is **returned in the API response** (`order.controller.js:174-178`) instead of sent. |
| Google Maps / geo | 🔴 Missing | No SDK, no lat/long, no distance query. |
| File uploads (avatars, docs, product images, medical records) | 🔴 Mocked | `upload.middleware.js` returns `mock://…` URLs — no Cloudinary/S3. |
| Product Manager dashboard (2.5, optional) | 🔴 0% | Role enum is `CUSTOMER/DOCTOR/ADMIN` only (`user.model.js:88`); controller comments reference a non-existent PM role. |
| Security: input validation | 🟡 Manual | Per-controller checks only; no Joi/Zod. |
| Testing (PRD §5: "proper testing before handover") | 🔴 0% | `npm test` is an echo stub; no tests exist. |
| API + DB documentation deliverable | ✅ Present | `VIQURE_DB_API_CONTRACTv1.md` (183 KB) — but it should be reconciled with the actual routes. |

### 2.3 Additional defects found (fix during the work)

- **`app.js:50-52`** — `app.get("/jsonData", … User.find())` but `User` is **not imported** in `app.js` → `ReferenceError` (500) if that path is ever hit. Dead debug route; delete it.
- **`auth.controller.js:13` `/api/auth/jsonData`** dumps **all users** — remove before handover.
- **`axiosConfig.js:21-24`** logs every POST/PUT/PATCH body **and headers (including the `Authorization` bearer token)** to the console — strip in production.
- **Pricing mismatch:** `Checkout.jsx` shows 5% tax + ₹40 shipping; `order.controller.js` stores ₹49 delivery and **no tax** → the total the user sees ≠ the total stored.
- **`jwt.util.js:3`** falls back to `'dev-only-secret'` if `JWT_SECRET` is unset — enforce a real secret in prod.
- **`server.js:6`** uses `PORT = process.env.PORT` with the `|| 5500` fallback commented out — app will misbehave if `PORT` is unset.
- **CORS** allows **all** origins when `CORS_ORIGINS` is empty (`app.js:24`).
- **Dead code:** `client/server.js` (65 KB json-server-style mock) + `client/src/db.json` (39 KB). This mock is the contract the broken frontend pages were written against — removing it forces (and reveals) the real-API wiring.

---

## 3. Design System audit & Ant Design v6 migration

### 3.1 Audit (current state)

**Components reviewed:** 6 shared + 26 page surfaces · **Design-system score: ~25/100** (functional but unsystematized).

**Token coverage**

| Category | Defined as tokens? | Hardcoded usage found |
|---|---|---|
| Colors | ❌ `tailwind.config.js` `theme.extend` is empty | Brand color is inconsistent: `index.css` declares `--primary: sky-500 / --secondary: emerald`, but the app uses `bg-blue-600` everywhere (`App.jsx`, `Homepage.jsx`, etc.). Hundreds of inline hex/utility colors. |
| Spacing | ❌ default scale only | Arbitrary padding/margins inline per page. |
| Typography | ❌ | `Inter` set in `index.css`; sizes are ad-hoc (`text-2xl`, `text-4xl` …). |
| Elevation/radius/motion | ❌ | Shadows/radii inline; `* { transition: all }` global (a perf smell). |

**Component completeness**

| Component | States | Variants | A11y | Score |
|---|---|---|---|---|
| Button | inline only | none | none | 2/10 |
| Input/Select | inline | none | labels only | 3/10 |
| Card (doctor/stat/product) | bespoke per page | none | none | 3/10 |
| Table (`DataTable.jsx`) | manual sort/paginate | none | none | 4/10 |
| Modal | hand-rolled fixed overlays | none | no focus-trap/Esc | 2/10 |
| Toast | `react-hot-toast` + a second `ToastNotification.jsx` | — | partial | 4/10 |

**Priority actions:** (1) adopt a real token layer; (2) replace bespoke widgets with one library; (3) standardize states & a11y. All three are exactly what adopting Ant Design gives you.

### 3.2 Target: Ant Design **v6** (verified current)

- **antd v6 is GA and natively supports React 19** — which this project uses (`react ^19.2`). The old `@ant-design/v5-patch-for-react-19` shim is **not** needed on v6. (If you stayed on antd v5 you'd have to add that patch, since v5 supports only React 16–18.)
- Install: `antd@^6 @ant-design/icons@^6`. v6 requires React 18+, uses CSS variables by default, and drops a few legacy APIs (`Button.Group`→`Space.Compact`, `BackTop`→`FloatButton.BackTop`, children-based `Menu/Breadcrumb`→`items`).

### 3.3 How to do the full replacement (the right long-term path)

1. **Theme foundation (≈1 day).** Wrap the app in `<ConfigProvider theme={{ token: {...}, components: {...} }}>`. Define a healthcare palette (calm teal/blue primary, success/warn/error, neutral grays), radius, font. This becomes the single source of truth that the empty `tailwind.config.js` never was. Remove Tailwind, PostCSS, `index.css` globals, and the dead `App.css` Vite boilerplate.
2. **Shared components → AntD (≈1 day).** Navbar → `Layout.Header` + `Menu` + `Dropdown` + `Badge`; `NotificationBell` → `Badge` + `Popover` + `List`; `DataTable` → AntD `Table` (built-in sort/filter/pagination — deletes a lot of code); `StatCard` → `Card` + `Statistic`; `LoadingSpinner` → `Spin`; toasts → `App.useApp().message/notification` (one system, removing the duplicate).
3. **Pages → AntD (≈13 days).** Forms via `Form` + `Input`/`Select`/`DatePicker`/`Upload` with built-in validation; the hand-rolled modals → `Modal`; admin tables → `Table`; the multi-step `DoctorBooking` → `Steps` + `Form`. ~10 simple pages × ~0.35d + ~16 complex pages × ~0.6d.
4. **Responsive + accessibility + polish (≈2 days).** AntD's `Grid`/`Row`/`Col`, focus-trapped modals, keyboard nav, contrast pass.

**Full-replacement effort: ~15–18 engineer-days.** Doing the revamp *page-by-page at the same time* as the integration rewrite (Section 4) saves a few days versus doing them separately.

---

## 4. Full frontend↔backend integration — what & how

This splits into **(A) reconnecting the existing screens to the real API** and **(B) building the four external integrations the PRD mandates**, plus **(C) file storage**.

### 4.A Reconcile the client to the real contract

| Item | What's wrong now | What to do | Effort |
|---|---|---|---|
| **Login** | password not sent | Send `{email,password}`; on success store token/user/role; verify `/auth/me` bootstrap on reload. | 0.5d |
| **Appointment booking** | calls non-existent `/booking/calculate-cost`, `/appointment-requests` | Rewrite `DoctorBooking` to load slots from the doctor's `detailsOfHealthCareProfessional.timeSlots` (via `/users/doctors/:id`) and `POST /appointments {doctorId, slotId, reason, consultationType}`. Compute fee+18% client-side or trust the returned appointment. | 1.5d |
| **Appointment management** | `/appointment-requests/*`, `/appointments/patient/:roleId`, flat fields, wrong envelope, `roleId` | Rewrite `Appointments` to `GET /appointments` (JWT identity, read `res.data.data`), map nested `schedule.*`/`financials.*`, and the real lifecycle (`BOOKED→CONFIRMED→COMPLETED`/`CANCELLED`/`REJECTED`) via the `PATCH /:id/confirm|reject|cancel|complete` endpoints. **Decision:** the backend has no "request / change-request / patient-response" workflow — either *simplify the UI to the real lifecycle* (cheaper, recommended) or *build that workflow in the backend* (adds ~2–3d). | 2–4d |
| **Admin dashboard** | `/admin/stats` (≠`/admin/analytics`, different shape) | Point to `/admin/analytics`; map nested `{users,bookings,revenue}` to the cards. | 0.5d |
| **Admin doctors** | `/admin/doctors`, `/admin/pending-doctors`, PUT verbs, delete | Use `GET /admin/doctors/pending`, `PATCH …/approve|reject`; add backend `GET /admin/doctors` (list all) + soft-delete if the UI needs them. | 1d |
| **Admin products** | `/admin/products`, `/admin/categories` don't exist | Repoint to `/products` (admin-guarded) and `/categories`. | 0.5d |
| **Admin patients/orders/categories/appointments** | mixed | Repoint to `/admin/users`, `/orders`, `/categories`, `/appointments`; fix PATCH/PUT + envelopes. | 1d |
| **Doctor settings/slots** | `/users/doctors/:id`, `/users/doctors/:id/generate-slots` don't exist | Use `/doctors/me/profile` and `/doctors/me/slots` (GET/POST/DELETE). Build "generate-slots" backend helper if you keep that UX. | 1d |
| **Documents** | `/patients/:id`, `/doctors/:id` (wrong) | Wire to `/medical-records` (role-scoped). | 0.5d |
| **Envelope/shape normalization** | several pages assume arrays | Add an axios response unwrap or fix per page so everything reads `{success,data,pagination}`. | 0.5–1d |

**Reconciliation subtotal: ~9–12 engineer-days.**

### 4.B External integrations (PRD §3.2 — explicit deliverables)

**1) Payment — Razorpay (recommended for INR).** *Effort ~3–4d.*
How: `npm i razorpay` (backend) + Razorpay checkout script (frontend). Add `POST /payments/order` that creates a Razorpay order for a cart-order or appointment and returns `{orderId, amount, key}`. Frontend opens Razorpay Checkout; on success it returns `razorpay_payment_id/order_id/signature`. Add `POST /payments/verify` that recomputes the HMAC-SHA256 signature with `RAZORPAY_KEY_SECRET` and **only then** flips `paymentDetails.status` to `SUCCESS/PAID` (replace the no-op ternary at `order.controller.js:76` and the unverified `recordPayment`). Add a webhook for async capture. Test mode first.

**2) Video consultation.** *Effort: Jitsi ~1.5d / Agora full ~3–5d.*
- **Fast path — Jitsi Meet (free, no signaling server):** on appointment confirm, set `meeting.meetingId = viqure-<appointmentId>` and `meeting.meetingLink = https://meet.jit.si/viqure-<appointmentId>`; render with the Jitsi iframe (`@jitsi/react-sdk`) on an in-app call page gated by role + time window. This alone converts video from *fake* to *working*.
- **Controlled path — Agora/Daily:** SDK + server token generation + custom call UI; better branding/recording, more time.

**3) Email + SMS.** *Effort ~2–3d.*
Email via `nodemailer` (SMTP) or Resend — transactional templates for registration, booking confirmation, order confirmation, doctor approval. SMS via **MSG91/Twilio** for India. Move the delivery OTP off the API response and onto SMS/email; this also unlocks email-OTP login/reset if you add it.

**4) Google Maps + geo distance (PRD 2.1).** *Effort ~2–3d.*
Add `location: { type:'Point', coordinates:[lng,lat] }` to the address schema + a `2dsphere` index. Geocode on address save (Google Geocoding API). Add a `$near` query for the distance filter and a Maps display on the doctor detail page. Seed Noida coordinates.

### 4.C File storage (replace the mock). *Effort ~1–2d.*
`multer` (memory) + Cloudinary (or S3) SDK; real upload for avatars, doctor documents, product images and medical records, replacing the `mock://` util.

### 4.D Notifications (fix the broken feature). *Effort ~2–3d.*
Add a `Notification` model + controller + routes (`GET /notifications`, `PATCH /:id/read`, `PATCH /read-all`) at the path the bell expects, emit on doctor-approval / new-order / new-appointment, and fix the `response.data` shape bug. Optional real-time via `socket.io`.

---

## 5. Deployment & DevOps — what & how. *Effort ~2–3d.*

| Step | How |
|---|---|
| Database | MongoDB Atlas (free M0 to start), IP allowlist, connection string → `MONGODB_URI`. Run `npm run seed`. |
| Backend host | Render or Railway (Node 20+, `npm start`). Set env: `MONGODB_URI`, `JWT_SECRET` (strong), `JWT_EXPIRES_IN`, `PORT`, `CORS_ORIGINS`, plus Razorpay/SMTP/Cloudinary keys. |
| Frontend host | Vercel/Netlify; build `vite build`; set `VITE_APP_API_URL` to the backend URL (note: the Vite proxy in `vite.config.js` points at `https://localhost:5500` — production uses the env var, not the proxy). |
| CORS/SSL/domain | Put the deployed frontend origin in `CORS_ORIGINS`; HTTPS is automatic on these hosts; map a domain if available. |
| CI (optional but ideal) | GitHub Action: install → lint → test → build on PR. |
| Smoke test | Run every flow against prod with a seeded demo account. |
| Handover | Remove dead mock + debug routes; reconcile `VIQURE_DB_API_CONTRACTv1.md`; write README/runbook; transfer the repo to the company GitHub org (PRD §4). |

---

## 6. Security, validation & testing (PRD §3.3 + §5)

- **Validation (~2d):** add Zod (or Joi) schemas per route; centralize 400s.
- **Auth hardening (~1–2d):** forgot/reset password; optional email-OTP login; enforce `JWT_SECRET`.
- **Security cleanup (~1d):** strip token logging in `axiosConfig`, delete `/jsonData` routes, tighten CORS, tune rate-limit, add helmet CSP.
- **Testing (~3–5d):** Jest + Supertest (auth, booking, checkout, payment-verify), Vitest + RTL for critical components, a Playwright smoke run of the main flows. PRD explicitly requires "proper testing… before handover."

---

## 7. Complete-scope effort model & realistic timeline

| # | Workstream | Solo eng-days |
|---|---|---|
| 1 | Ant Design v6 **full** replacement | 15–18 |
| 2 | FE↔BE integration reconciliation (4.A, 4.D) | 11–15 |
| 3 | Payment (Razorpay) | 3–4 |
| 4 | Video consultation | 3–5 |
| 5 | Email + SMS | 2–3 |
| 6 | Google Maps + geo distance | 2–3 |
| 7 | File storage (Cloudinary) | 1–2 |
| 8 | Security + validation | 3–4 |
| 9 | Auth: forgot/reset + OTP | 1–2 |
| 10 | Automated testing pass | 3–5 |
| 11 | Deployment + CI | 2–3 |
| 12 | Cleanup + docs + handover | 1–2 |
| | **Line-item total** | **~47–66 eng-days** |
| | **Net of overlap** (revamp + integration on the same pages) | **~50–60 eng-days** |

**Calendar translation** (at ~5 productive days/week)

| Team | Calendar for "complete" |
|---|---|
| **Solo** | **~10–12 working weeks** |
| 2 devs (1 FE + 1 BE) | ~5–6 weeks |
| Squad of 3–4 (FE/BE/QA/lead) | ~3–4 weeks |

**4 days solo ≈ 0.8 of one week ≈ ~7% of the remaining work.** Hence Section 8.

---

## 8. The 4-day plan (given the 5th-day deadline)

**Strategy: make the core product genuinely work end-to-end and get it deployed — prioritize *function* over *cosmetics* and over *optional* features.** This directly serves the PRD's hard rule that "all major user flows must be fully functional before final submission," and it's the version that survives a live demo. Cosmetic-first (full AntD revamp over broken flows) would look nicer but fail the demo — not recommended.

Assume ~8–9 focused hours/day.

**Day 1 — Reconnect & clean (make auth + admin real)**
- Fix `Login` (send password), verify session bootstrap + role redirects. *(1.5h)*
- Repoint **all admin pages** to real endpoints — `/admin/analytics`, `/admin/doctors/pending` + `PATCH approve/reject`, products→`/products`, patients→`/admin/users`, orders→`/orders`, categories→`/categories`, appointments→`/appointments`; fix PUT→PATCH and envelopes. *(4.5h)*
- Delete dead mock (`client/server.js`, `src/db.json`), strip axios token logging, remove the `/jsonData` routes (incl. the `app.js` crash). *(1h)*
- Smoke-test auth + admin. *(1h)*

**Day 2 — Core clinical flow (the heart of the product)**
- Rewrite `DoctorBooking` → `GET /users/doctors/:id` for slots + `POST /appointments`. *(3.5h)*
- Rewrite `Appointments` → `GET /appointments` (JWT, `res.data.data`, nested fields) + real lifecycle PATCHes; **simplify** away the request/change-request UI the backend doesn't support. *(4h)*
- Smoke-test book → confirm → complete. *(0.5h)*

**Day 3 — Payment + Video + Email (the credibility integrations)**
- **Razorpay (test mode):** create-order + signature **verify** for product checkout *and* appointment booking; replace the no-op payment status. *(5h)*
- **Video via Jitsi:** populate `meeting.meetingLink` on confirm and use it in the Join button. Real, free, ~immediate. *(1.5h)*
- **Email (nodemailer):** registration + booking + order confirmations; move the delivery OTP to email. *(2h)*

**Day 4 — Theme polish + deploy**
- **AntD v6 theme + high-visibility shell only:** install antd v6, `ConfigProvider` healthcare theme, convert Navbar, Login, Homepage cards/search, and the Admin layout. (Full per-page replacement = Phase 2.) *(4h)*
- **Deploy:** Atlas + seed → backend on Render → frontend on Vercel → env + CORS + SSL → prod smoke test. *(4h)*
- Buffer. *(1h)*

**Day 5 (deadline) — Harden & hand over**
- Full regression of every flow on prod; seed demo accounts (patient/doctor/admin); write README + runbook + an explicit **"Done vs Phase 2"** note; transfer repo to the company GitHub org; record a 5-minute demo.

### Explicitly de-scoped to **Phase 2** (disclose to the client)
Full AntD replacement across all 26 pages · Google Maps distance search · SMS (if Day-3 runs over) · notifications backend + real-time · OTP login + forgot/reset password · Cloudinary uploads (stays mocked) · automated test suite · Product-Manager dashboard · the appointment change-request workflow.

> **Be straight with the client.** The PRD lists payment, video, email/SMS, maps and "proper testing" as deliverables. A 4-day solo sprint can credibly deliver **payment, video, email, and a working, deployed core product** — but *not* maps, SMS, full test coverage, or a full design-system replacement. Presenting the Phase-2 list up front is far better than shipping screens that 404 in a live demo.

---

## 9. Top risks

1. **Demo-day 404s** — the booking/admin pages look done but don't connect. Day 1–2 exist precisely to remove this risk.
2. **Payment signature step skipped under time pressure** — never mark paid without server-side HMAC verification; an unverified gateway is worse than COD-only.
3. **Secrets in the repo** — there are committed `.env` files; rotate `JWT_SECRET`/DB creds before the GitHub transfer and ensure `.env` is git-ignored.
4. **Scope creep on the AntD revamp** — it's the biggest single line item; keep it to theme+shell for the deadline or it will eat the integration time.

---

### Appendix A — Frontend calls with **no matching backend route** (fix list)
`POST /auth/login` (password omitted) · `GET /appointment-requests/patient|doctor/:roleId` · `POST /appointment-requests` · `PUT /appointment-requests/:id/(approve|cancel|request-change|patient-response)` · `GET /appointments/patient|doctor/:roleId` · `PUT /appointments/:id/cancel` (backend is PATCH) · `GET /doctors/:id/available-slots` · `POST /booking/calculate-cost` · `GET /admin/stats` · `GET /admin/products` · `GET /admin/categories` · `GET /admin/pending-doctors` · `PUT /admin/doctors/:id/(approve|reject)` (backend is PATCH) · `DELETE /admin/doctors/:id` · `GET/PUT /users/doctors/:id` + `/generate-slots` · `GET /patients/:id`, `GET /doctors/:id` (Documents) · `GET/PUT/DELETE /admin/notifications*`.

### Appendix B — Required environment variables
**Server:** `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CORS_ORIGINS`, `NODE_ENV`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, SMTP/`RESEND_API_KEY`, `CLOUDINARY_*`, (optional) `GOOGLE_MAPS_API_KEY`, SMS provider key.
**Client:** `VITE_APP_API_URL` (+ Razorpay public key for checkout).

### Appendix C — Stack (verified)
React 19.2 · Vite 8 · Tailwind 3.4 (→ replace with antd 6) · React Router 7 · framer-motion · react-hot-toast · Node + Express 5 · Mongoose 9 / MongoDB · JWT (jsonwebtoken 9) + bcryptjs · helmet + cors + express-rate-limit + morgan. No payment/email/SMS/video/maps/validation/test dependencies present.

*Sources for current framework facts: Ant Design v6 release & v5→v6 migration (ant.design), antd React 19 compatibility notes, Razorpay Node.js server integration docs.*
