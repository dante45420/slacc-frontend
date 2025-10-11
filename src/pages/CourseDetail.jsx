import { useParams } from "react-router-dom";

export default function CourseDetail() {
  const { id } = useParams();
  return (
    <section className="section">
      <div className="container">
        <h2>Curso #{id}</h2>
        <p>Hello world</p>
      </div>
    </section>
  );
}


