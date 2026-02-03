import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "VentureTracker <no-reply@yourdomain.com>";

type EmailPayload = {
  type: "request" | "approved" | "rejected";
  email: string;
  cohortName?: string;
};

const buildEmail = (payload: EmailPayload) => {
  const cohort = payload.cohortName ? ` (${payload.cohortName})` : "";
  switch (payload.type) {
    case "request":
      return {
        subject: "Cohort request received",
        text: `Thanks for signing in! We received your request to join a cohort${cohort}. An admin has been notified and will approve your request soon.`,
      };
    case "approved":
      return {
        subject: "Your cohort request was approved",
        text: `Good news! Your request to join a cohort${cohort} has been approved. You can now create or join a team in VentureTracker.`,
      };
    case "rejected":
      return {
        subject: "Your cohort request was not approved",
        text: `Your cohort request${cohort} was not approved. If you believe this was a mistake, please contact your instructor.`,
      };
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing RESEND_API_KEY" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const payload = (await req.json()) as EmailPayload;
    if (!payload?.email || !payload?.type) {
      return new Response(
        JSON.stringify({ error: "Missing email or type" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { subject, text } = buildEmail(payload);

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: payload.email,
        subject,
        text,
      }),
    });

    if (!resendResp.ok) {
      const err = await resendResp.text();
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
