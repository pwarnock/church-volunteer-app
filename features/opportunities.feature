Feature: Volunteer Opportunities
  As a volunteer
  I want to browse and apply for ministry opportunities
  So that I can find meaningful ways to serve

  Background:
    Given I am signed in as a volunteer
    And ministry opportunities exist in the database

  Scenario: Volunteer views available opportunities
    Given I am on the opportunities page
    When I load the page
    Then I should see a list of opportunities
    And each opportunity should display title, description, and ministry type

  Scenario: Volunteer filters opportunities by ministry type
    Given I am on the opportunities page
    And opportunities from different ministries exist
    When I select filter "Children's Ministry"
    Then I should only see opportunities from "Children's Ministry"

  Scenario: Volunteer applies for an opportunity
    Given I am on the opportunities page
    When I select the "Sunday School Teacher" opportunity
    And I click the "Apply Now" button
    Then I should see an application form
    And I can enter a message about why I want to serve

  Scenario: Volunteer submits application for opportunity
    Given I am viewing the "Community Outreach" opportunity
    When I enter my application message "I have experience with community service"
    And I click the "Submit Application" button
    Then my application should be recorded
    And I should see confirmation message "Application submitted successfully"

  Scenario: Volunteer cannot apply for same opportunity twice
    Given I have already applied for "Youth Group Mentor"
    When I navigate to that opportunity
    Then the "Apply Now" button should be disabled
    And I should see message "You have already applied for this opportunity"

  Scenario: Volunteer views their applications
    Given I have submitted applications for 2 opportunities
    When I navigate to my applications page
    Then I should see all my submitted applications
    And each should show the status (pending, accepted, rejected)

  Scenario: Opportunity displays requirements clearly
    Given I am viewing an opportunity
    When I scroll to the requirements section
    Then I should see all requirements listed
    And each requirement should be clearly marked as required or optional

  Scenario: Ministry leader creates new opportunity
    Given I am signed in as a ministry leader
    When I navigate to "Create Opportunity"
    And I fill in all required fields
    And I click "Create"
    Then the new opportunity should be visible to volunteers
