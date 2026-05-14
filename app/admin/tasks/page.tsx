import { listOpenTasks } from "../../shared/crm-data";
import { ActivityTimeline } from "../activities/ActivityTimeline";

export const metadata = { title: "Tasks | Admin", robots: { index: false } };

export default async function AdminTasksPage() {
  const tasks = await listOpenTasks();
  const now = new Date();
  const overdue = tasks.filter((t) => t.dueAt && new Date(t.dueAt) < now);
  const upcoming = tasks.filter((t) => !overdue.includes(t));

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">CRM · Tasks</p>
        <h1>Open tasks ({tasks.length})</h1>
        <p>Follow-ups, callbacks, and other work that hasn't been completed yet.</p>
      </section>

      {overdue.length > 0 ? (
        <section className="page-card overdue-card">
          <h2>Overdue ({overdue.length})</h2>
          <ActivityTimeline activities={overdue} showContact redirectTo="/admin/tasks" />
        </section>
      ) : null}

      <section className="page-card">
        <h2>Upcoming</h2>
        <ActivityTimeline activities={upcoming} showContact redirectTo="/admin/tasks" />
      </section>
    </div>
  );
}
