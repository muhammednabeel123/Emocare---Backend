const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../model/userModel')

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
            // jwt token
            const {_id} = await result.toJSON()
            const token = jwt.sign({_id:_id},"secret")
            res.cookie("userReg",token,{
                httpOnly:true,
                maxAge:24*60*60*1000
            })
    
            res.send({
                message:"success"
            })  
        }

       
        
    } catch (error) {
        console.log(error);
        
    }
}

module.exports = {
    userRegistration
}