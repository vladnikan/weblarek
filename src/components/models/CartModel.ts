import { ICartModel, Product } from '../../types';
import { EventEmitter } from '../base/events';

export class CartModel implements ICartModel {
	private cartItems: Product[];
	private eventBroker: EventEmitter;

	constructor(eventBroker: EventEmitter, cartItems: Product[] = []) {
		this.eventBroker = eventBroker;
		this.cartItems = cartItems;
	}

	getItems(): Product[] {
		return this.cartItems;
	}

	addItem(product: Product): void {
		if (product.price == null) return; // проверка для бесценного мамкиного таймера
		const cartItem: Product = {
			...product,
			price: Number(product.price) || 0,
		};
		if (!this.cartItems.some((item) => item.id === product.id)) {
			this.cartItems.push(cartItem);
			this.notifyUpdate();
		}
	}

	removeItem(id: string): void {
		this.cartItems = this.cartItems.filter((item) => item.id !== id);
		this.notifyUpdate();
	}

	removeAll(): void {
		this.cartItems = [];
		this.notifyUpdate();
	}

	totalCount(): number {
		return this.cartItems.length;
	}

	totalPrice(): number {
		return this.cartItems.reduce((a, b) => a + Number(b.price), 0);
	}

	checkItem(productId: string): boolean {
		return this.cartItems.some((item) => item.id === productId);
	}

	private notifyUpdate(): void {
		this.eventBroker.emit('cart:updated', {
			items: this.cartItems,
			total: this.totalPrice(),
			totalCount: this.totalCount(),
		});
	}
}
