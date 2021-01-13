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
