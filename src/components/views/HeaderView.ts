import { View } from './View';
import { EventEmitter } from '../base/events';

export class HeaderView extends View<void> {
	private button: HTMLButtonElement;
	private counter: HTMLSpanElement;
	private events: EventEmitter;

	constructor(container: HTMLElement, events: EventEmitter) {
		super(container);
		this.events = events;

		// Ищем элементы шапки внутри контейнера
		this.button = container.querySelector(
			'.header__basket'
		) as HTMLButtonElement;
		this.counter = container.querySelector(
			'.header__basket-counter'
		) as HTMLSpanElement;

		// Обработчик клика по кнопке корзины
		this.button.addEventListener('click', () => {
			this.events.emit('cart:open');
		});
	}

	render(): HTMLElement {
		return this.container;
	}

	updateCounter(count: number) {
		this.counter.textContent = count.toString();
	}
}
