package stepdefinitions;

import io.cucumber.java.en.*;
import com.microsoft.playwright.*;

public class SBNSteps {
    Playwright playwright = Playwright.create();
    Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(false));
    BrowserContext context = browser.newContext();
    Page page = context.newPage();

    @Given("I navigate to the Bibit homepage")
    public void i_navigate_to_the_bibit_homepage() {
        page.navigate("https://bibit.id/");
    }

    @When("I click the explore investment icon")
    public void i_click_the_explore_investment_icon() {
        page.getByTestId("index-action-invest-lp").getByRole(AriaRole.IMG, new Page.GetByRoleOptions().setName("icon arrow more")).click();
    }

    @And("I navigate to the SBN page")
    public void i_navigate_to_the_sbn_page() {
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("SBN Investasi yang 100% aman")).click();
    }

    @And("I interact with the SBN info arrows")
    public void i_interact_with_the_sbn_info_arrows() {
        page.getByRole(AriaRole.IMG, new Page.GetByRoleOptions().setName("arrow")).nth(2).click();
        page.getByRole(AriaRole.IMG, new Page.GetByRoleOptions().setName("arrow")).nth(2).click();
    }

    @And("I interact with upcoming offers")
    public void i_interact_with_upcoming_offers() {
        page.locator("div").filter(new Locator.FilterOptions().setHasText("Penawaran mendatang dimulai")).nth(3).click();
    }

    @And("I navigate through live offers")
    public void i_navigate_through_live_offers() {
        page.getByTestId("sbn-webpage-action-live-offer-nextPrev").first().click();
        page.getByTestId("sbn-webpage-action-live-offer-nextPrev").first().click();
    }

    @And("I browse past products for years 2026 to 2022")
    public void i_browse_past_products() {
        page.getByTestId("sbn-webpage-action-view-past-product-2026").click();
        page.getByTestId("sbn-webpage-action-view-past-product-2025").click();
        page.getByTestId("sbn-webpage-action-view-past-product-2024").click();
        page.getByTestId("sbn-webpage-action-view-past-product-2023").click();
        page.getByTestId("sbn-webpage-action-view-past-product-2022").click();
    }

    @And("I click the arrow to view more past products")
    public void i_click_arrow_past_products() {
        page.getByRole(AriaRole.IMG, new Page.GetByRoleOptions().setName("arrow")).nth(4).click();
    }

    @And("I click on the next\\/previous past product button")
    public void i_click_next_prev_past_products() {
        page.getByTestId("sbn-webpage-action-view-past-product-nextPrev").first().click();
    }

    @Then("I open the Memo in a new popup and close it")
    public void i_open_memo_popup_and_close_it() {
        // Handle target "_blank" / popup
        Page popup = context.waitForPage(() -> {
            page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Lihat Memo")).first().click();
        });
        
        popup.waitForLoadState(options -> options.setState(LoadState.DOMCONTENTLOADED));
        popup.close();

        // Teardown
        page.close();
        context.close();
        browser.close();
        playwright.close();
    }
}
