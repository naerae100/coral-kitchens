import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Mirrors the four service lines in site.ts. */
export const ENQUIRY_SERVICES = [
  { value: "kitchen", label: "A complete kitchen" },
  { value: "panels", label: "Cut-to-size panels" },
  { value: "doors", label: "Cabinet doors / profiles" },
  { value: "joinery", label: "Other joinery (wardrobe, laundry, vanity)" },
  { value: "commercial", label: "Commercial / shopfit" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const PROPERTY_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "trade", label: "Trade / builder" },
] as const;

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(80),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  suburb: z.string().trim().max(80).optional().or(z.literal("")),
  service: z.enum(["kitchen", "panels", "doors", "joinery", "commercial", "unsure"]),
  propertyType: z.enum(["residential", "commercial", "trade"]),
  message: z
    .string()
    .trim()
    .min(10, "A sentence or two about the job helps us quote it properly.")
    .max(2000),
  /** Honeypot: real people never see this field, bots fill everything. */
  website: z.string().max(0).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

const labelFor = (list: ReadonlyArray<{ value: string; label: string }>, value: string) =>
  list.find((item) => item.value === value)?.label ?? value;

/**
 * ⚠️ INTEGRATION POINT — where enquiries actually go.
 *
 * Set `ENQUIRY_WEBHOOK_URL` in the deployment environment and every submission is
 * POSTed there as JSON. Any of these accept a plain webhook with no extra code:
 * Zapier, Make, n8n, Slack (incoming webhook), HubSpot, or your own endpoint.
 *
 * With the variable unset the enquiry is only written to the server log — fine
 * for local development, but leads will NOT reach an inbox in production.
 */
export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => enquirySchema.parse(data))
  .handler(async ({ data }) => {
    // Bots trip the honeypot. Return success so they don't retry with a new shape.
    if (data.website) return { ok: true as const };

    const payload = {
      receivedAt: new Date().toISOString(),
      name: data.name,
      email: data.email,
      phone: data.phone || "—",
      suburb: data.suburb || "—",
      service: labelFor(ENQUIRY_SERVICES, data.service),
      propertyType: labelFor(PROPERTY_TYPES, data.propertyType),
      message: data.message,
    };

    const webhook = process.env.ENQUIRY_WEBHOOK_URL;

    if (!webhook) {
      console.warn(
        "[enquiry] ENQUIRY_WEBHOOK_URL is not set — this enquiry was logged only, not delivered:",
        payload,
      );
      return { ok: true as const };
    }

    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: `New enquiry from ${payload.name} (${payload.email}) — ${payload.service}, ${payload.propertyType}`,
        ...payload,
      }),
    });

    if (!response.ok) {
      console.error("[enquiry] webhook rejected the submission", response.status, payload);
      // Surface the failure so the visitor is told to call instead of assuming it sent.
      throw new Error("Enquiry could not be delivered");
    }

    return { ok: true as const };
  });
