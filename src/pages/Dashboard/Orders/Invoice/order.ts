// src/types/order.ts
export type PopulatedProduct = {
    _id: string;
    title: string;
    price: number;
};

export type OrderProduct = {
    product: PopulatedProduct;
    color?: string;
    size?: string;
    quantity: number;
    price: number;  // unit price stored at order time
};

export type Order = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state?: string;
    zip: string;
    subtotal: number;
    shipping: number;
    discount: number;
    totalAmount: number;
    paymentMethod: string;
    deliveryMethod: string;
    products: OrderProduct[];
    createdAt: string;
    status?: string;
};
