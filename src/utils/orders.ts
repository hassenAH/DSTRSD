import { AxiosError } from "axios";
import api from "./axios";
export type DeliveryMethod = "standard" | "express";
export type PaymentMethod = "card" | "cod";

export type OrderItemInput = {
    productId: string;
    size: string;           // must match a size in the product.sizes[] on backend
    quantity: number;
    color?: string | null;
};

export type CreateOrderRequest = {
    products: OrderItemInput[];
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zip: string;
    state?: string;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
    subtotal: number;       // number in DT
    shipping: number;       // number in DT
    discount: number;       // number in DT
    totalAmount: number;    // subtotal + shipping - discount
};

export type CreateOrderResponse = {
    message: string;
    order: {
        _id: string;
        status: string;
        products: Array<{
            product: { _id: string; title: string; price: number };
            color?: string;
            size: string;
            quantity: number;
            price: number;
        }>;
        email: string;
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        zip: string;
        state?: string;
        deliveryMethod: DeliveryMethod;
        paymentMethod: PaymentMethod;
        subtotal: number;
        shipping: number;
        discount: number;
        totalAmount: number;
        createdAt: string;
        updatedAt: string;
    };
};

export async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
        const res = await api.post<CreateOrderResponse>("/orders/create", payload, {
            headers: { "Content-Type": "application/json" },

        });
        return res.data;
    } catch (err) {
        const e = err as AxiosError<any>;
        const msg =
            e.response?.data?.error ||
            e.response?.data?.message ||
            e.message ||
            "Failed to place order.";
        throw new Error(msg);
    }
}