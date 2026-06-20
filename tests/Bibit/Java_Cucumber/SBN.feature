Feature: SBN Information Explorer on Bibit

  Scenario: Explore live offers, past products, and view SBN memo
    Given I navigate to the Bibit homepage
    When I click the explore investment icon
    And I navigate to the SBN page
    And I interact with the SBN info arrows
    And I interact with upcoming offers
    And I navigate through live offers
    And I browse past products for years 2026 to 2022
    And I click the arrow to view more past products
    And I click on the next/previous past product button
    Then I open the Memo in a new popup and close it
