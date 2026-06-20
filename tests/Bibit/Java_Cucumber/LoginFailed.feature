Feature: Login Failure on Bibit

  Scenario: Failed login attempt with incorrect OTP
    Given I navigate to the Bibit homepage
    When I click on the Login menu
    And I enter a randomly generated unique phone number
    And I click the Login button
    And I enter an incorrect OTP
    Then I should see the invalid OTP error message
    And I close the login prompt
