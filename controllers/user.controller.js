import { User } from "../models/user.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer'
import dotenv from 'dotenv' 
dotenv.config()

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

    // Looking to send emails in production? Check out our Email API/SMTP product!
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "26fd5256970177",
    pass: "015c46ce8f04c0"
  }
});

const mailOptions = {
    from: '26fd5256970177',
    to: user.email,
    subject: "Verify your email",
    text: `Please click on the following link:
    ${process.env.BASE_URL}/api/v1/users/verify/${token}
    `, // plain‑text body
    // HTML body
  }
  await transport.sendMail(mailOptions);

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
  const {token} = req.params;
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

  return res.status(200).json({
    success: true,
    message: "Email Verified Successfully!!",
  });
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
  try {
    console.log("Reached at profile level")
    const user = await User.findById(req.user.id).select("-password")
    if(!user){
      return res.status(400).json({
        success:false,
        message:"User not found"
      })
    }

    return res.status(200).json({
      success:true,
      message:"Login Successfully",
      user
    })
  } catch (error) {
    
  }
}

const logout =  async (req , res)=>{
  res.cookie("token",'',{})
  return res.status(200).json({
    success:true,
    message:"Logout Successfully"
  })
}

const forgotPassword =  async (req , res)=>{
  const {email} = req.body
  if(!email){
    return res.status(400).json({
      success:false,
      message:"Email is required"
    })
  }
  try {
    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success:false,
        message:"User not found"
      })
    }
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetExpire = Date.now() + 10*60*1000 // 10 minutes
    user.resetPasswordToken = resetToken
    user.resetPasswordTokenExpiry = resetExpire
    await user.save()

    const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "26fd5256970177",
    pass: "015c46ce8f04c0"
  }
});

const mailOptions = {
    from: '26fd5256970177',
    to: user.email,
    subject: "Reset your email",
    text: `Please click on the following link:
    ${process.env.BASE_URL}/api/v1/users/reset/${resetToken}
    `, // plain‑text body
    // HTML body
  }
  await transport.sendMail(mailOptions);

  } catch (error) {
    
  }
}

const resetPassword =  async (req , res)=>{

  const {resetToken} = req.params
  const {password} = req.body
  if(!resetToken){
    return res.status(400).json({
      success:false,
      message:"Invalid reset token"
    })
  }
  if(!password){
    return res.status(400).json({
      success:false,
      message:"Password is required"
    })
  }
  try {
    const user = await User.findOne({
      resetPasswordToken : resetToken,
      resetPasswordTokenExpiry : {$gt : Date.now()}
    })
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordTokenExpiry = undefined
    await user.save()
    return res.status(200).json({
      success:true,
      message:"Password reset successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }

}

export { registerUser, verifyUser , login , getMe , logout , forgotPassword , resetPassword };
