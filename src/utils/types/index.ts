import { NextApiRequest, NextApiResponse } from "next";
import { 
  User as DrizzleUser, 
  Product as DrizzleProduct, 
  Sale as DrizzleSale, 
  SaleProduct as DrizzleSaleProduct,
  Role as DrizzleRole,
  Status as DrizzleStatus,
  PaymentMethod as DrizzlePaymentMethod,
  SaleStatus as DrizzleSaleStatus
} from "@/db/schema";

export interface CreateProductBody {
    name: string;
    barCode: string;
    price: number;
}

// Re-export Drizzle types for backward compatibility
export type User = DrizzleUser;
export type Product = DrizzleProduct;
export type Sale = DrizzleSale & {
    saleProducts: SaleItem[];
};
export type SaleItem = DrizzleSaleProduct & {
    unitPrice?: number | null;
    product?: Product;
};
// Re-export Drizzle enum types
export type Role = DrizzleRole;
export type Status = DrizzleStatus;  
export type PaymentMethod = DrizzlePaymentMethod;
export type SaleStatus = DrizzleSaleStatus;

// Constants for backward compatibility
export const Role = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    USER: 'USER',
} as const;

export const Status = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
} as const;

export const PaymentMethod = {
    CASH: 'CASH',
    CREDIT_CARD: 'CREDIT_CARD',
} as const;

export const SaleStatus = {
    PENDING: 'PENDING',
    CONCLUDED: 'CONCLUDED',
    CANCELLED: 'CANCELLED',
} as const;
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