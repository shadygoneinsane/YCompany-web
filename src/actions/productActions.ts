"use server";

import { z } from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { revalidatePath } from "next/cache";
import type { AddProductActionState } from "@/types";

const ProductFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  price: z.coerce.number().positive("Price must be a positive number."),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function addProductAction(
  prevState: AddProductActionState | undefined,
  formData: FormData
): Promise<AddProductActionState> {
  const validatedFields = ProductFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your inputs.",
      success: false,
    };
  }

  const imageFile = formData.get("image") as File | null;
  let imageUrl = "";

  if (!imageFile || imageFile.size === 0) {
    return { errors: { image: ["Product image is required."] }, message: "Image is required.", success: false };
  }

  if (imageFile.size > MAX_FILE_SIZE) {
    return { errors: { image: [`Image size should be less than ${MAX_FILE_SIZE / 1024 / 1024}MB.`] }, message: "Image too large.", success: false };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
    return { errors: { image: ["Invalid image type. Only JPG, PNG, WEBP allowed."] }, message: "Invalid image type.", success: false };
  }

  try {
    const storageRef = ref(storage, `product_images/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error("Error uploading image:", error);
    return { errors: { _form: ["Failed to upload image. Please try again."] }, message: "Image upload failed.", success: false };
  }

  try {
    await addDoc(collection(db, "products"), {
      ...validatedFields.data,
      imageUrl,
      createdAt: serverTimestamp(),
    });
    revalidatePath("/");
    return { message: "Product added successfully!", success: true, errors: null };
  } catch (error) {
    console.error("Error adding product to Firestore:", error);
    return { message: "Failed to add product to database. Please try again.", success: false, errors: { _form: ["Database error."] } };
  }
}
