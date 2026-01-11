import "dotenv/config";
import { stripe } from "../lib/stripe";

async function check() {
    console.log("Checking Stripe Configuration...");

    if (!process.env.STRIPE_SECRET_KEY) {
        console.error("❌ STRIPE_SECRET_KEY is not set in env.");
        // We know lib/stripe.ts provides a fallback, but we want to know if ENV is set.
    } else {
        console.log("✅ STRIPE_SECRET_KEY is present.");
    }

    try {
        console.log("Attempting to create a test Express account...");
        const account = await stripe.accounts.create({
            type: "express",
        });
        console.log("✅ Successfully created test account:", account.id);
    } catch (err: any) {
        console.error("❌ Stripe API Error:", err.message);
        if (err.type === 'StripeAuthenticationError') {
            console.error("   Reason: Invalid API Key.");
        }
    }
}

check();
