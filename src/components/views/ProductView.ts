import { View } from "./View";
import { Product } from "../../types";
import { EventEmitter } from "../base/events";
import { openPopup } from "../base/Modal";

export class ProductView extends View<Product> {
    private events: EventEmitter;
    constructor(container: HTMLElement, events: EventEmitter) {
        super(container);
        this.events = events;
    }
    render(product: Product): HTMLElement {
        const cardTemplate = (document.querySelector("#card-catalog") as HTMLTemplateElement).content;

        const cardElement = (cardTemplate.querySelector('.gallery__item').cloneNode(true)) as HTMLElement;

        const cardImage = cardElement.querySelector('.card__image') as HTMLImageElement;
        const cardCategory = cardElement.querySelector('.card__category') as HTMLElement;
        const cardTitle = cardElement.querySelector('.card__title') as HTMLElement;
        const cardPrice = cardElement.querySelector('.card__price') as HTMLElement;

        cardImage.alt = product.title;
        cardImage.src = product.image;

        cardCategory.textContent = product.category;
        cardTitle.textContent = product.title;
        if (!product.price) {
            cardPrice.textContent = 'Бесценно'
            
        }
        else {
            cardPrice.textContent = product.price?.toString() + ' синапсов';
        }

        this.container.appendChild(cardElement);

        return this.container;
    }
}