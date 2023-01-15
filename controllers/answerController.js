const Answer = require('../models/answer');
const help = require('./utility.js');

async function getAllAnswers(search) {
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
    const answer = await Answer.find(options)
      .populate('answeredBy')
      .sort('-answerTimeStamp');
    return {
      success: true,
      data: answer,
    };
  } catch (err) {
    return { success: false, message: `Answers not found because {err}` };
  }
}

async function updateAnsVote(answer) {
  try {
    const updatedAnswer = await answer.save();
    console.log(updatedAnswer);
    return {
      success: true,
      message: 'answer votes updated successfully',
    };
  } catch (err) {
    console.log(err);
    return { sucess: false, message: 'Failed to update votes' };
  }
}

async function getAnswerById(id) {
  let answer;
  try {
    answer = await Answer.findById(id).populate('answeredBy');
    if (answer == null) {
      return { success: false, message: 'Cannot find answer' };
    }
    const res = await updateView(answer);
    if (res.success == false) return res;
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }

  return {
    success: true,
    data: answer,
  };
}

async function updateView(answer) {
  answer.views = answer.views + 1;
  try {
    const updatedAnswer = await answer.save();
    console.log(updatedAnswer);
    return {
      success: true,
      message: 'answer views updated successfully',
    };
  } catch (err) {
    console.log(err);
    return { sucess: false, message: 'Failed to update answer views' };
  }
}

async function addAnswer(body) {
  const answer = new Answer(body);

  try {
    const newAnswer = await answer.save();
    return {
      success: true,
      data: newAnswer,
    };
  } catch (err) {
    console.log(err);
    return { success: false, message: 'Failed to add answer' };
  }
}

async function removeAnswer(id) {
  let answer;
  try {
    answer = await Answer.findById(id);
    if (answer == null) {
      return { success: false, message: 'Cannot find answer' };
    }

    try {
      await answer.remove();
      await help.removeVotesForObjectId(id);
      return {
        success: true,
        message: 'Deleted answer',
      };
    } catch (err) {
      return { success: false, message: err.message };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
}

async function getAnswerByOptions(option) {
  try {
    answer = await Answer.find(option);
    if (answer.length < 1) {
      return {
        message: 'No answers found',
      };
    } else {
      return {
        success: true,
        message: answer,
      };
    }
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
}

async function updateAnswer(id, ans) {
  let answer;
  try {
    res = await Answer.findById(id);
    console.log(res);
    if (res == null) {
      return {
        success: false,
        message: 'Cannot find Answer',
      };
    }
    if (ans.answer) {
      res.answer = ans.answer;
    }
    res.answerModifiedTimeStamp = new Date();
    console.log('Updated Ans:', res);
    const updatedAnswer = await res.save();
    console.log(updatedAnswer);
    return {
      success: true,
      data: updatedAnswer,
      message: 'Answer updated successfully',
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
}

module.exports = {
  getAllAnswers,
  getAnswerById,
  addAnswer,
  removeAnswer,
  updateAnswer,
  getAnswerByOptions,
  updateAnsVote,
};
