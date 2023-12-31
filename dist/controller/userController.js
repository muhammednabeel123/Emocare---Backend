"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const Token = require('../model/tokenModel');
const SendEmail = require("../utilities/sendmail");
const Counselor = require('../model/counselorModel');
const moment = require('moment');
const Appointment = require('../model/appointmentModel');
const cryptos = require("crypto");
const dotenv = require("dotenv");
dotenv.config();
const userRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let name = req.body.name;
        const salt = yield bcrypt.genSalt(10);
        const hashedPassword = yield bcrypt.hash(password, salt);
        const record = yield User.findOne({ email: email });
        if (record) {
            return res.status(400).send({
                message: "Email is already registered"
            });
        }
        else {
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword
            });
            const result = yield user.save();
            const emailtoken = yield new Token({
                userId: result._id,
                token: cryptos.randomBytes(32).toString("hex")
            }).save();
            const url = `${process.env.BASE_URL2}user/${result._id}/verify/${emailtoken.token}`;
            yield SendEmail(user.email, "verify email", name, password, url);
            const { _id } = yield result.toJSON();
            res.status(201).send({
                message: "mail sented",
                token: emailtoken.token,
                userId: user._id
            });
        }
    }
    catch (error) {
        console.log(error);
    }
});
const mailVerify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findOne({ _id: req.params.id });
        console.log(user, "ther");
        if (!user)
            return res.status(404).send({ message: "Invalid link" });
        const tokens = jwt.sign({ _id: req.params.id }, "secret");
        res.cookie("userRegi", tokens, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        console.log(tokens, "this is token");
        const token = yield Token.findOne({
            userId: user._id,
            token: req.params.token
        });
        if (!token)
            return res.status(400).send({ message: "invalid link" });
        yield User.updateOne({ _id: user._id }, { $set: { verified: true } });
        yield Token.deleteOne({ token: req.params.token });
        res.status(200).send({ message: 'Verification successful' });
    }
    catch (error) {
        res.status(500).send({ message: "Internals Server Error" });
    }
});
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['userReg'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        const user = yield User.findOne({ _id: claims._id });
        const _a = yield user.toJSON(), { password } = _a, data = __rest(_a, ["password"]);
        res.status(200).send(data);
    }
    catch (error) {
        console.log(error);
        return res.status(401).send({
            message: 'unauthenticated'
        });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ email: req.body.email });
    console.log("hey");
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }
    if (user.is_blocked) {
        return res.status(400).send({ message: 'Forbidden' });
    }
    if (!(yield bcrypt.compare(req.body.password, user.password))) {
        return res.status(400).send({ message: 'Password is incorrect' });
    }
    const token = jwt.sign({ _id: user._id }, 'secret');
    res.cookie('userReg', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 });
    res.status(200).send({ message: 'Login successful', token: token });
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("userReg", "", { maxAge: 0 });
    res.send({
        message: "success"
    });
});
const servicesById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const counselors = yield Counselor.find({ service: req.params.id });
        res.send(counselors);
    }
    catch (error) {
        console.log(error);
    }
});
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
const slots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const availableSlots = slotes;
        res.json(availableSlots);
    }
    catch (error) {
        console.log(error);
    }
});
const bookSlot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slotId, serviceId, userId } = req.params;
        const slot = slotes[slotId];
        const customer = yield User.findOne({ _id: userId });
        const counselor = yield Counselor.findOne({ _id: serviceId });
        const timeString = slot.startTime;
        const date = new Date();
        const timeComponents = timeString.split(':');
        let hour = parseInt(timeComponents[0]);
        const minute = parseInt(timeComponents[1].split(' ')[0]);
        const period = timeComponents[1].split(' ')[1].toUpperCase();
        if (period === 'PM' && hour !== 12) {
            hour += 12;
        }
        else if (period === 'AM' && hour === 12) {
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
        });
        const result = yield booking.save();
        console.log(result);
        if (!slot || slot.booked || slot.expired || slot.servicer) {
            res.status(400).send({ error: 'Invalid or unavailable slot' });
        }
        else {
            slot.booked = true;
            slot.servicer = result.counselor;
            console.log(slot, "theree  is an erro");
            setTimeout(() => {
                slot.expired = true;
            }, 60 * 60 * 1000);
            res.json({ message: 'Slot booked successfully' });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const getDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = moment().format('YYYY-MM-DD');
        res.json({ date: currentDate });
    }
    catch (error) {
        console.log(error);
    }
});
const getServicer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies['userReg'];
        const claims = jwt.verify(cookie, "secret");
        if (!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            });
        }
        else {
            const servicer = yield Counselor.findById({ _id: req.params.id }).populate('service');
            res.json(servicer);
        }
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred' });
        console.log(error);
    }
});
module.exports = {
    userRegistration,
    getUser, logout, login, mailVerify, servicesById, slots, bookSlot, getServicer, getDate
};
