/* eslint-disable camelcase */

import { APIClient } from '../api-client';
import { UserDataType } from '../api-client/api-client';

import { isTokenValid } from './tokenHandlers';

export type IdentityConfigType = {
  apiUrl: string;
  accessToken?: string;
  refreshToken?: string;
  onAuth?: () => void;
  onLogout?: () => void;
};

const LS_ACCESS_TOKEN_KEY = 'access-token';
const LS_REFRESH_TOKEN_KEY = 'refresh-token';
const LS_USER_FIRST_NAME_KEY = 'user-first-name';
const LS_USER_LAST_NAME_KEY = 'user-last-name';

const LS_AUTH_KEY = 'user-auth';

export const LS_KEYS = {
  LS_ACCESS_TOKEN_KEY,
  LS_REFRESH_TOKEN_KEY,
  LS_USER_FIRST_NAME_KEY,
  LS_USER_LAST_NAME_KEY,
};

export class Identity {
  private apiClient: APIClient;

  private onAuth?: () => void;

  private onLogout?: () => void;

  private refreshPromise: ReturnType<APIClient['refresh']> | null = null;

  private refreshIsActive = false;

  constructor(config: IdentityConfigType) {
    const { apiUrl, accessToken = null, refreshToken = null, onAuth, onLogout } = config;

    this.apiClient = new APIClient(apiUrl);
    this.onAuth = onAuth;
    this.onLogout = onLogout;

    if (accessToken && refreshToken) {
      this.setTokens(accessToken, refreshToken);
    }
  }

  public auth = async (userData: UserDataType): Promise<string | undefined> => {
    try {
      const res = await this.apiClient.auth(userData);

      if (res.jwt_for_access !== undefined && res.jwt_for_refresh !== undefined) {
        this.setTokens(res.jwt_for_access, res.jwt_for_refresh);
      } else {
        this.setAuth(true);
      }

      if (res.first_name !== undefined && res.last_name !== undefined) {
        this.setUserName(res.first_name, res.last_name);
      }
      if (this.onAuth) {
        this.onAuth();
      }

      return res.jwt_for_access;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  public authSSO = async (): Promise<string | undefined> => {
    try {
      const res = await this.apiClient.authSSO();

      if (res.jwt_for_access !== undefined && res.jwt_for_refresh !== undefined) {
        this.setTokens(res.jwt_for_access, res.jwt_for_refresh);
      } else {
        this.setAuth(true);
      }

      if (res.first_name !== undefined && res.last_name !== undefined) {
        this.setUserName(res.first_name, res.last_name);
      }

      if (this.onAuth) {
        this.onAuth();
      }

      return res.jwt_for_access;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  private refresh = async (): Promise<string | null> => {
    try {
      const refreshToken = this.getRefreshToken();

      if (refreshToken === null) {
        // istanbul ignore next
        throw new Error('RefreshToken не найден');
      }

      if (!this.refreshIsActive) {
        this.refreshPromise = this.apiClient.refresh(refreshToken);
        this.refreshIsActive = true;
      }

      const res = await this.refreshPromise;
      this.refreshIsActive = false;

      if (res) {
        this.setTokens(res.jwt_for_access, res.jwt_for_refresh);
        return res.jwt_for_access;
      }

      // istanbul ignore next
      return null;
    } catch (error) {
      return null;
    }
  };

  private destroyTokens = async (): Promise<string> => {
    try {
      const accessToken = this.getAccessToken();

      if (accessToken === null) {
        // istanbul ignore next
        throw new Error('AccessToken не найден');
      }

      const { ok } = await this.apiClient.destroy(accessToken);

      return ok;
    } catch (err) {
      // istanbul ignore next
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
    if (destroyTokens) {
      this.destroyTokens();
    }

    this.clear();

    if (this.onLogout) {
      this.onLogout();
    }
  };

  /*
    Для получения валидного accessToken достаточно валидного refreshToken
    Если accessToken был удален из ls (accessToken === null), то все равно лучше перелогиниться
  */

  public isLoggedIn(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (this.getAuth() === 'true') {
      return true;
    }

    if (accessToken !== null && refreshToken !== null && isTokenValid(refreshToken)) {
      return true;
    }

    return false;
  }

  private setTokens = (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(LS_ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(LS_REFRESH_TOKEN_KEY, refreshToken);
  };

  public getAccessToken = (): string | null => {
    const accessToken = localStorage.getItem(LS_ACCESS_TOKEN_KEY);
    return accessToken;
  };

  public getRefreshToken = (): string | null => {
    const refreshToken = localStorage.getItem(LS_REFRESH_TOKEN_KEY);
    return refreshToken;
  };

  public getAuth = (): string | null => {
    return localStorage.getItem(LS_AUTH_KEY);
  };

  private setAuth = (isAuth: boolean): void => {
    localStorage.setItem(LS_AUTH_KEY, String(isAuth));
  };

  private setUserName = (firstName: string, lastName: string): void => {
    localStorage.setItem(LS_USER_FIRST_NAME_KEY, firstName);
    localStorage.setItem(LS_USER_LAST_NAME_KEY, lastName);
  };

  public getUserName = (): { firstName: string; lastName: string } | null => {
    const firstName = localStorage.getItem(LS_USER_FIRST_NAME_KEY);
    const lastName = localStorage.getItem(LS_USER_LAST_NAME_KEY);

    if (firstName && lastName) {
      return { firstName, lastName };
    }

    return null;
  };

  public clear = (): void => {
    localStorage.removeItem(LS_ACCESS_TOKEN_KEY);
    localStorage.removeItem(LS_REFRESH_TOKEN_KEY);
    localStorage.removeItem(LS_USER_FIRST_NAME_KEY);
    localStorage.removeItem(LS_USER_LAST_NAME_KEY);
    localStorage.removeItem(LS_AUTH_KEY);
  };
}
