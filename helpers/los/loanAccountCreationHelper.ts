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
  async getKycUtility(utilityReferenceId: string, imageType: string = 'base64', sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.getKycUtility.replace('{utilityReferenceId}', utilityReferenceId);
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}?imageType=${imageType}`;
      this.logger.info(`Getting KYC utility status for: ${utilityReferenceId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey);
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
  async initPhotoVerification(photoData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.initPhotoVerification;
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Initializing photo verification for opportunity: ${photoData.opportunityId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, photoData);
      const response = await this.request.post(fullUrl, {
        data: photoData,
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
      this.logger.info(`Init photo verification response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Init photo verification failed:', error.message);
      throw error;
    }
  }
  async getPhotoVerification(utilityReferenceId: string, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.getPhotoVerification.replace('{utilityReferenceId}', utilityReferenceId);
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Getting photo verification for: ${utilityReferenceId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey);
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
      this.logger.info(`Get photo verification response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Get photo verification failed:', error.message);
      throw error;
    }
  }
  async saveAdditionalData(additionalDataPayload: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.saveAdditionalData;
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Saving additional data for opportunity: ${additionalDataPayload.opportunityId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, additionalDataPayload);
      const response = await this.request.post(fullUrl, {
        data: additionalDataPayload,
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
      this.logger.info(`Save additional data response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Save additional data failed:', error.message);
      throw error;
    }
  }
  async getAdditionalData(utilityReferenceId: string, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.getAdditionalData.replace('{utilityReferenceId}', utilityReferenceId);
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Getting additional data for: ${utilityReferenceId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey);
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
      this.logger.info(`Get additional data response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Get additional data failed:', error.message);
      throw error;
    }
  }
  async bankUtilityInit(bankData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.bankUtilityInit;
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Initializing bank verification for opportunity: ${bankData.opportunityId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, bankData);
      const response = await this.request.post(fullUrl, {
        data: bankData,
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
      this.logger.info(`Bank utility init response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Bank utility init failed:', error.message);
      throw error;
    }
  }
  async getBankUtility(utilityReferenceId: string, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.getBankUtility.replace('{utilityReferenceId}', utilityReferenceId);
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Getting bank utility status for: ${utilityReferenceId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey);
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
      this.logger.info(`Get bank utility response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Get bank utility failed:', error.message);
      throw error;
    }
  }
  async createMandate(mandateData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.createMandate;
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Creating mandate for opportunity: ${mandateData.opportunityId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, mandateData);
      const response = await this.request.post(fullUrl, {
        data: mandateData,
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
      this.logger.info(`Create mandate response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Create mandate failed:', error.message);
      throw error;
    }
  }
  async getMandate(utilityReferenceId: string, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.getMandate.replace('{utilityReferenceId}', utilityReferenceId);
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Getting mandate status for: ${utilityReferenceId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey);
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
      this.logger.info(`Get mandate response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Get mandate failed:', error.message);
      throw error;
    }
  }
  async createVerificationLogEmail(verificationData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.createVerificationLogEmail;
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Creating verification log for opportunity: ${verificationData.opportunityId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, verificationData);
      const response = await this.request.post(fullUrl, {
        data: verificationData,
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
      this.logger.info(`Create verification log response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Create verification log failed:', error.message);
      throw error;
    }
  }
  async getVerificationLog(utilityReferenceId: string, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.getVerificationLog.replace('{utilityReferenceId}', utilityReferenceId);
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Getting verification log for: ${utilityReferenceId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey);
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
      this.logger.info(`Get verification log response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Get verification log failed:', error.message);
      throw error;
    }
  }
  async generateLoanContract(opportunityId: string, contractData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.generateLoanContract.replace('{opportunityId}', opportunityId);
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Generating loan contract for opportunity: ${opportunityId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, contractData);
      const response = await this.request.post(fullUrl, {
        data: contractData,
        headers: {
          'Content-Type': 'application/json',
          'X-SourcingChannelCode': sourcingChannelCode,
          'X-RequestSource': 'SYSTEM',
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
      this.logger.info(`Generate loan contract response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Generate loan contract failed:', error.message);
      throw error;
    }
  }
  async approveKfs(kfsData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.approveKfs;
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Approving KFS for opportunity: ${kfsData.opportunityId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, kfsData);
      const response = await this.request.post(fullUrl, {
        data: kfsData,
        headers: {
          'Content-Type': 'application/json',
          'X-SourcingChannelCode': sourcingChannelCode,
          'requester': kfsData.requester,
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
      this.logger.info(`Approve KFS response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Approve KFS failed:', error.message);
      throw error;
    }
  }
  async kfsConsent(kfsReferenceId: string, consentData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.kfsConsent.replace('{kfsReferenceId}', kfsReferenceId);
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Submitting KFS consent for: ${kfsReferenceId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, consentData);
      const response = await this.request.post(fullUrl, {
        data: consentData,
        headers: {
          'Content-Type': 'application/json',
          'X-SourcingChannelCode': sourcingChannelCode,
          'requester': 'DSP-UAT',
          'X-Client-Ip': '192.168.1.1',
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
      this.logger.info(`KFS consent response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('KFS consent failed:', error.message);
      throw error;
    }
  }
  async approveAgreement(agreementData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.approveAgreement;
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Approving Agreement for opportunity: ${agreementData.opportunityId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, agreementData);
      const response = await this.request.post(fullUrl, {
        data: agreementData,
        headers: {
          'Content-Type': 'application/json',
          'X-SourcingChannelCode': sourcingChannelCode,
          'requester': 'DSP-UAT',
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
      this.logger.info(`Approve Agreement response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Approve Agreement failed:', error.message);
      throw error;
    }
  }
  async agreementConsent(agreementReferenceId: string, consentData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.agreementConsent.replace('{agreementReferenceId}', agreementReferenceId);
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Submitting Agreement consent for: ${agreementReferenceId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, consentData);
      const response = await this.request.post(fullUrl, {
        data: consentData,
        headers: {
          'Content-Type': 'application/json',
          'X-SourcingChannelCode': sourcingChannelCode,
          'requester': 'DSP-UAT',
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
      this.logger.info(`Agreement consent response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Agreement consent failed:', error.message);
      throw error;
    }
  }
  async submitOpportunity(opportunityId: string, submitData: any, sourcingChannelCode: string = 'DSP-UAT'): Promise<ApiResponse> {
    try {
      const endpoint = endpoints.los.loanAccountCreation.submitOpportunity.replace('{opportunityId}', opportunityId);
      const dspBaseUrl = this.getDspBaseUrl();
      const fullUrl = `${dspBaseUrl}${endpoint}`;
      this.logger.info(`Submitting opportunity: ${opportunityId}`);
      const dspAuthHeaders = generateDspAuthHeaders(this.dspSecretKey, submitData);
      const response = await this.request.post(fullUrl, {
        data: submitData,
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
      this.logger.info(`Submit opportunity response status: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error('Submit opportunity failed:', error.message);
      throw error;
    }
  }
}
