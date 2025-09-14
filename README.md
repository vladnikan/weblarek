# Проектная работа "Веб-ларек"

## В этом проекте использована архитектура MVP (Model-View-Presenter)

## Model
Классы моделей отвечают за хранение и обработку данных приложения. Они обеспечивают доступ к данным, их валидацию и управление состоянием.

Классы моделей:

ProductModel - класс, хранящий данные о товарах
OrderModel - класс, хранящияй данные об информации о заказе (адрес, номер и т.д.) 
CartModel - класс, хранящий обработку данных, передающихся в корзину (подсчет итоговой суммы и т.д)

## View 

Классы представления отвечают за отображение данных в пользовательском интерфейсе, предоставляя DOM-элементы для взаимодействия. Обработка событий осуществляется в слое Presenter через EventEmitter

Классы вида:

ProductView - класс, отображающий карточку товара
CartView - класс, отображающий корзину 
CartProductView - отображение карточки в корзине
OrderPaymentAndAdresView - отображение окна способа оплаты и ввода адреса
OrderEmailAndPhoneView - отображение окна для заполнения почты и телефона перед оплатой
OrderSuccess - окно успешного оформления заказа

## Presenter

Presenter реализован как набор обработчиков через EventEmmiter в src/index.ts. Он отвечает за логику приложения, координируя взаимодействие между Model и View, обрабатывая пользовательские действия и обновляя данные.

## Вспомогательные классы

EventEmitter - обеспечивает работу событий
API - для работы с сервером
Modal - для работы с модульными окнами

## Описание классов

## Model - класс ProductModel

Свойства:
private products: Product[] = [] - массив товаров
private currentProduct: Product | null = null - текущий выбранный продукт

Методы:
public getAllItems(): Product[] - текущий список товаров
public setProducts(products: Product[]): void - заполнение списка товаров
public getProductById(id: number): Product | null - получение продукта по идентификатору
public setCurrentProduct(id: number): void - выбор текущего продукта по идентификатору

## Model - класс CartModel

Свойства:
private cartProducts: CartItem[] = [] - массив товаров в корзине
private eventEmitter: EventEmitter - брокер

Методы:
public getItems(): CartItem[] - текущий список товаров в корзине
public addItem(product: Product): void - добавление товара в корзину
public removeItem(productId: number): void - удаление товара из корзины 
public totalPrice(): number - подсчет итоговой стоимости товаров в корзине
public totalCount(): number - отображение количества товаров в корзине
public removeAll(): void - очистка корзины после заказа товаров


## Model - класс OrderModel

Свойства:
private orderData: OrderData = {} - объект с данными заказа
private eventEmitter: EventEmitter - брокер

Методы:
public getOrder(): OrderData - получение информации о заказе
public setPayment(data: PaymentAddressForm): void - задание данных об оплате и адресе
public setContact(data: EmailPhoneForm): void - задание контактных данных
public validateAddress(): boolean - проверка заполнения адреса
public validateContact(): boolean - проверка заполнения номера и почты 


# View 

# View - класс ProductView

Свойства:
public productTitle: string - название товара
public productCategory: string - категория товара (софт-скил, дополнительное и т.д.)
public productDescription: string - описание товара
public productPrice: number - цена товара
public productImage: string - изображение товара (ссылка)
public productPreviewTitle: string - название товара в превью
public productPreviewPrice: number - цена товара в превью
public productPreviewImage: string - изображение товара (ссылка) в превью
public productPreviewCategory: string - категория товара (софт-скил, дополнительное и т.д.) в превью
public productAddButton: HTMLButtonElement - кнопка купить

private container: HTMLElement - контейнер карточки товара
private eventEmitter: EventEmitter - брокер

Методы:
public render(): HTMLElement - создание карточки

## View - класс CartView

Свойства:
private container: HTMLElement - контейнер корзины
private eventEmitter: EventEmitter - брокер


Методы:
public render(): HTMLElement - возвращает контейнер корзины
public updateItems(elements: HTMLElement[]): void - обновление содержимого корзины (создание списка товаров совершается в presenter)

## View - класс CartProductView

Свойства:
private cartElement: CartItem - объект с данными о добавленном товаре в корзину
private container: HTMLElement - контейнер элемента корзины
private eventEmitter: EventEmitter - брокер

Методы:
public render(item: CartItem): HTMLElement - создание элемента товара в корзине

## View - класс OrderPaymentAndAdresView

Свойства:
private container: HTMLElement - контейнер формы
private eventEmitter: EventEmitter - брокер


Методы:
public render(): HTMLElement - отрисовка формы оплаты и адреса

private setEventListeners(): void - обработчик событий для форм и кнопки закрытия

## View - класс OrderEmailAndPhoneView

Свойства:
private container: HTMLElement - контейнер формы
private eventEmitter: EventEmitter - брокер

Методы:
public render(): HTMLElement - отрисовка формы контактов
private setEventListeners(): void - обработчик событий для форм и кнопки закрытия

## View - класс OrderSuccessView

Свойства:
private container: HTMLElement - контейнер успешного заказа
private totalPrice: HTMLElement - итоговая сумма заказа
private orderSuccessCloseButton: HTMLButtonElement - кнопка закрытия
private eventEmitter: EventEmitter - брокер

Методы:
private setEventListeners(): void - обработчик события для кнопки закрытия
public render(orderData: OrderData): HTMLElement - отрисовка страницы успеха


Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
