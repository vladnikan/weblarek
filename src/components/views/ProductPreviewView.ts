import { View } from "./View";
import { Product } from "../../types";
import { EventEmitter } from "../base/events";

export class ProductPreviewView extends View<Product> {
    events: EventEmitter;
    constructor(container: HTMLElement, events: EventEmitter) {
        super(container);
        this.events = events;
    }

    public render(product: Product): HTMLElement {

        const cardPreviewTemplate = (document.querySelector('#card-preview') as HTMLTemplateElement).content;

        const cardElement = (cardPreviewTemplate.querySelector('.card_full')?.cloneNode(true)) as HTMLElement;

        const cardImage = cardElement.querySelector('.card__image') as HTMLImageElement;
        const cardTitle = cardElement.querySelector('.card__title') as HTMLElement;
        const cardCategory = cardElement.querySelector('.card__category') as HTMLElement;
        const cardText = cardElement.querySelector('.card__text') as HTMLElement;
        const cardPrice = cardElement.querySelector('.card__price') as HTMLSpanElement;
        const buyButton = cardElement.querySelector('.card__button') as HTMLButtonElement;

        const modalContent = document.querySelector('.modal__content:has(.card_full)') as HTMLElement;

        cardImage.src = product?.image;
        cardImage.alt = product.title;

        cardCategory.textContent = product.category;
        cardTitle.textContent = product.title;
        cardText.textContent = product.description;
        cardPrice.textContent = product.price?.toString() + ' синапсов' || null;

        if (buyButton && product.price !== null && product.price!== undefined) {
            buyButton.textContent = 'Купить'
        }
        else {
            cardPrice.textContent = 'Бесценно';
            buyButton.textContent = 'Недоступно';
            buyButton.disabled = true;
        }


        modalContent.innerHTML = '';

        modalContent.appendChild(cardElement);
        console.log('превью вью отрисован')
        return this.container;
    }
}
