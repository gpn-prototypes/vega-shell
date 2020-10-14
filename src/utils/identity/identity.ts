import { APIClient, UserDataType } from '../api-client';

export type IdentityConfigType = {
  apiUrl: string;
  token?: string;
  cbOnAuth?(): void;
};

const AUTH_TOKEN = 'auth-token';

export class Identity {
  private apiClient: APIClient;

  private readonly AUTH_TOKEN = AUTH_TOKEN;

  private cbOnAuth?(): void;

  constructor(config: IdentityConfigType) {
    const { apiUrl, token = null, cbOnAuth = () => {} } = config;
    this.apiClient = new APIClient(apiUrl);
    this.cbOnAuth = cbOnAuth;
    if (token) {
      localStorage.setItem(this.AUTH_TOKEN, token);
    }
  }

  public auth = async ({ login, password }: UserDataType): Promise<void> => {
    const { token } = await this.apiClient.auth({ login, password });
    if (token) {
      if (typeof this.cbOnAuth === 'function') {
        this.cbOnAuth();
      }

      localStorage.setItem(this.AUTH_TOKEN, token);
    }
  };

  public getToken = (): IdentityConfigType['token'] | null => {
    const authToken = localStorage.getItem('auth-token');
    return authToken || null;
  };

  public updateToken = (newToken: IdentityConfigType['token']): void => {
    if (newToken) {
      localStorage.setItem(this.AUTH_TOKEN, newToken);
    }
  };

  public logout = (): void => {
    localStorage.removeItem(this.AUTH_TOKEN);
  };
}
