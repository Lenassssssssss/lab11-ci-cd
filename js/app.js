document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const result = document.getElementById('result');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();

        result.classList.remove('hidden', 'success', 'error');

        if (!name) {
            result.textContent = 'Ошибка: поле «Имя» обязательно для заполнения';
            result.classList.add('error');
            return;
        }

        if (!email || !email.includes('@')) {
            result.textContent = 'Ошибка: введите корректный email';
            result.classList.add('error');
            return;
        }

        result.textContent = `Спасибо, ${name}! Ваша заявка принята.`;
        result.classList.add('success');
        form.reset();
    });
});
