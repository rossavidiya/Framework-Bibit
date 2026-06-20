package stepdefinitions;

import io.cucumber.java.en.*;
import com.microsoft.playwright.*;

public class ReksadanaFilterSteps {
    Playwright playwright = Playwright.create();
    Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(false));
    Page page = browser.newPage();

    @Given("I navigate to the Bibit homepage")
    public void i_navigate_to_the_bibit_homepage() {
        page.navigate("https://bibit.id/");
    }

    @When("I click the explore investment icon")
    public void i_click_the_explore_investment_icon() {
        page.getByTestId("index-action-invest-lp").getByRole(AriaRole.IMG, new Page.GetByRoleOptions().setName("icon arrow more")).click();
    }

    @And("I navigate to the Reksadana page")
    public void i_navigate_to_the_reksadana_page() {
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Reksa Dana Investasi untuk")).click();
    }

    @And("I check the RDPU fund type filter")
    public void i_check_the_rdpu_fund_type_filter() {
        page.getByTestId("mf-webpage-action-fund-type-rdpu").check();
        page.navigate("https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3");
    }

    @And("I check the USD filter")
    public void i_check_the_usd_filter() {
        page.getByTestId("mf-webpage-action-filter-usd").check();
        page.navigate("https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3&usd=1");
    }

    @And("I select the {string} tradeable radio button")
    public void i_select_the_tradeable_radio_button(String radioName) {
        page.getByRole(AriaRole.RADIO, new Page.GetByRoleOptions().setName(radioName)).check();
        if(radioName.equals("Semua")) {
            page.navigate("https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3&usd=1");
        } else {
            page.navigate("https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3&tradeable=1");
        }
    }

    @And("I uncheck the USD filter")
    public void i_uncheck_the_usd_filter() {
        page.getByTestId("mf-webpage-action-filter-usd").uncheck();
        page.navigate("https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3");
    }

    @And("I interact with the search box")
    public void i_interact_with_the_search_box() {
        page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Cari Reksa Dana")).click();
        page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("Cari Reksa Dana")).fill("");
        page.navigate("https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3&tradeable=1");
    }

    @And("I uncheck the RDPU fund type filter")
    public void i_uncheck_the_rdpu_fund_type_filter() {
        page.getByTestId("mf-webpage-action-fund-type-rdpu").uncheck();
        page.navigate("https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&tradeable=1");
    }

    @And("I click the filter label")
    public void i_click_the_filter_label() {
        page.getByText("Dijual di BibitSemua").click();
    }

    @And("I select the {string} tradeable radio button again")
    public void i_select_the_tradeable_radio_button_again(String radioName) {
        page.getByRole(AriaRole.RADIO, new Page.GetByRoleOptions().setName(radioName)).check();
        page.navigate("https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1");
    }

    @Then("I click the Bibit logo to return to the homepage")
    public void i_click_the_bibit_logo_to_return_to_the_homepage() {
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("logo bibit")).click();
        
        // Teardown
        page.close();
        browser.close();
        playwright.close();
    }
}
