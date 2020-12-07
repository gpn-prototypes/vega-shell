type DecodedToken = {
  header: {
    typ: string;
    alg: string;
  };
  payload: {
    exp: number;
    salt: string;
    login: string;
  };
};

function decodeToken(token: string): DecodedToken | null {
  const parts = token.split('.');

  try {
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));

    return {
      header,
      payload,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Произошла ошибка при декодировании токена:', token);
    // eslint-disable-next-line no-console
    console.error(error);

    return null;
  }
}

function isTokenValid(token: string): boolean {
  const decodedToken = decodeToken(token);

  if (!decodedToken) {
    return false;
  }

  const currentTime = new Date().getTime() / 1000;

  if (decodedToken.payload.exp <= currentTime) {
    return false;
  }

  return true;
}

export { decodeToken, isTokenValid };
