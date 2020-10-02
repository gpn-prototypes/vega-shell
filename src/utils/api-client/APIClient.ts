type UserData = {
  login: string;
  password: string;
};

export class APIClient {
  private url: string;

  public constructor(url: string) {
    this.url = url;
  }

  public async auth({ login, password }: UserData) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({ login, password }),
    });

    if (response.status === 200) {
      const { data } = await response.json();
      return data;
    }
    const { error } = await response.json();
    return Promise.reject(error);
  }
}
