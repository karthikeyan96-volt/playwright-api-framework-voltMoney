import { APIRequestContext } from '@playwright/test';
import { BaseHelper } from '../base/baseHelper';
import endpoints from '../../config/endpoints.json';
import creds from '../../config/creds.json';
import { LoginResponse, ApiResponse } from '../../types/api.types';
export class LMSHelper extends BaseHelper {
  constructor(request: APIRequestContext) {
    super(request, 'lms');
  }
  async login(): Promise<void> {
    const loginEndpoint = endpoints.lms.auth.login;
    const credentials = creds.lms;
    const response = await this.makeRequest('POST', loginEndpoint, {
      data: {
        email: credentials.email,
        password: credentials.password
      }
    });
    if (!response.ok) {
      throw new Error(`LMS login failed: ${response.status} - ${JSON.stringify(response.body)}`);
    }
    const loginData: LoginResponse = response.body;
    this.setAuthToken(loginData.token);
    this.logger.info('LMS login successful');
  }
  async createPayment(paymentData: any): Promise<ApiResponse> {
    const endpoint = endpoints.lms.payments.create;
    return await this.makeRequest('POST', endpoint, { data: paymentData });
  }
  async getPaymentById(paymentId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.lms.payments.getById, { id: paymentId });
    return await this.makeRequest('GET', endpoint);
  }
  async listPayments(params?: Record<string, string>): Promise<ApiResponse> {
    const endpoint = endpoints.lms.payments.list;
    return await this.makeRequest('GET', endpoint, { params });
  }
  async getAccountById(accountId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.lms.accounts.getById, { id: accountId });
    return await this.makeRequest('GET', endpoint);
  }
  async updateAccount(accountId: string, accountData: any): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.lms.accounts.update, { id: accountId });
    return await this.makeRequest('PUT', endpoint, { data: accountData });
  }
  async logout(): Promise<void> {
    const endpoint = endpoints.lms.auth.logout;
    await this.makeRequest('POST', endpoint);
    this.setAuthToken('');
    this.logger.info('LMS logout successful');
  }
}
