import { APIClient, UserDataType } from '../api-client';

export type IdentityConfigType = {
  apiUrl: string;
  token?: string;
};

const AUTH_TOKEN = 'auth-token';

export class Identity {
  private apiClient: APIClient;

  private readonly AUTH_TOKEN = AUTH_TOKEN;

  constructor(config: IdentityConfigType) {
    const { apiUrl, token = null } = config;
    this.apiClient = new APIClient(apiUrl);
    if (token) {
      localStorage.setItem(this.AUTH_TOKEN, JSON.stringify(token));
    }
  }

  public auth = async ({ login, password }: UserDataType): Promise<void> => {
    const { token } = await this.apiClient.auth({ login, password });
    localStorage.setItem(this.AUTH_TOKEN, JSON.stringify(token));
  };

  public getToken = (): Pick<IdentityConfigType, 'token'> => {
    const authToken = localStorage.getItem('auth-token');
    return authToken ? JSON.parse(authToken) : null;
  };

  public updateToken = (newToken: IdentityConfigType['token']): void => {
    if (newToken) {
      localStorage.setItem(this.AUTH_TOKEN, JSON.stringify(newToken));
    }
  };

  public logout = (): void => {
    localStorage.removeItem(this.AUTH_TOKEN);
  };
}
