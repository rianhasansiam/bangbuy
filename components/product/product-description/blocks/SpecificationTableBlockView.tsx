import type { SpecificationTableBlock } from "@/lib/types/product-description-blocks";

export default function SpecificationTableBlockView({
  block,
}: {
  block: SpecificationTableBlock;
}) {
  const visibleRows = block.rows.filter(
    (row) => row.label.trim() && row.value.trim(),
  );
  if (visibleRows.length === 0) return null;

  return (
    <section
      aria-labelledby={
        block.heading?.trim() ? `st-${block.id}` : undefined
      }
    >
      {block.heading?.trim() && (
        <h2
          id={`st-${block.id}`}
          className="mb-4 text-xl font-bold text-gray-900"
        >
          {block.heading}
        </h2>
      )}
      <div className="overflow-x-auto rounded-2xl border border-brand-border">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            {block.heading?.trim() ?? "Specification table"}
          </caption>
          <tbody className="divide-y divide-gray-100">
            {visibleRows.map((row) => (
              <tr key={row.id} className="even:bg-brand-light-bg">
                <th
                  scope="row"
                  className="w-2/5 px-5 py-3 align-top font-semibold text-gray-900"
                >
                  {row.label}
                </th>
                <td className="px-5 py-3 text-gray-600">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
