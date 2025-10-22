import { View } from "./View";
import { PaymentAddressForm } from "../../types";
import { EventEmitter } from "../base/events";

export class OrderPaymentAndAddressView extends View<PaymentAddressForm> {

    events: EventEmitter;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container),
        this.events = events;
    }
    render(data?: PaymentAddressForm): HTMLElement {

        const orderPaymentAddressTemplate = (document.querySelector('#order') as HTMLTemplateElement).content;

        const orderPaymentAddressElement = (orderPaymentAddressTemplate.querySelector('form[name="order"]').cloneNode(true)) as HTMLFormElement;
        const button = orderPaymentAddressElement.querySelector('.modal__actions .button') as HTMLButtonElement;

        const orderError = orderPaymentAddressElement.querySelector('.form__errors') as HTMLSpanElement;

        const paymentChoice = {
            online: orderPaymentAddressElement.querySelector('button[name="card"]') as HTMLButtonElement,
            later: orderPaymentAddressElement.querySelector('button[name="cash"]') as HTMLButtonElement
        }

        Object.entries(paymentChoice).forEach(([method, button]) => {
            button.addEventListener('click', (evt) => {
                evt.preventDefault();
                this.events.emit('order:paymentSelected', {paymentMethod: method as 'online' | 'cash'});
            })
        })

        button.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.events.emit('order:nextStep');
        })

        this.events.on('order:validatePayment', (data: {isValid: boolean, message?: string}) => {
            button.disabled = !data.isValid;
            if (orderError) orderError.textContent = data.message || '';
        })

        const address = (orderPaymentAddressElement.querySelector('input[name="address"]')) as HTMLInputElement;

        address.addEventListener('input', (evt) => {
            const input = evt.target as HTMLInputElement;
            this.events.emit('order:addressInput', {address: input.value})
        })

        address.value = data?.address || '';

        console.log('оплата и адрес отрисованы');

        this.container.innerHTML = '';
        this.container.appendChild(orderPaymentAddressElement);
        return this.container;
    }

}