import { defineConfig } from "drizzle-kit";
import env from "./env";

export default defineConfig({
    //db connection
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL
    },
    //schema
    schema: "./src/db/schema.ts",
    //migrations
    out: "./migrations",
    //sql verbose logging
    verbose: true,
    //strict mode
    strict: true
});