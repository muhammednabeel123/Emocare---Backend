var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Counselor = require('../model/counselorModel');
const Services = require('../model/serviceModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Token = require('../model/tokenModel');
const { uploadToCloudinary, removeFromCloudinary } = require('../middlewears/cloudinary');
//  COUNSELOR SIGNUP
const signup = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { name, email, password, state, primaryAddress, profession, country, pincode, experience } = req.body;
        const record = yield Counselor.findOne({ email: email });
        if (record) {
            return res.status(400).send({
                message: "Email is already registered"
            });
        }
        else {
            const id_proof = req.files.idProof[0].path;
            const certificate = req.files.certificate[0].path;
            const image1 = yield uploadToCloudinary(id_proof, "counselor-idproof");
            const image2 = yield uploadToCloudinary(certificate, "counselor-certificate");
            const counselor = new Counselor({
                name: name,
                password: password,
                email: email,
                state: state,
                address: primaryAddress,
                service: profession,
                country: country,
                pincode: pincode,
                experience: experience,
                id_proof: image1.url,
                id_proofPublicId: image1.public_id,
                certificates: image2.url,
                certificatesPublicId: image2.public_id
            });
            const result = yield counselor.save();
            console.log(result);
            res.send({ message: 'success' });
        }
    }
    catch (error) {
        console.log(error.message);
    }
});
const getServices = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log("hey");
        const services = yield Services.find({});
        res.send(services);
    }
    catch (error) {
        console.log(error.message);
    }
});
const counselorLogin = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const user = yield Counselor.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send({ message: 'user not found' });
        }
        if (!(yield bcrypt.compare(req.body.password, user.password))) {
            return res.status(400).send({ message: "Password is incorrect" });
        }
        const token = jwt.sign({ _id: user._id }, "secret");
        res.cookie("C-Logged", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 100 });
        res.send({ message: "success" });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).send({ message: "Internals Server Error" });
    }
});
module.exports = {
    signup, getServices, counselorLogin
};
