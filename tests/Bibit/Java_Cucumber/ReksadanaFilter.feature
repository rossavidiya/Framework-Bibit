Feature: Reksadana Filters on Bibit

  Scenario: Apply and remove various Reksadana filters on Bibit website
    Given I navigate to the Bibit homepage
    When I click the explore investment icon
    And I navigate to the Reksadana page
    And I check the RDPU fund type filter
    And I check the USD filter
    And I select the "Semua" tradeable radio button
    And I uncheck the USD filter
    And I select the "Dijual di Bibit" tradeable radio button
    And I interact with the search box
    And I uncheck the RDPU fund type filter
    And I click the filter label
    And I select the "Semua" tradeable radio button again
    Then I click the Bibit logo to return to the homepage
