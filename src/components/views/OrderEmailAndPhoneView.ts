import { View } from './View';
import { EmailPhoneForm, OrderData } from '../../types';
import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class OrderEmailAndPhoneView extends View<EmailPhoneForm> {
	events: EventEmitter;
	email: HTMLInputElement;
	phone: HTMLInputElement;
	button: HTMLButtonElement;
	error: HTMLSpanElement;

	constructor(container: HTMLElement, events: EventEmitter) {
		super(container);
		this.events = events;

		// элементы
		this.email = ensureElement<HTMLInputElement>(
			'input[name="email"]',
			this.container
		);
		this.phone = ensureElement<HTMLInputElement>(
			'input[name="phone"]',
			this.container
		);
		this.button = ensureElement<HTMLButtonElement>('.button', this.container);
		this.error = ensureElement<HTMLSpanElement>(
			'.form__errors',
			this.container
		);

		// Слушатели ввода
		[this.email, this.phone].forEach((input) => {
			input.addEventListener('input', () => {
				this.events.emit('order:contactInput', {
					field: input.name as 'email' | 'phone',
					value: input.value,
				});
			});
		});

		// Слушатель кнопки сабмита
		this.button.addEventListener('click', (evt) => {
			evt.preventDefault();
			this.events.emit('order:submit');
		});

		// Обновление при изменении модели
		this.events.on('order:update', (order: OrderData) => {
			this.render(order.contact);
		});
	}

	// Рендер полей
	render(data?: EmailPhoneForm): HTMLElement {
		if (data) {
			this.email.value = data.email || '';
			this.phone.value = data.phone || '';
		}
		return this.container;
	}

	// Отображение ошибок
	renderValidation(isValid: boolean, field?: 'email' | 'phone') {
		this.button.disabled = !isValid;
		if (!isValid) {
			this.error.textContent =
				field === 'email' ? 'Не введен email' : 'Не введен телефон';
		} else {
			this.error.textContent = '';
		}
	}
}
