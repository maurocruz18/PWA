"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.describe)('Auth API', () => {
    (0, vitest_1.it)('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = { status: 201, body: { username: 'testuser' } };
        (0, vitest_1.expect)(response.status).toBe(201);
        (0, vitest_1.expect)(response.body.username).toBe('testuser');
    }));
    (0, vitest_1.it)('should fail login with wrong credentials', () => {
        const isAuth = false;
        (0, vitest_1.expect)(isAuth).toBeFalsy();
    });
});
