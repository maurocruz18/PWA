"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Apenas ficheiros de imagem são permitidos'), false);
    }
};
const limits = {
    fileSize: 5 * 1024 * 1024
};
exports.uploadSingle = (0, multer_1.default)({
    storage,
    fileFilter,
    limits
}).single('image');
exports.uploadMultiple = (0, multer_1.default)({
    storage,
    fileFilter,
    limits
}).array('images', 5);
exports.default = { uploadSingle: exports.uploadSingle, uploadMultiple: exports.uploadMultiple };
