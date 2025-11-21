"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaFallbackMiddleware = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
let SpaFallbackMiddleware = class SpaFallbackMiddleware {
    use(req, res, next) {
        const { method, url } = req;
        if (method === 'GET' && !url.startsWith('/auth') && !url.startsWith('/time') &&
            !url.startsWith('/leave') && !url.startsWith('/scheduling') &&
            !url.startsWith('/payroll') && !url.startsWith('/ai') &&
            !url.startsWith('/organization') && !url.startsWith('/notifications') &&
            !url.startsWith('/sage-vip') && !url.startsWith('/reports') &&
            !url.startsWith('/dashboard') && !url.startsWith('/assets')) {
            const indexPath = (0, path_1.join)(__dirname, '..', '..', 'client', 'dist', 'index.html');
            if ((0, fs_1.existsSync)(indexPath)) {
                res.sendFile(indexPath);
                return;
            }
        }
        next();
    }
};
exports.SpaFallbackMiddleware = SpaFallbackMiddleware;
exports.SpaFallbackMiddleware = SpaFallbackMiddleware = __decorate([
    (0, common_1.Injectable)()
], SpaFallbackMiddleware);
//# sourceMappingURL=spa-fallback.middleware.js.map