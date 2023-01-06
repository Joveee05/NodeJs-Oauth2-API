const mongoose = require("mongoose");
const  Schema  = mongoose.Schema;

const questionPageSchema = new Schema({
    vote: {
        type: Number,
        default: 0,
    },
    title: {
        type: String,
        required: true,
    },
    questionBody: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    userId: {
        type: String,
    },
    askedTimeStamp: {
        type: Date,
        required: true,
    },
    modifiedTimeStamp: {
        type: Date,
        required: true,
    },
    keywords: {
        type: [String],
        defaut: [],
    },
})

const QuestionPageSchema = mongoose.model('QuestionPageSchema', questionPageSchema);

module.exports = QuestionPageSchema;