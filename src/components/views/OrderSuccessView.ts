import { View } from "./View";
import { OrderData, Cart } from "../../types";
import { EventEmitter } from "../base/events";

export class OrderSuccessView extends View<Cart> {
    events: EventEmitter;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container);
        this.events = events;
    }

    render(data?: Cart): HTMLElement {
        const orderSuccessTemplate = (document.querySelector('#success') as HTMLTemplateElement).content;
        const orderSuccessElement = (orderSuccessTemplate.querySelector('.order-success').cloneNode(true)) as HTMLElement;
        const order_description = orderSuccessElement.querySelector('.order-success__description') as HTMLElement;

        order_description.innerHTML = `Списано ${data.total} синапсов`;

        this.container.innerHTML = '';
        this.container.appendChild(orderSuccessElement);

        console.log('успешна оплата отрисована')
        return this.container;
    }
}