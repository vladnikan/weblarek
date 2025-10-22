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
        const orderForm = document.querySelector('form[name="order"]') as HTMLFormElement | null;

        const onlineButton = orderForm.querySelector('button[name="card"]') as HTMLButtonElement | null;
        const laterButton = orderForm.querySelector('button[name="cash"]') as HTMLButtonElement | null;

        if (onlineButton && laterButton) {
            const selectedPayment = (selected: HTMLButtonElement, other: HTMLButtonElement) => {
            onlineButton.classList.remove('selected');
            laterButton.classList.remove('selected');

            selected.classList.add('selected');

            this.order.payment.paymentMethod = selected.name as 'online' | 'cash';

            this.eventBroker.emit('order:paymentSelected', {paymentMethod: selected.name})
            };

            onlineButton.addEventListener('click', (evt) => {
                evt.preventDefault();
                selectedPayment(onlineButton, laterButton);
                this.notifyUpdate();
            });

            laterButton.addEventListener('click', (evt) => {
                evt.preventDefault();
                selectedPayment(laterButton, onlineButton);
                this.notifyUpdate();
            })
        }
        else {
            console.log('проблема с выбором оплаты')
        }
    }

    setContact(data: EmailPhoneForm): void {
        
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
        this.eventBroker.trigger('update in ORDER MODEL', this.order)
    }
}