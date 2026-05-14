import Link from "next/link";
import { listOpenTasks } from "../../shared/crm-data";
import { ActivityTimeline } from "../activities/ActivityTimeline";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tasks | Admin", robots: { index: false } };

export default async function AdminTasksPage() {
  const tasks = await listOpenTasks();
  const now = new Date();
  const overdue = tasks.filter((t) => t.dueAt && new Date(t.dueAt) < now);
  const dueToday = tasks.filter((t) => {
    if (!t.dueAt || overdue.includes(t)) return false;
    const d = new Date(t.dueAt);
    return d.toDateString() === now.toDateString();
  });
  const upcoming = tasks.filter((t) => !overdue.includes(t) && !dueToday.includes(t));

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">Tasks</p>
        <h1>Open tasks ({tasks.length})</h1>
        <p>Follow-ups, callbacks, sample shipments — everything that needs your action.</p>
      </section>

      {tasks.length === 0 ? (
        <section className="page-card">
          <div className="empty-state">
            <h2>You're all caught up</h2>
            <p>
              No open tasks. Tasks are created automatically when you log a "task" activity
              on a contact or deal, or via workflow automations.{" "}
              <Link className="auth-link" href="/admin/contacts">Open a contact to log one →</Link>
            </p>
          </div>
        </section>
      ) : (
        <>
          {overdue.length > 0 ? (
            <section className="page-card overdue-card">
              <h2>Overdue ({overdue.length})</h2>
              <ActivityTimeline activities={overdue} redirectTo="/admin/tasks" showContact />
            </section>
          ) : null}

          {dueToday.length > 0 ? (
            <section className="page-card">
              <h2>Due today ({dueToday.length})</h2>
              <ActivityTimeline activities={dueToday} redirectTo="/admin/tasks" showContact />
            </section>
          ) : null}

          <section className="page-card">
            <h2>Upcoming ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="muted">No upcoming tasks.</p>
            ) : (
              <ActivityTimeline activities={upcoming} redirectTo="/admin/tasks" showContact />
            )}
          </section>
        </>
      )}
    </div>
  );
}
