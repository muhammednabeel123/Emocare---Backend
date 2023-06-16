var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const userRegistration = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
            // jwt token
            const { _id } = yield result.toJSON();
            const token = jwt.sign({ _id: _id }, "secret");
            res.cookie("userReg", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            });
            res.send({
                message: "success"
            });
        }
    }
    catch (error) {
        console.log(error);
    }
});
module.exports = {
    userRegistration
};
