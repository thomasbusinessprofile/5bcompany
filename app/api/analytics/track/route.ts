import { NextResponse } from "next/server";
import { trackEvent, type AnalyticsEventName } from "../../../shared/analytics";

export async function POST(request: Request) {
  try {
    const { event_name, properties } = await request.json();

    if (!event_name) {
      return NextResponse.json({ error: "Missing event_name" }, { status: 400 });
    }

    await trackEvent(event_name as AnalyticsEventName, properties);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
