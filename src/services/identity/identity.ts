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

const LS_ACCESS_TOKEN_KEY = 'access-token';
const LS_REFRESH_TOKEN_KEY = 'refresh-token';
const LS_USER_FIRST_NAME_KEY = 'user-first-name';
const LS_USER_LAST_NAME_KEY = 'user-last-name';

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

  public auth = async (userData: UserDataType): Promise<string | null> => {
    try {
      const res = await this.apiClient.auth(userData);

      if (res) {
        if (typeof this.cbOnAuth === 'function') {
          this.cbOnAuth();
        }

        this.setTokens(res.jwt_for_access, res.jwt_for_refresh);
        this.setUserName(res.first_name, res.last_name);

        return res.jwt_for_access;
      }

      return null;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  public authSSO = async (): Promise<string | null> => {
    try {
      const res = await this.apiClient.authSSO();

      if (res) {
        if (typeof this.cbOnAuth === 'function') {
          this.cbOnAuth();
        }

        this.setTokens(res.jwt_for_access, res.jwt_for_refresh);
        this.setUserName(res.first_name, res.last_name);

        return res.jwt_for_access;
      }

      return null;
    } catch (error) {
      return Promise.reject(error);
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

      const res = await this.refreshPromise;

      this.refreshIsActive = false;

      if (res) {
        this.setTokens(res.jwt_for_access, res.jwt_for_refresh);

        return res.jwt_for_access;
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

  public logout = ({ destroyTokens } = { destroyTokens: true }): void => {
    if (typeof this.cbOnLogout === 'function') {
      this.cbOnLogout();
    }

    if (destroyTokens) {
      this.destroyTokens();
    }

    this.removeTokens();
    this.removeUserName();
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
    const token = localStorage.getItem(LS_ACCESS_TOKEN_KEY);
    return token || null;
  };

  public getRefreshToken = (): string | null => {
    const token = localStorage.getItem(LS_REFRESH_TOKEN_KEY);
    return token || null;
  };

  public setTokens = (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(LS_ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(LS_REFRESH_TOKEN_KEY, refreshToken);
  };

  public removeTokens = (): void => {
    localStorage.removeItem(LS_ACCESS_TOKEN_KEY);
    localStorage.removeItem(LS_REFRESH_TOKEN_KEY);
  };

  public setUserName = (firstName: string, lastName: string): void => {
    localStorage.setItem(LS_USER_FIRST_NAME_KEY, firstName);
    localStorage.setItem(LS_USER_LAST_NAME_KEY, lastName);
  };

  public removeUserName = (): void => {
    localStorage.removeItem(LS_USER_FIRST_NAME_KEY);
    localStorage.removeItem(LS_USER_LAST_NAME_KEY);
  };
}
