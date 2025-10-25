import { View } from './View';
import { Cart } from '../../types';
import { CartProductView } from './CartProductView';
import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class CartView extends View<Cart> {
	events: EventEmitter;
	private total: HTMLSpanElement;
	private list: HTMLUListElement;
	private button: HTMLButtonElement;
	private cartItemTemplate: HTMLTemplateElement;

	constructor(
		container: HTMLElement,
		events: EventEmitter,
		cartItemTemplate: HTMLTemplateElement
	) {
		super(container);
		this.events = events;
		this.cartItemTemplate = cartItemTemplate;

		this.total = ensureElement<HTMLSpanElement>(
			'.basket__price',
			this.container
		);
		this.list = ensureElement<HTMLUListElement>(
			'.basket__list',
			this.container
		);
		this.button = ensureElement<HTMLButtonElement>('.button', this.container);

		this.button.addEventListener('click', () => {
			console.log('кнопка корзины нажата');
			this.events.emit('cart:buy');
		});
	}

	render(cart: Cart): HTMLElement {
		this.list.replaceChildren();
		this.list.style.listStyle = 'none';

		//прокрутка
		this.list.style.maxHeight = '600px';
		this.list.style.overflowY = 'auto';

		if (!cart.items.length) {
			const empty = document.createElement('p');
			empty.style.opacity = '0.3';
			empty.textContent = 'Корзина пуста';
			this.list.appendChild(empty);
			this.button.disabled = true;
		} else {
			cart.items.forEach((cartItem, index) => {
				const itemView = new CartProductView(
					this.cartItemTemplate,
					this.events,
					index
				);
				this.list.appendChild(itemView.render(cartItem));
			});
			this.button.disabled = false;
		}

		this.total.textContent = cart.total
			? `${cart.total} синапсов`
			: `0 синапсов`;

		console.log('корзина отрисована');
		return this.container;
	}
}
