import { Prisma, type Product, type StockMovementType } from "@prisma/client";
import { AppError } from "@/server/errors/app-error";
import { recordAudit } from "@/server/audit/audit-log";
import { createProductRepository, type ProductRepository, type ProductWithMovements } from "../repositories/product.repository";
import type { CreateProductOutput, ProductQueryInput, StockAdjustmentOutput, UpdateProductOutput } from "../validators/product.schema";
import { nextTenantCode } from "@/server/codes/auto-code";

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductService {
  list(tenantId: string, query: ProductQueryInput): Promise<PaginatedProducts>;
  getById(id: string, tenantId: string): Promise<ProductWithMovements>;
  create(tenantId: string, input: CreateProductOutput, userId?: string): Promise<Product>;
  update(id: string, tenantId: string, input: UpdateProductOutput, userId?: string): Promise<Product>;
  softDelete(id: string, tenantId: string, userId?: string): Promise<Product>;
  adjustStock(id: string, tenantId: string, input: StockAdjustmentOutput, userId?: string): Promise<Product>;
}

function buildSortOrder(sort: ProductQueryInput["sort"], order: ProductQueryInput["order"]): Prisma.ProductOrderByWithRelationInput {
  const fieldMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
    code: { code: order },
    name: { name: order },
    salePrice: { salePrice: order },
    stockQuantity: { stockQuantity: order },
    createdAt: { createdAt: order },
  };
  return fieldMap[sort] ?? { createdAt: "desc" };
}

export function createProductService(repository: ProductRepository = createProductRepository()): ProductService {
  return {
    async list(tenantId, { page, pageSize, search, category, isActive, lowStock, sort, order }) {
      const where: Prisma.ProductWhereInput = { tenantId, deletedAt: null };
      if (isActive !== undefined) where.isActive = isActive;
      if (category) where.category = category;
      if (lowStock) where.id = { in: await repository.findLowStockIds(tenantId) };
      if (search) {
        where.OR = [
          { code: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ];
      }

      const skip = (page - 1) * pageSize;
      const [data, total] = await Promise.all([
        repository.findMany({ where, orderBy: buildSortOrder(sort, order), skip, take: pageSize }),
        repository.count(where),
      ]);
      return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    },

    async getById(id, tenantId) {
      const product = await repository.findById(id, tenantId);
      if (!product) throw new AppError("Ürün bulunamadı", 404, "PRODUCT_NOT_FOUND");
      return product;
    },

    async create(tenantId, input, userId) {
      const code = input.code || await nextTenantCode("URN", await repository.count({ tenantId }), (candidate) => repository.findByCode(candidate, tenantId).then(Boolean));
      if (await repository.findByCode(code, tenantId)) {
        throw new AppError("Bu ürün kodu zaten kullanılıyor", 409, "PRODUCT_CODE_EXISTS");
      }
      const product = await repository.create({
        code,
        name: input.name,
        category: input.category || null,
        unit: input.unit,
        description: input.description || null,
        salePrice: input.salePrice,
        purchasePrice: input.purchasePrice,
        stockQuantity: input.stockQuantity,
        minStockLevel: input.minStockLevel,
        hasDeposit: input.hasDeposit,
        depositAmount: input.depositAmount,
        tenant: { connect: { id: tenantId } },
        createdBy: userId ?? null,
        updatedBy: userId ?? null,
        stockMovements: input.stockQuantity > 0 ? { create: { tenantId, type: "INITIAL", quantity: input.stockQuantity, balanceAfter: input.stockQuantity, notes: "İlk stok" } } : undefined,
      });
      await recordAudit({ tenantId, actorId: userId, action: "CREATE", entityType: "Product", entityId: product.id });
      return product;
    },

    async update(id, tenantId, input, userId) {
      const existingProduct = await repository.findById(id, tenantId);
      if (!existingProduct) throw new AppError("Ürün bulunamadı", 404, "PRODUCT_NOT_FOUND");
      if (input.code && input.code !== existingProduct.code && (await repository.findByCode(input.code, tenantId))) {
        throw new AppError("Bu ürün kodu zaten kullanılıyor", 409, "PRODUCT_CODE_EXISTS");
      }
      const data: Prisma.ProductUpdateInput = {
        ...(input.code !== undefined && { code: input.code }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.category !== undefined && { category: input.category || null }),
        ...(input.unit !== undefined && { unit: input.unit }),
        ...(input.description !== undefined && { description: input.description || null }),
        ...(input.salePrice !== undefined && { salePrice: input.salePrice }),
        ...(input.purchasePrice !== undefined && { purchasePrice: input.purchasePrice }),
        ...(input.minStockLevel !== undefined && { minStockLevel: input.minStockLevel }),
        ...(input.hasDeposit !== undefined && { hasDeposit: input.hasDeposit }),
        ...(input.depositAmount !== undefined && { depositAmount: input.depositAmount }),
        updatedBy: userId ?? null,
      };
      const product = await repository.update(id, tenantId, data);
      await recordAudit({ tenantId, actorId: userId, action: "UPDATE", entityType: "Product", entityId: id });
      return product;
    },

    async softDelete(id, tenantId, userId) {
      const product = await repository.findById(id, tenantId);
      if (!product) throw new AppError("Ürün bulunamadı", 404, "PRODUCT_NOT_FOUND");
      const deleted = await repository.softDelete(id, tenantId);
      await recordAudit({ tenantId, actorId: userId, action: "DELETE", entityType: "Product", entityId: id });
      return deleted;
    },

    async adjustStock(id, tenantId, input, userId) {
      try {
        const product = await repository.adjustStock({ id, tenantId, type: input.type as StockMovementType, quantity: input.quantity, notes: input.notes, userId });
        await recordAudit({ tenantId, actorId: userId, action: "STOCK_ADJUSTMENT", entityType: "Product", entityId: id, metadata: { type: input.type, quantity: input.quantity } });
        return product;
      } catch (error) {
        if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") throw new AppError("Ürün bulunamadı", 404, "PRODUCT_NOT_FOUND");
        if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") throw new AppError("Yeterli stok bulunmuyor", 400, "INSUFFICIENT_STOCK");
        throw error;
      }
    },
  };
}
