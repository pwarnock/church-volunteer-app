Feature: User Authentication
  As a user
  I want to sign in securely
  So that I can access the application

  Background:
    Given the application is running
    And demo users exist in the database

  Scenario: Volunteer signs in with valid credentials
    Given I am on the sign in page
    When I enter email "volunteer@demo.com"
    And I enter password "password123"
    And I click the sign in button
    Then I should be redirected to the dashboard
    And I should see "Welcome" message

  Scenario: Ministry leader signs in with valid credentials
    Given I am on the sign in page
    When I enter email "leader@demo.com"
    And I enter password "password123"
    And I click the sign in button
    Then I should be redirected to the dashboard
    And I should see "Ministry Leader" dashboard

  Scenario: User fails to sign in with invalid email
    Given I am on the sign in page
    When I enter email "nonexistent@demo.com"
    And I enter password "password123"
    And I click the sign in button
    Then I should see error message "Invalid credentials"
    And I should remain on the sign in page

  Scenario: User fails to sign in with invalid password
    Given I am on the sign in page
    When I enter email "volunteer@demo.com"
    And I enter password "wrongpassword"
    And I click the sign in button
    Then I should see error message "Invalid credentials"
    And I should remain on the sign in page

  Scenario: User fails to sign in with empty email
    Given I am on the sign in page
    When I leave email empty
    And I enter password "password123"
    And I click the sign in button
    Then I should see validation error "Email is required"

  Scenario: User fails to sign in with empty password
    Given I am on the sign in page
    When I enter email "volunteer@demo.com"
    And I leave password empty
    And I click the sign in button
    Then I should see validation error "Password is required"

  Scenario: User session is maintained after sign in
    Given I am signed in as "volunteer@demo.com"
    When I navigate to the dashboard
    Then I should remain signed in
    And I should see my profile information

  Scenario: User can sign out
    Given I am signed in as "volunteer@demo.com"
    When I click the sign out button
    Then I should be redirected to the home page
    And the session should be cleared
