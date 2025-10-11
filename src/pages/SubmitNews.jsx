import { useState } from "react";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function SubmitNews() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    const form = new FormData();
    form.append("title", title);
    form.append("excerpt", excerpt);
    form.append("content", content);
    if (e.target.image.files[0]) form.append("image", e.target.image.files[0]);
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE_URL}/news`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form });
    if (!res.ok) { setMsg("Error al enviar la noticia"); return; }
    const data = await res.json();
    setMsg(`Noticia creada con estado ${data.status} (id ${data.id})`);
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <h2>Subir noticia</h2>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 12 }}>
            <label>Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", padding: 10 }} required />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Resumen</label>
            <input value={excerpt} onChange={e => setExcerpt(e.target.value)} style={{ width: "100%", padding: 10 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Contenido</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: "100%", padding: 10, minHeight: 140 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Imagen (opcional)</label>
            <input name="image" type="file" accept="image/*" />
          </div>
          <button className="btn btn-primary" type="submit">Enviar</button>
        </form>
        {msg ? <p style={{ marginTop: 12 }}>{msg}</p> : null}
      </div>
    </section>
  );
}


