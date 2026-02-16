import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  let body: { priceId?: string; userId?: string; email?: string; projectName?: string };
  try {
    body = await req.json();
  } catch (e) {
    console.error("Invalid JSON body:", e);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { priceId, userId, email, projectName } = body;

  if (!priceId || typeof priceId !== "string") {
    return NextResponse.json(
      { error: "priceId is required" },
      { status: 400 }
    );
  }
  if (!userId || typeof userId !== "string") {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }
  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 }
    );
  }
  if (!projectName || typeof projectName !== "string") {
    return NextResponse.json(
      { error: "projectName is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const payload = {
    name: projectName.trim(),
    owner_id: userId,
    subscription_status: "pending_payment",
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Bloque Stripe con try/catch detallado
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: {
        projectId,
        userId,
      },
      subscription_data: {
        metadata: {
          projectId,
          userId,
        },
      },
      success_url: `${baseUrl}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/dashboard?payment=cancelled`,
      allow_promotion_codes: true,
      locale: "en",
    });
  } catch (stripeErr: unknown) {
    const message =
      stripeErr instanceof Error
        ? stripeErr.message
        : typeof stripeErr === "object" && stripeErr !== null && "message" in stripeErr
          ? String((stripeErr as { message: unknown }).message)
          : "Unknown Stripe error";
    console.error("Stripe checkout.sessions.create error:", stripeErr);
    return NextResponse.json(
      { error: "Stripe error: " + message },
      { status: 500 }
    );
  }

  if (!session.url) {
    console.error("Stripe session created but url is null", { sessionId: session.id });
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
