CREATE INDEX "product_barCode_active_idx" ON "product" USING btree ("barCode","active");--> statement-breakpoint
CREATE INDEX "saleProduct_saleId_productId_idx" ON "saleProduct" USING btree ("saleId","productId");--> statement-breakpoint
CREATE INDEX "saleProduct_saleId_idx" ON "saleProduct" USING btree ("saleId");--> statement-breakpoint
CREATE INDEX "sale_status_idx" ON "sale" USING btree ("status");