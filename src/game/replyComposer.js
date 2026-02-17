function compose(username, result) {
  if (!result) {
    // No start time — user liked the last post without liking CTA first
    return (
      `@${username} ❌ Offside! You skipped straight to the shot without ` +
      `running the field first. Head back to the starting post and try again!\n\n`
    );
  }

  const { isGoal, elapsed, middleCount } = result;
  const time = elapsed.toFixed(2);

  if (isGoal && middleCount === 3) {
    return (
      `@${username} ⚽ GOOOAL! You made all the right moves across the field ` +
      `in just ${time} seconds — consider the average World Cup player runs ` +
      `7 miles per game, you're moving like a pro!\n\n`
    );
  }

  if (isGoal && middleCount === 2) {
    return (
      `@${username} ⚽ GOAL! You found the back of the net in ${time} seconds! ` +
      `You missed a play on the field, but your speed made up for it.\n\n`
    );
  }

  // Miss
  return (
    `@${username} ❌ The keeper saves it! You took ${time} seconds — a World ` +
    `Cup striker needs to be quicker than that! The best goals come from ` +
    `players who make every move count.\n\n` +
    `Better luck next time`
  );
}

module.exports = { compose };
