import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set in environment variables.");
}
const stripe = new Stripe(STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" as const });

export async function POST(req: Request) {
  try {
    if (!STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY missing");
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is not configured. Add it to .env.local and restart the server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { priceId, userId, email, projectName } = body as {
      priceId?: string;
      userId?: string;
      email?: string;
      projectName?: string;
    };

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    if (!projectName || typeof projectName !== "string") {
      return NextResponse.json({ error: "projectName is required" }, { status: 400 });
    }

    const userEmail = email;
    const supabase = await createClient();

    const payload = {
      name: projectName.trim(),
      owner_id: userId,
      subscription_status: "incomplete",
      model_type: "JUST_SPLIT",
      mult_cash: 4,
      mult_work: 2,
      mult_tangible: 1,
      mult_intangible: 2,
      mult_others: 1,
      use_log_risk: false,
    };

    const { data: insertedProject, error: projectError } = await supabase
      .from("projects")
      .insert([payload])
      .select("id")
      .single();

    if (projectError) {
      console.error("Error creating draft project:", projectError);
      return NextResponse.json(
        { error: "Failed to create project: " + projectError.message },
        { status: 500 }
      );
    }
    if (!insertedProject?.id) {
      return NextResponse.json(
        { error: "Project created but no ID returned" },
        { status: 500 }
      );
    }
    const projectId = insertedProject.id;

    console.log("🔥 INTENTO DE PAGO RECIBIDO:", { priceId, projectId });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
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
      console.error("Stripe session created but url is null", { sessionId: session.id });
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
