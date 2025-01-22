import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Profile Section Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-[140px]" />
            <Skeleton className="h-6 w-[80px]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[40px]" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-[160px]" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Skeleton className="h-9 w-[100px]" />
            <Skeleton className="h-9 w-[100px]" />
          </div>
        </CardContent>
      </Card>

      {/* Requests Section Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-[160px]" />
            <Skeleton className="h-9 w-[120px]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="mx-auto size-8" />
                <Skeleton className="mx-auto mt-2 h-4 w-16" />
              </div>
            ))}
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-[140px]" />
              </div>
              <Skeleton className="h-8 w-[80px]" />
            </div>
            <Skeleton className="mt-2 h-4 w-[200px]" />
          </div>
        </CardContent>
      </Card>

      {/* Procedures Section Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[140px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="mx-auto size-8" />
                <Skeleton className="mx-auto mt-2 h-4 w-16" />
              </div>
            ))}
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="size-8" />
            </div>
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1 h-3 w-[140px]" />
          </div>
        </CardContent>
      </Card>

      {/* Appointments Section Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-[120px]" />
            <Skeleton className="h-9 w-[120px]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-[140px]" />
              <Skeleton className="h-5 w-[80px]" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-[180px]" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-[140px]" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="h-8 w-[100px]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="mx-auto size-8" />
                <Skeleton className="mx-auto mt-2 h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents Section Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-[140px]" />
            <Skeleton className="h-9 w-[100px]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border p-2 text-center">
                <Skeleton className="mx-auto size-4" />
                <Skeleton className="mx-auto mt-1 h-6 w-8" />
                <Skeleton className="mx-auto mt-1 h-3 w-16" />
              </div>
            ))}
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-[140px]" />
              <Skeleton className="h-8 w-[80px]" />
            </div>
            <div className="mt-2 space-y-1">
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-3 w-[140px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}