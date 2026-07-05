"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectNotificationSchema = exports.selectPostSchema = exports.selectUserSchema = exports.insertNotificationSchema = exports.insertPostSchema = exports.insertUserSchema = exports.notificationsRelations = exports.postsRelations = exports.usersRelations = exports.notifications = exports.post = exports.post_categories = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    carnet: (0, pg_core_1.text)("carnet").notNull().unique(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    //secondary_phone: text("secondary_phone"),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.post_categories = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.post = (0, pg_core_1.pgTable)("posts", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    category: (0, pg_core_1.text)("category")
        .notNull()
        .references(() => exports.post_categories.name),
    user_id: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(() => exports.users.id),
    authorUsername: (0, pg_core_1.text)("author_username").notNull(),
    image: (0, pg_core_1.text)("image"),
    item_status: (0, pg_core_1.text)("item_status").notNull().default("lost"),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.notifications = (0, pg_core_1.pgTable)("notifications", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    recipient_id: (0, pg_core_1.uuid)("recipient_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    actor_id: (0, pg_core_1.uuid)("actor_id").references(() => exports.users.id, { onDelete: "set null" }),
    post_id: (0, pg_core_1.uuid)("post_id").references(() => exports.post.id, { onDelete: "cascade" }),
    type: (0, pg_core_1.text)("type").notNull().default("post_request"),
    title: (0, pg_core_1.text)("title").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    is_read: (0, pg_core_1.boolean)("is_read").notNull().default(false),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    posts: many(exports.post),
    receivedNotifications: many(exports.notifications, { relationName: "recipient" }),
    sentNotifications: many(exports.notifications, { relationName: "actor" }),
}));
exports.postsRelations = (0, drizzle_orm_1.relations)(exports.post, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.post.user_id],
        references: [exports.users.id],
    }),
    postCategory: one(exports.post_categories, {
        fields: [exports.post.category],
        references: [exports.post_categories.name],
    }),
    notifications: many(exports.notifications),
}));
exports.notificationsRelations = (0, drizzle_orm_1.relations)(exports.notifications, ({ one }) => ({
    recipient: one(exports.users, {
        fields: [exports.notifications.recipient_id],
        references: [exports.users.id],
        relationName: "recipient",
    }),
    actor: one(exports.users, {
        fields: [exports.notifications.actor_id],
        references: [exports.users.id],
        relationName: "actor",
    }),
    post: one(exports.post, {
        fields: [exports.notifications.post_id],
        references: [exports.post.id],
    }),
}));
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.insertPostSchema = (0, drizzle_zod_1.createInsertSchema)(exports.post);
exports.insertNotificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notifications);
exports.selectUserSchema = (0, drizzle_zod_1.createSelectSchema)(exports.users);
exports.selectPostSchema = (0, drizzle_zod_1.createSelectSchema)(exports.post);
exports.selectNotificationSchema = (0, drizzle_zod_1.createSelectSchema)(exports.notifications);
