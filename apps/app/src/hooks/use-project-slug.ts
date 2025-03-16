import { useParams } from 'next/navigation'

export const useProjectSlug = () => {
  const params = useParams<{ projectSlug: string }>()

  return params.projectSlug
}
