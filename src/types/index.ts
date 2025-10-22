export interface Product {
    id: number;
    title: string;
    description: string;
    category: string;
    image: string;
    price?: number | string;
    isAvailable: boolean;
}

//обновим пейментМетод, чтоб был тип, когда он не выбран и поменяем later на кэш
export interface PaymentAddressForm {
    address: string;
    paymentMethod: 'online' | 'cash' | '';
}

export interface EmailPhoneForm {
    email: string;
    phone: string;
}

//добавим локальный индекс для отрисовки номера в корзине
export interface CartItem {
    id: number;
    title: string;
    price: number;
    quantity: number;
    total?: number;
    cartId: number;
}

//новый интерфейс для корзины
export interface Cart {
    items: CartItem[];
    total: number;
    totalCount: number;
}

export interface OrderData {
    items: CartItem[];
    total: number;
    payment: PaymentAddressForm;
    contact: EmailPhoneForm;
}

// Модели
export interface IProductModel {
    getAllItems(): Product[]; 
    setProducts(products: Product[]): void;
    getProductById(id: number): Product | null;
    setCurrentProduct(id: number): void;
}

export interface ICartModel {
    getItems(): CartItem[]; 
    addItem(product: Product): void;
    removeItem(id: number): void;
    removeAll(): void; 
    totalPrice(): number;
    totalCount(): number;
}

export interface IOrderModel {
    getOrder(): OrderData;
    setPayment(data: PaymentAddressForm): void;
    setContact(data: EmailPhoneForm): void;
    validateAddress(): boolean;
    validateContact(): boolean; 
}

export interface IModal {
    open(page: HTMLElement): void;
    close(): void;
}