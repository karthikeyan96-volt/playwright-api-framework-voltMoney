import { test, expect } from '@playwright/test';
import { LMSHelper } from '../../helpers/lms/lmsHelper';
import { ResponseValidator } from '../../utils/validators';
import lmsTestData from '../../testdata/lms/testdata.json';

test.describe('LMS API Tests', () => {
  let lmsHelper: LMSHelper;

  test.beforeAll(async ({ request }) => {
    lmsHelper = new LMSHelper(request);
    await lmsHelper.login();
  });

  test.afterAll(async () => {
    await lmsHelper.logout();
  });

  test('should create a new payment', async () => {
    const paymentData = lmsTestData.payloads.validPayment;
    const response = await lmsHelper.createPayment(paymentData);

    ResponseValidator.validateStatusOk(response);
    ResponseValidator.validateField(response, 'amount', paymentData.amount);
    expect(response.body).toHaveProperty('id');
  });

  test('should retrieve payment by ID', async () => {
    // Create payment first
    const createResponse = await lmsHelper.createPayment(lmsTestData.payloads.validPayment);
    const paymentId = createResponse.body.id;

    // Retrieve payment
    const response = await lmsHelper.getPaymentById(paymentId);

    ResponseValidator.validateStatusOk(response);
    ResponseValidator.validateField(response, 'id', paymentId);
  });

  test('should list all payments', async () => {
    const response = await lmsHelper.listPayments();

    ResponseValidator.validateStatusOk(response);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test('should retrieve account by ID', async () => {
    const accountId = 'ACC-12345';
    const response = await lmsHelper.getAccountById(accountId);

    ResponseValidator.validateStatusOk(response);
    ResponseValidator.validateField(response, 'id', accountId);
  });

  test('should update account information', async () => {
    const accountId = 'ACC-12345';
    const updateData = lmsTestData.payloads.accountUpdate;
    
    const response = await lmsHelper.updateAccount(accountId, updateData);

    ResponseValidator.validateStatusOk(response);
    ResponseValidator.validateField(response, 'status', updateData.status);
  });
});
