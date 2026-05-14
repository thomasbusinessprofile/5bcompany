import Link from "next/link";
import { listActivitiesGlobal, type ActivityType } from "../../shared/crm-data";
import { ActivityTimeline } from "./ActivityTimeline";

export const metadata = { title: "Activities | Admin", robots: { index: false } };

type Props = { searchParams: Promise<{ type?: string }> };

const FILTERS: { value?: ActivityType; label: string }[] = [
  { label: "All" },
  { value: "call", label: "Calls" },
  { value: "email", label: "Emails" },
  { value: "meeting", label: "Meetings" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "note", label: "Notes" },
  { value: "task", label: "Tasks" }
];

export default async function ActivitiesPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const activeType = FILTERS.find((f) => f.value === type)?.value;
  const activities = await listActivitiesGlobal({ type: activeType, limit: 200 });

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">CRM · Activities</p>
        <h1>Activity feed ({activities.length})</h1>
        <p>Every call, email, meeting, WhatsApp, note and task logged across the team.</p>
      </section>

      <nav className="filter-bar" aria-label="Activity filter">
        {FILTERS.map((f) => {
          const href = f.value ? `/admin/activities?type=${f.value}` : "/admin/activities";
          const active = activeType === f.value;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={active ? "filter-chip active" : "filter-chip"}
              href={href}
              key={f.label}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <section className="page-card">
        <ActivityTimeline activities={activities} showContact redirectTo="/admin/activities" />
      </section>
    </div>
  );
}
