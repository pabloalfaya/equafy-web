import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover" as const,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.error("Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // Raw body as string required for Stripe signature verification (do not use req.json())
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const activateProject = async (projectId: string, source: string) => {
    if (!projectId) return;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Supabase URL or SERVICE_ROLE_KEY not set");
      return;
    }
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { error } = await supabase
      .from("projects")
      .update({ subscription_status: "active" })
      .eq("id", projectId);
    if (error) {
      console.error("Error updating project subscription_status:", error);
      return;
    }
    console.log(`[Webhook] Proyecto activado: ID=${projectId}, origen=${source}`);
  };

  const getProjectIdFromSession = (session: Stripe.Checkout.Session): string | null => {
    const fromMeta = session.metadata?.projectId;
    if (typeof fromMeta === "string" && fromMeta) return fromMeta;
    const fromRef = session.client_reference_id;
    if (typeof fromRef === "string" && fromRef) return fromRef;
    return null;
  };

  // --- checkout.session.completed: activar si pago completado O trial (no_payment_required) ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const projectId = getProjectIdFromSession(session);
    const paymentStatus = session.payment_status ?? "";
    const subscriptionStatus = (session as { subscription?: string }).subscription
      ? "has_subscription"
      : "no_subscription";

    console.log(
      `[Webhook] checkout.session.completed — Proyecto ID: ${projectId ?? "N/A"}, payment_status: ${paymentStatus}, subscription: ${subscriptionStatus}`
    );

    if (!projectId) {
      console.error("[Webhook] checkout.session.completed: sin projectId en metadata ni client_reference_id", {
        metadata: session.metadata,
        client_reference_id: session.client_reference_id,
      });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const paid = paymentStatus === "paid";
    const noPaymentRequired = paymentStatus === "no_payment_required";
    if (paid || noPaymentRequired) {
      await activateProject(projectId, "checkout.session.completed");
    } else {
      console.log(`[Webhook] checkout.session.completed: no se activa (payment_status=${paymentStatus}), se esperará customer.subscription.*`);
    }
  }

  // --- customer.subscription.created / updated: activar si trialing o active ---
  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const status = subscription.status ?? "";
    const projectId = (subscription.metadata?.projectId as string) || null;

    console.log(
      `[Webhook] customer.subscription.${event.type.split(".").pop()} — Proyecto ID: ${projectId ?? "N/A"}, Estado: ${status}`
    );

    if (status === "trialing" || status === "active") {
      if (!projectId) {
        console.error("[Webhook] customer.subscription: sin projectId en metadata", subscription.metadata);
        return NextResponse.json({ received: true }, { status: 200 });
      }
      await activateProject(projectId, `customer.subscription.${event.type.split(".").pop()}`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
