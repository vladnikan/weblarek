import { View } from './View';
import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class HeaderView extends View<void> {
	private button: HTMLButtonElement;
	private counter: HTMLSpanElement;
	private events: EventEmitter;

	constructor(container: HTMLElement, events: EventEmitter) {
		super(container);
		this.events = events;
		this.button = ensureElement<HTMLButtonElement>(
			'.header__basket',
			this.container
		);
		this.counter = ensureElement<HTMLSpanElement>(
			'.header__basket-counter',
			this.container
		);

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
