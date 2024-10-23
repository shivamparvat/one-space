// db.ts
import mongoose from 'mongoose';

const connectToDatabase = async () => {
  console.log("first")
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit the process with failure code
  }
};

export default connectToDatabase;
