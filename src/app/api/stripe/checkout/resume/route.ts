import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-01-28.clover" as const })
  : null;

const DEFAULT_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || "";

export async function POST(req: Request) {
  try {
    if (!stripe || !STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { projectId, userId, email, priceId } = body as {
      projectId?: string;
      userId?: string;
      email?: string;
      priceId?: string;
    };

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, owner_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.owner_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userEmail = email;
    const priceIdToUse = typeof priceId === "string" && priceId ? priceId : DEFAULT_PRICE_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceIdToUse, quantity: 1 }],
      customer_email: userEmail,
      metadata: {
        projectId: projectId,
        userEmail: userEmail,
      },
      subscription_data: {
        metadata: {
          projectId: projectId,
          userEmail: userEmail,
        },
      },
      success_url: `${baseUrl}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/dashboard?payment=cancelled`,
      allow_promotion_codes: true,
      locale: "en",
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Checkout resume error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
