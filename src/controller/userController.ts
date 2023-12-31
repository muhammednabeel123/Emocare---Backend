const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../model/userModel')
const Token = require('../model/tokenModel')
const SendEmail = require("../utilities/sendmail")
const Counselor = require('../model/counselorModel')
const moment = require('moment');
const Appointment = require('../model/appointmentModel')


const cryptos = require("crypto")
import * as dotenv from "dotenv";
dotenv.config();

const userRegistration = async (req, res) => {
    try {
        let email = req.body.email
        let password = req.body.password
        let name = req.body.name
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const record = await User.findOne({ email: email })

        if (record) {
            return res.status(400).send({
                message: "Email is already registered"
            })
        } else {
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword
            })

            const result = await user.save()
            const emailtoken = await new Token({
                userId: result._id,
                token: cryptos.randomBytes(32).toString("hex")
            }).save()

            const url = `${process.env.BASE_URL2}user/${result._id}/verify/${emailtoken.token}`
            await SendEmail(user.email, "verify email", name, password, url)
            const { _id } = await result.toJSON()
            res.status(201).send({
                message: "mail sented",
                token: emailtoken.token,
                userId: user._id
            });


        }



    } catch (error) {
        console.log(error);

    }
}

const mailVerify = async (req, res) => {
    try {


        const user = await User.findOne({ _id: req.params.id });
        console.log(user, "ther");

        if (!user) return res.status(404).send({ message: "Invalid link" })
        const tokens = jwt.sign({ _id: req.params.id }, "secret")

        res.cookie("userRegi", tokens, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })
        console.log(tokens, "this is token");

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token
        })
        if (!token) return res.status(400).send({ message: "invalid link" })
        await User.updateOne({ _id: user._id }, { $set: { verified: true } })

        await Token.deleteOne({ token: req.params.token })



        res.status(200).send({ message: 'Verification successful' })


    } catch (error) {
        res.status(500).send({ message: "Internals Server Error" })
    }
}

const getUser = async (req, res) => {

    try {



        const cookie = req.cookies['userReg']
        const claims = jwt.verify(cookie, "secret")
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })
        }
        const user = await User.findOne({ _id: claims._id })

        const { password, ...data } = await user.toJSON()
        res.status(200).send(data)

    } catch (error) {
        console.log(error);

        return res.status(401).send({
            message: 'unauthenticated'
        })

    }

}

const login = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    console.log("hey");


    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }
    if (user.is_blocked) {
        return res.status(400).send({ message: 'Forbidden' });
    }

    if (!(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(400).send({ message: 'Password is incorrect' });
    }

    const token = jwt.sign({ _id: user._id }, 'secret');
    res.cookie('userReg', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 });

    res.status(200).send({ message: 'Login successful', token: token });
};

const logout = async (req, res) => {


    res.cookie("userReg", "", { maxAge: 0 })
    res.send({
        message: "success"
    })

}
const servicesById = async (req, res) => {
    try {

        const counselors = await Counselor.find({ service: req.params.id });


        res.send(counselors);

    } catch (error) {
        console.log(error);

    }
}

const slotes = [];


const startTime = moment().startOf('day').hour(9);
const endTime = moment().startOf('day').hour(24);

const slotDuration = 1;

while (startTime.isBefore(endTime, 'hour')) {
    const currentTime = moment();
    const slotTime = moment(startTime);

    const slot = {
        startTime: startTime.format('hh:mm A'),
        booked: false,
        expired: false,
        servicer: null
    };
    slotes.push(slot);

    startTime.add(slotDuration, 'hours');
}

const slots = async (req, res) => {
    try {

        const availableSlots = slotes
        res.json(availableSlots);
    } catch (error) {
        console.log(error);
    }
};

const bookSlot = async (req, res) => {
    try {
        const { slotId, serviceId, userId } = req.params;
        const slot = slotes[slotId];
        const customer = await User.findOne({ _id: userId })
        const counselor = await Counselor.findOne({ _id: serviceId })

        const timeString = slot.startTime;
        const date = new Date();
        const timeComponents = timeString.split(':');
        let hour = parseInt(timeComponents[0]);
        const minute = parseInt(timeComponents[1].split(' ')[0]);
        const period = timeComponents[1].split(' ')[1].toUpperCase();


        if (period === 'PM' && hour !== 12) {
            hour += 12;
        } else if (period === 'AM' && hour === 12) {
            hour = 0;
        }


        date.setHours(hour);
        date.setMinutes(minute);


        const indianTime = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const indianDate = new Date(indianTime);


        const hour24 = indianDate.getHours();
        const minutes = indianDate.getMinutes();


        const formattedTime = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;


        const formattedDateTime = new Date();
        formattedDateTime.setHours(hour24);
        formattedDateTime.setMinutes(minutes);
        formattedDateTime.setSeconds(0);


        const booking = new Appointment({
            user: customer._id,
            counselor: counselor._id,
            service: counselor.service,
            booked: true,
            consultingTime: formattedDateTime,
            date: new Date()
        })
        const result = await booking.save()

        console.log(result);







        if (!slot || slot.booked || slot.expired || slot.servicer) {
            res.status(400).send({ error: 'Invalid or unavailable slot' });
        } else {
            slot.booked = true;
            slot.servicer = result.counselor
            console.log(slot, "theree  is an erro");

            setTimeout(() => {
                slot.expired = true;
            }, 60 * 60 * 1000);

            res.json({ message: 'Slot booked successfully' });
        }
    } catch (error) {
        console.log(error,);
        res.status(500).json({ error: 'Internal server error' });
    }
};









const getDate = async (req, res) => {
    try {
        const currentDate = moment().format('YYYY-MM-DD');
        res.json({ date: currentDate })

    } catch (error) {
        console.log(error);

    }
}

const getServicer = async (req, res) => {
    try {
        const cookie = req.cookies['userReg']
        const claims = jwt.verify(cookie, "secret")
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })
        } else {
            const servicer = await Counselor.findById({ _id: req.params.id }).populate('service')
            res.json(servicer)

        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
        console.log(error);

    }
}





module.exports = {
    userRegistration,
    getUser, logout, login, mailVerify, servicesById, slots, bookSlot, getServicer, getDate
}