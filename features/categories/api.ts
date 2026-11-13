export type PublicCategoryNode = {
  id: string;
  name: string;
  slug: string;
  path: string;
  description: string | null;
  image: string | null;
  depth: number;
  position: number;
  childCount: number;
  directProductCount: number;
  totalProductCount: number;
  children: PublicCategoryNode[];
};

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function string(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function number(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parsePublicCategoryNode(value: unknown): PublicCategoryNode {
  const row = record(value) ?? {};
  const directProductCount = number(row.directProductCount ?? row.productCount);
  return {
    id: string(row.id),
    name: string(row.name),
    slug: string(row.slug),
    path: string(row.path) || string(row.slug),
    description: typeof row.description === "string" ? row.description : null,
    image: typeof row.image === "string" ? row.image : null,
    depth: number(row.depth),
    position: number(row.position),
    childCount: number(row.childCount),
    directProductCount,
    totalProductCount: number(row.totalProductCount ?? directProductCount),
    children: Array.isArray(row.children)
      ? row.children.map(parsePublicCategoryNode)
      : [],
  };
}

export function categoryHref(category: Pick<PublicCategoryNode, "path">): string {
  return `/categories/${category.path}`;
}
