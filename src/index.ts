import './scss/styles.scss';
import { ProductModel, CartModel, OrderModel } from './components/models';
import {
	ProductView,
	ProductPreviewView,
	CartView,
	OrderPaymentAndAddressView,
	OrderEmailAndPhoneView,
	OrderSuccessView,
	HeaderView,
} from './components/views';
import { EventEmitter } from './components/base/events';
import { Api } from './components/base/api';
import { Product, Cart, OrderData, PaymentAddressForm } from './types';
import { API_URL } from './utils/constants';
import { ProductApi } from './components/base/ProductApi';
import { Modal } from './components/base/Modal';

// Закрытие активных модалок
document
	.querySelectorAll<HTMLElement>('.modal.modal_active')
	.forEach((modal) => {
		modal.classList.remove('modal_active');
	});

// Инициализация
const eventBroker = new EventEmitter();
const api = new Api(API_URL);
const productApi = new ProductApi(API_URL);

const initialOrder: OrderData = {
	payment: { paymentMethod: '', address: '' },
	contact: { email: '', phone: '' },
};

const productModel = new ProductModel(eventBroker);
const cartModel = new CartModel(eventBroker);
const orderModel = new OrderModel(eventBroker, initialOrder);

// Контейнеры
const galleryContainer = document.querySelector('.gallery') as HTMLElement;
const headerContainer = document.querySelector('.header') as HTMLElement;

// Header
const headerView = new HeaderView(headerContainer, eventBroker);
headerView.render();
headerView.updateCounter(cartModel.totalCount());

// Шаблоны
const cardTemplate = document.querySelector(
	'#card-catalog'
) as HTMLTemplateElement;
const previewTemplate = document.querySelector(
	'#card-preview'
) as HTMLTemplateElement;
const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
const basketItemTemplate = document.querySelector(
	'#card-basket'
) as HTMLTemplateElement;
const orderPaymentTemplate = document.querySelector(
	'#order'
) as HTMLTemplateElement;
const orderContactTemplate = document.querySelector(
	'#contacts'
) as HTMLTemplateElement;
const orderSuccessTemplate = document.querySelector(
	'#success'
) as HTMLTemplateElement;

// Создание View
const orderPaymentView = new OrderPaymentAndAddressView(
	orderPaymentTemplate.content
		.querySelector('form[name="order"]')!
		.cloneNode(true) as HTMLElement,
	eventBroker
);

const orderEmailPhoneView = new OrderEmailAndPhoneView(
	orderContactTemplate.content
		.querySelector('form[name="contacts"]')!
		.cloneNode(true) as HTMLElement,
	eventBroker
);

const orderSuccessView = new OrderSuccessView(
	orderSuccessTemplate.content
		.querySelector('.order-success')!
		.cloneNode(true) as HTMLElement,
	eventBroker
);

const cartView = new CartView(
	basketTemplate.content
		.querySelector('.basket')!
		.cloneNode(true) as HTMLElement,
	eventBroker,
	basketItemTemplate
);

const previewClone = previewTemplate.content
	.querySelector('.card_full')!
	.cloneNode(true) as HTMLElement;
const productPreviewView = new ProductPreviewView(previewClone, eventBroker);

// Модалки
const modalContact = document.querySelector('#modal-container') as HTMLElement;
const modalSuccess = document.querySelector(
	'.modal:has(.order-success)'
) as HTMLElement;
const cardFullModal = document.querySelector(
	'.modal:has(.card_full)'
) as HTMLElement;
const basketFullModal = document.querySelector(
	'.modal:has(.basket)'
) as HTMLElement;

const contactModalInstance = new Modal(modalContact, eventBroker);
const successModalInstance = new Modal(modalSuccess, eventBroker);
const cardFullModalInstance = new Modal(cardFullModal, eventBroker);
const basketFullModalInstance = new Modal(basketFullModal, eventBroker);

// Загрузка товаров
productApi
	.getProducts()
	.then((products) => {
		productModel.setProducts(products);

		products.forEach((product) => {
			const cardClone = cardTemplate.content
				.querySelector('.gallery__item')!
				.cloneNode(true) as HTMLElement;
			const productView = new ProductView(cardClone, eventBroker);

			const storedProduct = productModel.getProductById(product.id);
			if (!storedProduct) return;

			productView.render(storedProduct);
			galleryContainer.appendChild(cardClone);

			// Открытие превью товара
			cardClone.addEventListener('click', (evt) => {
				evt.preventDefault();
				productPreviewView.render(storedProduct);
				cardFullModalInstance.content = productPreviewView.getElement();
				cardFullModalInstance.open();
			});
		});
	})
	.catch((err) => {
		console.error('Ошибка загрузки товаров', err);
	});

// Проверка корзины
eventBroker.on(
	'cart:checkItem',
	({
		productId,
		callback,
	}: {
		productId: string;
		callback: (isInCart: boolean) => void;
	}) => {
		const isInCart = cartModel.getItems().some((item) => item.id === productId);
		eventBroker.emit('cart:checked', { productId, isInCart });
		if (callback) callback(isInCart);
	}
);

// Корзина
function renderCart() {
	const cartData: Cart = {
		items: cartModel.getItems(),
		total: cartModel.totalPrice(),
		totalCount: cartModel.totalCount(),
	};
	cartView.render(cartData);
	basketFullModalInstance.content = cartView.getElement();
}

// Открытие корзины
eventBroker.on('cart:open', () => {
	renderCart();
	basketFullModalInstance.open();
});

// Обновление корзины
eventBroker.on('cart:updated', () => {
	headerView.updateCounter(cartModel.totalCount());
	renderCart();
});

// Добавление товара
eventBroker.on('card:add', ({ productId }: { productId: string }) => {
	const product = productModel.getProductById(productId);
	if (product && !cartModel.getItems().some((i) => i.id === productId)) {
		cartModel.addItem(product);
	}
});

// Удаление товара по ID
eventBroker.on('card:removeById', ({ productId }: { productId: string }) => {
	const index = cartModel.getItemIndexById(productId);
	if (index !== -1) cartModel.removeItem(index);
});

// Удаление товара по индексу
eventBroker.on('cart:remove', ({ index }: { index: number }) => {
	cartModel.removeItem(index);
});

// Открытие формы заказа
eventBroker.on('cart:buy', () => {
	basketFullModalInstance.close();
	contactModalInstance.content = orderPaymentView.getElement();
	contactModalInstance.open();
});

// Контакты
eventBroker.on(
	'order:contactInput',
	({ field, value }: { field: 'email' | 'phone'; value: string }) => {
		const updated = { ...orderModel.getOrder().contact, [field]: value };
		orderModel.setContact(updated);

		const isValid = orderModel.validateContact();
		orderEmailPhoneView.renderValidation(
			isValid,
			!updated.email ? 'email' : 'phone'
		);

		eventBroker.emit('order:update', orderModel.getOrder());
	}
);

// Оплата
eventBroker.on(
	'order:paymentSelected',
	({ paymentMethod, address }: PaymentAddressForm) => {
		orderModel.setPayment({ paymentMethod, address });
	}
);

// Установка данных оплаты
eventBroker.on('order:setPayment', (data: PaymentAddressForm) => {
	orderModel.setPayment(data);
});

// Валидация оплаты
eventBroker.on(
	'order:validatePayment',
	(data: { isValid: boolean; message?: string }) => {
		eventBroker.emit('order:renderPaymentValidation', data);
	}
);

// Переход к следующему шагу
eventBroker.on('order:nextStep', () => {
	if (orderModel.validateAddress()) {
		contactModalInstance.close();
		contactModalInstance.content = orderEmailPhoneView.getElement();
		contactModalInstance.open();
	}
});

// Отправка заказа
eventBroker.on('order:submit', () => {
	const cartItems = cartModel.getItems();
	if (!cartItems.length) return;

	const orderData = orderModel.getOrderData(cartItems, cartModel.totalPrice());
	api
		.post('/order', orderData, 'POST')
		.then(() => {
			contactModalInstance.close();

			orderSuccessView.render({
				items: cartItems,
				total: cartModel.totalPrice(),
				totalCount: cartModel.totalCount(),
			});
			successModalInstance.content = orderSuccessView.getElement();
			successModalInstance.open();

			cartModel.removeAll();
			orderModel.setPayment({ paymentMethod: '', address: '' });
			orderModel.setContact({ email: '', phone: '' });
		})
		.catch((err) => console.error('Ошибка при оформлении заказа', err));
});

// Закрытие успешного заказа
eventBroker.on('order:closeSuccess', () => {
	successModalInstance.close();
});
