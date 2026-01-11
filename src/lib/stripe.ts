import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    // We'll use a placeholder for now to prevent runtime errors during development
    // if the user hasn't provided the key yet.
    console.warn("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    apiVersion: "2024-12-18.acacia" as any,
});
