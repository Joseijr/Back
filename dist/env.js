"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isDev = exports.isProd = void 0;
//type check environment variables
/*
    Custom env is a library built to make development more feasible by allowing multiple .env configurations for different environments. This is done by loading environment variables from a .env.envname file, into the node's process.env object.
*/
/*
    Zod is a TypeScript-first validation library. Define a schema and parse some data with it. You'll get back a strongly typed, validated result.
*/
// @ts-ignore
const custom_env_1 = require("custom-env");
const zod_1 = require("zod");
/*
    This line sets up a default value for the APP_STAGE environment variable using a common JavaScript pattern called "short-circuit evaluation" or the "OR operator default pattern". It ensures that APP_STAGE always has a value, even if it wasn't defined in your environment configuration.

    The expression process.env.APP_STAGE || 'dev' works by checking if process.env.APP_STAGE already has a truthy value. If APP_STAGE was defined in your .env file or system environment variables, it will use that existing value. However, if APP_STAGE is undefined, null, an empty string, or any other falsy value, the OR operator (||) will "short-circuit" and use the fallback value 'dev' instead.
*/
process.env.APP_STAGE = process.env.APP_STAGE || 'dev';
/*
    process is a global object in Node.js, not a regular variable. It's automatically available in every Node.js application without needing to import it.

    The process object provides information about, and control over, the current Node.js process. It represents the running instance of your Node.js application. Think of it as a bridge between your JavaScript code and the underlying operating system.
*/
const isProduction = process.env.APP_STAGE === 'production';
const isDevelopment = process.env.APP_STAGE === 'dev';
const isTesting = process.env.APP_STAGE === 'test';
if (isProduction) {
    (0, custom_env_1.env)('production');
}
else if (isDevelopment) {
    (0, custom_env_1.env)();
}
else if (isTesting) {
    (0, custom_env_1.env)('test');
}
/*
    This code defines a schema for environment variables using Zod, a TypeScript-first validation library. The schema acts as a blueprint that describes what your environment variables should look like and what values they're allowed to have.

    The envSchema constant creates a Zod object schema using z.object(), which is similar to defining a TypeScript interface but with runtime validation capabilities. Inside this schema, you're defining a single environment variable called NODE_ENV.

    The z.enum() validator specifies that NODE_ENV must be one of three exact string values: 'production', 'dev', or 'test'. This is more restrictive than a regular string type - it ensures that NODE_ENV can only be set to these specific values, preventing typos or invalid environment names. If someone tries to use 'development' or 'staging', for example, Zod will throw a validation error.

    This schema is typically used in conjunction with envSchema.parse() or envSchema.safeParse() to validate your actual environment variables at runtime. This gives you type safety for your configuration - TypeScript knows the exact types, and Zod ensures the values are correct when your application starts. It's a common pattern in modern TypeScript applications to catch configuration errors early rather than discovering them deep in your code execution.
*/
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(['production', 'dev', 'test'])
        .default('dev'),
    APP_STAGE: zod_1.z
        .enum(['production', 'dev', 'test'])
        .default('dev'),
    PORT: zod_1.z.coerce.number().positive().default(3000),
    DATABASE_URL: zod_1.z.string().regex(/^postgres(ql)?:\/\//, 'Invalid DATABASE_URL: must start with "postgresql://" or "postgres://"'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
    JWT_EXPIRES_IN: zod_1.z.string().default('1h'),
    BCRYPT_ROUNDS: zod_1.z.coerce.number().positive().min(1).max(20).default(12),
});
let env;
try {
    env = envSchema.parse(process.env);
}
catch (error) {
    if (error instanceof zod_1.z.ZodError) {
        console.error('Environment variable validation failed ' + JSON.stringify(zod_1.z.treeifyError(error), null, 2));
        error.issues.forEach((err) => {
            const path = err.path.join('.');
            console.error(`- ${path}: ${err.message}`);
        });
        //stop the application if env validation fails
        process.exit(1);
    }
    throw error;
}
const isProd = () => env.APP_STAGE === 'production';
exports.isProd = isProd;
const isDev = () => env.APP_STAGE === 'dev';
exports.isDev = isDev;
const isTest = () => env.APP_STAGE === 'test';
exports.isTest = isTest;
exports.default = env;
