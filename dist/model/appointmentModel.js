const a_mongoose = require('mongoose');
const Schema = a_mongoose.Schema;
const A_mongoose = new a_mongoose.Schema({
    user: { type: String, required: true },
    service: { type: String, required: true },
    booked: { type: Boolean, default: false },
    consultingTime: { type: Number, default: 0 }
});
module.exports = a_mongoose.model("Appointment", A_mongoose);
