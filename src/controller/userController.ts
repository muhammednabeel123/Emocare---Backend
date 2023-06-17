const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../model/userModel')
const Token = require('../model/tokenModel')
const SendEmail = require("../utilities/sendmail")
const cryptos = require("crypto")
import * as dotenv from "dotenv";
dotenv.config();

const userRegistration = async (req,res) => {
    try {
        let email = req.body.email
        let password = req.body.password
        let name = req.body.name
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const record = await User.findOne({email:email})

        if(record){
            return res.status(400).send({
                message:"Email is already registered"
            })
        }else{ 
            const user =  new User({
                name : name,
                email : email,
                password:hashedPassword
            })
            
            const result = await user.save()
            const emailtoken = await new Token({ userId:result._id,
                token:cryptos.randomBytes(32).toString("hex") }).save()
                const url = `${process.env.BASE_URL}user/${user._id}/verify/${emailtoken.token}`
                await SendEmail(user.email,"verify email",url)
                const {_id} = await result.toJSON()
                const token = jwt.sign({_id:_id},"secret")
                res.cookie("userReg",token,{
                    httpOnly:true,
                    maxAge:24*60*60*1000
                })
                res.status(201).send({
                    message: "mail sented",
                    token: emailtoken.token,
                    userId: user._id
                  });
                  
            // jwt token
          
    
            // res.send({
            //     message:"success"
            // })  
        }

       
        
    } catch (error) {
        console.log(error);
        
    }
}

const mailVerify = async (req,res) =>{
    try {
        const user = await User.findOne({_id:req.params.id});
        console.log(user,"ther");
        
        if(!user) return res.status(404).send({message:"Invalid link"})
        const token = await Token.findOne({
            userId:user._id,
            token:req.params.token
        })
        if(!token)return res.status(400).send({message:"invalid link"})
        await User.updateOne({_id:user._id},{$set:{verified:true}})
        await Token.deleteOne({token:req.params.token})
        
        
        res.redirect(process.env.BASE_URL2);
       

    } catch (error) {
        res.status(500).send({message:"Internals Server Error"})
    }
} 

const getUser = async (req,res) => {
  
    try {
        const cookie = req.cookies['userReg']
        const  claims = jwt.verify(cookie,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const user = await User.findOne({_id:claims._id})
        const {password,...data} = await user.toJSON()
        res.send(data)

    } catch (error) {
        console.log("anything here");
        
        return res.status(401).send({
            message:'unauthenticated'
        })
        
    }
    
}

const login = async(req,res) =>{
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(404).send({ message:'user not found' })
    }
    if(!(await bcrypt.compare(req.body.password,user.password))){
        return res.status(400).send({ message:"Password is incorrect"})
    }
    const token = jwt.sign({_id:user._id},"secret")
    res.cookie("userReg",token,{httpOnly:true,maxAge:24*60*60*100})
    res.send({message:"success" })
}

const logout = async (req,res) =>{
    res.cookie("userReg","",{maxAge:0})
    res.send({
        message:"success"
    })

}

module.exports = {
    userRegistration,
    getUser,logout,login,mailVerify
}