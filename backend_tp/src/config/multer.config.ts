import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas ficheiros de imagem são permitidos'), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits
}).single('image');

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits
}).array('images', 5);

export default { uploadSingle, uploadMultiple };