/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isRegistered?: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  category: string;
  subcategory?: string;
  imageUrl: string;
  imageGallery?: string[];
  stock: number;
  isFeatured?: boolean;
  reviews?: Review[];
  colors?: string[];
  sizes?: string[];
  features?: string[];
  specifications?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface PaymentDetails {
  method: 'card' | 'paypal' | 'klarna';
  cardHolder?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  paypalEmail?: string;
  klarnaEmail?: string;
  klarnaBirthdate?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customerName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  paymentMethod: string;
  date: string;
}

export interface User {
  name: string;
  email: string;
  isLoggedIn: boolean;
  avatar?: string;
  role?: 'buyer' | 'seller';
}
