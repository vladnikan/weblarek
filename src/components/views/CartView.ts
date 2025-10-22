import { View } from "./View";
import { CartItem, Cart } from "../../types";
import { CartProductView } from "./CartProductView";
import { EventEmitter } from "../base/events";

export class CartView extends View<Cart> {

    events: EventEmitter;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container);
        this.events = events;
    }

    render(cart: Cart): HTMLElement {

        const cartTemplate = (document.querySelector('#basket') as HTMLTemplateElement).content;
        const cartItems = cartTemplate.querySelector('.basket').cloneNode(true) as HTMLElement;
        const cartTotal = cartItems.querySelector('.basket__price') as HTMLSpanElement ;
        const cartList = cartItems.querySelector('.basket__list') as HTMLUListElement;
        const buyButton = cartItems.querySelector('.basket__button') as HTMLButtonElement;

        const modalContent = document.querySelector('.modal__content:has(.basket)') as HTMLElement;

        const topButtonCounter = document.querySelector('.header__basket-counter') as HTMLSpanElement;

        
        cartList.innerHTML = '';
        cartList.style.listStyle = 'none';

        if(!cart.items.length) {
            const empty = document.createElement('p');
            empty.style.opacity = '0.3';
            empty.textContent = 'Корзина пуста';
            cartList.appendChild(empty);
            buyButton.disabled = true;
        }
        else {
            cart.items.forEach(cartItem => {
                const li = document.createElement('li');
                const itemView = new CartProductView(li, this.events);
                cartList.appendChild(itemView.render(cartItem));
            })
        }

        topButtonCounter.textContent = cart.items.length.toString();

        cartTotal.textContent = `${cart.total} синапсов`;

        modalContent.innerHTML = '';

        modalContent.appendChild(cartItems);

        console.log('корзина отрисована');
        return this.container;
    }
}