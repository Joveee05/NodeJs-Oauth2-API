const mongoose = require("mongoose");
const Schema  = mongoose.Schema;

const voteSchema = new Schema({
    objectId: {
        type: String,
        required: true,
    },
    objectType: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    voteType: {
        type: Number,
        required: true,
    },
})

const VoteSchema = mongoose.model('VoteSchema', voteSchema);

module.exports = VoteSchema;