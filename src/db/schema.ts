import {
  pgTable,
  serial,
  varchar,
  uuid,
  real,
  timestamp,
  integer,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('Role', ['SUPER_ADMIN', 'ADMIN', 'USER']);
export const statusEnum = pgEnum('Status', ['ACTIVE', 'INACTIVE']);
export const paymentMethodEnum = pgEnum('PaymentMethod', ['CASH', 'CREDIT_CARD']);
export const saleStatusEnum = pgEnum('SaleStatus', ['PENDING', 'CONCLUDED', 'CANCELLED']);

// Tables
export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  role: roleEnum('role').default('USER'),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
  active: statusEnum('active').default('ACTIVE'),
});

export const products = pgTable('product', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  barCode: varchar('barCode', { length: 100 }).notNull(),
  price: real('price').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
  active: statusEnum('active').default('ACTIVE').notNull(),
  createdBy: integer('createdBy').notNull(),
  updatedBy: integer('updatedBy').notNull(),
}, (table) => ({
  barCodeIdx: index('product_barCode_idx').on(table.barCode),
  barCodeActiveIdx: index('product_barCode_active_idx').on(table.barCode, table.active),
}));

export const sales = pgTable('sale', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: integer('sellerId').notNull(),
  paymentMethod: paymentMethodEnum('paymentMethod').notNull(),
  total: real('total').notNull(),
  amountReceived: real('amountReceived').notNull(),
  change: real('change').notNull(),
  saleDate: timestamp('saleDate', { withTimezone: true }).defaultNow().notNull(),
  status: saleStatusEnum('status').default('PENDING').notNull(),
}, (table) => ({
  statusIdx: index('sale_status_idx').on(table.status),
}));

export const saleProducts = pgTable('saleProduct', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleId: uuid('saleId').notNull(),
  productId: uuid('productId').notNull(),
  quantity: integer('quantity').notNull(),
}, (table) => ({
  saleIdProductIdIdx: index('saleProduct_saleId_productId_idx').on(table.saleId, table.productId),
  saleIdIdx: index('saleProduct_saleId_idx').on(table.saleId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdProducts: many(products, { relationName: 'createdByUser' }),
  updatedProducts: many(products, { relationName: 'updatedByUser' }),
  sales: many(sales),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [products.createdBy],
    references: [users.id],
    relationName: 'createdByUser',
  }),
  updatedByUser: one(users, {
    fields: [products.updatedBy],
    references: [users.id],
    relationName: 'updatedByUser',
  }),
  saleProducts: many(saleProducts),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  seller: one(users, {
    fields: [sales.sellerId],
    references: [users.id],
  }),
  saleProducts: many(saleProducts),
}));

export const saleProductsRelations = relations(saleProducts, ({ one }) => ({
  product: one(products, {
    fields: [saleProducts.productId],
    references: [products.id],
  }),
  sale: one(sales, {
    fields: [saleProducts.saleId],
    references: [sales.id],
  }),
}));

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;

export type SaleProduct = typeof saleProducts.$inferSelect;
export type NewSaleProduct = typeof saleProducts.$inferInsert;

// Enum types for use in the application
export type Role = typeof roleEnum.enumValues[number];
export type Status = typeof statusEnum.enumValues[number];
export type PaymentMethod = typeof paymentMethodEnum.enumValues[number];
export type SaleStatus = typeof saleStatusEnum.enumValues[number];