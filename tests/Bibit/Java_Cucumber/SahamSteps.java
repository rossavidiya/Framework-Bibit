package stepdefinitions;

import io.cucumber.java.en.*;
import com.microsoft.playwright.*;

public class SahamSteps {
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

    @And("I navigate to the Saham page")
    public void i_navigate_to_the_saham_page() {
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Saham Investasi langsung di")).click();
    }

    @And("I set the investment slider to {string}")
    public void i_set_the_investment_slider(String amount) {
        page.getByRole(AriaRole.SLIDER).fill(amount);
    }

    @And("I check the simulation for 3 years")
    public void i_check_the_simulation_for_3_years() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("3 Tahun")).click();
    }

    @And("I check the simulation for 5 years")
    public void i_check_the_simulation_for_5_years() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("5 Tahun")).click();
    }

    @And("I verify the 5-year simulation percentage")
    public void i_verify_the_5_year_simulation_percentage() {
        page.getByText("78.65%").click();
    }

    @And("I interact with the simulation summary")
    public void i_interact_with_the_simulation_summary() {
        page.getByText("Seandainya kamu investasi saham Bank BCARp62,100,0003 Tahun5 Tahun10 TahunNilai").click();
    }

    @And("I check the simulation for 10 years")
    public void i_check_the_simulation_for_10_years() {
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("10 Tahun")).click();
    }

    @And("I verify the 10-year simulation percentage")
    public void i_verify_the_10_year_simulation_percentage() {
        page.getByText("285.42%").click();
    }

    @And("I toggle the various Saham FAQ sections")
    public void i_toggle_the_various_saham_faq_sections() {
        page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Bagaimana cara daftar akun")).click();
        
        String[] faqs = {
            "Berapa minimum deposit untuk",
            "Berapa fee jual dan beli",
            "Siapa saja yang bisa membeli"
        };
        
        for (String faq : faqs) {
            Locator heading = page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName(faq));
            heading.click();
            heading.click();
        }

        Locator bedaText = page.locator("div").filter(new Locator.FilterOptions().setHasText("Apa perbedaan saham dan reksa")).nth(3);
        bedaText.click();
        bedaText.click();
    }

    @And("I click on the link to view all Bibit FAQs")
    public void i_click_on_the_link_to_view_all_bibit_faqs() {
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Lihat Semua FAQ Bibit icon")).click();
    }

    @Then("I click the Bibit logo to return to the homepage")
    public void i_click_bibit_logo_to_return_to_homepage() {
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Bibit").setExact(true)).first().click();
        
        // Teardown
        page.close();
        browser.close();
        playwright.close();
    }
}
