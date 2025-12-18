import User from '../models/user.js';
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';


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


export const loginuser=async(req,res)=>{
  try{
    const {email,password}=req.body;
    const user=await User.findOne({email});
    if(!user) return res.status(400).json({message:"User not found"});
    const isPasswordValid=await bcrypt.compare(password,user.password);
    if(!isPasswordValid) return res.status(400).json({message:"Invalid password"});
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{
      expiresIn:"1h"
    })
    res.json({message:"Login successful",token})
    
  }catch(error){
    res.status(500).json({message:error.message})
  }
}