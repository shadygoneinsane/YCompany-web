"use server";

import { z } from "zod";
import { addDoc, collection, serverTimestamp, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import type { AddProductActionState } from "@/types";
import { isValidImageUrl, fixImageUrl } from "@/lib/imageUtils";

// Custom validation function for image URLs
function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Check if it's a valid URL
    if (!urlObj.protocol.startsWith('http')) {
      return false;
    }

    // Check for common image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.ico'];
    const hasImageExtension = imageExtensions.some(ext =>
      urlObj.pathname.toLowerCase().endsWith(ext)
    );

    // If it has an image extension, it's likely valid
    if (hasImageExtension) {
      return true;
    }

    // For URLs without extensions (like CDN URLs), check if they're from known image services
    const knownImageServices = [
      'images.unsplash.com',
      'picsum.photos',
      'via.placeholder.com',
      'placehold.co',
      'loremflickr.com',
      'source.unsplash.com',
      'upload.wikimedia.org',
      'commons.wikimedia.org'
    ];

    const isFromKnownService = knownImageServices.some(service => urlObj.hostname.includes(service));

    // Additional validation for Unsplash URLs
    if (urlObj.hostname.includes('images.unsplash.com')) {
      // Unsplash URLs should have a photo ID that's typically 10-11 characters
      const photoMatch = urlObj.pathname.match(/\/photo-([a-zA-Z0-9]+)/);
      if (!photoMatch || photoMatch[1].length < 10) {
        return false;
      }
    }

    return isFromKnownService;
  } catch {
    return false;
  }
}

const ProductFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  price: z.coerce.number().positive("Price must be a positive number."),
  imageUrl: z.string()
    .url("Please enter a valid URL for the image.")
    .refine(isValidImageUrl, {
      message: "Please enter a valid image URL. For Unsplash, use URLs like 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'. For other services, ensure the URL points to an actual image file (.jpg, .png, .gif) or a known image service."
    }),
});

type ProductData = z.infer<typeof ProductFormSchema>;

const PRODUCTS_COLLECTION = "products";
const ERROR_MESSAGES = {
  VALIDATION_FAILED: "Validation failed. Please check your inputs.",
  DUPLICATE_NAME: "A product with this name already exists.",
  DUPLICATE_CHECK_FAILED: "Failed to verify product name uniqueness. Please try again.",
  ADD_FAILED: "Failed to add product to database. Please try again.",
  DELETE_FAILED: "Failed to delete product. Please try again.",
  PRODUCT_ID_REQUIRED: "Product ID is required for deletion.",
  PRODUCT_ADDED: "Product added successfully!",
  PRODUCT_DELETED: "Product deleted successfully.",
} as const;

export async function addProductAction(
  prevState: AddProductActionState | undefined,
  formData: FormData
): Promise<AddProductActionState> {
  const validatedFields = ProductFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your inputs.",
      success: false,
    };
  }

  const { name, description, price, imageUrl } = validatedFields.data;

  const duplicateCheck = await checkForDuplicateProduct(name);
  if (!duplicateCheck.success) {
    return duplicateCheck;
  }


  return await createProduct(validatedFields.data);
}

export async function deleteProductAction(productId: string): Promise<{ success: boolean; message: string }> {
  if (!productId) {
    return { success: false, message: ERROR_MESSAGES.PRODUCT_ID_REQUIRED };
  }

  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);
    revalidatePath("/");
    return { success: true, message: ERROR_MESSAGES.PRODUCT_DELETED };
  } catch (error: any) {
    console.error("Error deleting product from Firestore:", error);
    const detailedMessage = formatErrorMessage(ERROR_MESSAGES.DELETE_FAILED, error);
    return { success: false, message: detailedMessage };
  }
}

async function checkForDuplicateProduct(name: string): Promise<AddProductActionState> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const querySnapshot = await getDocs(productsRef);
    const existingProduct = querySnapshot.docs.find(
      (doc) => doc.data().name.toLowerCase() === name.toLowerCase()
    );

    if (existingProduct) {
      return {
        errors: { name: [ERROR_MESSAGES.DUPLICATE_NAME] },
        message: ERROR_MESSAGES.DUPLICATE_NAME,
        success: false,
      };
    }

    return { success: true, message: "", errors: null };
  } catch (error: any) {
    console.error("Error checking for duplicate product name:", error);
    return {
      message: ERROR_MESSAGES.DUPLICATE_CHECK_FAILED,
      success: false,
      errors: { _form: [ERROR_MESSAGES.DUPLICATE_CHECK_FAILED] },
    };
  }
}

async function createProduct(productData: ProductData): Promise<AddProductActionState> {
  try {
    // Fix the image URL before saving
    const fixedImageUrl = fixImageUrl(productData.imageUrl);

    await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      imageUrl: fixedImageUrl,
      createdAt: serverTimestamp(),
    });
    revalidatePath("/");
    return { message: ERROR_MESSAGES.PRODUCT_ADDED, success: true, errors: null };
  } catch (error: any) {
    console.error("Error adding product to Firestore:", error);
    const detailedMessage = formatErrorMessage(ERROR_MESSAGES.ADD_FAILED, error);
    return { message: detailedMessage, success: false, errors: { _form: [detailedMessage] } };
  }
}

function formatErrorMessage(baseMessage: string, error: any): string {
  if (error.code) {
    return `${baseMessage} (Error code: ${error.code})`;
  }
  if (error.message) {
    return `${baseMessage} (${error.message})`;
  }
  return baseMessage;
}

export async function deleteProductAction(productId: string): Promise<{ success: boolean; message: string }> {
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
    revalidatePath("/");
    return { success: true, message: "Product deleted successfully!" };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    let detailedMessage = "Failed to delete product. Please try again.";
    if (error.code) {
      detailedMessage += ` (Error code: ${error.code})`;
    } else if (error.message) {
      detailedMessage += ` (${error.message})`;
    }
    return { success: false, message: detailedMessage };
  }
}
