import { ProductCardBase } from './ProductCardBase';
import { Product } from '../../types';
import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class CartProductView extends ProductCardBase {
	private index: HTMLElement;
	private deleteButton: HTMLButtonElement;

	constructor(container: HTMLElement, events: EventEmitter) {
		super(container, events);

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
			this.events.emit('cart:remove', { id: this.container.dataset.id });
		});
	}

	render(product: Product, itemIndex?: number): HTMLElement {
		this.container.dataset.id = product.id; // Временный dataset для удаления (не хранение состояния)
		this.index.textContent = String(itemIndex + 1);
		this.cardTitle.textContent = product.title;
		this.cardPrice.textContent =
			product.price != null ? `${product.price} синапсов` : 'Бесценно';
		return this.container;
	}
}
