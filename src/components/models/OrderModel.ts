import {
	EmailPhoneForm,
	IOrderModel,
	OrderData,
	PaymentAddressForm,
	Product,
} from '../../types';
import { EventEmitter } from '../base/events';

export class OrderModel implements IOrderModel {
	order: OrderData;
	eventBroker: EventEmitter;

	constructor(eventBroker: EventEmitter, order: OrderData) {
		this.eventBroker = eventBroker;
		this.order = order;
	}

	getOrder(): OrderData {
		return this.order;
	}

	getOrderData(cartItems: Product[], totalPrice: number) {
		return {
			payment: this.order.payment.paymentMethod,
			address: this.order.payment.address,
			email: this.order.contact.email,
			phone: this.order.contact.phone,
			total: totalPrice,
			items: cartItems.map((index) => index.id),
		};
	}

	setPayment(data: PaymentAddressForm): void {
		this.order.payment = data;
		this.validateAddress();
		this.notifyUpdate();
	}

	setContact(data: EmailPhoneForm): void {
		this.order.contact = data;
		this.validateContact();
		this.notifyUpdate();
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
		const { email, phone } = contact;
		let isValid = true;
		let message = '';

		if (!email.trim()) {
			isValid = false;
			message = 'Введите email';
		} else if (!phone.trim()) {
			isValid = false;
			message = 'Введите телефон';
		}

		this.eventBroker.emit('order:validateContact', { isValid, message });
		return isValid;
	}

	private notifyUpdate(): void {
		this.eventBroker.emit('order:update', this.order);
	}
}
