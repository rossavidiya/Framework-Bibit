Feature: Obligasi FR FAQ and Guide Explorer on Bibit

  Scenario: Explore Obligasi FR FAQs and read various guides
    Given I navigate to the Bibit homepage
    When I click the explore investment icon
    And I navigate to the Obligasi FR page
    And I toggle the various FAQ sections
    And I click the FAQ container
    And I view the specific FAQ page for "Apa itu Obligasi FR"
    And I navigate back from the Obligasi FR article
    And I view the specific FAQ page for "Cara Melakukan Penjualan"
    And I navigate back from the Obligasi FR article
    And I view the specific FAQ page for "Bagaimana Cara Memasukkan"
    And I navigate back from the Registrasi article
    And I click multiple guides back to back
    Then I close the browser
