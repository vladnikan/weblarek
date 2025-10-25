import { View } from './View';
import { Product } from '../../types';
import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';
import { ProductCardBase } from './ProductCardBase';

export class CartProductView extends ProductCardBase {
	private index: HTMLElement;
	private deleteButton: HTMLButtonElement;

	constructor(
		private template: HTMLTemplateElement,
		events: EventEmitter,
		private itemIndex: number
	) {
		const element = template.content.firstElementChild!.cloneNode(
			true
		) as HTMLElement;
		super(element, events);

		this.events = events;

		this.index = ensureElement<HTMLElement>(
			'.basket__item-index',
			this.container
		);
		this.cardTitle = ensureElement<HTMLElement>('.card__title', this.container);
		this.cardPrice = ensureElement<HTMLElement>('.card__price', this.container);
		this.deleteButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			this.container
		);

		this.deleteButton.addEventListener('click', () => {
			this.events.emit('cart:remove', { index: this.itemIndex });
		});
	}

	render(product: Product): HTMLElement {
		this.index.textContent = String(this.itemIndex + 1);
		this.cardTitle.textContent = product.title;
		this.cardPrice.textContent = `${product.price} синапсов`;
		return this.container;
	}
}
