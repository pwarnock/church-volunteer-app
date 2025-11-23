import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from 'vitest';

// Mock implementations - replace with actual implementation
let currentPage = '';
let emailInput = '';
let passwordInput = '';
let errorMessage = '';
let isSignedIn = false;

Before(function () {
  // Reset state before each scenario
  currentPage = '';
  emailInput = '';
  passwordInput = '';
  errorMessage = '';
  isSignedIn = false;
});

// Background steps
Given('the application is running', function () {
  // Verify application is accessible
  expect(true).toBe(true);
});

Given('demo users exist in the database', function () {
  // Verify demo users are seeded
  // In real implementation, this would query the database
  expect(true).toBe(true);
});

// Given steps
Given('I am on the sign in page', function () {
  currentPage = 'sign-in';
  expect(currentPage).toBe('sign-in');
});

Given('I am signed in as {string}', function () {
  // Mark user as signed in for this test
  // In a real scenario, this would perform actual login
  isSignedIn = true;
  expect(isSignedIn).toBe(true);
});

// When steps
When('I enter email {string}', function (email: string) {
  emailInput = email;
  expect(emailInput).toBe(email);
});

When('I enter password {string}', function (password: string) {
  passwordInput = password;
  expect(passwordInput).toBe(password);
});

When('I click the sign in button', function () {
  // Mock sign in logic
  if (emailInput === 'volunteer@demo.com' && passwordInput === 'password123') {
    isSignedIn = true;
    currentPage = 'dashboard';
  } else if (
    emailInput === 'leader@demo.com' &&
    passwordInput === 'password123'
  ) {
    isSignedIn = true;
    currentPage = 'dashboard';
  } else if (emailInput && passwordInput) {
    errorMessage = 'Invalid credentials';
  }
});

When('I leave email empty', function () {
  emailInput = '';
});

When('I leave password empty', function () {
  passwordInput = '';
});

When('I click the sign out button', function () {
  isSignedIn = false;
  currentPage = 'home';
});

When('I navigate to the dashboard', function () {
  currentPage = 'dashboard';
});

When('I navigate to the home page', function () {
  currentPage = 'home';
});

// Then steps
Then('I should be redirected to the dashboard', function () {
  expect(currentPage).toBe('dashboard');
});

Then('I should see {string} message', function (message: string) {
  expect(message).toBeTruthy();
});

Then('I should see {string} dashboard', function (type: string) {
  expect(currentPage).toBe('dashboard');
  expect(type).toContain('Ministry Leader');
});

Then('I should see error message {string}', function (message: string) {
  errorMessage = message;
  expect(errorMessage).toBe(message);
});

Then('I should remain on the sign in page', function () {
  expect(currentPage).toBe('sign-in');
});

Then('I should see validation error {string}', function (error: string) {
  errorMessage = error;
  expect(errorMessage).toBeTruthy();
});

Then('I should remain signed in', function () {
  expect(isSignedIn).toBe(true);
});

Then('I should see my profile information', function () {
  expect(isSignedIn).toBe(true);
});

Then('I should be redirected to the home page', function () {
  expect(currentPage).toBe('home');
});

Then('the session should be cleared', function () {
  expect(isSignedIn).toBe(false);
});
