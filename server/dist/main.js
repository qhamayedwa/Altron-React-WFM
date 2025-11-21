"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const PostgresSessionStore = (0, connect_pg_simple_1.default)(express_session_1.default);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    if (!process.env.SESSION_SECRET) {
        throw new Error('SESSION_SECRET environment variable is required');
    }
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required');
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.use((0, express_session_1.default)({
        store: new PostgresSessionStore({
            conObject: {
                connectionString: process.env.DATABASE_URL,
            },
            createTableIfMissing: true,
            tableName: 'session',
            pruneSessionInterval: 60 * 15,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        },
    }));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    app.enableCors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    });
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 WFM24/7 Server running on http://0.0.0.0:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map