# ViQure Healthtech — Project Status & Technical Decision Report

**Prepared for:** Leadership / project sponsor review
**Stack:** MERN — MongoDB (Mongoose 9) · Express 5 · React 19 + Ant Design 6 + Tailwind (Vite) · JWT auth · Razorpay
**Companion docs:** `MVP_EXECUTION_PLAN.md` (delivery plan) · `VIDEO_CONSULTATION_ARCHITECTURE.md` (video blueprint) · `ViQure_Technical_Assessment.md`
**Date:** 08 August 2026

---

## 1. Executive summary (the 60-second version)

The platform's **commerce and clinical-operations core is functional**: registration/login, doctor discovery, slot booking, the full e-commerce catalogue→cart→checkout→tracking flow, and the admin control panel all work against a live MongoDB Atlas backend with 73 REST endpoints.

Since the last update we closed the single biggest PRD deliverable — **online payments** — and stood up a **working video-consultation demo**. Two headline engineering decisions drove this period:

1. **Payments → Razorpay, fully integrated.** One unified, security-hardened payment module now covers *both* money flows (product orders **and** consultation fees). Amounts are server-authoritative and every payment is verified by server-side signature check. **This is done.**
2. **Video → pivoted from Agora to LiveKit.** Video was first proven end-to-end on Jitsi (fastest zero-cost demo). For production the original choice was Agora; on evaluation we **shifted to LiveKit** because it gives near-CPaaS development speed *while keeping ownership of the media path* — a hard requirement for Indian telemedicine compliance (DPDP Act + Telemedicine Practice Guidelines). The full LiveKit target architecture is already blueprinted.

**Overall MVP completion: ~68%** (feature-weighted, see §4). The remaining third is concentrated in four areas: **production video (LiveKit)**, **email/SMS + in-app notifications**, **distance/maps filtering**, and **security hardening + automated testing** before handover.

**What is genuinely solid today:** payments code, the e-commerce lifecycle, the admin dashboard, and role-based auth. **What is demo-grade and needs the planned build:** live video.

---

## 2. Key technical decisions — Payments (Razorpay)

> Context: The PRD (§3.2) requires an integrated payment gateway ("Razorpay / Stripe or equivalent"). Two distinct flows need paying for: healthcare **product orders** and **appointment consultation fees**.

### 2.1 Decision log

| # | Decision | Justification (why this, not the alternative) |
|---|---|---|
| P1 | **Razorpay** over Stripe | India-first: native UPI, RuPay, netbanking, and cards; test mode works **without completing KYC** (unblocks development immediately); INR-native settlement. Stripe's India support is weaker for UPI and onboarding is heavier. |
| P2 | **One unified payment module** for both order and appointment flows (a single `context: 'ORDER'\|'APPOINTMENT'` parameter) | Avoids two divergent payment code paths that drift apart. One controller, one signature-verification routine, one client helper — half the surface area to secure and test. |
| P3 | **Server is the source of truth for the amount** — the charge is always recomputed from the DB (`pricing.finalAmount` / `financials.totalAmount`), never taken from the request body | The most important security line in the module. If the browser could name its own price, a user could pay ₹1 for a ₹500 order. Non-negotiable for a payment system. |
| P4 | **Server-side signature verification** with a constant-time HMAC compare (`crypto.timingSafeEqual`) before anything is marked paid | Only a signature Razorpay itself produced with our secret key can pass. The browser cannot forge a "paid" state, and the timing-safe compare avoids signature-guessing side channels. |
| P5 | **Removed the old "trust-me" `PATCH /appointments/:id/payment` endpoint** | It set an appointment to PAID on the client's say-so with no gateway proof — an unverified-payment backdoor. Superseded by the verified Razorpay flow. |
| P6 | **COD preserved; online orders gated** — an admin cannot confirm an unpaid online order (`confirmOrder` requires `status === 'SUCCESS'` for non-COD) | Keeps the cash-on-delivery path working unchanged while ensuring prepaid orders are genuinely paid before fulfilment. |
| P7 | **Pay-on-book with a retry button** (UX) | After booking/checkout, Razorpay opens immediately; if the user dismisses it, the order/appointment is saved as *pending* and a "Pay Now" button lets them complete it later. No lost bookings, no orphaned unpaid records that can't be recovered. |

### 2.2 What was built

- **Backend:** `payment.controller.js` + `payment.routes.js` mounted at `/api/payments` — `POST /order` (creates the gateway order) and `POST /verify` (signature check). `gatewayOrderId` added to the order and appointment payment schemas to link our records to Razorpay's. Checkout/confirm logic tightened.
- **Frontend:** a `razorpay.js` helper + the Razorpay Checkout SDK; wired into Checkout, Order detail ("Pay Now"), the (rewritten) booking flow, and the appointments list.

### 2.3 Honest status

The payment **code is complete and verified to load/run**. Live end-to-end charging needs two operational inputs that are the business's to provide, not code:
- Real Razorpay **test keys** in `.env` (currently placeholders).
- Future-dated doctor **slots** (the seed data is dated 2025, so the booking screen correctly shows "no slots" until re-seeded).

---

## 3. Key technical decisions — Video Consultation

> Context: PRD §3.2 asks for "Video Consultation Integration (WebRTC / Agora or similar)." §15 of the compliance analysis makes clear that for Indian telemedicine, *where the PHI-bearing media flows* is a regulatory question, not just a technical one.

### 3.1 The decision that matters: Agora → **LiveKit**

**We first proved the feature on Jitsi**, deliberately, as a throwaway demo scaffold: on doctor-confirm the server mints a room and the patient/doctor join it in-app via `/consultation/:id`. This validated the *end-to-end product flow* (book → pay → confirm → join) at zero cost and zero vendor onboarding — but public Jitsi (`meet.jit.si`) is **not securable or compliant** for real patients (no access control, no call lifecycle, client-only join checks).

For production, the original decision was **Agora** (a managed CPaaS). **We have shifted to LiveKit.** The reasoning:

| Criterion | Agora (managed CPaaS) | **LiveKit (chosen)** | Why it decided the pivot |
|---|---|---|---|
| **Media ownership / data residency** | Media transits Agora's cloud — you don't control the path | Self-hostable OSS SFU pinned to an **India region** | DPDP + Telemedicine Guidelines want PHI-bearing media under our control. This is the deciding factor. |
| **Development speed** | Fast (SDKs) | **Comparably fast** — first-class Node (`livekit-server-sdk`) + React (`@livekit/components-react`) SDKs drop into our exact MERN stack | "Benefits of LiveKit meant fast development" — we keep near-CPaaS velocity without giving up ownership. |
| **Access control** | Vendor tokens | **JWT room tokens with per-role grants** (publish/subscribe/roomAdmin) | Exactly the primitive our access model needs; identities tie back to our `User` records. |
| **Recording** | Cloud recording (per-minute) | **Egress** to our own India-region encrypted storage | Consent-gated recording that never leaves the country. |
| **Cost model** | Per-minute media billing | **Fixed self-hosted infra** (economical at 1:1 telehealth volume) | Predictable cost; media/upload bandwidth is the only variable. |
| **Exit option** | Locked to vendor | **Lift-and-shift to LiveKit Cloud with zero code change** | De-risks the ops burden of self-hosting. |

**One-line summary for leadership:** *Agora would have been fast but outsources our patients' video to a third party we can't control; LiveKit gives us the same development speed while keeping the media — and the compliance obligation — in our own hands, in India.*

### 3.2 Honest status

Video is **~25% complete**: the demo flow works and the *product* UX is proven, but the production build (LiveKit SFU, tokenized access, call lifecycle, waiting room, recording, compliance controls) is **specified but not yet built**. The full blueprint and a 15–22-day phased plan already exist in `VIDEO_CONSULTATION_ARCHITECTURE.md`.

---

## 4. Current completion by PRD feature

Percentages are feature-weighted engineering judgement, grounded in the codebase. Legend: ✅ done · 🟡 partial · 🔴 not started / demo-only.

| PRD area | Status | % | Notes |
|---|---|---|---|
| **Auth & profile** (register, login, profile mgmt, RBAC) | ✅ | 85% | Password login + JWT + role guards work. Gaps: OTP-login option and password-**reset** backend are not wired (frontend shells exist). |
| **Doctor discovery & filters** (category, rating, availability) | ✅ | 80% | Works. **Distance filter not built** (no geo/Maps yet). |
| **Appointment booking & lifecycle** (slots, book, accept/reject, history, earnings) | ✅ | 80% | Booking rewired to the real slot model; doctor confirm/reject/complete + earnings page present. |
| **Online payments (orders + consultations)** | ✅ | 90% | **Done.** Needs live keys to demo end-to-end (§2.3). |
| **Live video consultation** | 🔴 | 25% | Jitsi demo works; production LiveKit build not started (§3). |
| **E-commerce** (catalogue, cart, checkout, tracking, inventory) | ✅ | 90% | Full lifecycle functional incl. delivery-OTP flow. |
| **Admin dashboard** (approvals, users, products, categories, analytics, payments, issues) | ✅ | 85% | Broad coverage; "basic content management" is thin. |
| **Reviews & ratings** | ✅ | 80% | Backend + feedback flow; recomputes doctor rating. |
| **Email & SMS notifications** | 🔴 | 10% | Not built. In-app notification bell exists but polls an endpoint that returns 403/404 (Phase 2 work). |
| **Maps / distance search** | 🔴 | 5% | Not started. |
| **Security hardening** (RBAC, bcrypt, validation, common-vuln protection) | 🟡 | 65% | bcrypt, RBAC, `JWT_SECRET` load order and `trust proxy` are correct. **Open:** rate limiter is commented out; public `GET /auth/jsonData` still dumps the users collection; CORS falls open when unset. |
| **Testing & documentation** | 🟡 | 40% | Manual API testing partial; API contract exists; **zero automated tests** (`npm test` is a stub). |
| Product-Manager dashboard (PRD §2.5, *optional*) | — | — | Descoped — admin covers product/stock management. |

**Weighted overall MVP completion: ≈ 68%.**

---

## 5. What actually works today (verified, not aspirational)

Confirmed by running the stack (backend on :5500 against Atlas, client on :5173) and exercising it in a browser:

- ✅ **The app builds and boots** cleanly on the upgraded stack (React 19 / antd 6 / Vite 8) after resolving a set of merge conflicts that had been blocking the client build.
- ✅ **Auth works** — logged in as a seeded customer; JWT issued; role-based routing enforced.
- ✅ **Doctor discovery renders** — homepage lists real seeded doctors from the API with filters and pagination.
- ✅ **Booking screen works** against the real slot model (correctly shows availability; empty only because seed slots are back-dated).
- ✅ **Appointments & orders screens render** with the new pay/join/confirm actions.
- ✅ **Razorpay SDK loads** and the payment endpoints are mounted and syntactically verified; the client opens Checkout on order/booking.
- ✅ **Video demo path is implemented** — confirming an appointment generates a room; the in-app consultation page mounts it.

> Not yet demonstrated live (and honestly flagged): a *completed* Razorpay charge (needs real test keys) and a *two-party* video call on production infrastructure (that's the LiveKit build).

---

## 6. Pragmatic roadmap to finish the MVP

Ordered by value-to-effort, drawing on the two existing plans so this is execution, not re-planning.

### Near-term unblock (hours, not days)
- Drop in **real Razorpay test keys** and **re-seed with future-dated slots** → payments demoable end-to-end today.
- **Quick security wins:** delete the public `/auth/jsonData` endpoint; re-enable the rate limiter (both are a few lines). These are cheap and materially reduce exposure.

### Phase A — Notifications + auth completion (~3–4 days)
- Email (transactional) + the dormant in-app notification model/endpoints; activate the existing `fcmToken` plumbing later.
- Finish **password reset** (backend for the existing UI) and lifecycle emails (order/appointment confirmations, delivery-OTP by email).

### Phase B — Production video on LiveKit (~15–22 days, phased) 🔴 the big one
- Follow `VIDEO_CONSULTATION_ARCHITECTURE.md`: LiveKit SFU + tokenized access + payment-gated join + call lifecycle (Phase 1 = "safe for real patients"), then recording/consent/resilience (Phase 2), then scale/observability (Phase 3).

### Phase C — Distance filter + Maps (~1–2 days)
- MongoDB geospatial (`$geoNear`) + a "near me" UI; embedded map needs no paid key for the core requirement.

### Phase D — Hardening, testing & handover (~2–4 days)
- Automated test suite (unit + integration for the payment and auth authorization matrices), API contract v2, README, and the GitHub repo transfer per PRD §4.

**Critical path to a defensible MVP handover:** Near-term unblock → Phase B Phase-1 (safe video) → Phase A → Phase D. Video is the long pole; everything else is days, not weeks.

---

## 7. Risks & things I want on the record

| # | Item | Impact | Recommendation |
|---|---|---|---|
| 1 | **Live video is demo-grade** on public Jitsi | Not safe/compliant for real patients | Prioritise LiveKit Phase 1; it's the gate to "real telemedicine". |
| 2 | **`/auth/jsonData` exposes the users collection** publicly | Data-exposure risk | Delete now (few minutes). |
| 3 | **Rate limiter disabled** | Abuse/DoS exposure | Re-enable (few minutes). |
| 4 | **No automated tests** | Regression risk at handover | Phase D; PRD §5 requires testing before submission. |
| 5 | **Client is mid-upgrade** to antd 6 (some legacy `Steps.Step` usages on non-critical pages still crash) | Two register pages need a small fix | Quick, isolated conversions. |
| 6 | Stack decisions (LiveKit self-host vs Cloud; SMS provider; recording retention) | Ops/compliance | Confirm with team per `VIDEO_CONSULTATION_ARCHITECTURE.md` §20. |

---

*This report reflects the codebase as of 08 Aug 2026 and is intended to be read alongside `MVP_EXECUTION_PLAN.md` and `VIDEO_CONSULTATION_ARCHITECTURE.md`.*
