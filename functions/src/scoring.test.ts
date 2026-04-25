import { calculatePoints, getWinner, isClose } from './scoring';

describe('getWinner', () => {
  it('home wins', () => expect(getWinner(2, 1)).toBe('home'));
  it('away wins', () => expect(getWinner(0, 1)).toBe('away'));
  it('draw',      () => expect(getWinner(1, 1)).toBe('draw'));
  it('0-0 draw',  () => expect(getWinner(0, 0)).toBe('draw'));
});

describe('isClose', () => {
  it('exact score is close',                    () => expect(isClose(2, 1, 2, 1)).toBe(true));
  it('home off by 1 is close',                  () => expect(isClose(2, 1, 3, 1)).toBe(true));
  it('away off by 1 is close',                  () => expect(isClose(2, 1, 2, 0)).toBe(true));
  it('both off by 1 is close',                  () => expect(isClose(2, 1, 3, 2)).toBe(true));
  it('home off by 2 is not close',              () => expect(isClose(2, 1, 4, 1)).toBe(false));
  it('away off by 2 is not close',              () => expect(isClose(2, 1, 2, 3)).toBe(false));
});

describe('calculatePoints — edge cases', () => {
  it('returns 0 if match not played (homeScore < 0)', () =>
    expect(calculatePoints(-1, -1, 2, 1, null)).toBe(0));

  it('returns 0 if no prediction', () =>
    expect(calculatePoints(2, 1, null, null, null)).toBe(0));
});

describe('calculatePoints — group stage (no penalties)', () => {
  it('exact score → 6 pts', () =>
    expect(calculatePoints(2, 1, 2, 1, null)).toBe(6));

  it('close: home off by 1 → 3 pts', () =>
    expect(calculatePoints(2, 1, 3, 1, null)).toBe(3));

  it('close: both off by 1 → 3 pts', () =>
    expect(calculatePoints(2, 1, 3, 2, null)).toBe(3));

  it('correct winner, not close → 2 pts', () =>
    expect(calculatePoints(3, 0, 1, 0, null)).toBe(2));

  it('correct winner, home off by 2 → 2 pts', () =>
    expect(calculatePoints(3, 1, 1, 0, null)).toBe(2));

  it('wrong winner → 0 pts', () =>
    expect(calculatePoints(2, 1, 0, 1, null)).toBe(0));

  it('predicted draw, actual home win → 0 pts', () =>
    expect(calculatePoints(2, 1, 1, 1, null)).toBe(0));

  it('exact draw → 6 pts', () =>
    expect(calculatePoints(1, 1, 1, 1, null)).toBe(6));

  it('close draw: both off by 1 from 0-0 → 3 pts', () =>
    expect(calculatePoints(0, 0, 1, 1, null)).toBe(3));

  it('0-0 exact → 6 pts', () =>
    expect(calculatePoints(0, 0, 0, 0, null)).toBe(6));
});

describe('calculatePoints — knockout, no penalties (winner in 90+ET)', () => {
  it('exact score, penaltyWinner=null → 6 pts (no bonus possible)', () =>
    expect(calculatePoints(2, 1, 2, 1, null)).toBe(6));

  it('correct winner, penaltyWinner=null → 2 pts', () =>
    expect(calculatePoints(3, 0, 1, 0, null)).toBe(2));

  it('predicted draw but match decided in ET → 0 pts', () =>
    expect(calculatePoints(2, 1, 1, 1, null)).toBe(0));
});

describe('calculatePoints — knockout, went to penalties', () => {
  it('predicted draw + correct penalty winner → 0 base + 1 bonus = 1 pt', () =>
    expect(calculatePoints(1, 1, 1, 1, 'home', 'home')).toBe(7));

  it('exact draw + correct penalty winner → 6 + 1 = 7 pts', () =>
    expect(calculatePoints(1, 1, 1, 1, 'home', 'home')).toBe(7));

  it('close draw + correct penalty winner → 3 + 1 = 4 pts', () =>
    expect(calculatePoints(1, 1, 0, 0, 'home', 'home')).toBe(4));

  it('correct draw winner, wrong penalty → no bonus', () =>
    expect(calculatePoints(1, 1, 1, 1, 'home', 'away')).toBe(6));

  it('predicted draw, no penalty winner selected → no bonus', () =>
    expect(calculatePoints(1, 1, 1, 1, 'home', undefined)).toBe(6));

  it('predicted non-draw, match went to penalties → no bonus', () =>
    expect(calculatePoints(1, 1, 2, 0, 'home', 'home')).toBe(0));

  it('away penalty winner, correct prediction → 6 + 1 = 7 pts', () =>
    expect(calculatePoints(0, 0, 0, 0, 'away', 'away')).toBe(7));

  it('away penalty winner, wrong prediction → 6 pts', () =>
    expect(calculatePoints(0, 0, 0, 0, 'away', 'home')).toBe(6));
});
