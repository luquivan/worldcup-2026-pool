export type Winner = 'home' | 'away' | 'draw';
export type PenaltyWinner = 'home' | 'away';

export const getWinner = (home: number, away: number): Winner => {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'draw';
};

export const isClose = (
  homeScore: number, awayScore: number,
  homePred: number, awayPred: number
): boolean =>
  Math.abs(homePred - homeScore) <= 1 && Math.abs(awayPred - awayScore) <= 1;

/**
 * 6 pts exact / 3 pts close / 2 pts correct winner / 0 pts wrong
 * +1 bonus for correct penalty winner when predicting a knockout draw
 */
export const calculatePoints = (
  homeScore: number,
  awayScore: number,
  homePrediction: number | null,
  awayPrediction: number | null,
  penaltyWinner: PenaltyWinner | null,
  predPenaltyWinner?: PenaltyWinner
): number => {
  if (homeScore < 0 || homePrediction === null || awayPrediction === null) return 0;

  let points = 0;

  if (homeScore === homePrediction && awayScore === awayPrediction) {
    points = 6;
  } else if (getWinner(homeScore, awayScore) === getWinner(homePrediction, awayPrediction)) {
    points = isClose(homeScore, awayScore, homePrediction, awayPrediction) ? 3 : 2;
  }

  if (
    penaltyWinner !== null &&
    homePrediction === awayPrediction &&
    predPenaltyWinner === penaltyWinner
  ) {
    points += 1;
  }

  return points;
};
