// import { View } from "./View";
// import { EmailPhoneForm } from "../../types";
// import { EventEmitter } from "../base/events";

// export class OrderEmailAndPhoneView extends View<EmailPhoneForm> {
//     events: EventEmitter;

//     constructor(container: HTMLElement, events: EventEmitter) {
//         super(container);
//         this.events = events;
//     }

//     render(data?: EmailPhoneForm): HTMLElement {
//         const template = (document.querySelector('#contacts') as HTMLTemplateElement).content;
//         const form = (template.querySelector('form[name="contacts"]')!.cloneNode(true)) as HTMLFormElement;

//         const inputEmail = form.querySelector('input[name="email"]') as HTMLInputElement;
//         const inputPhone = form.querySelector('input[name="phone"]') as HTMLInputElement;
//         const button = form.querySelector('.button') as HTMLButtonElement;
//         const errorSpan = form.querySelector('.form__errors') as HTMLElement;

//         // --- Отслеживаем ввод ---
//         form.addEventListener('input', (evt) => {
//             const input = evt.target as HTMLInputElement;

//             // Отправляем событие о том, что пользователь ввёл что-то
//             this.events.emit('order:contactInput', {
//                 field: input.name,
//                 value: input.value,
//             });
//         });

//         // --- Подписка на валидацию контактов из модели ---
//         this.events.on('order:validateEmail', (data: { isValid: boolean, message?: string }) => {
//             if (button) button.disabled = !data.isValid;
//             if (errorSpan && data.message) errorSpan.textContent = data.message;
//             else errorSpan.textContent = '';
//         });

//         // --- Клик по кнопке «Оплатить» ---
//         form.addEventListener('submit', (evt) => {
//             evt.preventDefault();
//             this.events.emit('order:submitContacts');
//         });

//         this.container.innerHTML = '';
//         this.container.appendChild(form);

//         console.log('Форма Email + Телефон отрисована');
//         return this.container;
//     }
// }

import { View } from "./View";
import { EmailPhoneForm } from "../../types";
import { EventEmitter } from "../base/events";

export class OrderEmailAndPhoneView extends View<EmailPhoneForm> {
    events: EventEmitter;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container);
        this.events = events;
    }

    render(data?: EmailPhoneForm): HTMLElement {
        const template = (document.querySelector('#contacts') as HTMLTemplateElement).content;
        const form = (template.querySelector('form[name="contacts"]')!.cloneNode(true)) as HTMLFormElement;

        const inputEmail = form.querySelector('input[name="email"]') as HTMLInputElement;
        const inputPhone = form.querySelector('input[name="phone"]') as HTMLInputElement;
        const button = form.querySelector('.button') as HTMLButtonElement;
        const errorSpan = form.querySelector('.form__errors') as HTMLSpanElement;

       [inputEmail, inputPhone].forEach(input => {
        input.addEventListener('input', () => {
            this.events.emit('order:contactInput', {
                field: input.name,
                value: input.value
            })
        })
        input.addEventListener('blur', () => {
            if (!input.value.trim()) {
                errorSpan.textContent = `Введите ${input.name === "email" ? 'email' : 'телефон'}`;
            }
            else {
                errorSpan.textContent = '';
            }
        })
       })

       button.addEventListener('click', (evt) => {
        evt.preventDefault();
        this.events.emit('order:submit');
       })

       this.events.on('order:validateContact', (data: {isValid: boolean}) => {
        button.disabled = !data.isValid;
       })

        this.container.innerHTML = '';
        this.container.appendChild(form);

        console.log('Форма Email + Телефон отрисована');
        return this.container;
    }
}

