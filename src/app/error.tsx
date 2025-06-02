
'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error Boundary Caught:", error);
  }, [error]);

  const isImageConfigError = error.message.includes('hostname') && error.message.includes('is not configured under images in your `next.config.js`');

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-8">
      <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
      <h1 className="text-3xl font-bold text-destructive mb-4">Oops! Something went wrong.</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        {isImageConfigError
          ? "We encountered an issue loading an image. This might be a configuration problem."
          : "An unexpected error occurred. We're sorry for the inconvenience."}
      </p>
      {isImageConfigError && (
         <p className="text-sm text-muted-foreground mb-8">
           Please ensure the image domain is correctly configured if you are the site administrator.
         </p>
      )}
       <div className="bg-card border border-destructive/20 p-4 rounded-md shadow-sm mb-8 max-w-xl w-full">
        <p className="text-sm text-destructive-foreground font-mono break-all">
          Error: {error.message}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono mt-2">
            Digest: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-4">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          size="lg"
        >
          Try again
        </Button>
        <Button
          onClick={() => router.push('/')} // Navigate to the main products page
          variant="outline"
          size="lg"
        >
          Go to Homepage
        </Button>
      </div>
    </div>
  )
}
