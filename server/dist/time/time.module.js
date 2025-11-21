"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const time_controller_1 = require("./time.controller");
const time_service_1 = require("./time.service");
const time_entry_entity_1 = require("../entities/time-entry.entity");
const department_entity_1 = require("../entities/department.entity");
const user_entity_1 = require("../entities/user.entity");
const auth_module_1 = require("../auth/auth.module");
let TimeModule = class TimeModule {
};
exports.TimeModule = TimeModule;
exports.TimeModule = TimeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([time_entry_entity_1.TimeEntry, department_entity_1.Department, user_entity_1.User]),
            auth_module_1.AuthModule,
        ],
        controllers: [time_controller_1.TimeController],
        providers: [time_service_1.TimeService],
        exports: [time_service_1.TimeService],
    })
], TimeModule);
//# sourceMappingURL=time.module.js.map