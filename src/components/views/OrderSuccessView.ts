import { View } from './View';
import { Cart } from '../../types';
import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class OrderSuccessView extends View<{ total: number }> {
	private description: HTMLElement;
	private button: HTMLButtonElement;
	private events: EventEmitter;

	constructor(container: HTMLElement, events: EventEmitter) {
		super(container);
		this.events = events;
		this.description = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);
		this.button = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.container
		);

		this.button.addEventListener('click', () => {
			this.events.emit('order:closeSuccess');
		});
	}

	render(data?: { total: number }): HTMLElement {
		if (data) {
			this.description.textContent = `Списано ${data.total} синапсов`;
		}
		return this.container;
	}
}
