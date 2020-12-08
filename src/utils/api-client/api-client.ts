/* eslint-disable camelcase */

export type UserDataType = {
  login: string;
  password: string;
};

type AuthObtainResponse = {
  first_name: string;
  last_name: string;
  jwt_for_access: string;
  jwt_for_refresh: string;
};

type AuthRefreshResponse = {
  jwt_for_access: string;
  jwt_for_refresh: string;
};

type AuthDestroyResponse = {
  ok: string;
};

type ErrorType = {
  code: number;
  message: string;
};

type FailedResponseType = {
  Error: ErrorType;
};

const getDefaultError = (response: Response): ErrorType => {
  const message = `При входе в систему возникла ошибка: ${response.statusText}. Попробуйте снова или обратитесь в Службу технической поддержки`;
  const error = {
    code: response.status,
    message,
  };

  return error;
};

const handleError = async <T>(response: Response): Promise<T> => {
  try {
    const { Error }: FailedResponseType = await response.json();
    return Promise.reject(Error);
  } catch {
    return Promise.reject(getDefaultError(response));
  }
};

export class APIClient {
  private url: string;

  public constructor(url: string) {
    this.url = url;
  }

  public auth = async ({ login, password }: UserDataType): Promise<AuthObtainResponse> => {
    const response = await fetch(`${this.url}/auth/jwt/obtain`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, password }),
    });

    if (response.status === 200) {
      const data: AuthObtainResponse = await response.json();
      return data;
    }

    return handleError(response);
  };

  public authSSO = async (): Promise<AuthObtainResponse> => {
    const response = await fetch(`${this.url}/auth/sso/login`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.status === 200) {
      const data: AuthObtainResponse = await response.json();
      return data;
    }

    return handleError(response);
  };

  public refresh = async (refreshToken: string): Promise<AuthRefreshResponse> => {
    const response = await fetch(`${this.url}/auth/jwt/refresh`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jwt_for_refresh: refreshToken }),
    });

    if (response.status === 200) {
      const data: AuthRefreshResponse = await response.json();
      return data;
    }

    return handleError(response);
  };

  public destroy = async (accessToken: string): Promise<AuthDestroyResponse> => {
    const response = await fetch(`${this.url}/auth/jwt/destroy`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jwt_for_access: accessToken }),
    });

    if (response.status === 200) {
      const data: AuthDestroyResponse = await response.json();
      return data;
    }

    return handleError(response);
  };
}
