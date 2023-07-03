const a_mongoose = require('mongoose');
const Schema = a_mongoose.Schema;
const A_mongoose = new a_mongoose.Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User', },
    counselor: { type: Schema.Types.ObjectId, required: true, ref: 'Counselor', },
    service: { type: Schema.Types.ObjectId, required: true, ref: 'Service' },
    booked: { type: Boolean, default: false },
    consultingTime: { type: Date },
    date: Date,
    expired: { type: Boolean }
});
module.exports = a_mongoose.model("Appointment", A_mongoose);
