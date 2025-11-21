"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
const path_1 = require("path");
exports.typeOrmConfig = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [(0, path_1.join)(__dirname, '..', 'entities', '*.entity{.ts,.js}')],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DATABASE_URL?.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
};
//# sourceMappingURL=typeorm.config.js.map