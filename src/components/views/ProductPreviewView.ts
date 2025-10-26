import { ProductCardBase } from './ProductCardBase';
import { Product } from '../../types';
import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class ProductPreviewView extends ProductCardBase {
	private cardImage: HTMLImageElement;
	private cardCategory: HTMLElement;
	private cardText: HTMLElement;
	private buyButton: HTMLButtonElement;

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
		this.cardText = ensureElement<HTMLElement>('.card__text', this.container);
		this.buyButton = ensureElement<HTMLButtonElement>(
			'.button',
			this.container
		);

		this.buyButton.addEventListener('click', () => {
			this.events.emit('preview:buyButtonClicked');
		});
	}

	updateButton(isInCart: boolean, price: number | null): void {
		console.log('товар', isInCart, price);
		if (price !== null && price > 0) {
			this.buyButton.textContent = isInCart
				? 'Удалить из корзины'
				: 'В корзину';
			this.buyButton.disabled = false;
		} else {
			this.buyButton.textContent = 'Недоступно';
			this.buyButton.disabled = true;
		}
	}

	render(product: Product): HTMLElement {
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
		this.cardText.textContent = product.description;
		this.cardPrice.textContent =
			product.price != null ? `${product.price} синапсов` : 'Бесценно';

		this.cardTitle.textContent = product.title;
		this.cardText.textContent = product.description;
		this.cardPrice.textContent =
			product.price != null ? `${product.price} синапсов` : 'Бесценно';

		return this.container;
	}
}
