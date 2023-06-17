const mongoos = require('mongoose');
const userSchema = new mongoos.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean
    },
    is_blocked: {
        type: Boolean
    }
});
module.exports = mongoos.model("User", userSchema);
