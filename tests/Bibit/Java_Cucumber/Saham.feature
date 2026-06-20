Feature: Explore Saham Investments on Bibit

  Scenario: Interact with the Saham page, simulator, and FAQs
    Given I navigate to the Bibit homepage
    When I click the explore investment icon
    And I navigate to the Saham page
    And I set the investment slider to "62100000"
    And I check the simulation for 3 years
    And I check the simulation for 5 years
    And I verify the 5-year simulation percentage
    And I interact with the simulation summary
    And I check the simulation for 10 years
    And I verify the 10-year simulation percentage
    And I toggle the various Saham FAQ sections
    And I click on the link to view all Bibit FAQs
    Then I click the Bibit logo to return to the homepage
