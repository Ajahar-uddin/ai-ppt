import { Button } from '#/components/ui/button'
import { PresentationListSection } from '#/features/presentation/components/presentaion-list-section'
import { usePresentationListHook } from '#/features/presentation/hooks/use-presentation-hook'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

export const Route = createFileRoute('/_presentation/presentations')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: presentationList, isPending: isPresentationListPending } =
    usePresentationListHook()
  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              render={
                <Link to="/">
                  <ArrowLeftIcon className="size-4" />
                  Home
                </Link>
              }
              variant="ghost"
              size="sm"
              className="rounded-xl gap-1"
            />
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <PresentationListSection
            presentations={presentationList!}
            isPending={isPresentationListPending}
          />
        </div>
      </div>
    </main>
  )
}
