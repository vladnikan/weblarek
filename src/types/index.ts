export interface Product {
    id: number;
    title: string;
    description: string;
    category: string;
    image: string;
    price: number;
    isAvailable: boolean;
}

export interface PaymentAddressForm {
    address: string;
    paymentMethod: 'online' | 'later';
}

export interface EmailPhoneForm {
    email: string;
    phone: string;
}

export interface CartItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
    total: number;
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
}

export interface ICartModel {
    getItems(): CartItem[]; 
    addItem(product: Product): void;
    removeItem(id: string): void;
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