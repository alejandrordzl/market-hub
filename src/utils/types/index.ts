import { NextApiRequest, NextApiResponse } from "next";

export interface CreateProductBody {
    name: string;
    barCode: string;
    price: number;
}

export type User = {
    id: number;
    name: string;
    password: string;
    phone: string;
    role: Role | null;
    email: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    active: Status | null;
    telegramId: string | null;
};

export type Product = {
    id: string;
    name: string;
    barCode: string;
    price: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    active: Status;
    createdBy: number;
    updatedBy: number;
};
export type Sale = {
    id: string;
    sellerId: number;
    paymentMethod: PaymentMethod;
    total: number;
    amountReceived: number;
    change: number;
    saleDate: Date;
    status: SaleStatus;
    saleProducts?: SaleItem[];
};
export type SaleItem = {
    id: string;
    saleId: string;
    productId: string;
    quantity: number;
    product?: Product;
};
export const Role = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    USER: 'USER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const Status = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const PaymentMethod = {
    CASH: 'CASH',
    CREDIT_CARD: 'CREDIT_CARD',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const SaleStatus = {
    PENDING: 'PENDING',
    CONCLUDED: 'CONCLUDED',
    CANCELLED: 'CANCELLED',
} as const;

export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];
export interface AuthenticatedRequest extends NextApiRequest {
    user: User;
}

export type AuthenticatedHandler<T = unknown> = (req: AuthenticatedRequest, res: NextApiResponse<T>) => unknown | Promise<unknown>;

export type UserToken = {
    id: number;
    name: string;
    email: string | null;
    role: Role | null;
}