/**
 * Loan Account Creation Helper Class
 * 
 * Helper class for Loan Account Creation E2E Journey (16 API chain)
 * Handles DSP-specific APIs with custom headers
 */

import { APIRequestContext } from '@playwright/test';
import { BaseHelper } from '../base/baseHelper';
import endpoints from '../../config/endpoints.json';
import { ApiResponse } from '../../types/api.types';
import { generateDspAuthHeaders } from '../../utils/dspAuth';
import { getDspSecretKey } from '../../config/envconfig';

export class LoanAccountCreationHelper extends BaseHelper {
  private dspSecretKey: string;

  constructor(request: APIRequestContext) {
    super(request, 'los');
    this.dspSecretKey = getDspSecretKey();
  }

  async login(): Promise<void> {
    this.logger.info('LoanAccountCreationHelper: Using existing authentication');
  }

  /**
   * Generate Offer - Step 1
   * POST /los/api/v1/generate/offer
   */
  async generateOffer(offerData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.generateOffer;
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      
      this.logger.info(`Generating offer for PAN: ${offerData.pan}`);
      
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, offerData);
      
      const response = await this.request.post(fullUrl, {
        data: offerData,
        headers: {
          'Content-Type': 'application/json',
          'X-SourcingChannelCode': sourcingChannelCode,
          ...dspAuthHeaders
        }
      });
      
      const body = await this.parseResponse(response);
      const result: ApiResponse = {
        status: response.status(),
        headers: response.headers(),
        body: body,
        ok: response.ok()
      };
      
      this.logger.info(`Generate offer response status: ${result.status}`);
      
      return result;
    } catch (error: any) {
      this.logger.error('Generate offer failed:', error.message);
      throw error;
    }
  }

  /**
   * Client Dedupe Check - Step 2
   * POST /lms/api/client/dedupe/v1
   */
  async clientDedupeCheck(dedupeData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.clientDedupeCheck;
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      
      this.logger.info(`Client dedupe check for PAN: ${dedupeData.pan}`);
      
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, dedupeData);
      
      const response = await this.request.post(fullUrl, {
        data: dedupeData,
        headers: {
          'Content-Type': 'application/json',
          'X-SourcingChannelCode': sourcingChannelCode,
          ...dspAuthHeaders
        }
      });
      
      const body = await this.parseResponse(response);
      const result: ApiResponse = {
        status: response.status(),
        headers: response.headers(),
        body: body,
        ok: response.ok()
      };
      
      this.logger.info(`Client dedupe check response status: ${result.status}`);
      
      return result;
    } catch (error: any) {
      this.logger.error('Client dedupe check failed:', error.message);
      throw error;
    }
  }

  /**
   * Create Opportunity - Step 3
   * POST /los/api/v1/opportunity
   */
  async createOpportunity(opportunityData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.createOpportunity;
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      
      this.logger.info(`Creating opportunity for PAN: ${opportunityData.pan}`);
      
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, opportunityData);
      
      const response = await this.request.post(fullUrl, {
        data: opportunityData,
        headers: {
          'Content-Type': 'application/json',
          'X-SourcingChannelCode': sourcingChannelCode,
          ...dspAuthHeaders
        }
      });
      
      const body = await this.parseResponse(response);
      const result: ApiResponse = {
        status: response.status(),
        headers: response.headers(),
        body: body,
        ok: response.ok()
      };
      
      this.logger.info(`Create opportunity response status: ${result.status}`);
      
      return result;
    } catch (error: any) {
      this.logger.error('Create opportunity failed:', error.message);
      throw error;
    }
  }

  /**
   * KYC Utility Init - Step 4
   * POST /los/api/v1/utility/kyc/init
   */
  async kycUtilityInit(kycData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.kycUtilityInit;
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      
      this.logger.info(`Initializing KYC utility for opportunity: ${kycData.opportunityId}`);
      
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, kycData);
      
      const response = await this.request.post(fullUrl, {
        data: kycData,
        headers: {
          'Content-Type': 'application/json',
          'X-SourcingChannelCode': sourcingChannelCode,
          ...dspAuthHeaders
        }
      });
      
      const body = await this.parseResponse(response);
      const result: ApiResponse = {
        status: response.status(),
        headers: response.headers(),
        body: body,
        ok: response.ok()
      };
      
      this.logger.info(`KYC utility init response status: ${result.status}`);
      
      return result;
    } catch (error: any) {
      this.logger.error('KYC utility init failed:', error.message);
      throw error;
    }
  }

  /**
   * Get KYC Utility - Step 5
   * GET /los/api/v1/utility/kyc/{utilityReferenceId}?imageType=base64
   */
  async getKycUtility(utilityReferenceId: string, imageType: string = 'base64', sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.getKycUtility.replace('{utilityReferenceId}', utilityReferenceId);
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}?imageType=${imageType}`;
      
      this.logger.info(`Getting KYC utility status for: ${utilityReferenceId}`);
      
      // For GET requests, use empty body for signature generation
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, {});
      
      const response = await this.request.get(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-SourcingChannelCode': sourcingChannelCode,
          ...dspAuthHeaders
        }
      });
      
      const body = await this.parseResponse(response);
      const result: ApiResponse = {
        status: response.status(),
        headers: response.headers(),
        body: body,
        ok: response.ok()
      };
      
      this.logger.info(`Get KYC utility response status: ${result.status}`);
      
      return result;
    } catch (error: any) {
      this.logger.error('Get KYC utility failed:', error.message);
      throw error;
    }
  }
}
