import {
  timestamp,
  integer,
  json,
  pgTable,
  text,
  varchar,
  unique,
} from "drizzle-orm/pg-core";

/* ================= USERS ================= */
export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  credits: integer("credits").default(5),
});

/* ================= PROJECT ================= */
export const ProjectTable = pgTable("project", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  projectId: varchar("projectId", { length: 255 }).notNull().unique(),

  projectName: varchar("projectName", { length: 255 }),

  theme: varchar("theme", { length: 100 }),

  userInput: text("userInput"),

  device: varchar("device", { length: 50 }),

  createdOn: timestamp("createdOn").defaultNow(),

  config: json("config"),

  projectVisualDescription: text("projectVisualDescription"),

  userId: varchar("userId", { length: 255 })
    .references(() => usersTable.email)
    .notNull(),
});

/* ================= SCREEN CONFIG ================= */
export const ScreenConfigTable = pgTable(
  "screenConfig",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    projectId: varchar("projectId", { length: 255 })
      .notNull()
      .references(() => ProjectTable.projectId, { onDelete: "cascade" }),

    screenId: varchar("screenId", { length: 100 }).notNull(),

    screenName: varchar("screenName", { length: 255 }),

    purpose: text("purpose"),

    screenDescription: text("screenDescription"),

    code: text("code"),
  },
  (table) => ({
    uniqueScreen: unique().on(table.projectId, table.screenId),
  })
);