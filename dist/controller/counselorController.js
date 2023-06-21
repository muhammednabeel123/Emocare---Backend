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
            const counselor = new Counselor({
                name: name,
                password: password,
                email: email,
                state: state,
                address: primaryAddress,
                profession: profession,
                country: country,
                pincode: pincode,
                experience: experience,
                id_proof: req.files['idProof'][0].filename,
                certificates: req.files['certificate'][0].filename
            });
            const result = yield counselor.save();
            console.log(result, "this is  result");
            res.send({ message: 'success' });
        }
    }
    catch (error) {
        console.log(error.message);
    }
});
module.exports = {
    signup
};
