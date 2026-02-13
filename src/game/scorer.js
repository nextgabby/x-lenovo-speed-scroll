const config = require("../config");

function score(participant) {
  const elapsed =
    Math.round(
      ((participant.endTime - participant.startTime) / 1000) * 100
    ) / 100;

  const middleCount = participant.middleLikes.size;
  const underTime = elapsed <= config.scoring.timeLimit;
  const enoughLikes = middleCount >= config.scoring.minMiddleLikesForGoal;
  const isGoal = underTime && enoughLikes;

  participant.elapsedSeconds = elapsed;
  participant.middleLikeCount = middleCount;
  participant.scored = isGoal;

  return { isGoal, elapsed, middleCount };
}

module.exports = { score };
