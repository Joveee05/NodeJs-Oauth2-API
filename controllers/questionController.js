const Question = require('../models/questions');
const help = require('./utility.js');

async function getAllQuestions(search) {
  let options = {};

  if (search) {
    options = {
      ...options,
      $or: [
        { question: new RegExp(search.toString(), 'i') },
        { subject: new RegExp(search.toString(), 'i') },
      ],
    };
  }
  try {
    const question = await Question.find(options);
    return {
      success: true,
      data: question,
    };
  } catch (err) {
    return { success: false, message: 'Questions not found' };
  }
}

async function getQuestionById(id) {
  let question;
  try {
    question = await Question.findById(id);
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
    return { sucess: false, message: 'Failed to update views' };
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
  console.log(question);

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
  console.log('Entered');
  let question;
  try {
    question = await Question.findById(id);
    if (question == null) {
      return { success: false, message: 'Cannot find question' };
    }
    console.log(question);
    if (ques.title) {
      console.log(ques.title);
      question.title = ques.title;
    }
    if (ques.questionBody) {
      console.log(ques.questionBody);
      question.questionBody = ques.questionBody;
    }
    if (ques.keywords) {
      console.log(ques.keywords);
      question.keywords = question.keywords.concat(ques.keywords);
    }
    question.modifiedTimeStamp = new Date();
    console.log(question);
    try {
      const updatedQuestion = await question.save();
      console.log(updatedQuestion);
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
  getAllQuestions,
  getQuestionById,
  addQuestion,
  updateQuestion,
  removeQuestion,
  updateQuesVote,
};
