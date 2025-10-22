import { EmailPhoneForm, IOrderModel, OrderData, PaymentAddressForm } from "../../types";
import { EventEmitter } from "../base/events";

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
        const {payment} = this.order;

        let isValid = true;
        let message = '';

        if(!payment.paymentMethod) {
            isValid = false;
            message = 'Выберите способ оплаты';
        }

        else if (!payment.address || payment.address.trim() === '') {
            isValid = false;
            message = 'Необходимо указать адрес'
        }

        this.eventBroker.emit('order:validatePayment', {isValid, message});
        return isValid;
    }

    validateContact(): boolean {
        const email = this.order.contact.email.trim();
        const phone = this.order.contact.phone.trim();

        const isValid = this.validateEmail(email) && phone !== '';

        this.eventBroker.emit('order:validateContact', {isValid});

        return isValid;
    }

    //новый метод валидации эмейла
    validateEmail(email: string): boolean {
        const regExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regExp.test(email);
    }

    private notifyUpdate(): void {
        this.eventBroker.emit('update in ORDER MODEL', this.order)
    }
}