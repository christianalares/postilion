'use client'

import { type ErrorBoundaryProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

export const ErrorBoundary = ({ children, ...props }: ErrorBoundaryProps) => {
  return <ReactErrorBoundary {...props}>{children}</ReactErrorBoundary>
}
