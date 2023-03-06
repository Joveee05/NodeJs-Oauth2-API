const Question = require('../models/questions');
const User = require('../models/userModel');
const help = require('./utility.js');

async function getQuestionById(id) {
  let question;
  try {
    question = await Question.findById(id).populate('answeredBy');
    if (question == null) {
      return { success: false, message: 'Cannot find question' };
    }
    const res = await updateView(question);
    if (res.success == false) return res;
  } catch (err) {
    return { success: false, message: err.message };
  }

  return {
    success: true,
    data: question,
  };
}

async function updateView(question) {
  question.views = question.views + 1;
  try {
    const updatedQuestion = await question.save();
    console.log(updatedQuestion);
    return {
      success: true,
      message: 'question views updated successfully',
    };
  } catch (err) {
    console.log(err);
    return { success: false, message: 'Failed to update views' };
  }
}

async function updateQuesVote(question) {
  try {
    const updatedQuestion = await question.save();
    console.log(updatedQuestion);
    return {
      success: true,
      message: 'question votes updated successfully',
    };
  } catch (err) {
    console.log(err);
    return { sucess: false, message: 'Failed to update votes' };
  }
}

async function addQuestion(body) {
  const question = new Question(body);

  try {
    const newQuestion = await question.save();
    return {
      success: true,
      data: newQuestion,
    };
  } catch (err) {
    console.log(err);
    return { success: false, message: 'Failed to add question' };
  }
}

async function updateQuestion(id, ques) {
  let question;
  try {
    question = await Question.findByIdAndUpdate(id, { new: true });
    if (question == null) {
      return { success: false, message: 'Cannot find question' };
    }

    if (ques.title) {
      question.title = ques.title;
    }
    if (ques.questionBody) {
      question.questionBody = ques.questionBody;
    }
    if (ques.keywords) {
      question.keywords = ques.keywords;
    }
    question.modifiedTimeStamp = new Date();

    try {
      const updatedQuestion = await question.save();

      return {
        success: true,
        data: updatedQuestion,
        message: 'question updated successfully',
      };
    } catch (err) {
      console.log(err);
      return { sucess: false, message: 'Failed to update question' };
    }
  } catch (err) {
    console.log(err);
    return { success: false, message: err.message };
  }
}

//Delete all questions
async function removeQuestion(id) {
  let question;
  try {
    question = await Question.findById(id);
    if (question == null) {
      return { success: false, message: 'Cannot find question' };
    }

    try {
      await question.remove();
      await help.removeVotesForObjectId(id);
      return {
        success: true,
        message: 'Deleted question',
      };
    } catch (err) {
      return { success: false, message: err.message };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
}

module.exports = {
  getQuestionById,
  addQuestion,
  updateQuestion,
  removeQuestion,
  updateQuesVote,
};
