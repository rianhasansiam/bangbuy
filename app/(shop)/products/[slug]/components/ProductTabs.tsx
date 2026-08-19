import { FileText, ListChecks } from "lucide-react";

type SpecificationValue = string | number | boolean;

function displaySpecificationValue(value: SpecificationValue): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  return value;
}

const ProductTabs = ({
  description,
  specifications,
}: {
  description: string | null;
  specifications: Record<string, SpecificationValue> | null;
}) => {
  const specificationEntries = Object.entries(specifications ?? {});

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-brand-border bg-white">
      {description?.trim() && (
        <section aria-labelledby="product-description-heading">
          <div className="flex items-center gap-2 border-b border-brand-border bg-brand-light-bg px-5 py-4 text-sm font-semibold text-brand-red">
            <FileText className="h-4 w-4" aria-hidden="true" />
            <h2
              id="product-description-heading"
              className="min-w-0 [overflow-wrap:anywhere]"
            >
              Description
            </h2>
          </div>
          <div className="p-5 sm:p-6">
            <p className="whitespace-pre-line leading-relaxed text-gray-600 [overflow-wrap:anywhere]">
              {description}
            </p>
          </div>
        </section>
      )}

      {specificationEntries.length > 0 && (
        <section
          aria-labelledby="product-specifications-heading"
          className={description?.trim() ? "border-t border-brand-border" : undefined}
        >
          <div className="flex items-center gap-2 border-b border-brand-border bg-brand-light-bg px-5 py-4 text-sm font-semibold text-brand-red">
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            <h2
              id="product-specifications-heading"
              className="min-w-0 [overflow-wrap:anywhere]"
            >
              Technical specifications
            </h2>
          </div>
          <div className="max-w-full overflow-x-auto p-5 sm:p-6">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                Technical specifications for this product
              </caption>
              <tbody className="divide-y divide-gray-100">
                {specificationEntries.map(([label, value]) => (
                  <tr key={label}>
                    <th
                      scope="row"
                      className="w-2/5 py-3 pr-4 align-top font-semibold text-gray-900 [overflow-wrap:anywhere]"
                    >
                      {label}
                    </th>
                    <td className="py-3 text-gray-600 [overflow-wrap:anywhere]">
                      {displaySpecificationValue(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductTabs;
