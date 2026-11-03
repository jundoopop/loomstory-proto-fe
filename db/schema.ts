import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
export const users = sqliteTable("users", {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  name: text().notNull(),
  password: text().notNull(),
  role: text().notNull().default("member"),
});
export const sessions = sqliteTable("sessions", {
  id: text().primaryKey(),
  userId: text("user_id").notNull(),
  expires: integer().notNull(),
});
export const models = sqliteTable("models", {
  id: text().primaryKey(),
  data: text().notNull(),
});
export const items = sqliteTable("items", {
  id: text().primaryKey(),
  ownerId: text("owner_id").notNull(),
  modelId: text("model_id"),
  authenticity: text().notNull().default("not_assessed"),
  custody: text().notNull().default("not_received"),
});
export const submissions = sqliteTable("submissions", {
  id: text().primaryKey(),
  ownerId: text("owner_id").notNull(),
  itemId: text("item_id").notNull(),
  state: text().notNull().default("draft"),
  revision: integer().notNull().default(1),
  reviewedRevision: integer("reviewed_revision"),
  data: text().notNull(),
  created: text().notNull(),
  updated: text().notNull(),
});
export const media = sqliteTable("media", {
  id: text().primaryKey(),
  ownerId: text("owner_id").notNull(),
  submissionId: text("submission_id").notNull(),
  objectKey: text("object_key"),
  derivativeKey: text("derivative_key"),
  mime: text().notNull(),
  width: integer().notNull(),
  height: integer().notNull(),
  slot: text().notNull(),
  fixture: text(),
  rights: text().notNull(),
  publicPermission: integer("public_permission").notNull().default(0),
});
export const recognition = sqliteTable("recognition", {
  id: text().primaryKey(),
  submissionId: text("submission_id").notNull(),
  revision: integer().notNull(),
  data: text().notNull(),
  created: text().notNull(),
});
export const reviews = sqliteTable("reviews", {
  id: text().primaryKey(),
  submissionId: text("submission_id").notNull(),
  revision: integer().notNull(),
  reviewerId: text("reviewer_id").notNull(),
  decision: text().notNull(),
  reason: text().notNull(),
  data: text().notNull(),
  created: text().notNull(),
});
export const claims = sqliteTable("claims", {
  id: text().primaryKey(),
  submissionId: text("submission_id").notNull(),
  revision: integer().notNull(),
  state: text().notNull(),
  data: text().notNull(),
});
export const listings = sqliteTable("listings", {
  id: text().primaryKey(),
  itemId: text("item_id").notNull().unique(),
  submissionId: text("submission_id"),
  state: text().notNull().default("draft"),
  revision: integer().notNull(),
  data: text().notNull(),
});
export const interests = sqliteTable(
  "interests",
  {
    id: text().primaryKey(),
    memberId: text("member_id").notNull(),
    listingId: text("listing_id").notNull(),
    created: text().notNull(),
  },
  (t) => [uniqueIndex("interest_member_listing").on(t.memberId, t.listingId)],
);
export const reports = sqliteTable("reports", {
  id: text().primaryKey(),
  memberId: text("member_id").notNull(),
  listingId: text("listing_id").notNull(),
  reason: text().notNull(),
  state: text().notNull().default("open"),
  created: text().notNull(),
});
export const events = sqliteTable("events", {
  id: text().primaryKey(),
  actorId: text("actor_id"),
  action: text().notNull(),
  target: text().notNull(),
  mode: text().notNull().default("demo"),
  created: text().notNull(),
});
export const rateLimits = sqliteTable("rate_limits", {
  id: text().primaryKey(),
  count: integer().notNull(),
  expires: integer().notNull(),
});
