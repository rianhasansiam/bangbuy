import "server-only";

import type { Prisma } from "@/app/generated/prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

import {
  cleanOptionalText,
  slugifyCatalogName,
} from "@/lib/catalog/catalog-entity";
import { prisma } from "@/lib/db/prisma";
import { ServiceError } from "@/lib/services/service-error";
import type {
  BrandQueryInput,
  CreateBrandInput,
  UpdateBrandInput,
} from "@/lib/validations/brand.validation";

const brandSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logo: true,
  website: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { products: true } },
} satisfies Prisma.BrandSelect;

type BrandRow = Prisma.BrandGetPayload<{ select: typeof brandSelect }>;

export type SerializedBrand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  status: "ACTIVE" | "INACTIVE";
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

function serializeBrand(row: BrandRow): SerializedBrand {
  const { _count, ...brand } = row;
  return {
    ...brand,
    productCount: _count.products,
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString(),
  };
}

function buildWhere(query: BrandQueryInput): Prisma.BrandWhereInput {
  const where: Prisma.BrandWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { slug: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { website: { contains: query.search, mode: "insensitive" } },
    ];
  }
  return where;
}

function buildOrderBy(
  sort: BrandQueryInput["sort"],
): Prisma.BrandOrderByWithRelationInput[] {
  switch (sort) {
    case "latest":
      return [{ createdAt: "desc" }, { name: "asc" }];
    case "oldest":
      return [{ createdAt: "asc" }, { name: "asc" }];
    case "name":
    default:
      return [{ name: "asc" }, { createdAt: "asc" }];
  }
}

export async function listBrands(query: BrandQueryInput) {
  const where = buildWhere(query);
  const skip = (query.page - 1) * query.pageSize;
  const [rows, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip,
      take: query.pageSize,
      select: brandSelect,
    }),
    prisma.brand.count({ where }),
  ]);

  return {
    items: rows.map(serializeBrand),
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

export async function getBrandById(
  id: string,
): Promise<SerializedBrand | null> {
  const row = await prisma.brand.findUnique({
    where: { id },
    select: brandSelect,
  });
  return row ? serializeBrand(row) : null;
}

async function assertUniqueBrandName(name: string, excludeId?: string) {
  const conflict = await prisma.brand.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (conflict) {
    throw new ServiceError(409, "A brand with that name already exists.");
  }
}

async function generateUniqueBrandSlug(name: string): Promise<string> {
  const root = slugifyCatalogName(name, "brand");
  let candidate = root;

  for (let suffix = 2; suffix <= 51; suffix += 1) {
    const conflict = await prisma.brand.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!conflict) return candidate;
    candidate = `${root}-${suffix}`;
  }

  return `${root}-${Date.now()}`;
}

function mapBrandWriteError(error: unknown): never {
  if (error instanceof ServiceError) throw error;
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw new ServiceError(404, "Brand not found.");
    }
    if (error.code === "P2002") {
      throw new ServiceError(409, "A brand with that name already exists.");
    }
  }
  throw error;
}

export async function createBrand(input: CreateBrandInput) {
  await assertUniqueBrandName(input.name);
  const slug = await generateUniqueBrandSlug(input.name);

  try {
    const row = await prisma.brand.create({
      data: {
        name: input.name,
        slug,
        description: cleanOptionalText(input.description) ?? null,
        logo: cleanOptionalText(input.logo) ?? null,
        website: cleanOptionalText(input.website) ?? null,
        status: input.status,
      },
      select: brandSelect,
    });
    return serializeBrand(row);
  } catch (error) {
    return mapBrandWriteError(error);
  }
}

export async function updateBrand(id: string, input: UpdateBrandInput) {
  if (input.name !== undefined) {
    await assertUniqueBrandName(input.name, id);
  }

  const data: Prisma.BrandUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) {
    data.description = cleanOptionalText(input.description);
  }
  if (input.logo !== undefined) data.logo = cleanOptionalText(input.logo);
  if (input.website !== undefined) {
    data.website = cleanOptionalText(input.website);
  }
  if (input.status !== undefined) data.status = input.status;

  try {
    const row = await prisma.brand.update({
      where: { id },
      data,
      select: brandSelect,
    });
    return serializeBrand(row);
  } catch (error) {
    return mapBrandWriteError(error);
  }
}

export async function deleteBrand(id: string): Promise<{ id: string }> {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.brand.findUnique({
        where: { id },
        select: { id: true, _count: { select: { products: true } } },
      });
      if (!existing) throw new ServiceError(404, "Brand not found.");
      if (existing._count.products > 0) {
        throw new ServiceError(
          409,
          `Cannot delete this brand while ${existing._count.products} product${existing._count.products === 1 ? "" : "s"} reference it.`,
          { productCount: existing._count.products },
        );
      }

      await tx.brand.delete({ where: { id } });
      return { id };
    });
  } catch (error) {
    return mapBrandWriteError(error);
  }
}

