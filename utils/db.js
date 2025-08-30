import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const db =  ()=>{
    mongoose.connect(process.env.DATABASE_URL)
    .then(()=>{
        console.log("MongoDB Connected !!")
    })
    .catch((error)=>{
        console.log("Error occur to connect to MongoDB !!")
    })

}

export {db}