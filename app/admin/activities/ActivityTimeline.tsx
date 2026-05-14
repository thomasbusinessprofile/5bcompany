import Link from "next/link";
import type { CrmActivity } from "../../shared/crm-data";
import { deleteActivity, toggleTaskComplete } from "./actions";

const TYPE_LABEL: Record<string, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  whatsapp: "WhatsApp",
  note: "Note",
  task: "Task"
};

const TYPE_ICON: Record<string, string> = {
  call: "📞",
  email: "✉️",
  meeting: "🗓",
  whatsapp: "💬",
  note: "📝",
  task: "✅"
};

function fmt(d: string) {
  return new Date(d).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function ActivityTimeline({
  activities,
  redirectTo,
  showContact = false
}: {
  activities: CrmActivity[];
  redirectTo?: string;
  showContact?: boolean;
}) {
  if (activities.length === 0) {
    return <p className="muted">No activities yet.</p>;
  }
  return (
    <ol className="activity-timeline">
      {activities.map((a) => {
        const overdue =
          a.type === "task" && !a.completedAt && a.dueAt && new Date(a.dueAt) < new Date();
        return (
          <li className={`activity-item ${a.completedAt ? "done" : ""} ${overdue ? "overdue" : ""}`} key={a.id}>
            <span className="activity-icon" aria-hidden="true">{TYPE_ICON[a.type] ?? "•"}</span>
            <div className="activity-body">
              <div className="activity-head">
                <strong>{TYPE_LABEL[a.type]}</strong>
                {a.subject ? <span> · {a.subject}</span> : null}
                {showContact && a.contactName ? (
                  <Link className="muted activity-contact" href={`/admin/contacts/${a.contactId}`}>
                    {a.contactName}
                  </Link>
                ) : null}
              </div>
              {a.body ? <p className="activity-text">{a.body}</p> : null}
              <p className="activity-meta">
                <time>{fmt(a.occurredAt)}</time>
                {a.dueAt ? <span> · Due {fmt(a.dueAt)}</span> : null}
                {a.completedAt ? <span> · Done {fmt(a.completedAt)}</span> : null}
              </p>
            </div>
            <div className="activity-actions">
              {a.type === "task" ? (
                <form action={toggleTaskComplete}>
                  <input name="activity_id" type="hidden" value={a.id} />
                  {redirectTo ? <input name="redirect_to" type="hidden" value={redirectTo} /> : null}
                  <button className="ghost-link" type="submit">
                    {a.completedAt ? "Reopen" : "Mark done"}
                  </button>
                </form>
              ) : null}
              <form action={deleteActivity}>
                <input name="activity_id" type="hidden" value={a.id} />
                {redirectTo ? <input name="redirect_to" type="hidden" value={redirectTo} /> : null}
                <button className="ghost-link danger" type="submit" aria-label="Delete activity">×</button>
              </form>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

