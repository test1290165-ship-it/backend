import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
   resetPasswordToken: String,
  resetPasswordExpires: Date,
  oldPassword: String,
  newPassword: String,
  confirmPassword: String,
  profilePhoto: String   ,
  // OTP-based password reset
  otpCode: String,
  otpExpires: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;

