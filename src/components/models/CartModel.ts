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

	getItemIndexById(productId: string): number {
		return this.cartItems.findIndex((item) => item.id === productId);
	}

	addItem(product: Product): void {
		const cartItem: Product = {
			...product,
			price: Number(product.price) || 0,
		};
		this.cartItems.push(cartItem);
		this.notifyUpdate();
	}

	removeItem(index: number): void {
		if (index >= 0 && index < this.cartItems.length) {
			this.cartItems.splice(index, 1);
			this.notifyUpdate();
		}
	}

	removeAll(): void {
		this.cartItems = [];
		this.notifyUpdate();
	}

	totalCount(): number {
		const total: number = this.cartItems.length;
		return total;
	}

	totalPrice(): number {
		let sum: number = this.cartItems.reduce((a, b) => a + Number(b.price), 0);
		return sum;
	}

	private notifyUpdate(): void {
		this.eventBroker.emit('cart:updated', {
			items: this.cartItems,
			total: this.totalPrice(),
			totalCount: this.totalCount(),
		});
	}
}
