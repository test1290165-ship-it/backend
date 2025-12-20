import User from '../models/user.js';
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';
import BlacklistedToken from '../models/BlacklistedToken.js';
import mongoose from 'mongoose';
import crypto from "crypto";
import nodemailer from "nodemailer";

// CREATE USER

export const createUser = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Validation
    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobile,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Login user

export const loginusers=async(req,res)=>{
    try {
        const {email,password}=req.body;

        if(!email||!password){
            return res.status(400).json({message:"All fields are required"});
        }

        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User not found"});
        }

        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid password"});
        }

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{
            expiresIn:"1h"
        });
        const userdata={
          id:user._id,
          name:user.name,
          email:user.email,
          mobile:user.mobile
        }

        res.status(200).json({message:"Login successful",token,userdata});        
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}


//Get user by id

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params; // URL se id milegi

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("-password"); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//Logout user

export const logoutUser = async (req, res) => {
  try {
    const token = req.token;
    const decoded = req.user;

    await BlacklistedToken.create({
      token,
      expiresAt: new Date(decoded.exp * 1000),
    });

    return res.status(200).json({ message: "Logout successful" });

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in DB with expiry 5 minutes
    user.otpCode = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Attempt to send the OTP via email in all environments.
    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: "Password Reset OTP",
        text: `Your password reset OTP is: ${otp}. It will expire in 5 minutes.`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: "OTP sent to email" });
    } catch (mailError) {
      console.error("Error sending reset OTP email:", mailError.message || mailError);
      return res.status(500).json({
        message: "Could not send OTP email",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// reset password 
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // 1️⃣ Validation
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    // 2️⃣ Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3️⃣ Validate OTP and expiry
    if (!user.otpCode || !user.otpExpires) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "OTP wrong" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 4️⃣ Update password
    user.password = await bcrypt.hash(newPassword, 10);
    // Clear OTP fields after successful reset
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//upload profile photo

export const uploadProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { profilePhoto: req.file.path },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile photo uploaded successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//



