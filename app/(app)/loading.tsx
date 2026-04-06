import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-8 p-1">
      <Card className="space-y-4 bg-slate-950 text-white">
        <Skeleton className="h-6 w-40 bg-white/15" />
        <Skeleton className="h-12 w-3/4 bg-white/15" />
        <div className="grid gap-4 sm:grid-cols-4">
          <Skeleton className="h-28 bg-white/10" />
          <Skeleton className="h-28 bg-white/10" />
          <Skeleton className="h-28 bg-white/10" />
          <Skeleton className="h-28 bg-white/10" />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </Card>
        <Card className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    </div>
  );
}
