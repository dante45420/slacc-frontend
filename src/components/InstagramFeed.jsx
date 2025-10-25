import { useEffect, useState } from "react";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function InstagramFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/instagram/recent?limit=3`);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error loading Instagram feed:", e);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Cargando Instagram...</div>;

  return (
    <div className="cards">
      {posts.map(p => (
        <a
          key={p.id}
          href={p.permalink || "https://instagram.com/slacc_cadera"}
          target="_blank"
          rel="noreferrer"
          className="card"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <img
            src={p.media_url}
            alt={p.caption || ""}
            style={{
              width: "100%",
              height: 240,
              objectFit: "cover",
              borderRadius: 8,
              marginBottom: 8,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>📷</span>
            <div style={{ fontWeight: 600 }}>@slacc_cadera</div>
          </div>
          {p.caption ? (
            <p style={{ color: "var(--color-muted)", marginTop: 8 }}>
              {p.caption}
            </p>
          ) : null}
        </a>
      ))}
    </div>
  );
}
