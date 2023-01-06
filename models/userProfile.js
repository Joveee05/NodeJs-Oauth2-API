const mongoose = require("mongoose");
const  Schema  = mongoose.Schema;

const userProfileSchema = new Schema({
    userId: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    photo: {
        type: String,
    },
    phoneNumber: {
        type: Number,
    },
    email: {
        type: String,
    },
    dob: {
        type: Date,
    },
    creationDate: {
        type: Date,
    },
    university: {
        type: String,
    }
});

const UserProfileSchema = mongoose.model('UserProfileSchema', userProfileSchema);

module.exports = UserProfileSchema;