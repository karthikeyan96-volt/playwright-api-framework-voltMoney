import { APIRequestContext } from '@playwright/test';
import { BaseHelper } from '../base/baseHelper';
import endpoints from '../../config/endpoints.json';
import creds from '../../config/creds.json';
import { LoginResponse, ApiResponse } from '../../types/api.types';
/**
 * LOS Helper class for Loan Origination System API operations
 * 
 * Provides methods for:
 * - Authentication (login/logout)
 * - Loan management (create, read, update, delete, list)
 * - Application management (create, read, submit)
 */
export class LOSHelper extends BaseHelper {
  /**
   * Constructor for LOSHelper
   * 
   * @param request - Playwright APIRequestContext for making HTTP requests
   */
  constructor(request: APIRequestContext) {
    super(request, 'los');
  }
  /**
   * Login to LOS API using 3-step OTP flow
   * 
   * Step 1: Request OTP to phone number (GET)
   * Step 2: Verify OTP and receive JWT token (POST)
   * Step 3: Fetch user data using JWT token (POST)
   * 
   * Authenticates using LOS credentials and stores the authentication token
   * for use in subsequent API requests.
   * 
   * @throws Error if any step of login fails with status code and response body
   * 
   * Requirements: 6.3 - Provides login method for LOS authentication
   */
  async login(): Promise<void> {
    const credentials = creds.los;
    // Hardcoded custom headers for Volt Money API
    const customHeaders = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'Origin': 'https://app.staging.voltmoney.in',
      'Referer': 'https://app.staging.voltmoney.in/',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
      'x-appmode': 'INVESTOR_VIEW',
      'x-appplatform': 'VOLT_WEB_APP',
      'x-deviceid': '',
      'x-devicetype': 'MobileWeb',
      'x-entitytype': 'BORROWER'
    };
    try {
      // Step 1: Request OTP (GET)
      this.logger.info('Step 1: Requesting OTP...');
      const requestOtpEndpoint = this.replacePathParams(
        endpoints.los.auth.requestOtp, 
        { phoneNo: credentials.phoneNo }
      );
      const otpResponse = await this.makeRequest('GET', `${requestOtpEndpoint}?enableWhatsapp=true`, {
        headers: customHeaders
      });
      if (!otpResponse.ok) {
        throw new Error(`Request OTP failed: ${otpResponse.status} - ${JSON.stringify(otpResponse.body)}`);
      }
      this.logger.info('OTP requested successfully');
      // Step 2: Verify OTP and get JWT token (POST)
      this.logger.info('Step 2: Verifying OTP...');
      const verifyOtpEndpoint = endpoints.los.auth.verifyOtp;
      const verifyResponse = await this.makeRequest('POST', verifyOtpEndpoint, {
        data: {
          otp: credentials.otp,
          phoneNo: credentials.phoneNo
        },
        headers: customHeaders
      });
      if (!verifyResponse.ok) {
        throw new Error(`Verify OTP failed: ${verifyResponse.status} - ${JSON.stringify(verifyResponse.body)}`);
      }
      // Extract JWT token from response
      const jwtToken = verifyResponse.body.jwt;
      if (!jwtToken) {
        throw new Error('JWT token not found in verify OTP response');
      }
      this.setAuthToken(jwtToken);
      this.logger.info('OTP verified successfully, JWT token received');
      // Step 3: Fetch user data (POST)
      this.logger.info('Step 3: Fetching user data...');
      const getUserDataEndpoint = endpoints.los.auth.getUserData;
      const userDataResponse = await this.makeRequest('POST', getUserDataEndpoint, {
        data: {
          onboardingPartnerCode: ""
        },
        headers: customHeaders
      });
      if (!userDataResponse.ok) {
        throw new Error(`Fetch user data failed: ${userDataResponse.status} - ${JSON.stringify(userDataResponse.body)}`);
      }
      this.logger.info('LOS login successful - User data fetched');
      this.logger.debug('User data:', userDataResponse.body);
    } catch (error: any) {
      this.logger.error('LOS login failed:', error.message);
      throw error;
    }
  }
  /**
   * Create a new loan
   * 
   * @param loanData - Loan data object containing loan details
   * @returns ApiResponse with created loan data including ID
   */
  async createLoan(loanData: any): Promise<ApiResponse> {
    const endpoint = endpoints.los.loans.create;
    return await this.makeRequest('POST', endpoint, { data: loanData });
  }
  /**
   * Get loan by ID
   * 
   * @param loanId - Unique identifier of the loan
   * @returns ApiResponse with loan data
   */
  async getLoanById(loanId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.los.loans.getById, { id: loanId });
    return await this.makeRequest('GET', endpoint);
  }
  /**
   * Update an existing loan
   * 
   * @param loanId - Unique identifier of the loan to update
   * @param loanData - Updated loan data
   * @returns ApiResponse with updated loan data
   */
  async updateLoan(loanId: string, loanData: any): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.los.loans.update, { id: loanId });
    return await this.makeRequest('PUT', endpoint, { data: loanData });
  }
  /**
   * Delete a loan
   * 
   * @param loanId - Unique identifier of the loan to delete
   * @returns ApiResponse with deletion confirmation
   */
  async deleteLoan(loanId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.los.loans.delete, { id: loanId });
    return await this.makeRequest('DELETE', endpoint);
  }
  /**
   * List all loans with optional query parameters
   * 
   * @param params - Optional query parameters for filtering/pagination
   * @returns ApiResponse with array of loans
   */
  async listLoans(params?: Record<string, string>): Promise<ApiResponse> {
    const endpoint = endpoints.los.loans.list;
    return await this.makeRequest('GET', endpoint, { params });
  }
  /**
   * Create a new loan application
   * 
   * @param applicationData - Application data object
   * @returns ApiResponse with created application data including ID
   */
  async createApplication(applicationData: any): Promise<ApiResponse> {
    const endpoint = endpoints.los.applications.create;
    return await this.makeRequest('POST', endpoint, { data: applicationData });
  }
  /**
   * Get application by ID
   * 
   * @param applicationId - Unique identifier of the application
   * @returns ApiResponse with application data
   */
  async getApplicationById(applicationId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.los.applications.getById, { id: applicationId });
    return await this.makeRequest('GET', endpoint);
  }
  /**
   * Submit an application
   * 
   * @param applicationId - Unique identifier of the application to submit
   * @returns ApiResponse with submission confirmation
   */
  async submitApplication(applicationId: string): Promise<ApiResponse> {
    const endpoint = this.replacePathParams(endpoints.los.applications.submit, { id: applicationId });
    return await this.makeRequest('POST', endpoint);
  }
  /**
   * Logout from LOS API
   * 
   * Clears the authentication token after logging out.
   */
  async logout(): Promise<void> {
    const endpoint = endpoints.los.auth.logout;
    await this.makeRequest('POST', endpoint);
    this.setAuthToken('');
    this.logger.info('LOS logout successful');
  }
  /**
   * Request OTP for phone number (GET method)
   * 
   * @param phoneNo - Phone number to send OTP to (e.g., "+918344422975")
   * @param enableWhatsapp - Whether to enable WhatsApp OTP (default: true)
   * @returns ApiResponse with OTP request confirmation
   */
  async requestOtp(phoneNo: string, enableWhatsapp: boolean = true): Promise<ApiResponse> {
    try {
      const customHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Origin': 'https://app.staging.voltmoney.in',
        'Referer': 'https://app.staging.voltmoney.in/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
        'x-appmode': 'INVESTOR_VIEW',
        'x-appplatform': 'VOLT_WEB_APP',
        'x-deviceid': '',
        'x-devicetype': 'MobileWeb',
        'x-entitytype': 'BORROWER'
      };
      const endpoint = this.replacePathParams(endpoints.los.auth.requestOtp, { phoneNo });
      return await this.makeRequest('GET', `${endpoint}?enableWhatsapp=${enableWhatsapp}`, {
        headers: customHeaders
      });
    } catch (error: any) {
      this.logger.error('Request OTP failed:', error.message);
      throw error;
    }
  }
  /**
   * Verify OTP and get JWT token (POST method)
   * 
   * @param phoneNo - Phone number that received the OTP
   * @param otp - OTP code to verify
   * @returns ApiResponse with JWT token in body.jwt
   */
  async verifyOtp(phoneNo: string, otp: string): Promise<ApiResponse> {
    try {
      const customHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Content-Type': 'application/json',
        'Origin': 'https://app.staging.voltmoney.in',
        'Referer': 'https://app.staging.voltmoney.in/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
        'x-appmode': 'INVESTOR_VIEW',
        'x-appplatform': 'VOLT_WEB_APP',
        'x-deviceid': '',
        'x-devicetype': 'MobileWeb',
        'x-entitytype': 'BORROWER'
      };
      const endpoint = endpoints.los.auth.verifyOtp;
      return await this.makeRequest('POST', endpoint, {
        data: {
          otp,
          phoneNo
        },
        headers: customHeaders
      });
    } catch (error: any) {
      this.logger.error('Verify OTP failed:', error.message);
      throw error;
    }
  }
  /**
   * Get user data after authentication (POST method)
   * 
   * @param onboardingPartnerCode - Optional onboarding partner code (default: "")
   * @returns ApiResponse with user data
   */
  async getUserData(onboardingPartnerCode: string = ""): Promise<ApiResponse> {
    try {
      const customHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Content-Type': 'application/json',
        'Origin': 'https://app.staging.voltmoney.in',
        'Referer': 'https://app.staging.voltmoney.in/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
        'x-appmode': 'INVESTOR_VIEW',
        'x-appplatform': 'VOLT_WEB_APP',
        'x-deviceid': '',
        'x-devicetype': 'MobileWeb',
        'x-entitytype': 'BORROWER'
      };
      const endpoint = endpoints.los.auth.getUserData;
      return await this.makeRequest('POST', endpoint, {
        data: {
          onboardingPartnerCode
        },
        headers: customHeaders
      });
    } catch (error: any) {
      this.logger.error('Get user data failed:', error.message);
      throw error;
    }
  }
}
