"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateUser(username, password) {
        const user = await this.prisma.users.findUnique({
            where: { username },
            include: {
                jobs: true,
                departments_users_department_idTodepartments: {
                    include: {
                        sites: {
                            include: {
                                regions: {
                                    include: {
                                        companies: true,
                                    },
                                },
                            },
                        },
                    },
                },
                user_roles: {
                    include: {
                        roles: true,
                    },
                },
            },
        });
        if (!user || !user.is_active) {
            throw new common_1.UnauthorizedException('Invalid credentials or inactive account');
        }
        if (!user.password_hash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const { password_hash, ...result } = user;
        return result;
    }
    async getUserById(id) {
        const user = await this.prisma.users.findUnique({
            where: { id },
            include: {
                jobs: true,
                departments_users_department_idTodepartments: {
                    include: {
                        sites: {
                            include: {
                                regions: {
                                    include: {
                                        companies: true,
                                    },
                                },
                            },
                        },
                    },
                },
                user_roles: {
                    include: {
                        roles: true,
                    },
                },
            },
        });
        if (!user || !user.is_active) {
            return null;
        }
        const { password_hash, ...result } = user;
        return result;
    }
    async updateProfile(userId, data) {
        const user = await this.prisma.users.update({
            where: { id: userId },
            data: {
                email: data.email,
                phone_number: data.phone_number || data.phone,
                mobile_number: data.mobile_number,
                first_name: data.first_name,
                last_name: data.last_name,
            },
        });
        const { password_hash, ...result } = user;
        return result;
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
        });
        if (!user || !user.password_hash) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                password_hash: hashedPassword,
            },
        });
    }
    getUserRoles(user) {
        return user.user_roles?.map((ur) => ur.roles.name) || [];
    }
    hasRole(user, requiredRole) {
        const roles = this.getUserRoles(user);
        return roles.includes(requiredRole) || roles.includes('system_super_admin');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map