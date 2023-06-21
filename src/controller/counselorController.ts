const Counselor = require('../model/counselorModel') 


const signup = async (req,res) => {
  
    try {

        const {name,email,password,state,primaryAddress,profession,country,pincode,experience} = req.body
   
        
        
        const record = await Counselor.findOne({ email: email })
        if (record) {
            return res.status(400).send({
                message: "Email is already registered"
            })
        }else{
            const counselor = new Counselor({
                name:name,
                password:password,
                email:email,
                state:state,
                address:primaryAddress,
                profession:profession,
                country:country,
                pincode:pincode,
                experience:experience,
                id_proof:req.files['idProof'][0].filename,
                certificates:req.files['certificate'][0].filename

            })

            const result = await counselor.save()
            console.log(result,"this is  result");
            
            res.send({message:'success'})
            
        }

        
    } catch (error) {
        console.log(error.message);
        
    }
    
    
    
}

module.exports ={
    signup
} 