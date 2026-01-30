import { test, expect, request as playwrightRequest } from '@playwright/test';
import { LOSHelper } from '../../helpers/los/losHelper';
import { setFeature, setStory, setSeverity, step } from '../../utils/allureHelper';
test.describe('LOS Login - Negative Tests', { tag: '@LoginTests' }, () => {
  let losHelper: LOSHelper;
  test.beforeEach(async () => {
    const requestContext = await playwrightRequest.newContext();
    losHelper = new LOSHelper(requestContext);
  });
  test('Invalid JWT Token - Returns 403', async () => {
    setFeature('Authentication');
    setStory('Negative Testing - Invalid JWT');
    setSeverity('critical');
    await step('Attempt to fetch user data with invalid JWT token', async () => {
      const invalidJwtToken = 'eyJhbGciOiJIUzI1NiJ9.INVALID_TOKEN.qHm-wWBtMIIm3tnPHZM6OxL-ZIDyVynf_SaF_-INVALID';
      losHelper.setAuthToken(invalidJwtToken);
      console.log('🔴 Testing with invalid JWT token:', invalidJwtToken);
      const response = await losHelper.getUserData();
      console.log('Response status:', response.status);
      console.log('Response body:', JSON.stringify(response.body, null, 2));
      expect(response.status).toBe(403);
      expect(response.ok).toBe(false);
      // ❌ INTENTIONAL FAILURE - Expect 200 to demonstrate Allure categories
      expect(response.status).toBe(200); // This will fail!
      console.log('✅ Test passed: Invalid JWT correctly rejected with 403');
    });
  });
  test('Malformed Phone Number - Returns 400', async () => {
    setFeature('Error Handling');
    setStory('Negative Testing - Malformed Data');
    setSeverity('normal');
    await step('Request OTP with malformed phone number', async () => {
      const malformedPhoneNo = 'INVALID_PHONE_FORMAT_@#$%^&*()';
      console.log('🔴 Testing with malformed phone number:', malformedPhoneNo);
      const response = await losHelper.requestOtp(malformedPhoneNo, true);
      console.log('Response status:', response.status);
      console.log('Response body:', JSON.stringify(response.body, null, 2));
      expect(response.status).toBe(400);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(200); // This will fail!
      console.log('✅ Test passed: Malformed data correctly rejected with 400');
    });
  });
});
