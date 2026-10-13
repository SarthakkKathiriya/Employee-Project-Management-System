import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in the environment');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};

export default connectDB;
