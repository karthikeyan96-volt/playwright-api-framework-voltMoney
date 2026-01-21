

import { test, expect, request as playwrightRequest } from '@playwright/test';
import { LOSHelper } from '../../helpers/los/losHelper';
import { ResponseValidator } from '../../utils/validators';
import { setFeature, setStory, setSeverity, step } from '../../utils/allureHelper';
import creds from '../../config/creds.json';

test.describe.serial('LOS Login Flow', { tag: '@LoginTests' }, () => {
  let losHelper: LOSHelper;
  let jwtToken: string; 
  test.beforeAll(async () => {
    
    const requestContext = await playwrightRequest.newContext();
    losHelper = new LOSHelper(requestContext);
  });

  test('Step 1: Request OTP - Returns 200', async () => {
   
    setFeature('Authentication');
    setStory('OTP Login Flow');
    setSeverity('critical');
    
    const phoneNo = creds.los.phoneNo;
    
    await step('Request OTP for phone number', async () => {
      const response = await losHelper.requestOtp(phoneNo, true);
      
    
      ResponseValidator.validateStatusOk(response);
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      

      expect(response.body.status).toBe('SUCCESS');
      expect(response.body.message).toBe('Otp sent successfully');
      expect(response.body.noOfDigits).toBe(6);
      
      console.log('✅ Step 1: OTP requested successfully for:', phoneNo);
    });
  });

  test('Step 2: Verify OTP - Returns 200 (when OTP is valid)', async () => {

    setFeature('Authentication');
    setStory('OTP Login Flow');
    setSeverity('critical');
    
    const phoneNo = creds.los.phoneNo;
    const otp = creds.los.otp;
    
    await step('Verify OTP and capture JWT token', async () => {
  
      const response = await losHelper.verifyOtp(phoneNo, otp);
      
     
      ResponseValidator.validateStatusOk(response);
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
     
      expect(response.body.status).toBe('SUCCESS');
      expect(response.body.message).toBe('Otp verified successfully');
      ResponseValidator.validateField(response, 'jwt');
      
     
      jwtToken = response.body.jwt;
      expect(jwtToken).toBeTruthy();
      expect(typeof jwtToken).toBe('string');
      expect(jwtToken.split('.')).toHaveLength(3); // JWT has 3 parts: header.payload.signature
      
      console.log('✅ Step 2: OTP verified successfully! JWT token received.');
      console.log('JWT Token:', jwtToken);
    });
  });

  test('Step 3: Fetch User Data - Returns 200', async () => {
   
    setFeature('Authentication');
    setStory('OTP Login Flow');
    setSeverity('critical');
    
    await step('Set JWT token and fetch user data', async () => {
     
      if (!jwtToken) {
        throw new Error('No JWT token available from Step 2');
      }
      
 
      losHelper.setAuthToken(jwtToken);
      
     
      const response = await losHelper.getUserData();
      
      
      ResponseValidator.validateStatusOk(response);
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      
      
      expect(response.body.isLoggedIn).toBe(true);
      
      
      expect(response.body.user).toBeDefined();
      expect(response.body.user.phoneNumber).toBe(creds.los.phoneNo);
      expect(response.body.user.userId).toBeTruthy();
      expect(response.body.user.state).toBe('ACTIVE');
      
   
      expect(response.body.linkedBorrowerAccounts).toBeDefined();
      expect(Array.isArray(response.body.linkedBorrowerAccounts)).toBe(true);
      expect(response.body.linkedBorrowerAccounts.length).toBeGreaterThan(0);
      
    
      const firstAccount = response.body.linkedBorrowerAccounts[0];
      expect(firstAccount.accountId).toBeTruthy();
      expect(firstAccount.accountState).toBe('ACTIVE');
      expect(firstAccount.accountHolderPhoneNumber).toBe(creds.los.phoneNo);
      
      console.log('✅ Step 3: User data fetched successfully!');
      console.log('User data:', JSON.stringify(response.body, null, 2));
    });
  });
});
