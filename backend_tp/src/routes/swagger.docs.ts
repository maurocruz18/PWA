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

// ==========================================
// AUTH ROUTES
// ==========================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Fazer login na plataforma
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciais inválidas
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registar novo utilizador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Utilizador criado com sucesso
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obter dados do utilizador atual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do utilizador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /auth/qr-login:
 *   post:
 *     summary: Login via QR Code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrToken:
 *                 type: string
 *                 description: Token lido do QR Code
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 */

/**
 * @swagger
 * /auth/generate-qr-token:
 *   get:
 *     summary: Gerar token para QR Code (Para ser lido por outro dispositivo)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token gerado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qrToken:
 *                   type: string
 */

// ==========================================
// USERS ROUTES
// ==========================================

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos os utilizadores
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de utilizadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /users/my-clients:
 *   get:
 *     summary: Obter clientes do PT logado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /users/request-pt:
 *   post:
 *     summary: Cliente solicita um PT
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ptId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pedido efetuado
 */

/**
 * @swagger
 * /users/available-pts:
 *   get:
 *     summary: Listar PTs validados e disponíveis
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de PTs
 */

// ==========================================
// PLANS ROUTES
// ==========================================

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Listar planos de treino (do cliente ou criados pelo PT)
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de planos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plan'
 *   post:
 *     summary: Criar um novo plano de treino (Apenas PT)
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               clientId:
 *                 type: string
 *               exercises:
 *                 type: array
 *     responses:
 *       201:
 *         description: Plano criado
 */

/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     summary: Obter detalhes de um plano
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes do plano
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plan'
 */

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * @swagger
 * /admin/pending-pts:
 *   get:
 *     summary: Listar PTs pendentes de validação
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de PTs pendentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /admin/users/{userId}/validate:
 *   patch:
 *     summary: Validar (aprovar) um PT
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PT validado com sucesso
 */

export {};