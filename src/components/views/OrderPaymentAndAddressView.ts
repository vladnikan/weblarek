import { View } from './View';
import { PaymentAddressForm } from '../../types';
import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class OrderPaymentAndAddressView extends View<PaymentAddressForm> {
	private address: HTMLInputElement;
	private button: HTMLButtonElement;
	private orderError: HTMLSpanElement;
	private paymentOnline: HTMLButtonElement;
	private paymentLater: HTMLButtonElement;
	private events: EventEmitter;

	constructor(container: HTMLElement, events: EventEmitter) {
		super(container);
		this.events = events;

		this.address = ensureElement<HTMLInputElement>(
			'input[name="address"]',
			this.container
		);
		this.button = ensureElement<HTMLButtonElement>(
			'.modal__actions .button',
			this.container
		);
		this.orderError = ensureElement<HTMLSpanElement>(
			'.form__errors',
			this.container
		);
		this.paymentOnline = ensureElement<HTMLButtonElement>(
			'button[name="card"]',
			this.container
		);
		this.paymentLater = ensureElement<HTMLButtonElement>(
			'button[name="cash"]',
			this.container
		);

		// Обработчик клика на кнопки оплаты
		[this.paymentOnline, this.paymentLater].forEach((button) => {
			button.addEventListener('click', (evt) => {
				evt.preventDefault();
				const paymentMethod: 'online' | 'cash' =
					button.name === 'card' ? 'online' : 'cash';
				this.events.emit('order:paymentSelected', {
					paymentMethod,
					address: this.address.value,
				});
			});
		});

		// Обработчик ввода адреса
		this.address.addEventListener('input', () => {
			this.events.emit('order:setPayment', {
				address: this.address.value,
			});
		});

		// Обработка клика кнопки далее
		this.button.addEventListener('click', (evt) => {
			evt.preventDefault();
			this.events.emit('order:nextStep');
		});
	}

	render(data?: PaymentAddressForm): HTMLElement {
		if (data) {
			this.address.value = data.address || '';
			this.paymentLater.classList.remove('button_alt-active');
			this.paymentOnline.classList.remove('button_alt-active');
			if (data.paymentMethod === 'online') {
				this.paymentOnline.classList.add('button_alt-active');
			} else if (data.paymentMethod === 'cash') {
				this.paymentLater.classList.add('button_alt-active');
			}
		}
		return this.container;
	}

	renderValidation(isValid: boolean, message?: string) {
		this.button.disabled = !isValid;
		this.orderError.textContent = message || '';
	}
}
