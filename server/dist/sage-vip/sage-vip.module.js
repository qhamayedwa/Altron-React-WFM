"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SageVipModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sage_vip_controller_1 = require("./sage-vip.controller");
const sage_vip_service_1 = require("./sage-vip.service");
const time_entry_entity_1 = require("../entities/time-entry.entity");
const leave_application_entity_1 = require("../entities/leave-application.entity");
const user_entity_1 = require("../entities/user.entity");
const pay_code_entity_1 = require("../entities/pay-code.entity");
let SageVipModule = class SageVipModule {
};
exports.SageVipModule = SageVipModule;
exports.SageVipModule = SageVipModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, time_entry_entity_1.TimeEntry, leave_application_entity_1.LeaveApplication, pay_code_entity_1.PayCode])],
        controllers: [sage_vip_controller_1.SageVipController],
        providers: [sage_vip_service_1.SageVipService],
        exports: [sage_vip_service_1.SageVipService],
    })
], SageVipModule);
//# sourceMappingURL=sage-vip.module.js.map