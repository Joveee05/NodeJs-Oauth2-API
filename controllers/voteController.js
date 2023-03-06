const Vote = require('../models/vote');
const quesFunc = require('./questionController');
const ansFunc = require('./answerController');

//Read
async function findVote(objectId, userId) {
  let options = {};

  options = {
    ...options,
    objectId: objectId,
    userId: userId,
  };

  try {
    const vote = await Vote.find(options);
    if (vote.length > 0) {
      return {
        success: true,
        data: vote[0],
      };
    } else {
      return {
        success: false,
        message: 'vote not found',
      };
    }
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }
}

//Create
async function createNewVote(body) {
  const vote = new Vote(body);
  try {
    const newVote = await vote.save();
    return {
      success: true,
      message: newVote,
    };
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }
}

async function updateQuestionVote(objectId, value) {
  const ques = await quesFunc.getQuestionById(objectId);
  if (ques.success == true) {
    ques.data.vote = ques.data.vote + value;
    const res = await quesFunc.updateQuesVote(ques.data);
    return res;
  } else {
    return ques;
  }
}

//TODO: To be implemented when answer schema is created
async function updateAnswerVote(objectId, value) {
  const ans = await ansFunc.getAnswerById(objectId);
  if (ans.success == true) {
    ans.data.vote = ans.data.vote + value;
    const res = await ansFunc.updateAnsVote(ans.data);
    return res;
  } else {
    return ans;
  }
}

async function addVote(objectId, userId, voteType, objectType) {
  const ans = await findVote(objectId, userId);
  if (ans.success == true) {
    if (ans.data.voteType == voteType) {
      /* return {
				success: false,
				message: "Already Voted",
			}; */
      let result = removeVote(objectId, userId);
      return result;
    } else {
      ans.data.voteType = voteType;
      msg = await updateVote(ans.data);
      if (msg.success == true) {
        return {
          success: true,
          message: 'Vote was successfull',
        };
      } else {
        return msg;
      }
    }
  } else {
    const newVote = await createNewVote({
      objectId,
      objectType,
      userId,
      voteType,
    });
    if (newVote.success == false) return newVote;
    if (objectType == 'question') {
      const res = await updateQuestionVote(objectId, 1);
    } else {
      const res = await updateAnswerVote(objectId, 1);
    }
  }
  return {
    success: true,
    message: 'successfully Voted',
  };
}

//Update
async function updateVote(vote) {
  try {
    const updatedVote = await vote.save();
    return {
      success: true,
      message: 'vote was updated successfully',
    };
  } catch (err) {
    console.log(err);
    return { sucess: false, message: err };
  }
}

//Delete
async function removeVote(objectId, userId) {
  const ans = await findVote(objectId, userId);
  if (ans.success == true) {
    try {
      await ans.data.remove();
      if (ans.data.objectType == 'question') {
        updateQuestionVote(ans.data.objectId, -1);
      } else if (ans.data.objectType == 'answer') {
        updateAnswerVote(ans.data.objectId, -1);
      } else {
        return {
          sucess: 'false',
          message: 'objectType not supported',
        };
      }
      return {
        success: true,
        message: 'Deleted vote',
      };
    } catch (err) {
      return {
        success: false,
        message: err,
      };
    }
  } else {
    return {
      success: false,
      message: 'Vote not found',
    };
  }
}

async function getVotesForUser(userId) {
  try {
    const res = await Vote.find({ userId: userId });
    return {
      success: true,
      countVotes: res.length,
      VoteInfo: res,
    };
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }
}

async function getVotesForObject(objectId) {
  try {
    const res = await Vote.find({ objectId: objectId });
    return {
      success: true,
      countVotes: res.length,
      VoteInfo: res,
    };
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }
}

module.exports = {
  findVote,
  addVote,
  removeVote,
  getVotesForUser,
  getVotesForObject,
};
