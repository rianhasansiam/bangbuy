import { AdminTablePageSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <AdminTablePageSkeleton
      title="Loading transaction history"
      columns={6}
    />
  );
}
