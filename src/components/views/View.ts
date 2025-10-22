export abstract class View<T> {
    protected container: HTMLElement;

    constructor(container: HTMLElement | undefined) {
        this.container = container;
    }

    abstract render(data?: T): HTMLElement;
}