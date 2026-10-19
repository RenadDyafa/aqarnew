import { NextResponse } from "next/server";

const MAX = 2000;
const clean = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, MAX) : "");

/*
  Receives enquiries from the contact dialog.
  Set CONTACT_WEBHOOK_URL (CRM, Zapier/Make, or an email relay) to forward them.
  Without it, development logs the enquiry and production refuses it,
  so no enquiry is silently lost.
*/
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const enquiry = {
    name: clean(body.name),
    email: clean(body.email),
    phone: clean(body.phone),
    subject: clean(body.subject),
    propertyType: clean(body.propertyType),
    location: clean(body.location),
    units: clean(body.units),
    message: clean(body.message),
    intent: clean(body.intent),
    locale: clean(body.locale),
    receivedAt: new Date().toISOString(),
  };

  // A quick call request from the footer carries only a phone number.
  if (enquiry.intent === "callback") {
    if (enquiry.phone.replace(/\D/g, "").length < 7) {
      return NextResponse.json({ error: "A valid phone number is required" }, { status: 422 });
    }
  } else if (!enquiry.name || (!enquiry.email && !enquiry.phone)) {
    return NextResponse.json({ error: "Name and an email or phone number are required" }, { status: 422 });
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] enquiry (no CONTACT_WEBHOOK_URL set):", enquiry);
      return NextResponse.json({ ok: true, delivered: false });
    }
    return NextResponse.json({ error: "Enquiry delivery is not configured" }, { status: 503 });
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(enquiry),
  });
  if (!res.ok) return NextResponse.json({ error: "Delivery failed" }, { status: 502 });
  return NextResponse.json({ ok: true, delivered: true });
}
