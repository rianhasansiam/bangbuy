export type VariantSelectionCandidate = {
  id: string;
  isActive: boolean;
};

/** Only one active variant is safe to preselect without customer input. */
export function initialVariantSelectionId(
  variants: readonly VariantSelectionCandidate[],
): string | null {
  const active = variants.filter((variant) => variant.isActive);
  return active.length === 1 ? active[0].id : null;
}
