import { View } from './View';
import { EmailPhoneForm } from '../../types';
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

		[this.email, this.phone].forEach((input) => {
			input.addEventListener('input', () => {
				this.events.emit('order:contactInput', {
					field: input.name as 'email' | 'phone',
					value: input.value,
				});
			});
		});

		this.button.addEventListener('click', (evt) => {
			evt.preventDefault();
			this.events.emit('order:submit');
		});
	}

	render(data?: EmailPhoneForm): HTMLElement {
		if (data) {
			this.email.value = data.email || '';
			this.phone.value = data.phone || '';
		}
		return this.container;
	}

	renderValidation(isValid: boolean, message?: string) {
		this.button.disabled = !isValid;
		this.error.textContent = message || '';
	}
}
