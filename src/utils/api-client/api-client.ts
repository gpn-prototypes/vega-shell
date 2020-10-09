export type UserDataType = {
  login: string;
  password: string;
};

type TokenType = {
  token: string;
};

type Error = {
  code: string;
  message: string;
};

type FailedResponseType = {
  error: {
    errors: Error[];
  };
};

export class APIClient {
  private url: string;

  public constructor(url: string) {
    this.url = url;
  }

  public auth = async ({ login, password }: UserDataType): Promise<TokenType> => {
    const response = await fetch(this.url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, password }),
    });

    if (response.status === 200) {
      const data: TokenType = await response.json();
      return data;
    }
    const { error }: FailedResponseType = await response.json();
    return Promise.reject(error);
  };
}
