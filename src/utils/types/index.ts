export interface CreateProductBody {
    name: string;
    barCode: string;
    price: number;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    active: string;
    password: string;
    createdBy: string;
}