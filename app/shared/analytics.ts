import { createSupabaseServerClient } from "../lib/supabase/server";

export type AnalyticsEventName =
  | "product_viewed"
  | "create_request_clicked"
  | "request_started"
  | "request_submitted"
  | "request_submission_failed"
  | "buyer_message_sent"
  | "admin_status_changed"
  | "quotation_sent";

/**
 * Server-side tracking function.
 * Tracks events to the `analytics_events` table in Supabase.
 */
export async function trackEvent(
  eventName: AnalyticsEventName,
  properties?: Record<string, any>
) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return;

    await supabase.from("analytics_events").insert({
      event_name: eventName,
      properties: properties || {}
    });
  } catch (err) {
    console.error("Failed to track event:", eventName, err);
  }
}
