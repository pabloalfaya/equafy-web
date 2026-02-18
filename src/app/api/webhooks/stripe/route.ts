import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover" as const,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Stripe envía webhooks por POST. Esta ruta debe aceptar solo POST. */
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
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const supabaseAdmin = () => createClient(supabaseUrl, supabaseServiceRoleKey);

  const activateProject = async (projectId: string, source: string) => {
    if (!projectId) return;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Supabase URL or SERVICE_ROLE_KEY not set");
      return;
    }
    const supabase = supabaseAdmin();
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

  const deactivateProject = async (projectId: string, source: string) => {
    if (!projectId) return;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Supabase URL or SERVICE_ROLE_KEY not set");
      return;
    }
    const supabase = supabaseAdmin();
    const { error } = await supabase
      .from("projects")
      .update({ subscription_status: "incomplete" })
      .eq("id", projectId);
    if (error) {
      console.error("Error updating project subscription_status (deactivate):", error);
      return;
    }
    console.log(`[Webhook] Proyecto desactivado (suscripción cancelada): ID=${projectId}, origen=${source}`);
  };

  const getProjectIdFromSession = (session: Stripe.Checkout.Session): string | null => {
    const fromMeta = session.metadata?.projectId;
    if (typeof fromMeta === "string" && fromMeta) return fromMeta;
    const fromRef = session.client_reference_id;
    if (typeof fromRef === "string" && fromRef) return fromRef;
    return null;
  };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    let projectId = getProjectIdFromSession(session);
    const paymentStatus = session.payment_status ?? "";
    const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

    console.log(
      `[Webhook] checkout.session.completed — Proyecto ID: ${projectId ?? "N/A"}, payment_status: ${paymentStatus}, subscription: ${subId ?? "N/A"}`
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
    let shouldActivate = paid || noPaymentRequired;

    if (!shouldActivate && subId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subId);
        if (subscription.status === "trialing" || subscription.status === "active") {
          shouldActivate = true;
          console.log(`[Webhook] checkout.session.completed: activando por subscription.status=${subscription.status}`);
        }
      } catch (e) {
        console.warn("[Webhook] no se pudo recuperar subscription para trialing:", e);
      }
    }

    if (shouldActivate) {
      await activateProject(projectId, "checkout.session.completed");
    } else {
      console.log(`[Webhook] checkout.session.completed: no se activa (payment_status=${paymentStatus}), se esperará customer.subscription.*`);
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const status = subscription.status ?? "";
    let projectId = (subscription.metadata?.projectId as string) || null;

    if (!projectId && (status === "trialing" || status === "active")) {
      try {
        const sessions = await stripe.checkout.sessions.list({ limit: 100, subscription: subscription.id });
        const sessionWithMeta = sessions.data.find((s) => s.metadata?.projectId);
        if (sessionWithMeta?.metadata?.projectId) projectId = sessionWithMeta.metadata.projectId as string;
      } catch (e) {
        console.warn("[Webhook] fallback session list:", e);
      }
    }

    console.log(
      `[Webhook] customer.subscription.${event.type.split(".").pop()} — Proyecto ID: ${projectId ?? "N/A"}, Estado: ${status}`
    );

    if (status === "trialing" || status === "active") {
      if (!projectId) {
        console.error("[Webhook] customer.subscription: sin projectId en metadata ni en sesión", subscription.metadata);
        return NextResponse.json({ received: true }, { status: 200 });
      }
      await activateProject(projectId, `customer.subscription.${event.type.split(".").pop()}`);
    }
  }

  // --- customer.subscription.deleted: desactivar proyecto (suscripción cancelada) ---
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;

    let projectId = (subscription.metadata?.projectId as string) || null;
    if (!projectId) {
      try {
        const sessions = await stripe.checkout.sessions.list({ limit: 100, subscription: subscriptionId });
        const sessionWithMeta = sessions.data.find((s) => s.metadata?.projectId);
        if (sessionWithMeta?.metadata?.projectId) projectId = sessionWithMeta.metadata.projectId as string;
      } catch (e) {
        console.warn("[Webhook] customer.subscription.deleted: fallback session list:", e);
      }
    }

    console.log(
      `[Webhook] customer.subscription.deleted — subscription_id: ${subscriptionId}, Proyecto ID: ${projectId ?? "N/A"}`
    );

    if (projectId) {
      await deactivateProject(projectId, "customer.subscription.deleted");
    } else {
      // Fallback opcional: si en el futuro guardas stripe_subscription_id en 'projects', se puede buscar por él
      if (supabaseUrl && supabaseServiceRoleKey) {
        try {
          const supabase = supabaseAdmin();
          const { data: projects, error } = await supabase
            .from("projects")
            .select("id")
            .eq("stripe_subscription_id", subscriptionId)
            .limit(1);
          if (!error && projects?.length && projects[0]?.id) {
            await deactivateProject(projects[0].id, "customer.subscription.deleted (by stripe_subscription_id)");
          } else {
            console.error("[Webhook] customer.subscription.deleted: no projectId en metadata (ni columna stripe_subscription_id)", {
              subscription_id: subscriptionId,
              metadata: subscription.metadata,
            });
          }
        } catch (e) {
          console.error("[Webhook] customer.subscription.deleted: no se pudo resolver proyecto", {
            subscription_id: subscriptionId,
            metadata: subscription.metadata,
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
