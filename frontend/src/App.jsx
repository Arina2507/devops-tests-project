import { useEffect, useState } from "react";
import "./App.css";

function formatDateTime(value) {
  return new Date(value).toLocaleString();
}

function toLocalInputValue(date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

async function getJson(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function App() {
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [userId, setUserId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    const nextUsers = await getJson("/users");
    setUsers(nextUsers);
    if (nextUsers.length > 0) {
      setUserId((currentValue) => currentValue || nextUsers[0].id);
    }
  }

  async function loadResources() {
    const nextResources = await getJson("/resources");
    setResources(nextResources);
    if (nextResources.length > 0) {
      setResourceId((currentValue) => currentValue || nextResources[0].id);
    }
  }

  async function loadReservations() {
    const nextReservations = await getJson("/reservations");
    setReservations(nextReservations);
  }

  useEffect(() => {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() + 1, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    setStartAt(toLocalInputValue(startDate));
    setEndAt(toLocalInputValue(endDate));

    Promise.all([loadUsers(), loadResources(), loadReservations()])
      .catch((error) => {
        setMessage(error.message);
        setMessageType("error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      await getJson("/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          resourceId,
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          idempotencyKey: `${userId}-${resourceId}-${startAt}-${endAt}`
        })
      });

      await loadReservations();
      setMessage("Reservation created");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    }
  }

  const emptyData = users.length === 0 || resources.length === 0;

  return (
    <div className="page-shell">
      <div className="background-orb orb-left"></div>
      <div className="background-orb orb-right"></div>

      <main className="layout">
        <section className="hero-card">
          <p className="eyebrow">Reservation System</p>
          <h1>Bookings with a clean workflow</h1>
          <p className="lead">
            Small frontend for the current backend. It lets you create reservations and review the existing schedule in one screen.
          </p>

          <div className="hero-stats">
            <article>
              <span>{users.length}</span>
              <p>Users</p>
            </article>
            <article>
              <span>{resources.length}</span>
              <p>Resources</p>
            </article>
            <article>
              <span>{reservations.length}</span>
              <p>Reservations</p>
            </article>
          </div>
        </section>

        <section className="panel form-panel">
          <div className="panel-head">
            <p className="eyebrow">Create</p>
            <h2>New reservation</h2>
          </div>

          {loading ? <p className="info-text">Loading data...</p> : null}

          {!loading && emptyData ? (
            <div className="notice-card warning">
              <strong>No demo data found</strong>
              <p>Run the seed script first so the form has users and resources to choose from.</p>
            </div>
          ) : null}

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>User</span>
              <select value={userId} onChange={(event) => setUserId(event.target.value)} disabled={loading || emptyData}>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Resource</span>
              <select value={resourceId} onChange={(event) => setResourceId(event.target.value)} disabled={loading || emptyData}>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} · {resource.type}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Start time</span>
              <input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} disabled={loading || emptyData} />
            </label>

            <label className="field">
              <span>End time</span>
              <input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} disabled={loading || emptyData} />
            </label>

            <button className="primary-button" type="submit" disabled={loading || emptyData}>
              Create reservation
            </button>
          </form>

          {message ? <p className={`message ${messageType}`}>{message}</p> : null}
        </section>

        <section className="panel list-panel">
          <div className="panel-head row-between">
            <div>
              <p className="eyebrow">Overview</p>
              <h2>Current reservations</h2>
            </div>
            <button className="secondary-button" type="button" onClick={loadReservations}>
              Refresh
            </button>
          </div>

          {reservations.length === 0 ? (
            <div className="notice-card">
              <strong>No reservations yet</strong>
              <p>Create the first one from the form on the left.</p>
            </div>
          ) : (
            <ul className="reservation-list">
              {reservations.map((reservation) => (
                <li key={reservation.id} className="reservation-card">
                  <div className="reservation-top">
                    <strong>{reservation.resource.name}</strong>
                    <span className="status-chip">{reservation.status}</span>
                  </div>
                  <div className="reservation-details">
                    <span>User: {reservation.user.name}</span>
                    <span>Type: {reservation.resource.type}</span>
                    <span>From: {formatDateTime(reservation.startAt)}</span>
                    <span>To: {formatDateTime(reservation.endAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;