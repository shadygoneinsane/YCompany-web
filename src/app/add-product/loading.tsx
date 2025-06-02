
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function AddProductLoading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-xl">
        <LoadingSpinner size={48} />
        <p className="text-lg text-muted-foreground">Loading Product Form...</p>
      </div>
    </div>
  );
}
