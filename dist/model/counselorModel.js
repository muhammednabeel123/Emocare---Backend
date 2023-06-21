const c_mongoose = require('mongoose');
const Schemas = c_mongoose.Schema;
const C_schema = new c_mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    state: {
        type: String
    },
    address: {
        type: Array
    },
    country: {
        type: String
    },
    pincode: {
        type: Number
    },
    experience: {
        type: Number
    },
    id_proof: {
        type: Array,
        default: "hello"
    },
    certificates: {
        type: Array
    },
    age: {
        type: Number
    },
    is_verified: {
        type: Boolean,
        default: false
    }
});
module.exports = c_mongoose.model("counselor", C_schema);
