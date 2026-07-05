"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./src/app"));
const env_1 = __importDefault(require("./env"));
//import created routes
const postRoutes_1 = __importDefault(require("./src/routes/postRoutes"));
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./src/routes/userRoutes"));
const notificationRoutes_1 = __importDefault(require("./src/routes/notificationRoutes"));
//use routes
app_1.default.use('/api/posts', postRoutes_1.default);
app_1.default.use('/api/auth', authRoutes_1.default);
app_1.default.use('/api/users', userRoutes_1.default);
app_1.default.use('/api/notifications', notificationRoutes_1.default);
app_1.default.use('/api', (req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});
app_1.default.listen(env_1.default.PORT, () => {
    console.log(`Server running on port ${env_1.default.PORT}`);
});
