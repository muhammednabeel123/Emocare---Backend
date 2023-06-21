const nodemailer = require("nodemailer")
import * as dotenv from "dotenv";
dotenv.config();



const Sendmail = async (email,subject,text) =>{
    try {       
        const transporter = nodemailer.createTransport({
            host:process.env.HOST,
            service:process.env.SERVICE,
            post:Number(process.env.EMAIL_PORT),
            secure:Boolean(process.env.SECURE),
            auth:{
                user:process.env.USER,
                pass:process.env.PASS
            }
        })

       
        
        
        await transporter.sendMail({
            from:process.env.User,
            to:email,
            subject:subject,
            text:text 
        })
        console.log("Email  sent Successfully");
        
        
    } catch (error) {
        console.log("Email no sent");
        console.log(error);
        
        
    }
}

module.exports = Sendmail