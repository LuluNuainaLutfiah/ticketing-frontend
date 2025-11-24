export default function UserTopbar({ query, setQuery, status, setStatus }) {
  return (
    <div className="user-topbar">
      <div>
        <div className="user-topbar-title">Dashboard</div>
        <div className="user-topbar-sub">
          Welcome back! Here's your ticket overview.
        </div>
      </div>

      <div className="user-topbar-right">
        <input
          className="user-search"
          placeholder="Search tickets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="user-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="progress">In Progress</option>
          <option value="done">Resolved</option>
        </select>
      </div>
    </div>
  );
}
