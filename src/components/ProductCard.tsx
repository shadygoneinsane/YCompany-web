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
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteProductAction } from "@/actions/productActions";
import { fixImageUrl, getPlaceholderImageUrl, isValidImageUrl } from "@/lib/imageUtils";

const PLACEHOLDER_IMAGE_URL = getPlaceholderImageUrl();
const IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

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
function formatProductDate(createdAt: any): string {
  if (!createdAt || !('seconds' in createdAt)) {
    return "Date not available";
  }

  try {
    return format(new Date(createdAt.seconds * 1000), 'PP');
  } catch (e) {
    console.warn("Failed to format product date:", e);
    return "Date not available";
  }
}

function formatPrice(price: unknown): string {
  return typeof price === 'number' ? price.toFixed(2) : 'N/A';
}

function getImageProps(imageUrl: string | undefined, productName: string, hasError: boolean) {
  const shouldUsePlaceholder = hasError || !imageUrl || !isValidImageUrl(imageUrl);
  const fixedUrl = imageUrl ? fixImageUrl(imageUrl) : undefined;

  return {
    src: shouldUsePlaceholder ? PLACEHOLDER_IMAGE_URL : fixedUrl!,
    alt: shouldUsePlaceholder ? "Placeholder image" : productName,
    hint: shouldUsePlaceholder ? "placeholder" : "product package",
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const displayPrice = formatPrice(product.price);
  const displayDate = formatProductDate(product.createdAt);
  const imageProps = getImageProps(product.imageUrl, product.name, imageLoadError);

  useEffect(() => {
    setImageLoadError(false);
  }, [product.imageUrl]);

  const handleImageError = () => setImageLoadError(true);

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

  const handleDeleteConfirm = async () => {
    const result = await deleteProductAction(product.id);

    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out group">
      <CardHeader className="p-0 relative">
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            key={imageProps.src}
            src={imageProps.src}
            alt={imageProps.alt}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
            data-ai-hint={imageProps.hint}
            priority={false}
            sizes={IMAGE_SIZES}
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
      <CardFooter className="px-6 py-3 flex justify-between items-center border-t mt-auto">
        <p className="text-lg font-semibold text-primary">${displayPrice}</p>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-muted-foreground">Added: {displayDate}</p>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 w-8 h-8">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Product</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product "{product.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
