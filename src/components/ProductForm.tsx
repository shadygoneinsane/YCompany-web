"use client";

import { useEffect, useRef, useActionState } from "react"; // useState and Image removed
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
// import Image from "next/image"; // No longer needed for preview
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
import { AlertCircle } from "lucide-react"; // UploadCloud removed
import LoadingSpinner from "./ui/loading-spinner";


const FormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  price: z.coerce.number().positive("Price must be a positive number."),
  imageUrl: z.string().url("Please enter a valid URL for the image."), // Changed from image file
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
  const [initialState, action] = useActionState<AddProductActionState | undefined, FormData>(addProductAction, undefined);
  // const [imagePreview, setImagePreview] = useState<string | null>(null); // Removed image preview
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    control,
    // handleSubmit, // handleSubmit from RHF is not used with server actions in this setup
    formState: { errors: clientErrors },
    // setValue, // setValue for image is no longer needed
    // watch, // watch for image is no longer needed
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "", // Default imageUrl to empty string
    },
  });
  
  // const selectedImage = watch("image"); // Removed

  // useEffect(() => { // Removed image preview effect
  //   if (selectedImage) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result as string);
  //     };
  //     reader.readAsDataURL(selectedImage);
  //   } else {
  //     setImagePreview(null);
  //   }
  // }, [selectedImage]);

  useEffect(() => {
    if (initialState?.success) {
      toast({
        title: "Success!",
        description: initialState.message,
      });
      reset(); // Reset react-hook-form fields
      // setImagePreview(null); // Clear image preview - removed
      formRef.current?.reset(); // Reset the native form element
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
            {allErrors?.name && Array.isArray(allErrors.name) && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{allErrors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Textarea id="description" {...field} placeholder="Describe the product..." rows={4} />}
            />
            {allErrors?.description && Array.isArray(allErrors.description) && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{allErrors.description[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => <Input id="price" type="number" step="0.01" {...field} placeholder="e.g. 19.99" />}
            />
            {allErrors?.price && Array.isArray(allErrors.price) && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{allErrors.price[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Product Image URL</Label>
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                 <Input 
                  id="imageUrl" 
                  type="url" // Changed type to url for better semantics, though text also works
                  placeholder="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
                  {...field}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct link to an image file (.jpg, .png, .gif) or use services like Unsplash, Picsum, or Placeholder.
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Example URLs:</p>
              <ul className="space-y-1 text-xs">
                <li>• <code className="bg-muted px-1 rounded">https://picsum.photos/600/400</code></li>
                <li>• <code className="bg-muted px-1 rounded">https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d</code></li>
                <li>• <code className="bg-muted px-1 rounded">https://via.placeholder.com/600x400/468BFF/FFFFFF?text=Product</code></li>
              </ul>
            </div>
            {allErrors?.imageUrl && Array.isArray(allErrors.imageUrl) && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{allErrors.imageUrl[0]}</p>}
          </div>

          {/* Image preview section removed */}
          {/* {imagePreview && (
            <div className="mt-4">
              <Label>Image Preview</Label>
              <div className="mt-2 relative w-full aspect-video rounded-md overflow-hidden border border-muted">
                <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="contain" />
              </div>
            </div>
          )} */}

           {initialState?.errors?._form && Array.isArray(initialState.errors._form) && <p className="text-sm text-destructive flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{initialState.errors._form[0]}</p>}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
