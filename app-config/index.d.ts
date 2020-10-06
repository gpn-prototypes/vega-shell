export type AppConfig = {
  root: string;
  entry: string;
  buildDirPath: string;
  mode: 'development' | 'production';
  env: 'development' | 'testing' | 'production';
  baseApiUrl: string;
  useApiProxy: boolean;
  apiPath: string;
  assetsPath: string;
  port: string | number;
  apiURL: string;
};

export declare function getAppConfig(): AppConfig;
