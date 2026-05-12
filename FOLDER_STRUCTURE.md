# VIQURE PROJECT STRUCTURE

This file documents the current recommended folder structure for this repository after backend cleanup.

## Goals

- keep all backend runtime code under `server/`
- keep all frontend code under `client/`
- keep root-level files limited to workspace-level scripts and documentation
- avoid mixing controllers, middleware, and routes across multiple top-level folders

## Current canonical structure

```text
/viqure
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── appointment.controller.js
│   │   ├── auth.controller.js
│   │   ├── cart.controller.js
│   │   ├── doctor.controller.js
│   │   ├── doctorProfile.controller.js
│   │   ├── misc.controller.js
│   │   ├── order.controller.js
│   │   ├── patient.controller.js
│   │   ├── product.controller.js
│   │   ├── review.controller.js
│   │   └── slot.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── role.middleware.js
│   ├── models/
│   │   ├── index.js
│   │   ├── user.model.js
│   │   ├── doctor.model.js
│   │   ├── admins.model.js
│   │   ├── appointments.model.js
│   │   ├── slot.model.js
│   │   ├── cart.model.js
│   │   ├── categories.model.js
│   │   ├── consultations.model.js
│   │   ├── deliveries.model.js
│   │   ├── medicalRecords.model.js
│   │   ├── notifications.model.js
│   │   ├── orders.model.js
│   │   ├── payments.model.js
│   │   ├── products.model.js
│   │   └── reviews.model.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── appointments.routes.js
│   │   ├── auth.routes.js
│   │   ├── cart.routes.js
│   │   ├── doctors.routes.js
│   │   ├── orders.routes.js
│   │   ├── products.routes.js
│   │   ├── reviews.routes.js
│   │   └── slots.routes.js
│   ├── utils/
│   │   ├── jwt.util.js
│   │   ├── notification.util.js
│   │   └── response.util.js
│   └── server.js
├── .env
├── .gitignore
├── ACTIONABLE_ROADMAP.md
├── FOLDER_STRUCTURE.md
├── README.md
├── TASKS.md
├── package.json
├── package-lock.json
├── seed.js
└── test-connection.js
```

## Folder responsibilities

### `client/`

Frontend-only code lives here.

- `src/pages/`: route-level pages
- `src/components/`: reusable UI pieces
- `src/contexts/`: auth/global state providers
- `src/services/`: API clients and axios config
- `src/assets/`: images and static frontend resources

### `server/controllers/`

Each file should only contain request-handling logic.

- validate request payload basics
- call models/services
- build API responses
- avoid keeping route definitions here

### `server/middlewares/`

Keep Express middleware here.

- authentication
- role-based authorization
- upload middleware if added later
- centralized error middleware if added later

Do not store utility helpers here.

### `server/models/`

All Mongoose schemas and models belong here.

Rules:

- one model per file
- use lowercase file naming ending in `.model.js`
- export shared model references through `server/models/index.js`
- prefer importing from `../models` in controllers when possible

### `server/routes/`

Keep route wiring only.

Rules:

- one route file per feature area
- route file imports controller + middleware only
- no database logic inside route files

### `server/utils/`

Pure helper modules belong here.

- response helpers
- JWT helpers
- notification helpers
- constants and formatters if added later

## Root-level file policy

Root should stay thin.

Allowed at root:

- repo docs
- workspace-level `package.json`
- one-off scripts like `seed.js`
- environment file

Do not add these at root:

- controllers
- routes
- middlewares
- model files

## Problems that were cleaned up

These inconsistencies existed before cleanup:

- backend controllers were outside `server/`
- auth/role middleware lived under `server/utils/` instead of `server/middlewares/`
- an extra root `middlewares/` folder contained empty placeholder files
- route files were reaching outside `server/` to import controllers

The structure now follows one backend root: `server/`.

## Recommended next structure improvements

These are not required immediately, but they are the next best cleanup steps.

### Add `server/config/`

Move environment and DB setup into:

- `server/config/db.js`
- `server/config/env.js`

### Add `server/validations/`

Useful for:

- auth payload validation
- appointment payload validation
- cart/order request validation

### Add `server/services/`

Move multi-step business logic out of controllers later:

- booking service
- order service
- analytics service
- notification service

### Add `docs/`

Move future documentation into a dedicated folder:

- `docs/API_DOCS.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/BUGS.md`

## Naming conventions

Use these consistently:

- controllers: `feature.controller.js`
- routes: `feature.routes.js`
- models: `feature.model.js`
- middlewares: `name.middleware.js`
- utils: `name.util.js`

## Import conventions

Preferred backend import pattern:

```js
const { User, Doctor, Appointment } = require("../models");
const auth = require("../middlewares/auth.middleware");
const { sendSuccess } = require("../utils/response.util");
```

Avoid brittle imports like:

```js
require("../server/models/SomeModel");
require("../../controllers/some.controller");
```

Those are harder to maintain after refactors.
