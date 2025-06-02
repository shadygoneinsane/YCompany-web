import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product as ProductType } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, PackageSearch } from "lucide-react";

async function getProducts(): Promise<ProductType[]> {
  try {
    const productsCol = collection(db, "products");
    const q = query(productsCol, orderBy("createdAt", "desc"));
    const productSnapshot = await getDocs(q);
    
    const productList = productSnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure createdAt is correctly structured if it's a Firestore Timestamp
      let createdAt = data.createdAt;
      if (createdAt instanceof Timestamp) {
         // This is fine for server components. If passed to client, convert to serializable.
         // For ProductCard (server component), Timestamp object is fine.
      } else if (typeof createdAt === 'object' && createdAt !== null && 'seconds' in createdAt && 'nanoseconds' in createdAt) {
        // Already in a serializable-like format, but it's better to keep it as Timestamp if possible on server
      } else {
        // Fallback or error handling if createdAt is not in expected format
        createdAt = Timestamp.now(); // Or some default
      }

      return {
        id: doc.id,
        name: data.name || "Unnamed Product",
        description: data.description || "No description available.",
        price: typeof data.price === 'number' ? data.price : 0,
        imageUrl: data.imageUrl || "",
        createdAt: createdAt,
      } as ProductType;
    });
    return productList;
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Return empty array on error
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground">Our Products</h1>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/add-product">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <PackageSearch className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No Products Yet</h2>
          <p className="text-muted-foreground mb-6">
            It looks like there are no products in the catalog.
            <br />
            Why not add the first one?
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/add-product">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Product
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export const revalidate = 60; // Revalidate data every 60 seconds
