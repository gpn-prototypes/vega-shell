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

export const IDENTITY_LS_KEYS = {
  ACCESS_TOKEN: 'access-token',
  REFRESH_TOKEN: 'refresh-token',
  USER_FIRST_NAME: 'user-first-name',
  USER_LAST_NAME: 'user-last-name',
};

export class Identity {
  private apiClient: APIClient;

  private onAuth?: () => void;

  private onLogout?: () => void;

  private refreshPromise: ReturnType<APIClient['refresh']> | null = null;

  private refreshIsActive = false;

  constructor(config: IdentityConfigType) {
    const { apiUrl, accessToken, refreshToken, onAuth, onLogout } = config;

    this.apiClient = new APIClient(apiUrl);
    this.onAuth = onAuth;
    this.onLogout = onLogout;

    if (accessToken && refreshToken) {
      this.setTokens(accessToken, refreshToken);
    }
  }

  public auth = async (userData: UserDataType): Promise<string> => {
    try {
      const res = await this.apiClient.auth(userData);

      this.setTokens(res.jwt_for_access, res.jwt_for_refresh);
      this.setUserName(res.first_name, res.last_name);

      if (this.onAuth) {
        this.onAuth();
      }

      return res.jwt_for_access;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  public authSSO = async (): Promise<string> => {
    try {
      const res = await this.apiClient.authSSO();

      this.setTokens(res.jwt_for_access, res.jwt_for_refresh);
      this.setUserName(res.first_name, res.last_name);

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

    if (accessToken !== null && refreshToken !== null && isTokenValid(refreshToken)) {
      return true;
    }

    return false;
  }

  private setTokens = (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(IDENTITY_LS_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(IDENTITY_LS_KEYS.REFRESH_TOKEN, refreshToken);
  };

  public getAccessToken = (): string | null => {
    const accessToken = localStorage.getItem(IDENTITY_LS_KEYS.ACCESS_TOKEN);
    return accessToken;
  };

  public getRefreshToken = (): string | null => {
    const refreshToken = localStorage.getItem(IDENTITY_LS_KEYS.REFRESH_TOKEN);
    return refreshToken;
  };

  private setUserName = (firstName: string, lastName: string): void => {
    localStorage.setItem(IDENTITY_LS_KEYS.USER_FIRST_NAME, firstName);
    localStorage.setItem(IDENTITY_LS_KEYS.USER_LAST_NAME, lastName);
  };

  public getUserName = (): { firstName: string; lastName: string } | null => {
    const firstName = localStorage.getItem(IDENTITY_LS_KEYS.USER_FIRST_NAME);
    const lastName = localStorage.getItem(IDENTITY_LS_KEYS.USER_LAST_NAME);

    if (firstName && lastName) {
      return { firstName, lastName };
    }

    return null;
  };

  public clear = (): void => {
    localStorage.removeItem(IDENTITY_LS_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(IDENTITY_LS_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(IDENTITY_LS_KEYS.USER_FIRST_NAME);
    localStorage.removeItem(IDENTITY_LS_KEYS.USER_LAST_NAME);
  };
}
