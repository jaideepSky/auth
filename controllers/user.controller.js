import { json } from "stream/consumers";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(404).json({
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists !!",
      });
    }

    const user = await User.create({
      email,
      name,
      password,
    });
    console.log("User : ", user);
    if (!user) {
      return res.status(400).json({
        message: "User not registered",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    console.log("Token : ", token);
    user.verificationToken = token;
    await user.save();

    res.status(200).json({
      message: "User registered successfully!!",
      success: true,
    });
  } catch (error) {
    res.status(201).json({
      message: "User not registered !!",
      success: false,
      error,
    });
  }
};

const verifyUser = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({
      message: "Invalid Token!!",
    });
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return res.status(400).json({
      message: "Invalid Token!!",
    });
  }
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    console.log(token)

      const cookieOption = {
        httpOnly : true, 
        secure : true,
        maxAge : 24*60*60*1000
      }
      res.cookie("token",token , cookieOption)
      res.status(200).json({
        success : true,
        message : "Login Successfull",
        token,
        user:{
          id : user._id,
          name : user.name,
          role : user.role
        }
      })
  } catch (error) {
    res.status(201).json({
      message: "User not login !!",
     
    });
  }
};

const getMe =  async (req , res)=>{
  
}

const logout =  async (req , res)=>{

}

const forgotPassword =  async (req , res)=>{

}

const resetPassword =  async (req , res)=>{

}

export { registerUser, verifyUser , login , getMe , logout , forgotPassword , resetPassword };
