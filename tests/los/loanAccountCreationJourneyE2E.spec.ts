import { test, expect, request as playwrightRequest } from '@playwright/test';
import { LoanAccountCreationHelper } from '../../helpers/los/loanAccountCreationHelper';
import loanAccountData from '../../testdata/los/loanAccountCreation.json';
import { setFeature, setStory, setSeverity, step } from '../../utils/allureHelper';
test.describe.serial('Loan Account Creation Journey E2E', { tag: '@LoanAccountCreation' }, () => {
  let loanHelper: LoanAccountCreationHelper;
  let apiContext: any;
  let opportunityId: string; 
  let utilityReferenceId: string; 
  let photoVerificationReferenceId: string; 
  let additionalDataReferenceId: string; 
  let bankUtilityReferenceId: string; 
  let mandateReferenceId: string; 
  let verificationLogReferenceId: string;
  let mobileVerificationLogReferenceId: string; 
  let agreementReferenceId: string; 
  let kfsReferenceId: string; 
  let newKfsReferenceId: string; 
  let newAgreementReferenceId: string; 
  const selectedUser = loanAccountData.userDetails.automationMockUser;
  test.beforeAll(async () => {
    apiContext = await playwrightRequest.newContext();
    loanHelper = new LoanAccountCreationHelper(apiContext);
  });
  test.afterAll(async () => {
    await apiContext.dispose();
  });
  test('Step 1: Generate Offer - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Generate offer with PAN and assets', async () => {
      const testData = loanAccountData.generateOffer;
      const response = await loanHelper.generateOffer(
        {
          pan: selectedUser.pan,
          ...testData.request
        },
        loanAccountData.common.sourcingChannelCode
      );
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      testData.expectedResponse.requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
      console.log('Generate Offer Response:', JSON.stringify(response.body, null, 2));
    });
  });
  test('Step 2: Client Dedupe Check - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Check client dedupe with PAN', async () => {
      const testData = loanAccountData.clientDedupeCheck;
      const response = await loanHelper.clientDedupeCheck(
        {
          pan: selectedUser.pan,
          ...testData.request
        },
        loanAccountData.common.sourcingChannelCode
      );
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      testData.expectedResponse.requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
      expect(response.body.isDuplicate).toBe(testData.expectedResponse.isDuplicate);
      expect(response.body.message).toBe(testData.expectedResponse.message);
      expect(Array.isArray(response.body.availableAssetCategories)).toBe(true);
      testData.expectedResponse.availableAssetCategories.forEach(category => {
        expect(response.body.availableAssetCategories).toContain(category);
      });
      console.log('Client Dedupe Check Response:', JSON.stringify(response.body, null, 2));
    });
  });
  test('Step 3: Create Opportunity - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Create opportunity for loan creation', async () => {
      const testData = loanAccountData.createOpportunity;
      const response = await loanHelper.createOpportunity(
        {
          pan: selectedUser.pan,
          phoneNumber: selectedUser.phone,
          ...testData.request
        },
        loanAccountData.common.sourcingChannelCode
      );
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      testData.expectedResponse.requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
      opportunityId = response.body.opportunityId;
      expect(opportunityId).toBeDefined();
      console.log('Create Opportunity Response:', JSON.stringify(response.body, null, 2));
      console.log('Captured opportunityId:', opportunityId);
    });
  });
  test('Step 4: KYC Utility Init - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Initialize KYC utility', async () => {
      const testData = loanAccountData.kycUtilityInit;
      const response = await loanHelper.kycUtilityInit(
        {
          opportunityId: opportunityId,
          ...testData.request
        },
        loanAccountData.common.sourcingChannelCode
      );
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      testData.expectedResponse.requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.subStatus).toBe(testData.expectedResponse.subStatus);
      expect(response.body.opportunityId).toBe(opportunityId);
      utilityReferenceId = response.body.utilityReferenceId;
      expect(utilityReferenceId).toBeDefined();
      console.log('KYC Utility Init Response:', JSON.stringify(response.body, null, 2));
      console.log('Captured utilityReferenceId:', utilityReferenceId);
    });
  });
  test('Step 5: Get KYC Utility - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Get KYC utility status', async () => {
      const testData = loanAccountData.getKycUtility;
      const response = await loanHelper.getKycUtility(
        utilityReferenceId,
        testData.request.imageType,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Get KYC Utility Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      console.log('KYC Status:', response.body.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      testData.expectedResponse.requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBe(utilityReferenceId);
    });
  });
  test('Step 6: Init Photo Verification - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Initialize photo verification', async () => {
      const testData = loanAccountData.initPhotoVerification;
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(process.cwd(), testData.request.userImagePath);
      let userImage = fs.readFileSync(imagePath, 'utf-8').trim();
      if (userImage.startsWith('url(data:image/png;base64,')) {
        userImage = userImage.replace('url(data:image/png;base64,', '').replace(')', '');
      } else if (userImage.startsWith('data:image/png;base64,')) {
        userImage = userImage.replace('data:image/png;base64,', '');
      }
      console.log('Sending photo verification request for opportunityId:', opportunityId);
      console.log('Base64 image length:', userImage.length);
      const response = await loanHelper.initPhotoVerification(
        {
          opportunityId: opportunityId,
          userImage: userImage,
          customerConsent: testData.request.customerConsent
        },
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Init Photo Verification Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBeDefined();
      photoVerificationReferenceId = response.body.utilityReferenceId;
      console.log('Captured photoVerificationReferenceId:', photoVerificationReferenceId);
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.subStatus).toBe(testData.expectedResponse.subStatus);
      expect(response.body.fenixLoanAccountId).toBeNull();
    });
  });
  test('Step 6.1: Get Photo Verification - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Get photo verification status', async () => {
      const testData = loanAccountData.getPhotoVerification;
      console.log('Getting photo verification for utilityReferenceId:', photoVerificationReferenceId);
      const response = await loanHelper.getPhotoVerification(
        photoVerificationReferenceId,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Get Photo Verification Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBe(photoVerificationReferenceId);
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.subStatus).toBe(testData.expectedResponse.subStatus);
      expect(response.body.fenixLoanAccountId).toBeNull();
    });
  });
  test('Step 7: Save Additional Data - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Save additional data for opportunity', async () => {
      const testData = loanAccountData.saveAdditionalData;
      console.log('Saving additional data for opportunityId:', opportunityId);
      const response = await loanHelper.saveAdditionalData(
        {
          opportunityId: opportunityId,
          ...testData.request
        },
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Save Additional Data Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      testData.expectedResponse.requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
      expect(response.body.opportunityId).toBe(opportunityId);
      if (response.body.utilityReferenceId) {
        additionalDataReferenceId = response.body.utilityReferenceId;
        console.log('Captured additionalDataReferenceId:', additionalDataReferenceId);
      }
    });
  });
  test('Step 8: Get Additional Data - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Get additional data', async () => {
      const testData = loanAccountData.getAdditionalData;
      console.log('Getting additional data for utilityReferenceId:', additionalDataReferenceId);
      const response = await loanHelper.getAdditionalData(
        additionalDataReferenceId,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Get Additional Data Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBe(additionalDataReferenceId);
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.subStatus).toBe(testData.expectedResponse.subStatus);
    });
  });
  test('Step 9: Bank Utility Init - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Initialize bank verification', async () => {
      const testData = loanAccountData.bankUtilityInit;
      console.log('Initializing bank verification for opportunityId:', opportunityId);
      const response = await loanHelper.bankUtilityInit(
        {
          opportunityId: opportunityId,
          ...testData.request
        },
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Bank Utility Init Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBeDefined();
      bankUtilityReferenceId = response.body.utilityReferenceId;
      console.log('Captured bankUtilityReferenceId:', bankUtilityReferenceId);
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.subStatus).toBe(testData.expectedResponse.subStatus);
      expect(response.body.fenixLoanAccountId).toBeNull();
    });
  });
  test('Step 10: Get Bank Utility - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Get bank utility status', async () => {
      const testData = loanAccountData.getBankUtility;
      console.log('Getting bank utility for utilityReferenceId:', bankUtilityReferenceId);
      const response = await loanHelper.getBankUtility(
        bankUtilityReferenceId,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Get Bank Utility Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBe(bankUtilityReferenceId);
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.subStatus).toBe(testData.expectedResponse.subStatus);
      expect(response.body.fenixLoanAccountId).toBeNull();
    });
  });
  test('Step 11: Create Mandate - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Create mandate for bank account', async () => {
      const testData = loanAccountData.createMandate;
      console.log('Creating mandate for opportunityId:', opportunityId);
      console.log('Using bankAccountVerificationId:', bankUtilityReferenceId);
      const response = await loanHelper.createMandate(
        {
          opportunityId: opportunityId,
          bankAccountVerificationId: bankUtilityReferenceId,
          ...testData.request
        },
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Create Mandate Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBeDefined();
      mandateReferenceId = response.body.utilityReferenceId;
      console.log('Captured mandateReferenceId:', mandateReferenceId);
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.subStatus).toBe(testData.expectedResponse.subStatus);
      expect(response.body.fenixLoanAccountId).toBeNull();
    });
  });
  test('Step 12: Get Mandate - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Get mandate status', async () => {
      const testData = loanAccountData.getMandate;
      console.log('Getting mandate for utilityReferenceId:', mandateReferenceId);
      const response = await loanHelper.getMandate(
        mandateReferenceId,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Get Mandate Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBe(mandateReferenceId);
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.subStatus).toBe(testData.expectedResponse.subStatus);
      expect(response.body.fenixLoanAccountId).toBeNull();
    });
  });
  test('Step 13: Create Verification Log Email - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Create email verification log', async () => {
      const testData = loanAccountData.createVerificationLogEmail;
      console.log('Creating verification log for opportunityId:', opportunityId);
      const response = await loanHelper.createVerificationLogEmail(
        {
          opportunityId: opportunityId,
          ...testData.request
        },
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Create Verification Log Email Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBeDefined();
      verificationLogReferenceId = response.body.utilityReferenceId;
      console.log('Captured verificationLogReferenceId:', verificationLogReferenceId);
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.fenixLoanAccountId).toBeNull();
    });
  });
  test('Step 14: Get Verification Log Email - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Get verification log status', async () => {
      const testData = loanAccountData.getVerificationLog;
      console.log('Getting verification log for utilityReferenceId:', verificationLogReferenceId);
      const response = await loanHelper.getVerificationLog(
        verificationLogReferenceId,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Get Verification Log Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBe(verificationLogReferenceId);
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.fenixLoanAccountId).toBeNull();
    });
  });
  test('Step 14.1: Create Verification Log Mobile - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Create mobile verification log', async () => {
      const testData = loanAccountData.createVerificationLogMobile;
      console.log('Creating mobile verification log for opportunityId:', opportunityId);
      console.log('Using phone number:', selectedUser.phone);
      const response = await loanHelper.createVerificationLogEmail(
        {
          opportunityId: opportunityId,
          ...testData.request,
          verifiedValue: selectedUser.phone
        },
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Create Verification Log Mobile Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBeDefined();
      mobileVerificationLogReferenceId = response.body.utilityReferenceId;
      console.log('Captured mobileVerificationLogReferenceId:', mobileVerificationLogReferenceId);
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.fenixLoanAccountId).toBeNull();
    });
  });
  test('Step 15: Generate Loan Contract - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Generate loan contract', async () => {
      const testData = loanAccountData.generateLoanContract;
      console.log('=== Step 15: Generate Loan Contract ===');
      console.log('opportunityId:', opportunityId);
      console.log('kycReferenceId (from Step 4):', utilityReferenceId);
      console.log('photoUtilityReferenceId (from Step 6):', photoVerificationReferenceId);
      console.log('additionalUtilityReferenceId (from Step 7):', additionalDataReferenceId);
      console.log('bankAccountReferenceId (from Step 9):', bankUtilityReferenceId);
      console.log('emailVerificationLogId (from Step 13):', verificationLogReferenceId);
      const requestBody = {
        kfsRequest: {
          ...testData.request.kfsRequest,
          emailVerificationLogId: verificationLogReferenceId
        },
        agreementRequest: {
          kycReferenceId: utilityReferenceId,
          additionalUtilityReferenceId: additionalDataReferenceId,
          photoUtilityReferenceId: photoVerificationReferenceId,
          bankAccountReferenceId: bankUtilityReferenceId
        },
        redirectionUrl: testData.request.redirectionUrl
      };
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      const response = await loanHelper.generateLoanContract(
        opportunityId,
        requestBody,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Generate Loan Contract Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.status).toBe(testData.expectedResponse.status);
      if (response.body.steps && Array.isArray(response.body.steps)) {
        const agreementStep = response.body.steps.find((step: any) => step.utilityType === 'AGREEMENT_SIGN');
        const kfsStep = response.body.steps.find((step: any) => step.utilityType === 'KFS');
        if (agreementStep && agreementStep.utilityReferenceId) {
          agreementReferenceId = agreementStep.utilityReferenceId;
          console.log('Captured agreementReferenceId:', agreementReferenceId);
        }
        if (kfsStep && kfsStep.utilityReferenceId) {
          kfsReferenceId = kfsStep.utilityReferenceId;
          console.log('Captured kfsReferenceId:', kfsReferenceId);
        }
      }
    });
  });
  test('Step 15.1: Approve KFS - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Approve KFS', async () => {
      const testData = loanAccountData.approveKfs;
      console.log('=== Step 15.1: Approve KFS ===');
      console.log('opportunityId:', opportunityId);
      console.log('emailVerificationLogId (from Step 13):', verificationLogReferenceId);
      const requestBody = {
        opportunityId: opportunityId,
        ...testData.request,
        emailVerificationLogId: verificationLogReferenceId
      };
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      const response = await loanHelper.approveKfs(
        requestBody,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Approve KFS Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      if (response.body.utilityReferenceId) {
        newKfsReferenceId = response.body.utilityReferenceId;
        console.log('Captured NEW KFS Reference ID from Step 15.1:', newKfsReferenceId);
      }
    });
  });
  test('Step 15.2: KFS Consent - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Submit KFS consent', async () => {
      const testData = loanAccountData.kfsConsent;
      console.log('=== Step 15.2: KFS Consent ===');
      console.log('Using NEW KFS Reference ID from Step 15.1:', newKfsReferenceId);
      const requestBody = {
        ...testData.request
      };
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      const response = await loanHelper.kfsConsent(
        newKfsReferenceId,
        requestBody,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('KFS Consent Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
    });
  });
  test('Step 15.3: Approve Agreement - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Approve Agreement', async () => {
      const testData = loanAccountData.approveAgreement;
      console.log('=== Step 15.3: Approve Agreement ===');
      console.log('opportunityId:', opportunityId);
      console.log('kycReferenceId (from Step 4):', utilityReferenceId);
      console.log('additionalUtilityReferenceId (from Step 7):', additionalDataReferenceId);
      console.log('bankAccountReferenceId (from Step 9):', bankUtilityReferenceId);
      console.log('kfsReferenceId (NEW from Step 15.1):', newKfsReferenceId);
      console.log('photoUtilityReferenceId (from Step 6):', photoVerificationReferenceId);
      const requestBody = {
        opportunityId: opportunityId,
        kycReferenceId: utilityReferenceId,
        additionalUtilityReferenceId: additionalDataReferenceId,
        bankAccountReferenceId: bankUtilityReferenceId,
        kfsReferenceId: newKfsReferenceId,
        photoUtilityReferenceId: photoVerificationReferenceId
      };
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      const response = await loanHelper.approveAgreement(
        requestBody,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Approve Agreement Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      if (response.body.utilityReferenceId) {
        newAgreementReferenceId = response.body.utilityReferenceId;
        console.log('Captured NEW AGREEMENT Reference ID from Step 15.3:', newAgreementReferenceId);
      }
    });
  });
  test('Step 15.4: Agreement Consent - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Submit Agreement consent', async () => {
      const testData = loanAccountData.agreementConsent;
      console.log('=== Step 15.4: Agreement Consent ===');
      console.log('Using NEW AGREEMENT Reference ID from Step 15.3:', newAgreementReferenceId);
      const requestBody = {};
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      const response = await loanHelper.agreementConsent(
        newAgreementReferenceId,
        requestBody,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Agreement Consent Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
    });
  });
  test('Step 16: Submit Opportunity - Returns 200', async () => {
    setFeature('Loan Account Creation');
    setStory('E2E Loan Account Creation Journey');
    setSeverity('critical');
    await step('Submit opportunity with all reference IDs', async () => {
      const testData = loanAccountData.submitOpportunity;
      console.log('=== Step 16: Submit Opportunity ===');
      console.log('opportunityId:', opportunityId);
      console.log('bankUtilityReferenceId (from Step 9):', bankUtilityReferenceId);
      console.log('agreementReferenceId (NEW from Step 15.3):', newAgreementReferenceId);
      console.log('kfsReferenceId (NEW from Step 15.1):', newKfsReferenceId);
      console.log('mandateReferenceId (from Step 11):', mandateReferenceId);
      console.log('additionalDataReferenceId (from Step 7):', additionalDataReferenceId);
      console.log('utilityReferenceId/kycReferenceId (from Step 4):', utilityReferenceId);
      console.log('photoVerificationReferenceId (from Step 6):', photoVerificationReferenceId);
      console.log('mobileVerificationLogReferenceId (from Step 14.1):', mobileVerificationLogReferenceId);
      console.log('verificationLogReferenceId/emailVerificationLogId (from Step 13):', verificationLogReferenceId);
      const requestBody = {
        submittedDataList: [
          {
            dataType: 'BANK_ACCOUNT',
            referenceId: bankUtilityReferenceId
          },
          {
            dataType: 'AGREEMENT',
            referenceId: newAgreementReferenceId
          },
          {
            dataType: 'KFS',
            referenceId: newKfsReferenceId
          },
          {
            dataType: 'MANDATE',
            referenceId: mandateReferenceId
          },
          {
            dataType: 'ADDITIONAL_DATA',
            referenceId: additionalDataReferenceId
          },
          {
            dataType: 'KYC',
            referenceId: utilityReferenceId
          },
          {
            dataType: 'PHOTO_VERIFICATION',
            referenceId: photoVerificationReferenceId
          },
          {
            dataType: 'MOBILE_VERIFICATION_LOG',
            referenceId: mobileVerificationLogReferenceId
          },
          {
            dataType: 'EMAIL_VERIFICATION_LOG',
            referenceId: verificationLogReferenceId
          }
        ]
      };
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      const response = await loanHelper.submitOpportunity(
        opportunityId,
        requestBody,
        loanAccountData.common.sourcingChannelCode
      );
      console.log('Submit Opportunity Response:', JSON.stringify(response.body, null, 2));
      console.log('Response Status Code:', response.status);
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
    });
  });
});
