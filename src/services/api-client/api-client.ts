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
  code: string | number;
  message: string;
};

type FailedResponse = {
  Error: ErrorType;
};

type ErrorMessageFunction = (statusText: string) => string;

export const ERROR_MESSAGE_FUNCTIONS = {
  AUTH: (statusText: string): string =>
    `При входе в систему возникла ошибка: ${statusText}. Попробуйте снова или обратитесь в Службу технической поддержки`,
  DEFAULT: (statusText: string): string => statusText,
};

const handleResponseError = async <T>(
  response: Response,
  getErrorMessage: ErrorMessageFunction = ERROR_MESSAGE_FUNCTIONS.DEFAULT,
): Promise<T> => {
  try {
    const { Error }: FailedResponse = await response.json();
    return Promise.reject(Error);
  } catch {
    const error = {
      code: response.status,
      message: getErrorMessage(response.statusText),
    };

    return Promise.reject(error);
  }
};

const HEADERS = {
  GET: {
    Accept: 'application/json',
  },
  POST: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
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
      headers: HEADERS.POST,
      body: JSON.stringify({ login, password }),
    });

    if (response.status === 200) {
      const data: AuthObtainResponse = await response.json();
      return data;
    }

    const errorMessageFunction = ERROR_MESSAGE_FUNCTIONS.AUTH;
    return handleResponseError(response, errorMessageFunction);
  };

  public authSSO = async (): Promise<AuthObtainResponse> => {
    const response = await fetch(`${this.url}/auth/sso/login`, {
      method: 'GET',
      mode: 'cors',
      headers: HEADERS.GET,
    });

    if (response.status === 200) {
      const data: AuthObtainResponse = await response.json();
      return data;
    }

    const errorMessageFunction = ERROR_MESSAGE_FUNCTIONS.AUTH;
    return handleResponseError(response, errorMessageFunction);
  };

  public refresh = async (refreshToken: string): Promise<AuthRefreshResponse> => {
    const response = await fetch(`${this.url}/auth/jwt/refresh`, {
      method: 'POST',
      mode: 'cors',
      headers: HEADERS.POST,
      body: JSON.stringify({ jwt_for_refresh: refreshToken }),
    });

    if (response.status === 200) {
      const data: AuthRefreshResponse = await response.json();
      return data;
    }

    return handleResponseError(response);
  };

  public destroy = async (accessToken: string): Promise<AuthDestroyResponse> => {
    const response = await fetch(`${this.url}/auth/jwt/destroy`, {
      method: 'POST',
      mode: 'cors',
      headers: HEADERS.POST,
      body: JSON.stringify({ jwt_for_access: accessToken }),
    });

    if (response.status === 200) {
      const data: AuthDestroyResponse = await response.json();
      return data;
    }

    return handleResponseError(response);
  };
}
