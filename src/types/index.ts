export interface Product {
    id: string;
    title: string;
    description: string;
    category: string;
    image: string;
    price: number | string;
}

export interface PaymentAddressForm {
    address: string;
    paymentMethod: 'online' | 'cash' | '';
}

export interface EmailPhoneForm {
    email: string;
    phone: string;
}

//новый интерфейс для корзины
export interface Cart {
    items: Product[];
    total: number;
    totalCount: number;
}

export interface OrderData {
    payment: PaymentAddressForm;
    contact: EmailPhoneForm;
}

// Модели
export interface IProductModel {
    getAllItems(): Product[]; 
    setProducts(products: Product[]): void;
    getProductById(id: string): Product | null;
    setCurrentProduct(id: string): void;
}

export interface ICartModel {
    getItems(): Product[]; 
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