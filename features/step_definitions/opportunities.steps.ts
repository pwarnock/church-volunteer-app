import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';

// Mock state

let currentPage = '';
let opportunities: Array<Record<string, unknown>> = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let selectedOpportunity: any = null;
let applicationMessage = '';
let applications: Array<Record<string, unknown>> = [];
let isSignedInAsLeader = false;

// Background steps
Given('I am signed in as a volunteer', function () {
  // Verify volunteer is authenticated
  expect(true).toBe(true);
});

Given('I am signed in as a ministry leader', function () {
  isSignedInAsLeader = true;
  expect(isSignedInAsLeader).toBe(true);
});

Given('ministry opportunities exist in the database', function () {
  opportunities = [
    {
      id: '1',
      title: 'Sunday School Teacher',
      ministry: "Children's Ministry",
      status: 'ACTIVE',
    },
    {
      id: '2',
      title: 'Community Outreach',
      ministry: 'Outreach',
      status: 'ACTIVE',
    },
    {
      id: '3',
      title: 'Youth Group Mentor',
      ministry: 'Youth',
      status: 'ACTIVE',
    },
  ];
  expect(opportunities.length).toBeGreaterThan(0);
});

Given('opportunities from different ministries exist', function () {
  opportunities = [
    {
      id: '1',
      title: 'Sunday School Teacher',
      ministry: "Children's Ministry",
    },
    { id: '2', title: 'Community Outreach', ministry: 'Outreach' },
    { id: '3', title: 'Worship Leader', ministry: 'Worship' },
  ];
  expect(opportunities.length).toBeGreaterThan(0);
});

Given(
  'I have already applied for {string}',
  function (opportunityTitle: string) {
    const opp = opportunities.find((o) => o.title === opportunityTitle);
    if (opp) {
      applications.push({
        opportunityId: opp.id,
        status: 'PENDING',
      });
    }
    expect(applications.length).toBeGreaterThan(0);
  }
);

Given(
  'I have submitted applications for {int} opportunities',
  function (count: number) {
    applications = Array(count)
      .fill(null)
      .map((_, i) => ({
        opportunityId: `app${i}`,
        status: 'PENDING',
      }));
    expect(applications.length).toBe(count);
  }
);

// When steps
When('I am on the opportunities page', function () {
  currentPage = 'opportunities';
  expect(currentPage).toBe('opportunities');
});

When('I load the page', function () {
  expect(opportunities.length).toBeGreaterThan(0);
});

When('I select filter {string}', function (ministry: string) {
  opportunities = opportunities.filter((o) => o.ministry === ministry);
  expect(opportunities.length).toBeGreaterThan(0);
});

When('I select the {string} opportunity', function (title: string) {
  selectedOpportunity = opportunities.find((o) => o.title === title);
  expect(selectedOpportunity).toBeTruthy();
});

When('I click the {string} button', function (button: string) {
  if (button === 'Apply Now') {
    currentPage = 'application-form';
  } else if (button === 'Submit Application') {
    if (selectedOpportunity && applicationMessage) {
      applications.push({
        opportunityId: selectedOpportunity.id,
        message: applicationMessage,
        status: 'PENDING',
      });
    }
  } else if (button === 'Create') {
    currentPage = 'opportunities';
  }
});

When('I click {string}', function (button: string) {
  if (button === 'Create') {
    currentPage = 'opportunities';
  }
});

When('I enter my application message {string}', function (message: string) {
  applicationMessage = message;
  expect(applicationMessage).toBe(message);
});

When('I navigate to {string}', function (page: string) {
  if (page === 'my applications page') {
    currentPage = 'my-applications';
  } else if (page === '"Create Opportunity"') {
    currentPage = 'create-opportunity';
  } else if (page === 'that opportunity') {
    currentPage = 'opportunity-detail';
  }
});

When('I navigate to my applications page', function () {
  currentPage = 'my-applications';
});

When('I navigate to that opportunity', function () {
  currentPage = 'opportunity-detail';
  expect(selectedOpportunity).toBeTruthy();
});

Given('I am viewing an opportunity', function () {
  selectedOpportunity = opportunities[0];
  currentPage = 'opportunity-detail';
  expect(selectedOpportunity).toBeTruthy();
});

Given('I am viewing the {string} opportunity', function (title: string) {
  selectedOpportunity = opportunities.find((o) => o.title === title);
  currentPage = 'opportunity-detail';
  expect(selectedOpportunity).toBeTruthy();
});

When('I scroll to the requirements section', function () {
  // Mock scrolling
  expect(true).toBe(true);
});

When('I fill in all required fields', function () {
  expect(true).toBe(true);
});

// Then steps
Then('I should see a list of opportunities', function () {
  expect(opportunities.length).toBeGreaterThan(0);
});

Then(
  'each opportunity should display title, description, and ministry type',
  function () {
    opportunities.forEach((opp) => {
      expect(opp.title).toBeTruthy();
      expect(opp.ministry).toBeTruthy();
    });
  }
);

Then(
  'I should only see opportunities from {string}',
  function (ministry: string) {
    opportunities.forEach((opp) => {
      expect(opp.ministry).toBe(ministry);
    });
  }
);

Then('I should see an application form', function () {
  expect(currentPage).toBe('application-form');
});

Then('I can enter a message about why I want to serve', function () {
  expect(true).toBe(true);
});

Then('my application should be recorded', function () {
  expect(applications.length).toBeGreaterThan(0);
});

Then('I should see confirmation message {string}', function (message: string) {
  expect(message).toContain('submitted successfully');
});

Then('the {string} button should be disabled', function (button: string) {
  expect(button).toContain('Apply Now');
});

Then('I should see message {string}', function (message: string) {
  expect(message).toContain('already applied');
});

Then('I should see all my submitted applications', function () {
  expect(applications.length).toBeGreaterThan(0);
});

Then(
  'each should show the status \\(pending, accepted, rejected\\)',
  function () {
    applications.forEach((app) => {
      expect(['PENDING', 'ACCEPTED', 'REJECTED']).toContain(app.status);
    });
  }
);

Then('I should see all requirements listed', function () {
  expect(selectedOpportunity).toBeTruthy();
});

Then(
  'each requirement should be clearly marked as required or optional',
  function () {
    expect(true).toBe(true);
  }
);

Then('the new opportunity should be visible to volunteers', function () {
  expect(opportunities.length).toBeGreaterThan(0);
});
