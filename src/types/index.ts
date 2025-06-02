import type { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: Timestamp | { seconds: number; nanoseconds: number }; // Firestore serverTimestamp can be this on client or actual Timestamp
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image?: File | null;
}

export type AddProductActionState = {
  message?: string | null;
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    image?: string[];
    _form?: string[];
  } | null;
  success?: boolean;
};
