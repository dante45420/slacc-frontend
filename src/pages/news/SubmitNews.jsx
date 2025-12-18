import { useState } from "react";
import { apiPostForm } from "../../api/client";
import {
  Section,
  Container,
  Card,
  Input,
  Textarea,
  Select,
  Button,
  Alert,
  useToast,
} from "../../components/ui";

export default function SubmitNews() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("articulos-cientificos");
  const [imageFile, setImageFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const form = new FormData();
    form.append("title", title);
    form.append("excerpt", excerpt);
    form.append("content", content);
    form.append("category", category);
    if (imageFile) form.append("image", imageFile);

    try {
      const data = await apiPostForm("/news", form);
      toast.success("Enviado para revisión");
      setMsg(`Enviado para revisión (id ${data.id}).`);
      setTitle("");
      setExcerpt("");
      setContent("");
      setCategory("articulos-cientificos");
      setImageFile(null);
      if (e.target.image) e.target.image.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Error al enviar");
      setMsg("Error al enviar el artículo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section variant="default" padding="lg">
      <Container size="default">
        <div className="form-wrapper-centered">
          <div className="mb-6">
            <h1 className="mb-2">Enviar artículo</h1>
            <p className="text-muted">
              Tu envío quedará en estado “Pendiente” hasta revisión.
            </p>
          </div>

          <form onSubmit={submit}>
            <Card className="mb-4">
              <div className="grid grid-2 gap-4 mb-4">
                <Select
                  label="Categoría"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="articulos-cientificos">
                    Artículos científicos
                  </option>
                  <option value="articulos-destacados">
                    Artículos destacados
                  </option>
                  <option value="editoriales">Editoriales</option>
                </Select>

                <Input
                  label="Imagen (opcional)"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <Input
                label="Título"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />

              <Textarea
                label="Resumen"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                rows={3}
              />

              <Textarea
                label="Contenido"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={8}
              />

              <div className="flex justify-end mt-4">
                <Button type="submit" loading={loading} disabled={loading}>
                  Enviar
                </Button>
              </div>
            </Card>

            {msg ? <Alert variant="info">{msg}</Alert> : null}
          </form>
        </div>
      </Container>
    </Section>
  );
}
