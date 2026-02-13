const participants = new Map();

function getParticipant(userId) {
  return participants.get(userId) || null;
}

function createParticipant(userId, username, startTime) {
  const participant = {
    userId,
    username,
    startTime,
    middleLikes: new Set(),
    endTime: null,
    elapsedSeconds: null,
    middleLikeCount: null,
    scored: null,
    replied: false,
    replyTweetId: null,
  };
  participants.set(userId, participant);
  return participant;
}

function getAllParticipants() {
  return Array.from(participants.values()).map(serialize);
}

function getStats() {
  const all = Array.from(participants.values());
  const scored = all.filter((p) => p.scored !== null);
  const goals = scored.filter((p) => p.scored === true);
  const misses = scored.filter((p) => p.scored === false);
  const times = scored
    .filter((p) => p.elapsedSeconds !== null)
    .map((p) => p.elapsedSeconds);
  const avgTime =
    times.length > 0
      ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) /
        100
      : null;

  return {
    total: all.length,
    active: all.filter((p) => p.scored === null).length,
    goals: goals.length,
    misses: misses.length,
    avgTime,
  };
}

function serialize(p) {
  return {
    ...p,
    middleLikes: Array.from(p.middleLikes),
  };
}

module.exports = {
  getParticipant,
  createParticipant,
  getAllParticipants,
  getStats,
  serialize,
};
