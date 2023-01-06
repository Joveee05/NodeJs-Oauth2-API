const mongoose = require("mongoose");
const  Schema  = mongoose.Schema;

const answerSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    questionId: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    answerTimeStamp: {
        type: Date,
        required: true
    },
    answerModifiedTimeStamp: {
        type: Date,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    vote: {
        type: Number,
        default: 0,
    }
});

const AnswerSchema = mongoose.model('AnswerSchema', answerSchema);

module.exports = AnswerSchema;