
"use server";

import { z } from "zod";
import { addDoc, collection, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
// import { getDownloadURL, ref, uploadBytes } from "firebase/storage"; // No longer needed for upload
import { db } from "@/lib/firebase"; // storage is no longer needed here
import { revalidatePath } from "next/cache";
import type { AddProductActionState } from "@/types";

const ProductFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  price: z.coerce.number().positive("Price must be a positive number."),
  imageUrl: z.string().url("Please enter a valid URL for the image."),
});

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

  // Check for duplicate product name (case-insensitive)
  try {
    const productsRef = collection(db, "products");
    // Firestore queries are case-sensitive by default.
    // To do a case-insensitive check, we typically fetch and filter client-side,
    // or store a lowercase version of the name for querying.
    // For simplicity here, we'll fetch and then filter, but for large datasets,
    // storing a lowercase name field (e.g., `name_lowercase`) and querying that would be more efficient.
    // However, let's try a direct query first. If performance becomes an issue, we can optimize.
    // A common workaround for case-insensitive search is to query for a range if you normalize the case
    // e.g. name >= inputName.toLowerCase() and name <= inputName.toLowerCase() + '\uf8ff'
    // But since we need an exact match (case-insensitive), we'll fetch and filter.
    // A more direct approach for exact (but case-sensitive) match is:
    // const q = query(productsRef, where("name", "==", name), limit(1));
    // For case-insensitive, we'll retrieve potential matches and check in code.
    // This is not ideal for very large datasets.
    // A better Firestore pattern is to store a normalized (e.g., lowercase) version of the field
    // and query against that. For this example, we'll perform a case-insensitive check after fetching.

    const querySnapshot = await getDocs(productsRef);
    const existingProduct = querySnapshot.docs.find(
      (doc) => doc.data().name.toLowerCase() === name.toLowerCase()
    );

    if (existingProduct) {
      return {
        errors: { name: ["A product with this name already exists."] },
        message: "Duplicate product name.",
        success: false,
      };
    }
  } catch (error: any) {
    console.error("Error checking for duplicate product name:", error);
    return {
      message: "Failed to verify product name uniqueness. Please try again.",
      success: false,
      errors: { _form: ["Failed to verify product name uniqueness."] },
    };
  }


  try {
    await addDoc(collection(db, "products"), {
      name,
      description,
      price,
      imageUrl,
      createdAt: serverTimestamp(),
    });
    revalidatePath("/");
    return { message: "Product added successfully!", success: true, errors: null };
  } catch (error: any) {
    console.error("Error adding product to Firestore:", error);
    let detailedMessage = "Failed to add product to database. Please try again.";
     if (error.code) {
      detailedMessage += ` (Error code: ${error.code})`;
    } else if (error.message) {
      detailedMessage += ` (${error.message})`;
    }
    return { message: detailedMessage, success: false, errors: { _form: [detailedMessage] } };
  }
}
