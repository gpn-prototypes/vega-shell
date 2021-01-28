type DecodedToken = {
  header: {
    typ: string;
    alg: string;
  };
  payload: {
    jti: string;
    exp: number;
    login: string;
  };
};

export function mockValidToken(): string {
  return `${btoa(JSON.stringify({ type: 'JWT', alg: 'HS256' }))}.${btoa(
    JSON.stringify({
      jti: 'b8d9b6d3ebac4599b0b2194cc3862d0f',
      exp: Date.now(),
      login: 'vega2-test@gpndt.test',
    }),
  )}`;
}

function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));

    return {
      header,
      payload,
    };
  } catch (error) {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const decodedToken = decodeToken(token);

  if (!decodedToken) {
    return false;
  }

  const currentTime = Date.now() / 1000;

  if (decodedToken.payload.exp <= currentTime) {
    return false;
  }

  return true;
}

export { decodeToken, isTokenValid };
