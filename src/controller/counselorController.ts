const Counselor = require('../model/counselorModel') 
const Services = require('../model/serviceModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Token = require('../model/tokenModel')
const{uploadToCloudinary,removeFromCloudinary} =require('../middlewears/cloudinary')



//  COUNSELOR SIGNUP
const signup = async (req,res) => {
  
    try {

        const {name,email,password,state,primaryAddress,profession,country,pincode,experience} = req.body

        
       
        
     
    
        
        
        const record = await Counselor.findOne({ email: email })
        if (record) {
            return res.status(400).send({
                message: "Email is already registered"
            })

            
        }else{
           
             
                
                const id_proof = req.files.idProof[0].path  
                const certificate = req.files.certificate[0].path
                const image1 = await uploadToCloudinary(id_proof,"counselor-idproof") 
                const image2 = await uploadToCloudinary(certificate,"counselor-certificate")
                const counselor = new Counselor({
                    name:name,
                    password:password,
                    email:email,
                    state:state,
                    address:primaryAddress,
                    service:profession,
                    country:country,
                    pincode:pincode,
                    experience:experience,
                    id_proof:image1.url,
                    id_proofPublicId:image1.public_id,
                    certificates:image2.url,
                    certificatesPublicId:image2.public_id
    
                })
    
                const result = await counselor.save()

                console.log(result);
                
          
                
                res.send({message:'success'})
            
            
        }

        
    } catch (error) {
        console.log(error.message);
        
    }
    }

const getServices = async(req,res)=>{
    try {
        const services = await Services.find({})
       
        res.send(services)
        


    } catch (error) {
        console.log(error.message);
        
    }
}

const counselorLogin = async(req,res)=>{
    try {
     
        console.log(req.body);
        
        
        const user = await Counselor.findOne({ email: req.body.email })
        if (!user) {
           
            return res.status(404).send({ message: 'user not found' })
        }
        if (!(await bcrypt.compare(req.body.password,user.password))) {
           
            return res.status(400).send({ message: "Password is incorrect" })
        }
        const token = jwt.sign({ _id: user._id }, "secret")
        res.cookie("C-Logged", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 })
        res.send({ message: "success" })
    }
        
     catch (error) {
        console.log(error.message);
        res.status(500).send({ message: "Internals Server Error" })
    }
}



module.exports ={
    signup,getServices,counselorLogin
} 