import './scss/styles.scss';
import { ProductModel, CartModel, OrderModel } from './components/models/index'; 
import { ProductView, CartView, CartProductView, OrderPaymentAndAddressView, OrderEmailAndPhoneView, OrderSuccessView, ProductPreviewView } from './components/views/index'; 
import { EventEmitter } from './components/base/events';
import { Api, ApiListResponse } from './components/base/api';
import { openPopup, closePopup, closePopupOverlay } from './components/base/Modal';
import { Product, CartItem, OrderData, PaymentAddressForm, EmailPhoneForm, Cart } from './types';
import { API_URL } from './utils/constants';
import { ProductApi } from './components/base/ProductApi';



// инициализация
const eventBroker = new EventEmitter();
const api = new Api(API_URL);
// const modal = new Modal();
// const productModel = new ProductModel(eventEmitter);
// const productApi = new ProductApi(API_URL);
// const orderModel = new OrderModel(eventEmitter, initialOrder);

const initialOrder: OrderData = {
    items: [],
    total: 0,
    payment: { paymentMethod: '', address: '' },
    contact: { email: '', phone: '' }
};

const orderModel = new OrderModel(eventBroker, initialOrder);


const paymentModal = document.querySelector('.modal:has(.order)') as HTMLElement;

const modalContact = document.querySelector('#modal-container') as HTMLElement;

//окно успешного заказа
const modalSuccess = document.querySelector('.modal:has(.order-success)') as HTMLElement;
const modalContent = modalSuccess.querySelector('.modal__content') as HTMLElement;

const orderSuccess = new OrderSuccessView(modalContent, eventBroker);

document.addEventListener('click', (evt) => {
    const target = evt.target as HTMLElement;

    // крестик
    if (target.closest('.modal__close')) {
        evt.preventDefault();
        const popupElement = target.closest('.modal');
        if (popupElement) {
            closePopup(popupElement as HTMLElement);
            closePopupOverlay(popupElement as HTMLElement);
        }
    }

    // открытие корзины
    if (target.closest('.header__basket')) {
        if (basketFullModal) {
            openPopup(basketFullModal);
        }
    }

    // клик по кнопке "Оформить" в корзине
    if (target.closest('.basket__button')) {

        const modalContent = paymentModal.querySelector('.modal__content') as HTMLElement;

        const orderPayment = new OrderPaymentAndAddressView(modalContent, eventBroker);
        orderPayment.render();

        closePopup(basketFullModal);
        openPopup(paymentModal);
    }
    if (target.closest('.order__button')) {
        const modalContent = modalContact.querySelector('.modal__content') as HTMLElement;

        const orderContacts = new OrderEmailAndPhoneView(modalContent, eventBroker);
        orderContacts.render(); 

        closePopup(paymentModal);
        openPopup(modalContact);
    }
    if (target.matches('form[name="contacts"] .button')) {
    const order = orderModel.getOrder();
    const cartItems = cartModel.getItems();

    // данные для API
    const orderData = {
        payment: order.payment.paymentMethod,
        address: order.payment.address,
        email: order.contact.email,
        phone: order.contact.phone,
        total: cartModel.totalPrice(),
        items: cartItems.map(item => item.id)
    };

    // объект Cart для рендера успешного заказа
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
        })
        .catch(error => {
            console.error('Ошибка при оформлении', error);
        });
    }

    if (target.closest('.order-success__close')) {
        cartModel.removeAll();
        closePopup(modalSuccess);
    }

});

// Создаем API для работы с сервером
const productApi = new ProductApi(API_URL);

// Создаем модель для хранения данных
const productModel = new ProductModel(eventBroker);

// Находим контейнер для товаров
const container = document.querySelector('.gallery') as HTMLElement;

// Создаем View для отрисовки товаров
const productView = new ProductView(container, eventBroker);

const cardFullModal = document.querySelector('.modal:has(.card_full)') as HTMLElement;

//view для открытой карточки
const productFullView = new ProductPreviewView(cardFullModal, eventBroker);

//модель корзины
const cartModel = new CartModel(eventBroker);

const basketFullModal = document.querySelector('.modal:has(.basket)') as HTMLElement;

const cartView = new CartView(basketFullModal, eventBroker);

const cartOpenButton = document.querySelector('.header__basket') as HTMLButtonElement;

console.log(cartModel.getItems());

cartOpenButton.addEventListener('click', (evt) => {
    const basketFullModal = document.querySelector('.modal:has(.basket)') as HTMLElement;
    if (basketFullModal) {
        openPopup(basketFullModal)
    }
})


// Подписываемся на обновление товаров
eventBroker.on('products:updated', (products: Product[]) => {

    container.innerHTML = '';
    // Отрисовываем каждый товар
    products.forEach(product => {
        productView.render(product);
    });
    const cardButtons = document.querySelectorAll('.gallery__item');
    cardButtons.forEach((button, index) => {
        button.addEventListener('click', (evt) => {
            evt.preventDefault();
            if (!cardFullModal) {
                console.log('модальное окно не найдено');
            }
            productFullView.render(products[index]);
            openPopup(cardFullModal);

            const cardBuyButton = cardFullModal.querySelector('.card__button') as HTMLButtonElement;
            if (cardBuyButton) {
                cardBuyButton.onclick = (evt) => {
                    evt.preventDefault();
                    cartModel.addItem(products[index]);
                    console.log(cartModel.getItems())
                }
            }
        })
    });
});

productApi.getProducts()
    .then(products => {
        // Устанавливаем товары в модель (вызовет событие products:updated)
        productModel.setProducts(products);
    })
    .catch(error => {
        console.error('Ошибка загрузки:', error);
    });

//обработчики корзины
eventBroker.on('cart:updated', (cartData: Cart) => {
    cartView.render(cartData);
})

eventBroker.on('cart:remove', ({ id }: { id: number }) => {
    cartModel.removeItem(id);
})

//обработчик валидации почты 
eventBroker.on('order:paymentSelected', (data: {paymentMethod: 'online'|'cash'|''}) => {
    console.log('Выбран метод оплаты:', data.paymentMethod)
    orderModel.order.payment.paymentMethod = data.paymentMethod;
    orderModel.validateAddress();
})

eventBroker.on('order:addressInput', (data: {address: string}) => {
    console.log('Введен адрес', data.address);
    orderModel.order.payment.address = data.address;
    orderModel.validateAddress();
})

//итоговая кнопка отправки
eventBroker.on('order:submit', () => {
    const order = orderModel.getOrder();
    const cartItems = cartModel.getItems();

    // Данные для API
    const orderData = {
        payment: order.payment.paymentMethod,
        email: order.contact.email,
        phone: order.contact.phone,
        address: order.payment.address,
        total: cartModel.totalPrice(),
        item: cartItems.map(item => item.id)  // массив id товаров
    }

    // Данные для рендера успешного заказа (Cart)
    const cartForRender = {
        items: cartItems,
        total: cartModel.totalPrice(),
        totalCount: cartModel.totalCount()
    }

    api.post("/order", orderData)
        .then(response => {
            console.log('Заказ создан', response);
            orderSuccess.render(cartForRender);  // передаём Cart
            alert('Заказ оформлен');
        })
        .catch(error => {
            console.log('Ошибка при оформлении', error);
        })
});


eventBroker.on('order:contactInput', (data: {field: keyof EmailPhoneForm; value: string}) => {
    orderModel.order.contact[data.field] = data.value;
    orderModel.validateContact();
})








// // обработчики событий 
// eventEmitter.on('productsLoaded', (products: Product[]) => {
//     productModel.setProducts(products);
//     const productElements = productModel.getAllItems().map(product => {
//         const view = new ProductView(eventEmitter);
//         view.productTitle = product.title;
//         view.productPrice = product.price;
//         view.productCategory = product.category;
//         view.productDescription = product.description;
//         view.productImage = product.image;
//         return view.render();
//     });
//     document.querySelector('.gallery').append(...productElements);
// });

// eventEmitter.on('addToCart', (product: Product) => {
//     if (product.isAvailable) {
//         cartModel.addItem(product);
//         eventEmitter.emit('cartUpdated', cartModel.getItems());
//     }
// });

// eventEmitter.on('cartUpdated', (items: CartItem[]) => {
//     document.querySelector('.header__basket-counter').textContent = String(cartModel.totalCount());
//     const cartView = new CartView(eventEmitter);
//     const cartItems = items.map(item => new CartProductView(eventEmitter).render(item));
//     cartView.updateItems(cartItems);
//     modal.open(cartView.render());
// });

// eventEmitter.on('removeFromCart', (id: number) => {
//     cartModel.removeItem(id);
//     eventEmitter.emit('cartUpdated', cartModel.getItems());
// });

// eventEmitter.on('openCart', () => {
//     eventEmitter.emit('cartUpdated', cartModel.getItems());
// });

// eventEmitter.on('paymentSubmitted', (data: PaymentAddressForm) => {
//     orderModel.setPayment(data);
//     if (orderModel.validateAddress()) {
//         eventEmitter.emit('paymentValidated');
//     } else {
//         eventEmitter.emit('validationError', 'address');
//     }
// });

// eventEmitter.on('paymentValidated', () => {
//     const view = new OrderEmailAndPhoneView(eventEmitter);
//     modal.open(view.render());
// });

// eventEmitter.on('contactSubmitted', (data: EmailPhoneForm) => {
//     orderModel.setContact(data);
//     if (orderModel.validateContact()) {
//         eventEmitter.emit('contactValidated');
//     } else {
//         eventEmitter.emit('validationError', 'contact');
//     }
// });

// eventEmitter.on('contactValidated', () => {
//     const orderData = orderModel.getOrder();
//     api.submitOrder(orderData)
//         .then(() => eventEmitter.emit('orderSubmitted', orderData))
//         .catch(error => console.error('Ошибка отправки заказа:', error));
// });

// eventEmitter.on('orderSubmitted', (orderData: OrderData) => {
//     cartModel.removeAll();
//     const view = new OrderSuccessView(eventEmitter);
//     modal.open(view.render(orderData));
// });

// eventEmitter.on('closeModal', () => {
//     modal.close();
// });

// // обработчик кнопки корзины
// document.querySelector('.header__basket').addEventListener('click', () => {
//     eventEmitter.emit('openCart');
// });