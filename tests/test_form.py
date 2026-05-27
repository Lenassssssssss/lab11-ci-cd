import os
import subprocess
import sys
import time
import unittest

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager


BASE_URL = os.environ.get('APP_URL', 'http://127.0.0.1:8080/index.html')
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class FormUITests(unittest.TestCase):
    driver = None
    server_process = None

    @classmethod
    def setUpClass(cls):
        if not os.environ.get('APP_URL'):
            cls.server_process = subprocess.Popen(
                [sys.executable, '-m', 'http.server', '8080'],
                cwd=PROJECT_ROOT,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            time.sleep(1)

        options = Options()
        options.add_argument('--headless=new')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')

        cls.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options,
        )
        cls.driver.implicitly_wait(5)

    @classmethod
    def tearDownClass(cls):
        if cls.driver:
            cls.driver.quit()
        if cls.server_process:
            cls.server_process.terminate()
            cls.server_process.wait()

    def setUp(self):
        self.driver.get(BASE_URL)

    def test_page_title_and_heading(self):
        """Проверка заголовка страницы и формы."""
        self.assertEqual(self.driver.title, 'Форма регистрации')
        heading = self.driver.find_element(By.ID, 'form-title')
        self.assertEqual(heading.text, 'Форма регистрации на сайт')

    def test_form_fields_are_visible(self):
        """Проверка наличия всех полей формы."""
        self.assertTrue(self.driver.find_element(By.ID, 'name').is_displayed())
        self.assertTrue(self.driver.find_element(By.ID, 'email').is_displayed())
        self.assertTrue(self.driver.find_element(By.ID, 'message').is_displayed())
        submit_btn = self.driver.find_element(By.ID, 'submit-btn')
        self.assertTrue(submit_btn.is_displayed())
        self.assertEqual(submit_btn.text, 'Зарегистрироваться')

    def test_successful_form_submission(self):
        """Проверка успешной отправки формы с корректными данными."""
        self.driver.find_element(By.ID, 'name').send_keys('Иван')
        self.driver.find_element(By.ID, 'email').send_keys('ivan@example.com')
        self.driver.find_element(By.ID, 'message').send_keys('Тестовое сообщение')
        self.driver.find_element(By.ID, 'submit-btn').click()

        result = WebDriverWait(self.driver, 5).until(
            EC.visibility_of_element_located((By.ID, 'result'))
        )
        self.assertIn('Спасибо, Иван!', result.text)
        self.assertIn('success', result.get_attribute('class'))

    def test_empty_name_shows_error(self):
        """Проверка отображения ошибки при пустом имени."""
        self.driver.find_element(By.ID, 'email').send_keys('test@example.com')
        self.driver.find_element(By.ID, 'submit-btn').click()

        result = WebDriverWait(self.driver, 5).until(
            EC.visibility_of_element_located((By.ID, 'result'))
        )
        self.assertIn('Ошибка: поле «Имя» обязательно', result.text)
        self.assertIn('error', result.get_attribute('class'))


if __name__ == '__main__':
    unittest.main()
