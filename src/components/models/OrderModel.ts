import {
	EmailPhoneForm,
	IOrderModel,
	OrderData,
	PaymentAddressForm,
} from '../../types';
import { EventEmitter } from '../base/events';

export class OrderModel implements IOrderModel {
	order: OrderData;
	eventBroker: EventEmitter;

	constructor(eventBroker: EventEmitter, order?: OrderData) {
		this.eventBroker = eventBroker;
		this.order = order || {
			payment: { paymentMethod: '', address: '' },
			contact: { email: '', phone: '' },
		};
	}

	getOrder(): OrderData {
		return this.order;
	}

	setPayment(data: Partial<PaymentAddressForm>): void {
		this.order.payment = {
			paymentMethod: data.paymentMethod ?? this.order.payment.paymentMethod,
			address: data.address ?? this.order.payment.address,
		};
		this.eventBroker.emit('order:paymentUpdated', this.order);
		this.validateAddress();
	}

	setContact(data: Partial<EmailPhoneForm>): void {
		this.order.contact = { ...this.order.contact, ...data };
		this.eventBroker.emit('order:contactUpdated', this.order);
		this.validateContact();
	}

	validateAddress(): boolean {
		const { payment } = this.order;
		let isValid = true;
		let message = '';

		if (!payment.paymentMethod) {
			isValid = false;
			message = 'Выберите способ оплаты';
		} else if (!payment.address || payment.address.trim() === '') {
			isValid = false;
			message = 'Необходимо указать адрес';
		}

		this.eventBroker.emit('order:validatePayment', { isValid, message });
		return isValid;
	}

	validateContact(): boolean {
		const { contact } = this.order;
		let isValid = true;
		let message = '';

		if (!contact.email.trim()) {
			isValid = false;
			message = 'Введите email';
		} else if (!contact.phone.trim()) {
			isValid = false;
			message = 'Введите телефон';
		}

		this.eventBroker.emit('order:validateContact', { isValid, message });
		return isValid;
	}
}
