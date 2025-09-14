import './scss/styles.scss';
import { ProductModel, CartModel, OrderModel } from './components/models'; //добавится в будущем
import { ProductView, CartView, CartProductView, OrderPaymentAndAddressView, OrderEmailAndPhoneView, OrderSuccessView } from './components/views'; //добавится в будущем
import { EventEmitter } from './components/base/events';
import { Api, ApiListResponse } from './components/base/api';
import { Modal } from './components/base/Modal'; //добавится в будущем
import { Product, CartItem, OrderData, PaymentAddressForm, EmailPhoneForm } from './types';
import { API_URL } from './utils/constants';

// инициализация
const eventEmitter = new EventEmitter();
const api = new Api(API_URL);
const modal = new Modal();
const productModel = new ProductModel();
const cartModel = new CartModel(eventEmitter);
const orderModel = new OrderModel(eventEmitter);

// обработчики событий 
eventEmitter.on('productsLoaded', (products: Product[]) => {
    productModel.setProducts(products);
    const productElements = productModel.getAllItems().map(product => {
        const view = new ProductView(eventEmitter);
        view.productTitle = product.title;
        view.productPrice = product.price;
        view.productCategory = product.category;
        view.productDescription = product.description;
        view.productImage = product.image;
        return view.render();
    });
    document.querySelector('.gallery').append(...productElements);
});

eventEmitter.on('addToCart', (product: Product) => {
    if (product.isAvailable) {
        cartModel.addItem(product);
        eventEmitter.emit('cartUpdated', cartModel.getItems());
    }
});

eventEmitter.on('cartUpdated', (items: CartItem[]) => {
    document.querySelector('.header__basket-counter').textContent = String(cartModel.totalCount());
    const cartView = new CartView(eventEmitter);
    const cartItems = items.map(item => new CartProductView(eventEmitter).render(item));
    cartView.updateItems(cartItems);
    modal.open(cartView.render());
});

eventEmitter.on('removeFromCart', (id: number) => {
    cartModel.removeItem(id);
    eventEmitter.emit('cartUpdated', cartModel.getItems());
});

eventEmitter.on('openCart', () => {
    eventEmitter.emit('cartUpdated', cartModel.getItems());
});

eventEmitter.on('paymentSubmitted', (data: PaymentAddressForm) => {
    orderModel.setPayment(data);
    if (orderModel.validateAddress()) {
        eventEmitter.emit('paymentValidated');
    } else {
        eventEmitter.emit('validationError', 'address');
    }
});

eventEmitter.on('paymentValidated', () => {
    const view = new OrderEmailAndPhoneView(eventEmitter);
    modal.open(view.render());
});

eventEmitter.on('contactSubmitted', (data: EmailPhoneForm) => {
    orderModel.setContact(data);
    if (orderModel.validateContact()) {
        eventEmitter.emit('contactValidated');
    } else {
        eventEmitter.emit('validationError', 'contact');
    }
});

eventEmitter.on('contactValidated', () => {
    const orderData = orderModel.getOrder();
    api.submitOrder(orderData)
        .then(() => eventEmitter.emit('orderSubmitted', orderData))
        .catch(error => console.error('Ошибка отправки заказа:', error));
});

eventEmitter.on('orderSubmitted', (orderData: OrderData) => {
    cartModel.removeAll();
    const view = new OrderSuccessView(eventEmitter);
    modal.open(view.render(orderData));
});

eventEmitter.on('closeModal', () => {
    modal.close();
});

// обработчик кнопки корзины
document.querySelector('.header__basket').addEventListener('click', () => {
    eventEmitter.emit('openCart');
});
