import { date, integer, json, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  credits: integer("credits").default(5),
});

export const ProjectTable = pgTable('project',{
  id:integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId: varchar().notNull(),
  projectName:varchar(),
  theme:varchar(),
  userInput:varchar(),
  device:varchar(),
  createdOn:date().defaultNow(),
  config:json(),
  projectVisualDescription:text(),
  userId: varchar().references(()=> usersTable.email).notNull()
})

export const ScreenCongifTable=pgTable('screenConfig',{
  id:integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId:varchar().references(()=>ProjectTable.projectId),
  screenId:varchar(),
  screenName:varchar(),
  purpose:varchar(),
  screenDescription:varchar(),
  code:text(),
})