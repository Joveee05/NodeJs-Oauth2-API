//For resolving circular dependencies
const Vote = require('../models/vote');

async function removeVotesForObjectId(id) {
	try {
		const res = await Vote.deleteMany({objectId: id});
		console.log ("Votes Removed:", res)
		return {
			success: true,
			data: res,
			message: `successfully deleted all votes for {id}`
		}
	} catch (err) {
		return {
			success: false,
			message: err
		};
	}
}

module.exports = {
	removeVotesForObjectId,
};
