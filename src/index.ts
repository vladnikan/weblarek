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
	CartProductView,
} from './components/views';
import { EventEmitter } from './components/base/events';
import { Api } from './components/base/api';
import { Product, Cart, OrderData, PaymentAddressForm } from './types';
import { API_URL } from './utils/constants';
import { ProductApi } from './components/base/ProductApi';
import { Modal } from './components/base/Modal';

// Инициализация
const eventBroker = new EventEmitter();
const api = new Api(API_URL);
const productApi = new ProductApi(API_URL);

const productModel = new ProductModel(eventBroker);
const cartModel = new CartModel(eventBroker);
const orderModel = new OrderModel(eventBroker);

// Переменная для хранения текущего продукта
let currentProduct: Product | null = null;

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
const modalTemplate = document.querySelector(
	'#modal-container'
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
	eventBroker
);
const previewClone = previewTemplate.content
	.querySelector('.card_full')!
	.cloneNode(true) as HTMLElement;
const productPreviewView = new ProductPreviewView(previewClone, eventBroker);

// Модалка
const modalContainer = document.querySelector(
	'#modal-container'
) as HTMLElement;
const modalInstance = new Modal(modalContainer, eventBroker);

// Управление блокировкой страницы в презентере
eventBroker.on('modal:open', () => {
	document
		.querySelector('.page__wrapper')
		.classList.add('page__wrapper_locked');
});

eventBroker.on('modal:close', () => {
	document
		.querySelector('.page__wrapper')
		.classList.remove('page__wrapper_locked');
});

// Загрузка товаров
productApi
	.getProducts()
	.then((products) => {
		productModel.setProducts(products);
	})
	.catch((err) => {
		console.error('Ошибка загрузки товаров', err);
	});

// Обработка обновления продуктов
eventBroker.on('products:updated', () => {
	galleryContainer.innerHTML = '';
	productModel.getAllItems().forEach((product) => {
		const cardClone = cardTemplate.content
			.querySelector('.gallery__item')!
			.cloneNode(true) as HTMLElement;
		const productView = new ProductView(cardClone, eventBroker);
		productView.render(product);
		galleryContainer.appendChild(cardClone);
	});
});

// Обновление корзины
eventBroker.on('cart:updated', () => {
	headerView.updateCounter(cartModel.totalCount());
	if (!(modalInstance.content instanceof OrderSuccessView)) {
		renderCart();
	}
});

// Открытие превью
eventBroker.on('preview:open', ({ productId }: { productId: string }) => {
	const product = productModel.getProductById(productId);
	if (product) {
		currentProduct = product;
		productPreviewView.render(product);
		modalInstance.content = productPreviewView.getElement();
		modalInstance.open();
		const isAdded = cartModel.checkItem(productId);
		productPreviewView.updateButton(isAdded, Number(product.price));
	}
});

// Обработка клика по кнопке в корзину
eventBroker.on('preview:buyButtonClicked', () => {
	if (currentProduct && currentProduct.price != null) {
		const isAdded = cartModel.checkItem(currentProduct.id);
		if (isAdded) {
			cartModel.removeItem(currentProduct.id);
			productPreviewView.updateButton(false, Number(currentProduct.price));
		} else {
			cartModel.addItem(currentProduct);
			productPreviewView.updateButton(true, Number(currentProduct.price));
		}
	}
});

// Корзина
function renderCart() {
	const cartData: Cart = {
		items: cartModel.getItems(),
		total: cartModel.totalPrice(),
		totalCount: cartModel.totalCount(),
	};
	const itemViews = cartData.items.map((cartItem, index) => {
		const itemView = new CartProductView(
			basketItemTemplate.content
				.querySelector('.basket__item')!
				.cloneNode(true) as HTMLElement,
			eventBroker
		);
		return itemView.render(cartItem, index);
	});
	cartView.render(cartData, itemViews);
}

// Открытие корзины
eventBroker.on('cart:open', () => {
	renderCart();
	modalInstance.content = cartView.getElement();
	modalInstance.open();
});

// Удаление товара
eventBroker.on('cart:remove', ({ id }: { id: string }) => {
	cartModel.removeItem(id);
});

// Открытие формы заказа
eventBroker.on('cart:buy', () => {
	modalInstance.content = orderPaymentView.getElement();
	modalInstance.open();
});

// Обновление формы оплаты и контактов
eventBroker.on('order:paymentUpdated', (order: OrderData) => {
	orderPaymentView.render(order.payment);
});

eventBroker.on('order:contactUpdated', (order: OrderData) => {
	orderEmailPhoneView.render(order.contact);
});

// Валидация оплаты
eventBroker.on(
	'order:validatePayment',
	(data: { isValid: boolean; message?: string }) => {
		orderPaymentView.renderValidation(data.isValid, data.message);
	}
);

// Валидация контактов
eventBroker.on(
	'order:validateContact',
	(data: { isValid: boolean; message?: string }) => {
		orderEmailPhoneView.renderValidation(data.isValid, data.message);
	}
);

// Контакты
eventBroker.on(
	'order:contactInput',
	({ field, value }: { field: 'email' | 'phone'; value: string }) => {
		const updated = { ...orderModel.getOrder().contact, [field]: value };
		orderModel.setContact(updated);
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
eventBroker.on('order:setPayment', (data: Partial<PaymentAddressForm>) => {
	orderModel.setPayment(data);
});

// Переход к следующему шагу
eventBroker.on('order:nextStep', () => {
	if (orderModel.validateAddress()) {
		modalInstance.content = orderEmailPhoneView.getElement();
		modalInstance.open();
	}
});

// Отправка заказа
eventBroker.on('order:submit', () => {
	const order = orderModel.getOrder();
	const cartItems = cartModel.getItems();

	const orderData = {
		payment: order.payment.paymentMethod,
		address: order.payment.address,
		email: order.contact.email,
		phone: order.contact.phone,
		total: cartModel.totalPrice(),
		items: cartItems.map((item) => item.id),
	};

	api
		.post('/order', orderData, 'POST')
		.then((response: { total: number }) => {
			orderSuccessView.render({ total: response.total });
			modalInstance.content = orderSuccessView.getElement();
			modalInstance.open();
			cartModel.removeAll();
			orderModel.setContact({ email: '', phone: '' });
			orderModel.setPayment({ paymentMethod: '', address: '' });
		})
		.catch((err) => {
			console.error('Ошибка при оформлении заказа', err);
		});
});

// Закрытие успешного заказа
eventBroker.on('order:closeSuccess', () => {
	modalInstance.close();
	renderCart();
});
