/* eslint-disable camelcase */

import { APIClient } from '../api-client';
import { UserDataType } from '../api-client/api-client';

import { isTokenValid } from './tokenHandlers';

export type IdentityConfigType = {
  apiUrl: string;
  accessToken?: string;
  refreshToken?: string;
  cbOnAuth?(): void;
  cbOnLogout?(): void;
};

const ACCESS_TOKEN = 'access-token';
const REFRESH_TOKEN = 'refresh-token';

const noop = () => {};

export class Identity {
  private apiClient: APIClient;

  private cbOnAuth?(): void;

  private cbOnLogout?(): void;

  private refreshIsActive = false;

  private refreshPromise: ReturnType<APIClient['refresh']> | null;

  constructor(config: IdentityConfigType) {
    const {
      apiUrl,
      accessToken = null,
      refreshToken = null,
      cbOnAuth = noop,
      cbOnLogout = noop,
    } = config;

    this.apiClient = new APIClient(apiUrl);
    this.cbOnAuth = cbOnAuth;
    this.cbOnLogout = cbOnLogout;
    this.refreshPromise = null;

    if (accessToken && refreshToken) {
      this.setTokens(accessToken, refreshToken);
    }
  }

  public auth = async ({ login, password }: UserDataType): Promise<string | null> => {
    try {
      const { jwt_for_access, jwt_for_refresh } = await this.apiClient.auth({
        login,
        password,
      });

      if (jwt_for_access && jwt_for_refresh) {
        if (typeof this.cbOnAuth === 'function') {
          this.cbOnAuth();
        }

        this.setTokens(jwt_for_access, jwt_for_refresh);

        return jwt_for_access;
      }

      return null;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  public authSSO = async (): Promise<string | null> => {
    try {
      const { jwt_for_access, jwt_for_refresh } = await this.apiClient.authSSO();

      if (jwt_for_access && jwt_for_refresh) {
        if (typeof this.cbOnAuth === 'function') {
          this.cbOnAuth();
        }

        this.setTokens(jwt_for_access, jwt_for_refresh);

        return jwt_for_access;
      }

      return null;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  public refresh = async (): Promise<string | null> => {
    try {
      const refreshToken = this.getRefreshToken();

      if (refreshToken === null) {
        throw new Error('RefreshToken не найден');
      }

      if (!this.refreshIsActive) {
        this.refreshIsActive = true;
        this.refreshPromise = this.apiClient.refresh(refreshToken);
      }

      const response = await this.refreshPromise;

      this.refreshIsActive = false;

      if (response && response.jwt_for_access && response.jwt_for_refresh) {
        this.setTokens(response.jwt_for_access, response.jwt_for_refresh);

        return response.jwt_for_access;
      }

      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Произошла ошибка при обновлении токена');
      // eslint-disable-next-line no-console
      console.error(error);

      return null;
    }
  };

  public destroyTokens = async (): Promise<string> => {
    try {
      const accessToken = this.getAccessToken();

      if (accessToken === null) {
        throw new Error('AccessToken не найден');
      }

      const { ok } = await this.apiClient.destroy(accessToken);

      return ok;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  public getToken = async (): Promise<string | null> => {
    const accessToken = this.getAccessToken();

    if (accessToken && isTokenValid(accessToken)) {
      return accessToken;
    }

    const refreshToken = this.getRefreshToken();

    if (refreshToken && isTokenValid(refreshToken)) {
      const freshAccessToken = await this.refresh();

      return freshAccessToken;
    }

    return null;
  };

  public logout = (shouldDestroyTokens = true): void => {
    if (typeof this.cbOnLogout === 'function') {
      this.cbOnLogout();
    }

    if (shouldDestroyTokens) {
      this.destroyTokens();
    }

    this.removeTokens();
  };

  public isLoggedIn(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    /*
      Для получения валидного accessToken достаточно валидного refreshToken
      Если accessToken был удален из ls (accessToken === null), то все равно лучше перелогиниться
    */

    if (accessToken !== null && refreshToken !== null && isTokenValid(refreshToken)) {
      return true;
    }

    return false;
  }

  public getAccessToken = (): string | null => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    return token || null;
  };

  public getRefreshToken = (): string | null => {
    const token = localStorage.getItem(REFRESH_TOKEN);
    return token || null;
  };

  public setTokens = (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
  };

  public removeTokens = (): void => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
  };
}
