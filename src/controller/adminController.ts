import * as dotenv from "dotenv";
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Token = require('../model/tokenModel')
const cryptos = require("crypto")
const User = require('../model/userModel')
const Service = require('../model/serviceModel')
const Counselor = require('../model/counselorModel')
const SendEmail = require("../utilities/sendmail")
const { uploadToCloudinary, removeFromCloudinary } = require('../middlewears/cloudinary')
dotenv.config();

//
const adminLogin = async (req, res) => {
    try {
        console.log("hey there ");
        
        const a_email = process.env.ADMIN
        const a_password = process.env.ADMINPASS
        const { email, password } = req.body

        if (email.trim() === a_email.trim() && password.trim() === a_password.trim()) {
            const token = jwt.sign({ _id: "1234567890" }, "secret")
            res.cookie("adminLog", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 })
            console.log(token, "this token");

            res.json({ message: true })



        } else {
            res.json({ message: false })
        }


    } catch (error) {
        console.log(error.message);

    }
}

const getUsers = async (req, res) => {
    try {
        const cookie = req.cookies['adminLog']
        const claims = jwt.verify(cookie, "secret")
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })

        } else {
            const user = await User.find({})
            if (!user) { return res.status(404).send({ message: 'no users found' }) }
            else { res.send(user) }
        }


    } catch (error) {
        console.log(error);

    }
}

const blockUser = async (req, res) => {
    try {
        const cookie = req.cookies['adminLog']
        const claims = jwt.verify(cookie, "secret")
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })

        } else{
            const user = await User.findById({ _id: req.params.id });
            if (user.is_blocked) {
                console.log("here");
                
                user.is_blocked = false;
                await user.save();
                res.send({ message: "success" });
            } else {
                
                user.is_blocked = true;
                await user.save();
                res.send({ message: 'failed' });
            }
        }
        


        
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'An error occurred' });
    }
};

const getCounselor = async (req, res) => {
    try {
        const cookie = req.cookies['adminLog']
        const claims = jwt.verify(cookie, "secret")
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })

        } else {
            const counselor = await Counselor.find({}).populate('service');

            if (!counselor) {
                return res.status(404).send({ message: 'No users found' });
            }
            else { res.status(200).send(counselor); }
        }



    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'An error occurred' });


    }
}

const blockCounselor = async (req, res) => {
    try {
        const counselor = await Counselor.updateOne({ _id: req.params.id }, { $set: { is_Blocked: true } });
        res.status(200).send({ message: "Counselor blocked successfully" });

    } catch (error) {
        res.status(500).send({ message: 'An error occurred' });
    }
}

const unblockCounselor = async (req, res) => {
    try {
        const counselor = await Counselor.updateOne({ _id: req.params.id }, { $set: { is_Blocked: false } });
        res.status(200).send({ message: "Counselor unblocked successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'An error occurred' });
    }
}

const AcceptCounselor = async (req, res) => {
    try {
        const cookie = req.cookies['adminLog']
        const claims = jwt.verify(cookie, "secret")
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })

        } else {
            const id = req.body.id;
            const counselor = await Counselor.findById({ _id: id })

            function generateSimilarPassword(existingPassword) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let similarPassword = '';
                for (let i = 0; i < existingPassword.length; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    const existingChar = existingPassword.charAt(i);
                    similarPassword += Math.random() < 0.5 ? existingChar : characters.charAt(randomIndex);
                }
                return similarPassword;
            }
            const existingPassword = counselor.password;
            const name = counselor.name
      
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(existingPassword, salt)

            const url = `${process.env.BASE_URL2}/counselor-login`
            await SendEmail(counselor.email, "Your accound has been accepted",name,existingPassword,url)

            await Counselor.findByIdAndUpdate({ _id: id }, { $set: { is_verified: true, password:hashedPassword } })

            res.status(200).send({ message: "successfull" })

        }


    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'An error occurred' });
    }
}

const DeclineCounselor = async (req, res) => {
    try {
        const counselor = await Counselor.findByIdAndDelete(req.params.id);
        console.log(counselor, "this is counelor");

        if (!counselor) {
            return res.status(404).json({ message: 'Counselor not found' });
        }
        await SendEmail(counselor.email, "Request Declined", `your email is ${counselor.email} is declined please send the request again!! `)
        res.json({ message: 'Counselor deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }

}

const addService = async (req, res) => {


    try {
        const cookie = req.cookies['adminLog']
        const claims = jwt.verify(cookie, "secret")
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })

        } else {
            console.log(req.body, req.file, "hey  there")
            const { name, description } = req.body
            const image = req.file.path
            console.log(image, "hey image");
            const image1 = await uploadToCloudinary(image, "services")
            const services = new Service({
                name: name,
                description: description,
                Image: image1.url,
                Image_publicId: image1.public_id

            })
            const result = await services.save()
            res.json({ message: 'request submitted successfully' });
        }




    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });

    }
}

const getServices = async(req,res) =>{
    try {
        const cookie = req.cookies['adminLog']
        const claims = jwt.verify(cookie, "secret")
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })

        }else{ const services = await Service.find({})
            if(!services){
                return res.send({message:'no services recieved'})
            }
        

        res.send(services); }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}
const getCookie = async (req, res) => {
    try {
        console.log("here");
        
      const cookie = req.cookies['adminLog'];
      const claims = jwt.verify(cookie, "secret")
  
      if (claims) {
        res.json({ isAuthenticated: true });
      } else {
        res.json({ isAuthenticated: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  const logout = async (req, res) => {

   
  
    res.cookie("adminLog", "", { maxAge: 0 })
    res.send({
        message: "success"
    })
  };
  





       







module.exports = {
    adminLogin, getUsers, blockUser, getCounselor, blockCounselor, unblockCounselor, AcceptCounselor, DeclineCounselor, addService,
    getServices,getCookie,logout
}
