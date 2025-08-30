import express from "express";
import dotenv from "dotenv"
import cors from 'cors'
import cookieParser from "cookie-parser";
import { db } from "./utils/db.js";
import userRoute from './routes/user.route.js'

const  app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

dotenv.config({
    path : './.env'
})
const port = process.env.PORT || 4000


app.get('/' , (req , res)=>{
    res.send("Hello")

})

db()
app.use('/api/v1/users',userRoute)

app.listen(port , ()=>{
    console.log("Server listen at Port : " , port)
})