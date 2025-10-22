import './scss/styles.scss';
import { ProductModel, CartModel, OrderModel } from './components/models/index'; 
import { ProductView, CartView, OrderPaymentAndAddressView, OrderEmailAndPhoneView, OrderSuccessView, ProductPreviewView } from './components/views/index'; 
import { EventEmitter } from './components/base/events';
import { Api } from './components/base/api';
import { openPopup, closePopup, closePopupOverlay } from './components/base/Modal';
import { Product, OrderData, EmailPhoneForm, Cart } from './types';
import { API_URL } from './utils/constants';
import { ProductApi } from './components/base/ProductApi';

// Инициализация
const eventBroker = new EventEmitter();
const api = new Api(API_URL);
const productApi = new ProductApi(API_URL);
const initialOrder: OrderData = {
    items: [],
    total: 0,
    payment: { paymentMethod: '', address: '' },
    contact: { email: '', phone: '' }
};
const orderModel = new OrderModel(eventBroker, initialOrder);
const productModel = new ProductModel(eventBroker);
const cartModel = new CartModel(eventBroker);

// DOM-элементы
const paymentModal = document.querySelector('.modal:has(.order)') as HTMLElement;
const modalContact = document.querySelector('#modal-container') as HTMLElement;
const modalSuccess = document.querySelector('.modal:has(.order-success)') as HTMLElement;
const modalContentSuccess = modalSuccess.querySelector('.modal__content') as HTMLElement;
const cardFullModal = document.querySelector('.modal:has(.card_full)') as HTMLElement;
const basketFullModal = document.querySelector('.modal:has(.basket)') as HTMLElement;
const container = document.querySelector('.gallery') as HTMLElement;
const cartOpenButton = document.querySelector('.header__basket') as HTMLButtonElement;

// Views
const orderSuccess = new OrderSuccessView(modalContentSuccess, eventBroker);
const productView = new ProductView(container, eventBroker);
const productFullView = new ProductPreviewView(cardFullModal, eventBroker);
const cartView = new CartView(basketFullModal, eventBroker);

// Обработчик кликов для модальных окон и кнопок
document.addEventListener('click', (evt) => {
    const target = evt.target as HTMLElement;

    // Закрытие модального окна по крестику
    if (target.closest('.modal__close')) {
        evt.preventDefault();
        const popupElement = target.closest('.modal');
        if (popupElement) {
            closePopup(popupElement as HTMLElement);
            closePopupOverlay(popupElement as HTMLElement);
        }
    }

    // Открытие корзины
    if (target.closest('.header__basket')) {
        if (basketFullModal) {
            openPopup(basketFullModal);
        }
    }

    // Клик по кнопке "Оформить" в корзине
    if (target.closest('.basket__button')) {
        const modalContent = paymentModal.querySelector('.modal__content') as HTMLElement;
        const orderPayment = new OrderPaymentAndAddressView(modalContent, eventBroker);
        orderPayment.render();
        closePopup(basketFullModal);
        openPopup(paymentModal);
    }

    // Клик по кнопке "Далее" в форме оплаты и адреса
    if (target.closest('.order__button')) {
        const modalContent = modalContact.querySelector('.modal__content') as HTMLElement;
        const orderContacts = new OrderEmailAndPhoneView(modalContent, eventBroker);
        orderContacts.render();
        closePopup(paymentModal);
        openPopup(modalContact);
    }

    // Клик по кнопке "Оплатить" в форме контактов
    if (target.matches('form[name="contacts"] .button')) {
        evt.preventDefault();
        if (orderModel.validateContact()) {
            eventBroker.emit('order:submit');
        } else {
            const errorSpan = modalContact.querySelector('.form__errors') as HTMLSpanElement;
            errorSpan.textContent = 'Пожалуйста, заполните email и телефон корректно.';
        }
    }

    // Закрытие окна успешного заказа
    if (target.closest('.order-success__close')) {
        cartModel.removeAll();
        closePopup(modalSuccess);
    }
});

// Загрузка товаров
productApi.getProducts()
    .then(products => {
        productModel.setProducts(products);
    })
    .catch(error => {
        console.error('Ошибка загрузки:', error);
        const errorSpan = container.querySelector('.error') as HTMLSpanElement || document.createElement('span');
        errorSpan.textContent = 'Не удалось загрузить товары. Попробуйте снова.';
        container.appendChild(errorSpan);
    });

// Обработчик обновления списка товаров
eventBroker.on('products:updated', (products: Product[]) => {
    container.innerHTML = '';
    const productElements = products.map(product => productView.render(product));
    container.append(...productElements);
    const cardButtons = document.querySelectorAll('.gallery__item');
    cardButtons.forEach((button, index) => {
        button.addEventListener('click', (evt) => {
            evt.preventDefault();
            if (!cardFullModal) {
                console.log('Модальное окно не найдено');
                return;
            }
            productFullView.render(products[index]);
            openPopup(cardFullModal);
            const cardBuyButton = cardFullModal.querySelector('.card__button') as HTMLButtonElement;
            if (cardBuyButton) {
                cardBuyButton.onclick = (evt) => {
                    evt.preventDefault();
                    cartModel.addItem(products[index]);
                };
            }
        });
    });
});

// Обработчики корзины
eventBroker.on('cart:updated', (cartData: Cart) => {
    cartView.render(cartData);
});

eventBroker.on('cart:remove', ({ id }: { id: number }) => {
    cartModel.removeItem(id);
});

// Обработчики валидации
eventBroker.on('order:paymentSelected', (data: { paymentMethod: 'online' | 'cash' | '' }) => {
    orderModel.order.payment.paymentMethod = data.paymentMethod;
    orderModel.validateAddress();
});

eventBroker.on('order:addressInput', (data: { address: string }) => {
    orderModel.order.payment.address = data.address;
    orderModel.validateAddress();
});

eventBroker.on('order:contactInput', (data: { field: keyof EmailPhoneForm; value: string }) => {
    orderModel.order.contact[data.field] = data.value;
    orderModel.validateContact();
});

// Обработчик отправки заказа
eventBroker.on('order:submit', () => {
    const order = orderModel.getOrder();
    const cartItems = cartModel.getItems();
    const orderData = {
        payment: order.payment.paymentMethod,
        address: order.payment.address,
        email: order.contact.email,
        phone: order.contact.phone,
        total: cartModel.totalPrice(),
        items: cartItems.map(item => item.id)
    };
    const cartForRender = {
        items: cartItems,
        total: cartModel.totalPrice(),
        totalCount: cartModel.totalCount()
    };
    api.post('/order', orderData, 'POST')
        .then(response => {
            console.log('Заказ создан', response);
            orderSuccess.render(cartForRender);
            closePopup(modalContact);
            openPopup(modalSuccess);
            cartModel.removeAll();
        })
        .catch(error => {
            console.error('Ошибка при оформлении', error);
            const errorSpan = modalContact.querySelector('.form__errors') as HTMLSpanElement;
            errorSpan.textContent = 'Ошибка при оформлении заказа. Попробуйте снова.';
        });
});