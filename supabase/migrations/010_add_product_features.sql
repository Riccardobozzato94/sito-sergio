-- Add dietary and ingredients fields to products table
-- Prerequisite: Run this migration to support dietary filter and ingredient display

ALTER TABLE products
ADD COLUMN IF NOT EXISTS dietary TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ingredients TEXT DEFAULT '';

-- Update existing products with sensible defaults
UPDATE products SET dietary = '{}' WHERE dietary IS NULL;
UPDATE products SET ingredients = '' WHERE ingredients IS NULL;
