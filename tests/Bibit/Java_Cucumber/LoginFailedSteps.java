package stepdefinitions;

import io.cucumber.java.en.*;
import com.microsoft.playwright.*;
import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class LoginFailedSteps {
    Playwright playwright = Playwright.create();
    Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(false));
    Page page = browser.newPage();

    @Given("I navigate to the Bibit homepage")
    public void i_navigate_to_the_bibit_homepage() {
        page.navigate("https://bibit.id/");
    }

    @When("I click on the Login menu")
    public void i_click_on_the_login_menu() {
        page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("Login")).click();
    }

    @And("I enter a randomly generated unique phone number")
    public void i_enter_unique_phone() {
        page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("contoh:")).click();
        
        // Setup unique random phone number
        String uniquePhone = "8" + String.valueOf(System.currentTimeMillis()).substring(4);
        System.out.println("Nomor HP unik yang di-generate: " + uniquePhone);
        
        page.getByRole(AriaRole.TEXTBOX, new Page.GetByRoleOptions().setName("contoh:")).fill(uniquePhone);
    }

    @And("I click the Login button")
    public void i_click_the_login_button() {
        page.getByTestId("login-btn-login").click();
    }

    @And("I enter an incorrect OTP")
    public void i_enter_an_incorrect_otp() {
        page.locator("#otp-field-0").click();
        page.locator("#otp-field-0").fill("8");
        page.getByTestId("num-1").click();
        page.getByTestId("num-2").click();
        page.getByTestId("num-5").click();
        page.getByTestId("num-6").click();
        page.getByTestId("num-3").click();
        page.getByTestId("num-3").click();
    }

    @Then("I should see the invalid OTP error message")
    public void i_should_see_the_invalid_otp_error_message() {
        Locator errorMessage = page.getByText("Kode OTP yang kamu masukkan");
        errorMessage.click();
        // Validasi menggunakan Playwright Assertions
        assertThat(errorMessage).isVisible();
    }

    @And("I close the login prompt")
    public void i_close_the_login_prompt() {
        page.getByTestId("back-btn").click();
        page.getByRole(AriaRole.BUTTON).filter(new Locator.FilterOptions().setHasText("^$")).click();
        page.close();
        browser.close();
        playwright.close();
    }
}
