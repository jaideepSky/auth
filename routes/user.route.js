import express from 'express'
import { getMe, login, registerUser, verifyUser } from '../controllers/user.controller.js'
import { isLoggedIn } from '../middleware/auth.middleware.js'
const router = express.Router()
 router.post('/register',registerUser)
 router.get('/verify/:token',verifyUser)
 router.post('/login',login)
 router.post('/me', isLoggedIn,getMe)
 
export default router