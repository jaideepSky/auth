import express from 'express'
import { forgotPassword, getMe, login, logout, registerUser, resetPassword, verifyUser } from '../controllers/user.controller.js'
import { isLoggedIn } from '../middleware/auth.middleware.js'
const router = express.Router()
 router.post('/register',registerUser)
 router.get('/verify/:token',verifyUser)
 router.post('/login',login)
 router.get('/me', isLoggedIn,getMe)
 router.get('/logout', isLoggedIn,logout)
 router.post('/forgot', isLoggedIn,forgotPassword)
 router.post('/reset/:resetToken', isLoggedIn,resetPassword)
 
export default router