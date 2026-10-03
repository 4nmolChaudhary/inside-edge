import { useMutation } from '@tanstack/react-query'

import { abandonMatch, completeMatch, endInnings, recordBall, startSuperOver, undoLastBall } from '@/db/queries/scoring'
import { toast } from '@/components/ui/toast'
import type { MatchSnapshot, ScoringActionResult } from '@/lib/scoring'

type ScoringHandlers = {
  // called with the fresh match state on success and on a concurrency conflict, so the scorer re-renders from the server's truth
  onSnapshot: (snapshot: MatchSnapshot) => void
  onSettled?: (ok: boolean) => void
}

// Ball-level actions stay quiet (the scorer shows a saving/saved status); only failures raise a toast.
const useScoringMutation = <Input>(action: (input: Input) => Promise<ScoringActionResult>, { onSnapshot, onSettled }: ScoringHandlers) =>
  useMutation({
    mutationFn: action,
    onSuccess: result => {
      if (result.snapshot) onSnapshot(result.snapshot)
      if (result.error) toast.add({ type: 'error', title: result.error, timeout: 5000, priority: 'high' })
      onSettled?.(!result.error)
    },
    onError: () => {
      toast.add({ type: 'error', title: 'Could not reach the server', timeout: 5000, priority: 'high' })
      onSettled?.(false)
    },
  })

export const useRecordBall = (handlers: ScoringHandlers) => useScoringMutation(recordBall, handlers)
export const useUndoBall = (handlers: ScoringHandlers) => useScoringMutation(undoLastBall, handlers)
export const useEndInnings = (handlers: ScoringHandlers) => useScoringMutation(endInnings, handlers)
export const useStartSuperOver = (handlers: ScoringHandlers) => useScoringMutation(startSuperOver, handlers)
export const useCompleteMatch = (handlers: ScoringHandlers) => useScoringMutation(completeMatch, handlers)
export const useAbandonMatch = (handlers: ScoringHandlers) => useScoringMutation(abandonMatch, handlers)
