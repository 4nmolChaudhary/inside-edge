import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addTeam, getTeams, updateTeam } from '@/db/queries/teams'

const TEAMS_KEY = ['teams']

export const useTeams = () => {
  return useQuery({ queryKey: TEAMS_KEY, queryFn: getTeams })
}

export const useAddTeam = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { name: string; image: number }) => addTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY })
      onSuccess?.()
    },
  })
}

export const useUpdateTeam = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; logo: number } }) => updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY })
      onSuccess?.()
    },
  })
}
