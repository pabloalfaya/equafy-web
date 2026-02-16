import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    // 1. Insertar proyecto en Supabase y guardar el resultado
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

    // 2. Crear sesión de Stripe usando projectId y el priceId recibido en el POST
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
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

    if (!session.url) {
      console.error("Stripe session created but url is null", { sessionId: session.id });
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    // 3. Devolver la URL de checkout al cliente
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
