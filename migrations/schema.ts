import { boolean, pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  carnet: text("carnet").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  secondary_phone: text("secondary_phone"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const post_categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const post = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category")
    .notNull()
    .references(() => post_categories.name),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  authorUsername: text("author_username").notNull(),
  image: text("image"),
  item_status: text("item_status").notNull().default("lost"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipient_id: uuid("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actor_id: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  post_id: uuid("post_id").references(() => post.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("post_request"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  is_read: boolean("is_read").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(post),
  receivedNotifications: many(notifications, { relationName: "recipient" }),
  sentNotifications: many(notifications, { relationName: "actor" }),
}));

export const postsRelations = relations(post, ({ one, many }) => ({
  user: one(users, {
    fields: [post.user_id],
    references: [users.id],
  }),
  postCategory: one(post_categories, {
    fields: [post.category],
    references: [post_categories.name],
  }),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipient_id],
    references: [users.id],
    relationName: "recipient",
  }),
  actor: one(users, {
    fields: [notifications.actor_id],
    references: [users.id],
    relationName: "actor",
  }),
  post: one(post, {
    fields: [notifications.post_id],
    references: [post.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Post = typeof post.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const insertPostSchema = createInsertSchema(post);
export const insertNotificationSchema = createInsertSchema(notifications);

export const selectUserSchema = createSelectSchema(users);
export const selectPostSchema = createSelectSchema(post);
export const selectNotificationSchema = createSelectSchema(notifications);