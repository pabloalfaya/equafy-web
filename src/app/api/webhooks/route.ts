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

  const activateProject = async (projectId: string) => {
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
    console.log("Project activated:", projectId);
  };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const projectId = session.metadata?.projectId as string | undefined;

    if (!projectId) {
      console.error("checkout.session.completed: missing projectId in metadata", session.metadata);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    await activateProject(projectId);
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const status = subscription.status;
    if (status === "trialing" || status === "active") {
      const projectId = subscription.metadata?.projectId as string | undefined;
      if (!projectId) {
        console.error("customer.subscription: missing projectId in metadata", subscription.metadata);
        return NextResponse.json({ received: true }, { status: 200 });
      }
      await activateProject(projectId);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
