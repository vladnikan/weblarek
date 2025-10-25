import { ProductCardBase } from './ProductCardBase';
import { Product } from '../../types';
import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class ProductPreviewView extends ProductCardBase {
	private readonly cardImage: HTMLImageElement;
	private readonly cardCategory: HTMLElement;
	private readonly cardText: HTMLElement;
	private readonly buyButton: HTMLButtonElement;
	private product: Product | null = null;

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
			if (!this.product) {
				console.error('Продукт не установлен');
				return;
			}
			console.log(
				'Кнопка нажата для продукта:',
				this.product.title,
				'ID:',
				this.product.id
			);
			this.events.emit('cart:checkItem', {
				productId: this.product.id,
				callback: (isInCart: boolean) => {
					if (isInCart) {
						this.events.emit('card:removeById', { productId: this.product.id });
					} else {
						this.events.emit('card:add', { productId: this.product.id });
					}
				},
			});
		});

		// Подписка на событие cart:checked для обновления кнопки
		this.events.on(
			'cart:checked',
			({ productId, isInCart }: { productId: string; isInCart: boolean }) => {
				if (this.product && this.product.id === productId) {
					console.log('Получено событие cart:checked:', {
						productId,
						isInCart,
					});
					this.updateButton(isInCart);
				}
			}
		);

		// Подписка на cart:updated для обновления кнопки после изменения корзины
		this.events.on('cart:updated', () => {
			if (this.product) {
				this.events.emit('cart:checkItem', {
					productId: this.product.id,
					callback: (isInCart: boolean) => {
						this.updateButton(isInCart);
					},
				});
			}
		});
	}

	updateButton(isInCart: boolean): void {
		if (this.product && this.product.price != null) {
			this.buyButton.textContent = isInCart ? 'Удалить из корзины' : 'Купить';
			this.buyButton.disabled = false;
		} else {
			this.buyButton.textContent = 'Недоступно';
			this.buyButton.disabled = true;
		}
	}

	render(product: Product): HTMLElement {
		this.product = product;
		this.cardImage.src = product.image;
		this.cardImage.alt = product.title;

		this.cardCategory.textContent = product.category;
		//по умолчанию каждой карточке дается стиль "другое", поэтому первоначально удалим какой-либо класс стиля
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

		// Запрашиваем статус товара в корзине
		this.events.emit('cart:checkItem', {
			productId: product.id,
			callback: (isInCart: boolean) => {
				this.updateButton(isInCart);
			},
		});

		console.log('Превью продукта отрисовано:', product.title);
		return this.container;
	}
}
