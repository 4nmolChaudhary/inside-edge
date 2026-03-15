import { useMutation } from '@tanstack/react-query'

import { updateUser } from '@/db/queries/users'

import { UpdateUserInput } from '@/types/user'

export const useUpdateUser = (props: { onSuccess?: () => void; onError?: () => void }) => {
  return useMutation({
    mutationFn: ({ id, updates }: UpdateUserInput) => updateUser(id, updates),
    ...props,
  })
}
