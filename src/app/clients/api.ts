import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  User,
  Product,
  Sale,
  SaleItem,
  Role,
  Status,
  PaymentMethod,
  SaleStatus,
  UserToken,
  CreateProductBody
} from '../../utils/types';

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginRequest {
  id: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserToken;
}

// User types
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: Role;
  active?: Status;
}

// Product types
export interface UpdateProductRequest {
  name?: string;
  barCode?: string;
  price?: number;
}

// Sale types
export interface GetSalesParams {
  startDate?: string;
  endDate?: string;
  sellerId?: number;
  status?: SaleStatus;
  page?: number;
  limit?: number;
}

export interface UpdateSaleRequest {
  paymentMethod: PaymentMethod;
  amountReceived: number;
  change: number;
}

export interface CreateSaleItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateSaleItemRequest {
  quantity: number;
}

// Extended types with relations
export interface SaleWithDetails extends Sale {
  seller: User;
  saleProducts: (SaleItem & {
    product: Product;
  })[];
}

export interface ProductWithUser extends Product {
  createdByUser?: User;
  updatedByUser?: User;
}

export class MarketHubApiClient {
  private client: AxiosInstance;
  private token?: string;

  constructor(baseURL: string, token?: string) {
    this.token = token;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attach token to every request if present
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (this.token) {
        config.headers = config.headers || {};
        (config.headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string): void {
    this.token = token;
  }

  // Auth
  async login(id: string, password: string): Promise<AxiosResponse<LoginResponse>> {
    const res = await this.client.post<LoginResponse>('/api/auth/login', { id, password });
    return res;
  }

  // Users
  async getUsers(page = 1, limit = 10): Promise<AxiosResponse<PaginatedResponse<User>>> {
    const res = await this.client.get<PaginatedResponse<User>>('/api/users', { params: { page, limit } });
    return res;
  }

  async createUser(user: CreateUserRequest): Promise<AxiosResponse<User>> {
    const res = await this.client.post<User>('/api/users', user);
    return res;
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<AxiosResponse<User>> {
    const res = await this.client.put<User>(`/api/users/${id}`, data);
    return res;
  }

  async deleteUser(id: number): Promise<AxiosResponse<void>> {
    const res = await this.client.delete<void>(`/api/users/${id}`);
    return res;
  }

  // Products
  async getProducts(page = 1, limit = 10): Promise<AxiosResponse<PaginatedResponse<Product>>> {
    const res = await this.client.get<PaginatedResponse<Product>>('/api/products', { params: { page, limit } });
    return res;
  }

  async createProduct(product: CreateProductBody): Promise<AxiosResponse<Product>> {
    const res = await this.client.post<Product>('/api/products', product);
    return res;
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<AxiosResponse<Product>> {
    const res = await this.client.put<Product>(`/api/products/${id}`, data);
    return res;
  }

  async deleteProduct(id: string): Promise<AxiosResponse<void>> {
    const res = await this.client.delete<void>(`/api/products/${id}`);
    return res;
  }

  async getProductByBarCode(barCode: string, page = 1, limit = 10): Promise<AxiosResponse<PaginatedResponse<Product>>> {
    const res = await this.client.get<PaginatedResponse<Product>>(`/api/products/code/${barCode}`, { params: { page, limit } });
    return res;
  }

  // Sales
  async getSales(params: GetSalesParams = {}): Promise<AxiosResponse<PaginatedResponse<SaleWithDetails>>> {
    const res = await this.client.get<PaginatedResponse<SaleWithDetails>>('/api/sales', { params });
    return res;
  }

  async createSale(): Promise<AxiosResponse<Sale>> {
    const res = await this.client.post<Sale>('/api/sales');
    return res;
  }

  async getSaleById(id: string): Promise<AxiosResponse<SaleWithDetails>> {
    const res = await this.client.get<SaleWithDetails>(`/api/sales/${id}`);
    return res;
  }

  async updateSale(id: string, data: UpdateSaleRequest): Promise<AxiosResponse<Sale>> {
    const res = await this.client.put<Sale>(`/api/sales/${id}`, data);
    return res;
  }

  // Sale Items
  async addSaleItem(saleId: string, item: CreateSaleItemRequest): Promise<AxiosResponse<SaleItem>> {
    const res = await this.client.post<SaleItem>(`/api/sales/${saleId}/items`, item);
    return res;
  }

  async updateSaleItem(saleId: string, itemId: string, data: UpdateSaleItemRequest): Promise<AxiosResponse<SaleItem>> {
    const res = await this.client.put<SaleItem>(`/api/sales/${saleId}/items/${itemId}`, data);
    return res;
  }

  async deleteSaleItem(saleId: string, itemId: string): Promise<AxiosResponse<void>> {
    const res = await this.client.delete<void>(`/api/sales/${saleId}/items/${itemId}`);
    return res;
  }
}