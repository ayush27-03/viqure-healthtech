# SEED DUPLICATE KEY FIX

## File modified

- [server/models/doctor.model.js](/D:/viqure/server/models/doctor.model.js:1)

## Old index definition

The `userId` field did not explicitly declare sparse behavior:

```js
userId: {
  type: Schema.Types.ObjectId,
  ref: 'User',
}
```

The active MongoDB index causing the failure was:

```text
userId_1
```

with unique behavior already present in the database.

## New index definition

```js
userId: {
  type: Schema.Types.ObjectId,
  ref: 'User',
  unique: true,
  sparse: true,
}
```

## Why duplicate null values failed

The seed inserts multiple doctor documents with:

```js
userId: null
```

MongoDB unique indexes allow only one document for a repeated indexed value.

Without `sparse: true`, `null` is still indexed, so multiple seeded doctors with `userId: null` collide on the same unique key and produce:

```text
E11000 duplicate key error ... index: userId_1 dup key: { userId: null }
```

With `sparse: true`, documents where `userId` is missing are excluded from that unique index, so multiple unlinked seeded doctors can coexist.

Important detail:

- sparse indexes skip missing fields
- sparse indexes do not solve the problem if the field is explicitly stored as `null`

That is why the hotfix also removes `default: null` from `userId`, so seeded doctors that do not provide `userId` will omit the field entirely instead of storing `null`.

## Seed scan findings

### Does seed use `insertMany`?

Yes.

Examples:

- patients
- doctors
- categories
- products
- deliveries
- reviews
- notifications

### Does seed clear collections before insert?

Yes.

`resetCollections()` calls `deleteMany({})` across the seeded collections before inserting data.

### Is the current seed rerunnable / idempotent?

Partially.

- It is rerunnable in the sense that it clears collections first and then recreates data.
- It is not idempotent in the stricter sense of upserting by stable keys.
- It currently depends on successful full collection clearing before reinsert.

## Minimum safe change to make seeding rerunnable

Minimum change:

- replace bulk destructive reset + blind inserts for the key identity records with `updateOne(..., { upsert: true })` or `findOneAndUpdate(..., { upsert: true })` keyed by stable unique fields like:
  - admin: `email`
  - patient: `email`
  - doctor: `email` or `licenseNumber`
  - category: `slug`
  - product: `slug`

That would make reruns safer even if a previous partial seed left data behind.
