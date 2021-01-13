import { decodeToken, isTokenValid } from './tokenHandlers';

// Дата: 12.12.20 12:12:12
const validToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJiOGQ5YjZkM2ViYWM0NTk5YjBiMjE5NGNjMzg2MmQwZiIsImV4cCI6MTYwNzc2NDMzMiwibG9naW4iOiJ2ZWdhMi10ZXN0QGdwbmR0LnRlc3QifQ.tiRTcPXJJLhg0V01UvNJ8WT0B5xKf-aSl_qxuTWn_aA';

// Дата: 10.10.20 10:10:10
const outdatedToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJiOGQ5YjZkM2ViYWM0NTk5YjBiMjE5NGNjMzg2MmQwZiIsImV4cCI6MTYwMjMxMzgxMCwibG9naW4iOiJ2ZWdhMi10ZXN0QGdwbmR0LnRlc3QifQ.ez3PZiovCATwOFt6wOc10wvVXn9vVICGOXy-5W6ZdzE';

const corruptedToken =
  'eyJ0eXAiOiJKV1Qi2CJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJiOGQ53jZkM2ViYWM0NTk5YjBiMjE5NGNjMzg2MmQwZiIsImV4cCI6MTYwNzc2NDMzMiwibG9naW4iOiJ2ZWdhMi10ZXN0QGdwbmR0LnRlc3QifQ.tiRTcPXJJLhg0V01UvNJ8WT035xKf-aSl_qxuTWn_aA';

describe('decodeToken', () => {
  test('валидный token', () => {
    const decodedToken = decodeToken(validToken);

    expect(decodedToken).toEqual({
      header: {
        typ: 'JWT',
        alg: 'HS256',
      },
      payload: {
        jti: 'b8d9b6d3ebac4599b0b2194cc3862d0f',
        exp: 1607764332,
        login: 'vega2-test@gpndt.test',
      },
    });
  });

  test('испорченный token', () => {
    const decodedToken = decodeToken(corruptedToken);

    expect(decodedToken).toBeNull();
  });
});

describe('isTokenValid', () => {
  beforeAll(() => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => new Date('11.11.20 11:11:11').valueOf());
  });

  test('валидный token', () => {
    expect(isTokenValid(validToken)).toBeTruthy();
  });

  test('просроченный token', () => {
    expect(isTokenValid(outdatedToken)).toBeFalsy();
  });

  test('испорченный token', () => {
    expect(isTokenValid(corruptedToken)).toBeFalsy();
  });
});
