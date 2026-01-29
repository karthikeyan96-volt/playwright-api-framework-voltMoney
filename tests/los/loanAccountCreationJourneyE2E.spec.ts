/**
 * Loan Account Creation Journey E2E Tests
 * 
 * Tests the complete loan account creation flow (16 API chain)
 * Uses serial execution as APIs depend on each other
 * 
 * @tag @LoanAccountCreation
 */

import { test, expect, request as playwrightRequest } from '@playwright/test';
import { LoanAccountCreationHelper } from '../../helpers/los/loanAccountCreationHelper';
import loanAccountData from '../../testdata/los/loanAccountCreation.json';
import { setFeature, setStory, setSeverity, step } from '../../utils/allureHelper';

test.describe.serial('Loan Account Creation Journey E2E', { tag: '@LoanAccountCreation' }, () => {
  let loanHelper: LoanAccountCreationHelper;
  let apiContext: any;
  let opportunityId: string; // Store opportunityId from Step 3
  let utilityReferenceId: string; // Store utilityReferenceId from Step 4
  
  // Select user for testing
  const selectedUser = loanAccountData.userDetails.automationMockUser;

  test.beforeAll(async () => {
    // Create APIRequestContext manually
    apiContext = await playwrightRequest.newContext();
    
    // Initialize loan account creation helper
    loanHelper = new LoanAccountCreationHelper(apiContext);
  });

  test.afterAll(async () => {
    // Dispose APIRequestContext
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

      // Assertions
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      
      // Validate required fields
      testData.expectedResponse.requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
      
      // Log response for debugging
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

      // Assertions
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      
      // Validate required fields
      testData.expectedResponse.requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
      
      // Validate specific values
      expect(response.body.isDuplicate).toBe(testData.expectedResponse.isDuplicate);
      expect(response.body.message).toBe(testData.expectedResponse.message);
      expect(Array.isArray(response.body.availableAssetCategories)).toBe(true);
      testData.expectedResponse.availableAssetCategories.forEach(category => {
        expect(response.body.availableAssetCategories).toContain(category);
      });
      
      // Log response for debugging
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

      // Assertions
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      
      // Validate required fields
      testData.expectedResponse.requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
      
      // Capture opportunityId for subsequent steps
      opportunityId = response.body.opportunityId;
      expect(opportunityId).toBeDefined();
      
      // Log response for debugging
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

      // Assertions
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      
      // Validate required fields
      testData.expectedResponse.requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
      
      // Validate specific values
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.subStatus).toBe(testData.expectedResponse.subStatus);
      expect(response.body.opportunityId).toBe(opportunityId);
      
      // Capture utilityReferenceId for subsequent steps
      utilityReferenceId = response.body.utilityReferenceId;
      expect(utilityReferenceId).toBeDefined();
      
      // Log response for debugging
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

      // Assertions
      expect(response.status).toBe(testData.expectedResponse.statusCode);
      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
      
      // Validate required fields
      testData.expectedResponse.requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
      
      // Validate specific values
      expect(response.body.status).toBe(testData.expectedResponse.status);
      expect(response.body.subStatus).toBe(testData.expectedResponse.subStatus);
      expect(response.body.opportunityId).toBe(opportunityId);
      expect(response.body.utilityReferenceId).toBe(utilityReferenceId);
      
      // Log response for debugging
      console.log('Get KYC Utility Response:', JSON.stringify(response.body, null, 2));
    });
  });

  // Placeholder for remaining 11 APIs
  
  test.skip('Step 6: [Next API Name] - Returns 200', async () => {
    // To be implemented
  });
});
