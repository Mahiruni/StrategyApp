import { Skeleton } from "@/components/ui/primitives";

export default function Loading() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-4 lg:grid-cols-3">
      <Skeleton className="h-[370px] lg:col-span-2" />
      <Skeleton className="h-[370px]" />
      <Skeleton className="h-28 lg:col-span-3" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  );
}
