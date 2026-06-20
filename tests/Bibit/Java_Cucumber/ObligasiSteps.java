package stepdefinitions;

import io.cucumber.java.en.*;
import com.microsoft.playwright.*;

public class ObligasiSteps {
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

    @And("I navigate to the Obligasi FR page")
    public void i_navigate_to_the_obligasi_fr_page() {
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Obligasi FR Jenis obligasi")).click();
    }

    @And("I toggle the various FAQ sections")
    public void i_toggle_the_various_faq_sections() {
        String[] faqs = {
            "Apa perbedaan antara SBN dan",
            "Apakah harus menyimpan",
            "Apa perbedaan yield dan kupon",
            "Jika berinvestasi Obligasi FR",
            "Apa resiko yang mungkin",
            "Berapa minimum pembelian"
        };
        
        for (String faq : faqs) {
            Locator heading = page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName(faq));
            heading.click();
            heading.click();
        }
    }

    @And("I click the FAQ container")
    public void i_click_faq_container() {
        page.getByTestId("fr-bonds-webpage-faq").click();
    }

    @And("I view the specific FAQ page for {string}")
    public void i_view_faq_page(String pageName) {
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName(pageName)).click();
    }

    @And("I navigate back from the Obligasi FR article")
    public void i_navigate_back_from_obligasi_article() {
        page.getByRole(AriaRole.COMPLEMENTARY).getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Obligasi FR").setExact(true)).click();
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Belakang")).click();
    }

    @And("I navigate back from the Registrasi article")
    public void i_navigate_back_from_registrasi_article() {
        page.getByRole(AriaRole.COMPLEMENTARY).getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Registrasi").setExact(true)).click();
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Belakang")).click();
    }

    @And("I click multiple guides back to back")
    public void i_click_multiple_guides() {
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Bagaimana Cara Memasukkan")).click();
        i_navigate_back_from_registrasi_article();
        
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Cara Melakukan Pembelian")).click();
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Apa itu Obligasi FR")).click();
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Kenapa Investasi Pada")).click();
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Cara Melakukan Penjualan")).click();
        
        i_navigate_back_from_obligasi_article();
    }

    @Then("I close the browser")
    public void i_close_the_browser() {
        page.close();
        browser.close();
        playwright.close();
    }
}
