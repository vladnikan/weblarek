import { View } from './View';
import { Cart } from '../../types';
import { EventEmitter } from '../base/events';
import { ensureElement, createElement } from '../../utils/utils';

export class CartView extends View<Cart> {
	private list: HTMLElement;
	private totalPrice: HTMLElement;
	private buyButton: HTMLButtonElement;

	constructor(container: HTMLElement, events: EventEmitter) {
		super(container);
		this.list = ensureElement<HTMLElement>('.basket__list', this.container);
		this.totalPrice = ensureElement<HTMLElement>(
			'.basket__price',
			this.container
		);
		this.buyButton = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		);

		this.buyButton.addEventListener('click', () => {
			events.emit('cart:buy');
		});
	}

	protected setDisabled(element: HTMLButtonElement, state: boolean) {
		if (element) {
			element.disabled = state;
		}
	}

	render(cartData: Cart, itemViews?: HTMLElement[]): HTMLElement {
		if (cartData.items.length === 0) {
			this.list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
			this.totalPrice.textContent = '0 синапсов';
			this.setDisabled(this.buyButton, true);
		} else {
			this.list.replaceChildren(...(itemViews || []));
			this.totalPrice.textContent = cartData.total
				? `${cartData.total} синапсов`
				: '0 синапсов';
			this.setDisabled(this.buyButton, false);
		}

		return this.getElement();
	}
}
