import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

import {
  ENQUIRY_SERVICES,
  PROPERTY_TYPES,
  enquirySchema,
  submitEnquiry,
  type EnquiryInput,
} from "@/lib/enquiry";
import { site } from "@/config/site";

/* A rule under the text rather than a boxed input. The contact panel is
   inverted, so everything here is light-on-dark. */
const field =
  "w-full bg-transparent border-b border-background/25 py-3 text-background placeholder:text-background/40 " +
  "outline-none transition-colors focus:border-accent hover:border-background/50 " +
  "aria-[invalid=true]:border-destructive";

const labelStyle =
  "block text-[11px] uppercase tracking-[0.28em] font-medium text-background/55 mb-2";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-xs text-accent">
      {message}
    </p>
  );
}

export function EnquiryForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { service: "kitchen", propertyType: "residential" },
  });

  const onSubmit = async (data: EnquiryInput) => {
    try {
      await submitEnquiry({ data });
      setSent(true);
      toast.success("Enquiry received", {
        description: "We'll be in touch shortly.",
      });
    } catch {
      toast.error("That didn't send", {
        description: `Please call ${site.phoneDisplay} or email ${site.email}.`,
      });
    }
  };

  if (sent) {
    return (
      <div className="border border-background/25 p-10 md:p-14" role="status">
        <h3 className="text-3xl md:text-4xl">Thanks — we've got it.</h3>
        <p className="mt-4 text-background/70 leading-relaxed max-w-md">
          Your enquiry is with the workshop. We read every one personally and will get back to you
          to arrange a measure or put a quote together.
        </p>
        <p className="mt-6 text-sm text-background/60">
          In a hurry?{" "}
          <a href={site.phoneHref} className="text-accent hover:underline">
            {site.phoneDisplay}
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8">
      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <label htmlFor="name" className={labelStyle}>
            Name
          </label>
          <input
            id="name"
            autoComplete="name"
            className={field}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          <FieldError id="name-error" message={errors.name?.message} />
        </div>

        <div>
          <label htmlFor="email" className={labelStyle}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={field}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>

        <div>
          <label htmlFor="phone" className={labelStyle}>
            Phone <span className="normal-case tracking-normal opacity-60">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className={field}
            {...register("phone")}
          />
        </div>

        <div>
          <label htmlFor="suburb" className={labelStyle}>
            Suburb <span className="normal-case tracking-normal opacity-60">(optional)</span>
          </label>
          <input id="suburb" className={field} {...register("suburb")} />
        </div>

        <div>
          <label htmlFor="service" className={labelStyle}>
            What do you need?
          </label>
          <select
            id="service"
            className={`${field} [&>option]:bg-[#211f1c] [&>option]:text-[#fbfaf8]`}
            {...register("service")}
          >
            {ENQUIRY_SERVICES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="propertyType" className={labelStyle}>
            Project type
          </label>
          <select
            id="propertyType"
            className={`${field} [&>option]:bg-[#211f1c] [&>option]:text-[#fbfaf8]`}
            {...register("propertyType")}
          >
            {PROPERTY_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelStyle}>
          About the job
        </label>
        <textarea
          id="message"
          rows={4}
          className={`${field} resize-none`}
          placeholder="The space, roughly what you're after, and when you'd like it done."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
        <FieldError id="message-error" message={errors.message?.message} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group inline-flex items-center justify-center gap-3 bg-background text-foreground px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              Sending
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
            </>
          ) : (
            <>
              Send enquiry
              <ArrowRight
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </>
          )}
        </button>
        <p className="text-xs text-background/60 leading-relaxed max-w-xs">
          Or call{" "}
          <a href={site.phoneHref} className="text-background hover:text-accent transition-colors">
            {site.phoneDisplay}
          </a>{" "}
          — you'll get someone from the workshop.
        </p>
      </div>
    </form>
  );
}
