export interface EnvironmentConfig {
  dev: {
    baseUrl: string;
  };
  staging: {
    baseUrl: string;
  };
  prod: {
    baseUrl: string;
  };
}

export const envConfig: EnvironmentConfig = {
  dev: {
    baseUrl: 'https://api.dev.voltmoney.in'
  },
  staging: {
    baseUrl: 'https://api.staging.voltmoney.in'
  },
  prod: {
    baseUrl: 'https://api.voltmoney.in'
  }
};

export function getBaseUrl(env: string = process.env.TEST_ENV || 'dev'): string {
  const environment = env as keyof EnvironmentConfig;
  if (!envConfig[environment]) {
    throw new Error(`Invalid environment: ${env}`);
  }
  return envConfig[environment].baseUrl;
}
