import { useMutation } from '@tanstack/react-query'
import { createMatch, updateMatchSquads, updateMatchToss } from '@/db/queries/matches'
import { toast } from '@/components/ui/toast'

export const useCreateMatch = ({ onSuccess }: { onSuccess?: (match: NonNullable<Awaited<ReturnType<typeof createMatch>>['match']>) => void } = {}) => {
  return useMutation({
    mutationFn: async (input: Parameters<typeof createMatch>[0]) => {
      const result = await createMatch(input)
      if (result.error || !result.match) throw new Error(result.error ?? 'Could not create match')
      return result.match
    },
    onMutate: () => toast.add({ type: 'loading', title: 'Creating match...', timeout: 0 }),
    onSuccess: (match, _input, toastId) => {
      if (toastId) toast.update(toastId, { type: 'success', title: 'Match created', timeout: 3000 })
      onSuccess?.(match)
    },
    onError: (error, _input, toastId) => {
      if (toastId) toast.update(toastId, { type: 'error', title: error.message, timeout: 5000, priority: 'high' })
    },
  })
}

export const useUpdateMatchSquads = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  return useMutation({
    mutationFn: async (input: Parameters<typeof updateMatchSquads>[0]) => {
      const result = await updateMatchSquads(input)
      if (result.error || !result.match) throw new Error(result.error ?? 'Could not update squads')
      return result.match
    },
    onMutate: () => toast.add({ type: 'loading', title: 'Saving squads...', timeout: 0 }),
    onSuccess: (_match, _input, toastId) => {
      if (toastId) toast.update(toastId, { type: 'success', title: 'Squads saved', timeout: 3000 })
      onSuccess?.()
    },
    onError: (error, _input, toastId) => {
      if (toastId) toast.update(toastId, { type: 'error', title: error.message, timeout: 5000, priority: 'high' })
    },
  })
}

export const useUpdateMatchToss = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  return useMutation({
    mutationFn: async (input: Parameters<typeof updateMatchToss>[0]) => {
      const result = await updateMatchToss(input)
      if (result.error || !result.match) throw new Error(result.error ?? 'Could not start match')
      return result.match
    },
    onMutate: () => toast.add({ type: 'loading', title: 'Starting match...', timeout: 0 }),
    onSuccess: (_match, _input, toastId) => {
      if (toastId) toast.update(toastId, { type: 'success', title: 'Match started', timeout: 3000 })
      onSuccess?.()
    },
    onError: (error, _input, toastId) => {
      if (toastId) toast.update(toastId, { type: 'error', title: error.message, timeout: 5000, priority: 'high' })
    },
  })
}
