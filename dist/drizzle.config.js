"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
const env_1 = __importDefault(require("./env"));
exports.default = (0, drizzle_kit_1.defineConfig)({
    //db connection
    dialect: "postgresql",
    dbCredentials: {
        url: env_1.default.DATABASE_URL
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
