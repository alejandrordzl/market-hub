-- Add performance indexes for the sales endpoint

-- Index for saleProducts queries (saleId + productId combination)
CREATE INDEX "saleProduct_saleId_productId_idx" ON "saleProduct" USING btree ("saleId", "productId");

-- Index for saleProducts saleId lookups
CREATE INDEX "saleProduct_saleId_idx" ON "saleProduct" USING btree ("saleId");

-- Index for sales status queries
CREATE INDEX "sale_status_idx" ON "sale" USING btree ("status");

-- Composite index for products barCode and active status
CREATE INDEX "product_barCode_active_idx" ON "product" USING btree ("barCode", "active");