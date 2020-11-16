import { APIClient, UserDataType } from '../api-client';

export type IdentityConfigType = {
  apiUrl: string;
  token?: string;
  cbOnAuth?(): void;
  cbOnLogout?(): void;
};

const AUTH_TOKEN = 'auth-token';

const noop = () => {};

export class Identity {
  private apiClient: APIClient;

  private readonly AUTH_TOKEN = AUTH_TOKEN;

  private cbOnAuth?(): void;

  private cbOnLogout?(): void;

  constructor(config: IdentityConfigType) {
    const { apiUrl, token = null, cbOnAuth = noop, cbOnLogout = noop } = config;
    this.apiClient = new APIClient(apiUrl);
    this.cbOnAuth = cbOnAuth;
    this.cbOnLogout = cbOnLogout;
    if (token) {
      localStorage.setItem(this.AUTH_TOKEN, token);
    }
  }

  // eslint-disable-next-line consistent-return
  public auth = async ({ login, password }: UserDataType): Promise<void> => {
    try {
      const { token } = await this.apiClient.auth({ login, password });
      if (token) {
        if (typeof this.cbOnAuth === 'function') {
          this.cbOnAuth();
        }

        localStorage.setItem(this.AUTH_TOKEN, token);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  };

  public getToken = (): string | null => {
    const authToken = localStorage.getItem('auth-token');
    return authToken || null;
  };

  public isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null;
  }

  public updateToken = (newToken: string): void => {
    localStorage.setItem(this.AUTH_TOKEN, newToken);
  };

  public logout = (): void => {
    if (typeof this.cbOnLogout === 'function') {
      this.cbOnLogout();
    }
    localStorage.removeItem(this.AUTH_TOKEN);
  };
}
