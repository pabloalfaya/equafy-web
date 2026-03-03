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
    const {
      priceId,
      userId,
      email,
      projectName,
      model_type: bodyModelType,
      mult_cash: bodyMultCash,
      mult_work: bodyMultWork,
      mult_tangible: bodyMultTangible,
      mult_intangible: bodyMultIntangible,
      mult_others: bodyMultOthers,
      terms_accepted_at: termsAcceptedAt,
      privacy_accepted_at: privacyAcceptedAt,
    } = body as {
      priceId?: string;
      userId?: string;
      email?: string;
      projectName?: string;
      model_type?: string;
      mult_cash?: number;
      mult_work?: number;
      mult_tangible?: number;
      mult_intangible?: number;
      mult_others?: number;
      terms_accepted_at?: string;
      privacy_accepted_at?: string;
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
    if (!termsAcceptedAt || typeof termsAcceptedAt !== "string") {
      return NextResponse.json({ error: "You must accept the Terms of Service to continue" }, { status: 400 });
    }
    if (!privacyAcceptedAt || typeof privacyAcceptedAt !== "string") {
      return NextResponse.json({ error: "You must accept the Privacy Policy to continue" }, { status: 400 });
    }

    const userEmail = email;
    const supabase = await createClient();

    const modelType =
      bodyModelType === "FLAT" || bodyModelType === "JUST_SPLIT" || bodyModelType === "CUSTOM"
        ? bodyModelType
        : "JUST_SPLIT";
    const mult_cash = typeof bodyMultCash === "number" ? bodyMultCash : 4;
    const mult_work = typeof bodyMultWork === "number" ? bodyMultWork : 2;
    const mult_tangible = typeof bodyMultTangible === "number" ? bodyMultTangible : 1;
    const mult_intangible = typeof bodyMultIntangible === "number" ? bodyMultIntangible : 2;
    const mult_others = typeof bodyMultOthers === "number" ? bodyMultOthers : 1;

    const payload: Record<string, unknown> = {
      name: projectName.trim(),
      owner_id: userId,
      subscription_status: "incomplete",
      model_type: modelType,
      mult_cash,
      mult_work,
      mult_tangible,
      mult_intangible,
      mult_others,
      use_log_risk: false,
      model_onboarding_dismissed: false,
      // New project onboarding: legacy vs scratch flow not completed yet.
      is_setup_completed: false,
      terms_accepted_at: termsAcceptedAt,
      privacy_accepted_at: privacyAcceptedAt,
    };

    let insertedProject: { id: string } | null = null;
    let projectError: { message: string } | null = null;

    const { data: insertData, error: insertErr } = await supabase
      .from("projects")
      .insert([payload])
      .select("id")
      .single();

    if (insertErr) {
      projectError = insertErr;
      if (insertErr.message?.includes("model_onboarding_dismissed")) {
        delete payload.model_onboarding_dismissed;
        const { data: retryData, error: retryErr } = await supabase
          .from("projects")
          .insert([payload])
          .select("id")
          .single();
        if (!retryErr) {
          insertedProject = retryData;
          projectError = null;
        } else {
          projectError = retryErr;
        }
      }
    } else {
      insertedProject = insertData;
    }

    if (projectError || !insertedProject) {
      console.error("Error creating draft project:", projectError);
      return NextResponse.json(
        { error: "Failed to create project: " + (projectError?.message ?? "Unknown error") },
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
        trial_period_days: 7,
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
