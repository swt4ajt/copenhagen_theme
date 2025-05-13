async function login(browser, account) {
  const { email, password, loginUrl } = account;

  const page = await browser.newPage();
  try {
    console.log("Navigating to login URL...");
    await page.goto(loginUrl, { waitUntil: "networkidle2" });

    console.log("Waiting for email input field...");
    await page.waitForSelector("input#user_email", { visible: true, timeout: 60000 });

    console.log("Typing email...");
    await page.type("input#user_email", email);

    console.log("Waiting for password input field...");
    await page.waitForSelector("input#user_password", { visible: true, timeout: 60000 });

    console.log("Typing password...");
    await page.type("input#user_password", password);

    console.log("Clicking sign-in button...");
    await Promise.all([
      page.click("#sign-in-submit-button"),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
    ]);

    console.log("Login successful!");
  } catch (error) {
    console.error("Error during login:", error);
    await page.screenshot({ path: "login-error-screenshot.png" });
  } finally {
    await page.close();
  }
}

module.exports = login;