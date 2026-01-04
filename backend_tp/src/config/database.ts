import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pt_platform');
    console.log('📦 MongoDB Ligado com sucesso');
  } catch (error) {
    console.error('Falha na ligação à base de dados', error);
    process.exit(1);
  }
};