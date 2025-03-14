import { useParams } from 'next/navigation'

export const useTeamSlug = () => {
  const params = useParams<{ teamSlug: string }>()

  return params.teamSlug
}
