
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/moods";

const moods = [
  { emoji: "😊", name: "Happy", color: "#ffe5a8" },
  { emoji: "😌", name: "Calm", color: "#d9e9ff" },
  { emoji: "😐", name: "Okay", color: "#e8ddff" },
  { emoji: "😔", name: "Sad", color: "#d7e8e8" },
  { emoji: "😣", name: "Stressed", color: "#ffd9df" },
];

function formatEntry(entry) {
  const date = new Date(entry.createdAt);

  return {
    ...entry,
    date: date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function App() {
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load moods from MongoDB through the backend
  useEffect(() => {
    async function fetchMoods() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not load moods.");
        }

        const data = await response.json();
        setEntries(data.map(formatEntry));
      } catch (error) {
        alert("Could not load moods. Please check the backend server.");
      } finally {
        setLoading(false);
      }
    }

    fetchMoods();
  }, []);

  // Save a mood to MongoDB
  
async function saveMood() {
  if (!selectedMood) {
    alert("Pick a mood first 💗");
    return;
  }

  try {
    const isEditing = editingId !== null;

    const response = await fetch(
      isEditing ? `${API_URL}/${editingId}` : API_URL,
      {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood: selectedMood,
          note: note.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not save mood.");
    }

    const savedEntry = formatEntry(data);

    if (isEditing) {
      setEntries((previousEntries) =>
        previousEntries.map((entry) =>
          entry._id === editingId ? savedEntry : entry
        )
      );
    } else {
      setEntries((previousEntries) => [
        savedEntry,
        ...previousEntries,
      ]);
    }

    setSelectedMood("");
    setNote("");
    setEditingId(null);
  } catch (error) {
    alert(error.message || "Could not save mood. Please try again.");
  }
}

function editEntry(entry) {
  setEditingId(entry._id);
  setSelectedMood(entry.mood);
  setNote(entry.note || "");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}


  // Delete a mood from MongoDB
  async function deleteEntry(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete mood.");
      }

      setEntries((previousEntries) =>
        previousEntries.filter((entry) => entry._id !== id)
      );
    } catch (error) {
      alert(error.message || "Could not delete mood. Please try again.");
    }
  }

  const chosenMood = moods.find(
    (mood) => mood.name === selectedMood
  );

  return (
    <main className="app">
      <nav className="navbar">
        <a className="logo" href="#">moodly<span>.</span></a>
        <span className="nav-note">your little corner of calm ♡</span>
      </nav>

      <section className="hero">
        <div className="eyebrow">✦ YOUR DAILY PAUSE ✦</div>
        <h1>A little check-in<br />with <span>yourself.</span></h1>
        <p>No pressure to be anything. Just notice how you feel today.</p>
      </section>

      <section className="checkin card">
        <div className="section-heading">
          <div>
            <span className="step-label">01 — CHECK IN</span>
            <h2>How are you feeling?</h2>
          </div>
          <span className="tiny-heart">♡</span>
        </div>

        <div className="mood-grid">
          {moods.map((mood) => (
            <button
              className={`mood-option ${
                selectedMood === mood.name ? "selected" : ""
              }`}
              key={mood.name}
              onClick={() => setSelectedMood(mood.name)}
              style={{ "--mood-color": mood.color }}
              type="button"
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span>{mood.name}</span>
            </button>
          ))}
        </div>

        <label className="note-label" htmlFor="mood-note">
          <span>02 — A LITTLE NOTE</span>
          <span className="optional">OPTIONAL</span>
        </label>

        <textarea
          id="mood-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="What's on your mind? Anything is okay..."
          rows="3"
          maxLength={500}
        />

        <button
          className="save-button"
          onClick={saveMood}
          type="button"
          disabled={loading}
        >
          {editingId !== null ? "Update mood" : "Save today's mood"} <span>♡</span>
        </button>
        {editingId !== null && (
        <button
          className="edit-button"
          type="button"
          onClick={() => {
           setEditingId(null);
           setSelectedMood("");
           setNote("");
          }}
        >
          Cancel editing
        </button>
        )}

        <p className="privacy-note">
          A small moment for you, just as you are.
        </p>
      </section>

      <section className="dashboard">
        <div className="section-heading history-heading">
          <div>
            <span className="step-label">03 — YOUR JOURNEY</span>
            <h2>Your mood diary</h2>
          </div>
          <span className="entry-count">
            {entries.length} check-ins
          </span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🌷</span>
            <span className="stat-number">{entries.length}</span>
            <span className="stat-caption">Total check-ins</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">💗</span>
            <span className="stat-number">
              {entries.filter((entry) => entry.mood === "Happy").length}
            </span>
            <span className="stat-caption">Happy moments</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">☁️</span>
            <span className="stat-number">
              {entries.length
                ? entries.filter(
                    (entry) => entry.date === entries[0].date
                  ).length
                : 0}
            </span>
            <span className="stat-caption">Today's entries</span>
          </div>
        </div>

        <div className="history-list">
          {loading ? (
            <div className="empty-state">
              <span>🌸</span>
              <h3>Opening your diary...</h3>
              <p>Just a moment, we're fetching your moods.</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="empty-state">
              <span>🌸</span>
              <h3>Your story starts here</h3>
              <p>
                Your saved moods will find a home here.
                Check in when you're ready.
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const mood = moods.find(
                (item) => item.name === entry.mood
              );

              return (
                <article className="history-entry" key={entry._id}>
                  <div
                    className="history-emoji"
                    style={{
                      backgroundColor: mood?.color || "#f7e8ef",
                    }}
                  >
                    {mood?.emoji}
                  </div>

                  <div className="entry-details">
                    <strong>{entry.mood}</strong>
                    <span>{entry.date} · {entry.time}</span>
                    {entry.note && <p>{entry.note}</p>}
                  </div>

                  <button
                   className="edit-button"
                   onClick={() => editEntry(entry)}
                   type="button"
                  >
                   Edit
                  </button>


                  <button
                    className="delete-button"
                    onClick={() => deleteEntry(entry._id)}
                    aria-label={`Delete ${entry.mood} entry`}
                    title="Delete entry"
                    type="button"
                  >
                    ×
                  </button>
                </article>
              );
            })
          )}
        </div>
      </section>

      <footer>
        made with a little love <span>♡</span> — moodly
      </footer>
    </main>
  );
}

export default App;
