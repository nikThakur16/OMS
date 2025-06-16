const  mongoose= require('mongoose')
const dotenv = require('dotenv')
const express = require('express')
const app = express()

dotenv.config()

mongoose.connect('mongodb://localhost:27017/omsDB').then(()=>console.log('connected to mongodb')).catch((err)=>console.log(err));


app.get('/',(req,res)=>{
    res.send('OMS BACKEND')
})

app.listen(process.env.port,()=>{
    console.log('server is running')
});

