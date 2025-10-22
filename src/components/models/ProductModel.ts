import { IProductModel, Product } from "../../types";
import { CDN_URL } from "../../utils/constants";
import { EventEmitter } from "../base/events";

export class ProductModel implements IProductModel {
    private products: Product[];
    private eventBroker: EventEmitter;


    constructor (eventBroker: EventEmitter, products: Product[] = []) {
        this.products = products;
        this.eventBroker = eventBroker;
    }


    getAllItems(): Product[] {
        return this.products;
    }

    setProducts(products: Product[]): void {
        // this.products = this.products.concat(products);
        this.products = products.map(product => ({
            ...product,
            image: `${CDN_URL}/${product.image.slice(0,-3)}` + 'png'
        }));
        this.notifyUpdate();
    }

    getProductById(id: number): Product | undefined {
        return this.products.find((product) => product.id === id);
    }

    setCurrentProduct(id: number): void {
        const product = this.getProductById(id);
    }

    //новый метод
    private notifyUpdate(): void {
        this.eventBroker.emit('products:updated', this.products);
    }
}