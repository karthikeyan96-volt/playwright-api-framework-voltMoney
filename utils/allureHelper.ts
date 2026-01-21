/**
 * Allure Helper Utility
 * 
 * Provides helper functions for Allure reporting:
 * - Attach request/response data
 * - Add test metadata (severity, feature, story)
 * - Add links to issues/documentation
 * - Add custom steps
 */

import { allure } from 'allure-playwright';

/**
 * Attach API request details to Allure report
 * 
 * @param method - HTTP method
 * @param url - Request URL
 * @param headers - Request headers
 * @param body - Request body (optional)
 */
export function attachRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: any
): void {
  const requestData = {
    method,
    url,
    headers,
    ...(body && { body })
  };
  
  allure.attachment(
    'Request',
    JSON.stringify(requestData, null, 2),
    'application/json'
  );
}

/**
 * Attach API response details to Allure report
 * 
 * @param status - Response status code
 * @param headers - Response headers
 * @param body - Response body
 */
export function attachResponse(
  status: number,
  headers: Record<string, string>,
  body: any
): void {
  const responseData = {
    status,
    headers,
    body
  };
  
  allure.attachment(
    'Response',
    JSON.stringify(responseData, null, 2),
    'application/json'
  );
}

/**
 * Attach curl command for reproducing the request
 * 
 * @param method - HTTP method
 * @param url - Request URL
 * @param headers - Request headers
 * @param body - Request body (optional)
 */
export function attachCurlCommand(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: any
): void {
  let curlCommand = `curl -X ${method} '${url}'`;
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curlCommand += ` \\\n  -H '${key}: ${value}'`;
  });
  
  // Add body for POST/PUT/PATCH
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    curlCommand += ` \\\n  --data '${JSON.stringify(body)}'`;
  }
  
  allure.attachment('Curl Command', curlCommand, 'text/plain');
}

/**
 * Add severity to test
 * 
 * @param severity - Test severity (blocker, critical, normal, minor, trivial)
 */
export function setSeverity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
  allure.severity(severity);
}

/**
 * Add feature tag to test
 * 
 * @param feature - Feature name
 */
export function setFeature(feature: string): void {
  allure.feature(feature);
}

/**
 * Add story tag to test
 * 
 * @param story - Story name
 */
export function setStory(story: string): void {
  allure.story(story);
}

/**
 * Add link to issue tracker
 * 
 * @param issueId - Issue ID (e.g., JIRA-123)
 * @param url - Issue URL (optional)
 */
export function addIssueLink(issueId: string, url?: string): void {
  allure.issue(issueId, url);
}

/**
 * Add link to test management system
 * 
 * @param testCaseId - Test case ID
 * @param url - Test case URL (optional)
 */
export function addTestCaseLink(testCaseId: string, url?: string): void {
  allure.tms(testCaseId, url);
}

/**
 * Add custom link
 * 
 * @param name - Link name
 * @param url - Link URL
 */
export function addLink(name: string, url: string): void {
  allure.link(url, name);
}

/**
 * Add custom step to test
 * 
 * @param name - Step name
 * @param callback - Step callback function
 */
export async function step<T>(name: string, callback: () => Promise<T>): Promise<T> {
  return await allure.step(name, callback);
}

/**
 * Add description to test
 * 
 * @param description - Test description
 */
export function setDescription(description: string): void {
  allure.description(description);
}

/**
 * Add owner to test
 * 
 * @param owner - Test owner name
 */
export function setOwner(owner: string): void {
  allure.owner(owner);
}

/**
 * Add tag to test
 * 
 * @param tag - Tag name
 */
export function addTag(tag: string): void {
  allure.tag(tag);
}
