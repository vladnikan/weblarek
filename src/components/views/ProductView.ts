import { ProductCardBase } from './ProductCardBase';
import { Product } from '../../types';
import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class ProductView extends ProductCardBase {
	private cardImage: HTMLImageElement;
	private cardCategory: HTMLElement;

	constructor(container: HTMLElement, events: EventEmitter) {
		super(container, events);
		this.cardImage = ensureElement<HTMLImageElement>(
			'.card__image',
			this.container
		);
		this.cardCategory = ensureElement<HTMLElement>(
			'.card__category',
			this.container
		);

		this.container.addEventListener('click', (evt) => {
			evt.preventDefault();
			this.events.emit('preview:open', {
				productId: this.container.dataset.id,
			});
		});
	}

	render(product: Product): HTMLElement {
		this.container.dataset.id = product.id;
		this.cardImage.src = product.image;
		this.cardImage.alt = product.title;

		this.cardCategory.textContent = product.category;
		this.cardCategory.classList.remove(
			'card__category_soft',
			'card__category_hard',
			'card__category_other',
			'card__category_additional',
			'card__category_button'
		);
		switch (product.category) {
			case 'софт-скил':
				this.cardCategory.classList.add('card__category_soft');
				break;
			case 'хард-скил':
				this.cardCategory.classList.add('card__category_hard');
				break;
			case 'другое':
				this.cardCategory.classList.add('card__category_other');
				break;
			case 'дополнительное':
				this.cardCategory.classList.add('card__category_additional');
				break;
			case 'кнопка':
				this.cardCategory.classList.add('card__category_button');
				break;
		}

		this.cardTitle.textContent = product.title;
		this.cardPrice.textContent =
			product.price != null ? `${product.price} синапсов` : 'Бесценно';

		return this.container;
	}
}
