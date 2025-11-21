"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ai_controller_1 = require("./ai.controller");
const ai_service_1 = require("./ai.service");
const ai_fallback_service_1 = require("./ai-fallback.service");
const time_entry_entity_1 = require("../entities/time-entry.entity");
const leave_application_entity_1 = require("../entities/leave-application.entity");
const schedule_entity_1 = require("../entities/schedule.entity");
const pay_calculation_entity_1 = require("../entities/pay-calculation.entity");
const user_entity_1 = require("../entities/user.entity");
const department_entity_1 = require("../entities/department.entity");
const shift_type_entity_1 = require("../entities/shift-type.entity");
const role_entity_1 = require("../entities/role.entity");
const user_role_entity_1 = require("../entities/user-role.entity");
const auth_module_1 = require("../auth/auth.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                time_entry_entity_1.TimeEntry,
                leave_application_entity_1.LeaveApplication,
                schedule_entity_1.Schedule,
                pay_calculation_entity_1.PayCalculation,
                user_entity_1.User,
                department_entity_1.Department,
                shift_type_entity_1.ShiftType,
                role_entity_1.Role,
                user_role_entity_1.UserRole,
            ]),
            auth_module_1.AuthModule,
        ],
        controllers: [ai_controller_1.AiController],
        providers: [ai_service_1.AiService, ai_fallback_service_1.AiFallbackService],
        exports: [ai_service_1.AiService, ai_fallback_service_1.AiFallbackService],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map