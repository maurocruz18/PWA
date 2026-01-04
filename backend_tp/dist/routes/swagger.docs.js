"use strict";
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do utilizador
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [ADMIN, PT, CLIENT]
 *         isValidated:
 *           type: boolean
 *           description: Se o PT foi validado pelo Admin
 *         ptId:
 *           type: string
 *           description: ID do PT associado (para Clientes)
 *         profileImage:
 *           type: string
 *     LoginInput:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           default: admin
 *         password:
 *           type: string
 *           default: "123456"
 *     RegisterInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [CLIENT, PT]
 *           default: CLIENT
 *     Plan:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         exercises:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               sets:
 *                 type: number
 *               reps:
 *                 type: string
 * tags:
 *   - name: Auth
 *     description: Autenticação e Gestão de Sessão
 *   - name: Users
 *     description: Gestão de Utilizadores e Clientes
 *   - name: Plans
 *     description: Planos de Treino (PTs e Clientes)
 *   - name: Admin
 *     description: Rotas de Administração
 */
Object.defineProperty(exports, "__esModule", { value: true });
