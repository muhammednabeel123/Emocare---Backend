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
            const url = `${process.env.BASE_URL2}user/${user._id}/verify/${emailtoken.token}`;
            yield SendEmail(user.email, "verify email", url);
            const { _id } = yield result.toJSON();
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
    }
    catch (error) {
        console.log(error);
    }
});
const mailVerify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findOne({ _id: req.params._id });
        console.log(user._id, "ther");
        if (!user)
            return res.status(404).send({ message: "Invalid link" });
        const tokens = jwt.sign({ _id: req.params._id }, "secret");
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
        res.send(data);
    }
    catch (error) {
        console.log("anything here");
        return res.status(401).send({
            message: 'unauthenticated'
        });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hello");
    const user = yield User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).send({ message: 'user not found' });
    }
    if (!(yield bcrypt.compare(req.body.password, user.password))) {
        return res.status(400).send({ message: "Password is incorrect" });
    }
    const token = jwt.sign({ _id: user._id }, "secret");
    res.cookie("userRegx", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 });
    res.send({ message: "success" });
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("userReg", "", { maxAge: 0 });
    res.send({
        message: "success"
    });
});
module.exports = {
    userRegistration,
    getUser, logout, login, mailVerify
};
