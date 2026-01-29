export interface EnvironmentConfig {
  dev: {
    baseUrl: string;
    dspBaseUrl: string;
    dspSecretKey: string;
  };
  staging: {
    baseUrl: string;
    dspBaseUrl: string;
    dspSecretKey: string;
  };
  prod: {
    baseUrl: string;
    dspBaseUrl: string;
    dspSecretKey: string;
  };
}

export const envConfig: EnvironmentConfig = {
  dev: {
    baseUrl: 'https://api.dev.voltmoney.in',
    dspBaseUrl: 'https://api.dev.dspfin.com',
    dspSecretKey: 'qdD6wRiuQ44cBZyXQ5UgGaSk5lzQWTcd'
  },
  staging: {
    baseUrl: 'https://api.staging.voltmoney.in',
    dspBaseUrl: 'https://api.staging.dspfin.com',
    dspSecretKey: 'qdD6wRiuQ44cBZyXQ5UgGaSk5lzQWTcd'
  },
  prod: {
    baseUrl: 'https://api.voltmoney.in',
    dspBaseUrl: 'https://api.dspfin.com',
    dspSecretKey: 'qdD6wRiuQ44cBZyXQ5UgGaSk5lzQWTcd'
  }
};

export function getBaseUrl(env: string = process.env.TEST_ENV || 'dev'): string {
  const environment = env as keyof EnvironmentConfig;
  if (!envConfig[environment]) {
    throw new Error(`Invalid environment: ${env}`);
  }
  return envConfig[environment].baseUrl;
}

export function getDspBaseUrl(env: string = process.env.TEST_ENV || 'dev'): string {
  const environment = env as keyof EnvironmentConfig;
  if (!envConfig[environment]) {
    throw new Error(`Invalid environment: ${env}`);
  }
  return envConfig[environment].dspBaseUrl;
}

export function getDspSecretKey(env: string = process.env.TEST_ENV || 'dev'): string {
  const environment = env as keyof EnvironmentConfig;
  if (!envConfig[environment]) {
    throw new Error(`Invalid environment: ${env}`);
  }
  return envConfig[environment].dspSecretKey;
}
