import { CartItem, ICartModel, Product } from "../../types";
import { EventEmitter } from "../base/events";

//HTMLULList element тип для списка

export class CartModel implements ICartModel {
    private cartItems: CartItem[];
    private eventBroker: EventEmitter;

    private nextId: number = 1;


    constructor(eventBroker: EventEmitter, cartItems: CartItem[] = []) {
        this.eventBroker = eventBroker;
        this.cartItems = cartItems;
    }

    getItems(): CartItem[] {
        return this.cartItems;
    }

    addItem(product: Product): void {
        const cartItem: CartItem = {
            ...product,
            price: Number(product.price) || 0,
            quantity: 1,
            cartId: this.nextId
        };
        this.cartItems.push(cartItem);
        this.nextId++;
        this.notifyUpdate();
    }

    removeItem(cartId: number): void {
        this.cartItems = this.cartItems.filter(item => item.cartId !== cartId);

        this.cartItems.forEach((item, index) => {
            item.cartId = index + 1;
        })

        this.nextId = this.cartItems.length +1;
        
        this.notifyUpdate();
    }

    removeAll(): void {
        this.cartItems = [];

        this.cartItems.forEach((item, index) => {
            item.cartId = index + 1;
        })

        this.nextId = this.cartItems.length +1;
        this.notifyUpdate();
    }

    totalCount(): number {
        let total: number = this.cartItems.length;
        return total;
    }

    totalPrice(): number {
        let sum: number = 0;
        for (let i: number = 0; i < this.cartItems.length; i++) {
            sum += this.cartItems[i].price;
        }
        return sum;
    }

     //новый метод
    private notifyUpdate(): void {
        this.eventBroker.emit('cart:updated', {
            items: this.cartItems,
            total: this.totalPrice()
        });
    }
}