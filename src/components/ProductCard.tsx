import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Product } from '@/types';
import { format } from 'date-fns'; // For formatting timestamp if needed

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A';
  
  let displayDate = "Date not available";
  if (product.createdAt && 'seconds' in product.createdAt) {
    try {
      displayDate = format(new Date(product.createdAt.seconds * 1000), 'PP'); // e.g. Sep 28, 2023
    } catch (e) {
      // If date is invalid for some reason
      console.warn("Failed to format product date:", e);
    }
  }


  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="p-0">
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={product.imageUrl || "https://placehold.co/600x400.png"}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="product package"
          />
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
