"use client";

import { useEffect, useState, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { UploadCloud, AlertCircle } from "lucide-react";
import LoadingSpinner from "./ui/loading-spinner";


const FormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  price: z.coerce.number().positive("Price must be a positive number."),
  image: z.instanceof(File).refine(file => file.size > 0, "Image is required.")
    .refine(file => file.size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
    .refine(
      file => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only .jpg, .png, .webp formats are supported."
    ).optional() // Optional in schema, server action handles if null
});


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <LoadingSpinner /> : "Add Product"}
    </Button>
  );
}

export default function ProductForm() {
  const [initialState, action] = useFormState<AddProductActionState | undefined, FormData>(addProductAction, undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors: clientErrors },
    setValue,
    watch,
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: null,
    },
  });
  
  const selectedImage = watch("image");

  useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      setImagePreview(null);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (initialState?.success) {
      toast({
        title: "Success!",
        description: initialState.message,
      });
      reset(); // Reset react-hook-form fields
      setImagePreview(null); // Clear image preview
      formRef.current?.reset(); // Reset the native form element to clear file input
      router.push("/");
    } else if (initialState?.message && !initialState?.success) {
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
            {allErrors?.name && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{allErrors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Textarea id="description" {...field} placeholder="Describe the product..." rows={4} />}
            />
            {allErrors?.description && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{allErrors.description[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => <Input id="price" type="number" step="0.01" {...field} placeholder="e.g. 19.99" />}
            />
            {allErrors?.price && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{allErrors.price[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <Controller
              name="image"
              control={control}
              render={({ field: { onChange, value, ...restField } }) => (
                 <Input 
                  id="image" 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onChange(file); // RHF's onChange
                    setValue("image", file); // Explicitly set value for RHF
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  {...restField} 
                />
              )}
            />
            {allErrors?.image && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{allErrors.image[0]}</p>}
          </div>

          {imagePreview && (
            <div className="mt-4">
              <Label>Image Preview</Label>
              <div className="mt-2 relative w-full aspect-video rounded-md overflow-hidden border border-muted">
                <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="contain" />
              </div>
            </div>
          )}
           {initialState?.errors?._form && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{initialState.errors._form[0]}</p>}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
