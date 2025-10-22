import { View } from "./View";
import { PaymentAddressForm } from "../../types";
import { EventEmitter } from "../base/events";

export class OrderPaymentAndAddressView extends View<PaymentAddressForm> {
    events: EventEmitter;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container);
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
        };

        // Проверка существования элементов
        if (!paymentChoice.online || !paymentChoice.later || !button || !orderError) {
            console.error('Не найдены элементы формы оплаты');
            return this.container;
        }

        // Обработка кликов по кнопкам выбора метода оплаты
        Object.entries(paymentChoice).forEach(([method, btn]) => {
            btn.addEventListener('click', (evt) => {
                evt.preventDefault();
                // Устанавливаем класс selected
                paymentChoice.online.style.border = '';
                paymentChoice.later.style.border = '';
                btn.style.border = '2px solid white';
                this.events.emit('order:paymentSelected', { paymentMethod: method as 'online' | 'cash' });
            });
        });

        // Восстановление выбранного метода оплаты (если есть)
        if (data?.paymentMethod === 'online') {
            paymentChoice.online.classList.add('selected');
        } else if (data?.paymentMethod === 'cash') {
            paymentChoice.later.classList.add('selected');
        }

        // Обработка клика по кнопке "Далее"
        button.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.events.emit('order:nextStep');
        });

        // Обработка валидации
        this.events.on('order:validatePayment', (data: { isValid: boolean, message?: string }) => {
            button.disabled = !data.isValid;
            orderError.textContent = data.message || '';
        });

        // Обработка ввода адреса
        const address = orderPaymentAddressElement.querySelector('input[name="address"]') as HTMLInputElement;
        if (!address) {
            console.error('Не найден input для адреса');
            return this.container;
        }
        address.addEventListener('input', (evt) => {
            const input = evt.target as HTMLInputElement;
            this.events.emit('order:addressInput', { address: input.value });
        });

        // Установка начального значения адреса
        address.value = data?.address || '';

        console.log('оплата и адрес отрисованы');

        this.container.innerHTML = '';
        this.container.appendChild(orderPaymentAddressElement);
        return this.container;
    }
}