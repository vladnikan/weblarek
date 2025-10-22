import { View } from "./View";
import { Product, CartItem } from "../../types";
import { EventEmitter } from "../base/events";

export class CartProductView extends View<CartItem> {
    events: EventEmitter;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container);
        this.events = events;
    }

    render(cartItem: CartItem): HTMLElement {
        this.container.innerHTML = '';
        
        const cartProductTemplate = (document.querySelector('#card-basket') as HTMLTemplateElement).content;

        const cartProduct = cartProductTemplate.querySelector('.card_compact').cloneNode(true) as HTMLElement;

        const cartProductTitle = cartProduct.querySelector('.card__title') as HTMLSpanElement;
        const cartProductPrice = cartProduct.querySelector('.card__price') as HTMLSpanElement;
        const cartDeleteButton = cartProduct.querySelector('.basket__item-delete') as HTMLButtonElement
        const cartProductIndex = cartProduct.querySelector('.basket__item-index') as HTMLSpanElement;

        cartProductTitle.textContent = cartItem.title;
        cartProductPrice.textContent = `${cartItem.price} синапсов`;
        cartProductIndex.textContent = cartItem.cartId.toString() || '';

        cartDeleteButton.addEventListener('click', (evt) => {
            this.events.emit('cart:remove', {id: cartItem.cartId});
            console.log(this.events)
        })

        this.container.appendChild(cartProduct);
        return this.container;
    }
}