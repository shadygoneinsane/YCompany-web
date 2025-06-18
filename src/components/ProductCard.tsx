"use client";

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Product } from '@/types';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { deleteProductAction } from '@/actions/productActions';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import LoadingSpinner from './ui/loading-spinner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const displayPrice = typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A';

  let displayDate = "Date not available";
  if (product.createdAt && 'seconds' in product.createdAt) {
    try {
      displayDate = format(new Date(product.createdAt.seconds * 1000), 'PP');
    } catch (e) {
      console.warn("Failed to format product date:", e);
    }
  }

  useEffect(() => {
    // Reset error state if product.imageUrl changes (e.g., if the component is re-used with new props)
    setImageLoadError(false);
  }, [product.imageUrl]);

  const handleImageError = () => {
    console.warn(`Failed to load image for product "${product.name}": ${product.imageUrl}`);
    setImageLoadError(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProductAction(product.id);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the product.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const placeholderImageUrl = "https://placehold.co/600x400.png";
  const currentSrc = imageLoadError || !product.imageUrl ? placeholderImageUrl : product.imageUrl;
  const currentAlt = imageLoadError || !product.imageUrl ? "Placeholder image" : product.name;
  const dataAiHintValue = imageLoadError || !product.imageUrl ? "placeholder" : "product package";

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out group">
      <CardHeader className="p-0 relative">
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            key={currentSrc} // Add key to help React differentiate if src changes to fallback
            src={currentSrc}
            alt={currentAlt}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
            data-ai-hint={dataAiHintValue}
            priority={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        {/* Delete button overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 w-8 p-0 rounded-full shadow-lg"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <LoadingSpinner size={16} />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? <LoadingSpinner size={16} /> : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="font-headline text-xl mb-2 truncate" title={product.name}>{product.name}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm mb-4 line-clamp-3" title={product.description}>
          {product.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center border-t mt-auto">
        <p className="text-lg font-semibold text-primary">${displayPrice}</p>
        <p className="text-xs text-muted-foreground">Added: {displayDate}</p>
      </CardFooter>
    </Card>
  );
}
