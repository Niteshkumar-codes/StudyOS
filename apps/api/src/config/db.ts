import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyos';
    await mongoose.connect(mongoURI);
     
    console.log('📦 Connected to MongoDB successfully.');
  } catch (error) {
     
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
