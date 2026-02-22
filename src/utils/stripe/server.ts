import Stripe from 'stripe';
import { BRAND } from '@/lib/brand';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore: Los tipos de Stripe pueden ir un poco por detrás
  apiVersion: '2023-10-16', 
  appInfo: {
    name: BRAND.name,
    version: '0.1.0'
  }
});