"use client";

import { useEffect, useRef, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { addProductAction } from "@/actions/productActions";
import type { ProductFormData, AddProductActionState } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import LoadingSpinner from "./ui/loading-spinner";


const FormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  price: z.coerce.number().positive("Price must be a positive number."),
  imageUrl: z.string().url("Please enter a valid URL for the image."),
});


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <LoadingSpinner /> : "Add Product"}
    </Button>
  );
}

const FORM_DEFAULTS = {
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
} as const;

export default function ProductForm() {
  const [initialState, action] = useActionState<AddProductActionState | undefined, FormData>(addProductAction, undefined);
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    control,
    formState: { errors: clientErrors },
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!initialState?.message) return;

    if (initialState.success) {
      toast({
        title: "Success!",
        description: initialState.message,
      });
      reset();
      formRef.current?.reset();
      router.push("/");
    } else {
      toast({
        title: "Error",
        description: initialState.message,
        variant: "destructive",
      });
    }
  }, [initialState, router, toast, reset]);

  const allErrors = { ...clientErrors, ...initialState?.errors };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Add New Product</CardTitle>
        <CardDescription>Fill in the details below to add a new product to the catalog.</CardDescription>
      </CardHeader>
      <form action={action} ref={formRef}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input id="name" {...field} placeholder="e.g. Premium Coffee Beans" />}
            />
            {allErrors?.name && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{Array.isArray(allErrors.name) ? allErrors.name[0] : allErrors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Textarea id="description" {...field} placeholder="Describe the product..." rows={4} />}
            />
            {allErrors?.description && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{Array.isArray(allErrors.description) ? allErrors.description[0] : allErrors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => <Input id="price" type="number" step="0.01" {...field} placeholder="e.g. 19.99" />}
            />
            {allErrors?.price && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{Array.isArray(allErrors.price) ? allErrors.price[0] : allErrors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Product Image URL</Label>
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                 <Input 
                  id="imageUrl" 
                  type="url"
                  placeholder="https://dummyimage.com/600x400/4338ca/ffffff&text=Product"
                  {...field}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct link to an image file (.jpg, .png, .gif) or use services like Unsplash, Picsum, or Placeholder.
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Example URLs that work:</p>
              <ul className="space-y-1 text-xs">
                <li>• <code className="bg-muted px-1 rounded">https://dummyimage.com/600x400/4338ca/ffffff&text=Product</code></li>
                <li>• <code className="bg-muted px-1 rounded">https://placehold.co/600x400/blue/white?text=Sample</code></li>
                <li>• <code className="bg-muted px-1 rounded">https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d</code></li>
              </ul>
            </div>
            {allErrors?.imageUrl && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{Array.isArray(allErrors.imageUrl) ? allErrors.imageUrl[0] : allErrors.imageUrl.message}</p>}
          </div>

           {initialState?.errors?._form && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{initialState.errors._form[0]}</p>}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
