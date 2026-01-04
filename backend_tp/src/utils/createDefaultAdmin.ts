import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export const createDefaultAdmin = async () => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ptplatform.com';

    const existingAdmin = await User.findOne({ username: adminUsername });

    if (existingAdmin) {
      if (existingAdmin.role !== 'ADMIN') {
        existingAdmin.role = 'ADMIN';
        existingAdmin.isValidated = true;
        await existingAdmin.save();
        console.log('Utilizador promovido a ADMIN');
      }
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = new User({
      username: adminUsername,
      password: hashedPassword,
      email: adminEmail,
      role: 'ADMIN',
      isValidated: true,
    });

    await admin.save();

    console.log('Conta ADMIN criada');
  } catch (error) {
    console.error('Erro ao criar admin padrão:', error);
  }
};