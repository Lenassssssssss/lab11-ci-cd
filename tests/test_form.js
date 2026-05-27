const { spawn } = require('child_process');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.APP_URL || 'http://127.0.0.1:8080/index.html';
const PROJECT_ROOT = path.join(__dirname, '..');

let driver;
let serverProcess;

describe('Form UI Tests', function () {
  this.timeout(60000);

  before(async function () {
    if (!process.env.APP_URL) {
      const httpServerPath = require.resolve('http-server/bin/http-server');
      serverProcess = spawn('node', [httpServerPath, '.', '-p', '8080', '-c-1'], {
        cwd: PROJECT_ROOT,
        stdio: 'ignore',
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const options = new chrome.Options();
    options.addArguments(
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080'
    );

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({ implicit: 5000 });
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  beforeEach(async function () {
    await driver.get(BASE_URL);
  });

  it('should display page title and heading', async function () {
    const title = await driver.getTitle();
    const heading = await driver.findElement(By.id('form-title'));

    if (title !== 'Форма регистрации') {
      throw new Error(`Expected title "Форма регистрации", got "${title}"`);
    }

    const headingText = await heading.getText();
    if (headingText !== 'Форма регистрации на сайт') {
      throw new Error(`Expected heading "Форма регистрации на сайт", got "${headingText}"`);
    }
  });

  it('should show all form fields', async function () {
    const name = await driver.findElement(By.id('name'));
    const email = await driver.findElement(By.id('email'));
    const message = await driver.findElement(By.id('message'));
    const submitBtn = await driver.findElement(By.id('submit-btn'));

    if (!(await name.isDisplayed())) throw new Error('Name field is not visible');
    if (!(await email.isDisplayed())) throw new Error('Email field is not visible');
    if (!(await message.isDisplayed())) throw new Error('Message field is not visible');
    if (!(await submitBtn.isDisplayed())) throw new Error('Submit button is not visible');

    const buttonText = await submitBtn.getText();
    if (buttonText !== 'Зарегистрироваться') {
      throw new Error(`Expected button text "Зарегистрироваться", got "${buttonText}"`);
    }
  });

  it('should submit form with valid data', async function () {
    await driver.findElement(By.id('name')).sendKeys('Иван');
    await driver.findElement(By.id('email')).sendKeys('ivan@example.com');
    await driver.findElement(By.id('message')).sendKeys('Тестовое сообщение');
    await driver.findElement(By.id('submit-btn')).click();

    const result = await driver.wait(until.elementIsVisible(await driver.findElement(By.id('result'))), 5000);
    const resultText = await result.getText();
    const resultClass = await result.getAttribute('class');

    if (!resultText.includes('Спасибо, Иван!')) {
      throw new Error(`Expected success message, got "${resultText}"`);
    }
    if (!resultClass.includes('success')) {
      throw new Error(`Expected success class, got "${resultClass}"`);
    }
  });

  it('should show error when name is empty', async function () {
    await driver.findElement(By.id('email')).sendKeys('test@example.com');
    await driver.findElement(By.id('submit-btn')).click();

    const result = await driver.wait(until.elementIsVisible(await driver.findElement(By.id('result'))), 5000);
    const resultText = await result.getText();
    const resultClass = await result.getAttribute('class');

    if (!resultText.includes('Ошибка: поле «Имя» обязательно')) {
      throw new Error(`Expected error message, got "${resultText}"`);
    }
    if (!resultClass.includes('error')) {
      throw new Error(`Expected error class, got "${resultClass}"`);
    }
  });
});
