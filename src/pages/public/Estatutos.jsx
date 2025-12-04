import { Section, Container } from "../../components/ui";

export default function Estatutos() {
  return (
    <Section>
      <Container size="lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Estatutos, Misión y Visión
          </h1>
          <p className="text-xl text-gray-600">
            Fundamentos de la Sociedad Latinoamericana de Cirugía Cardiovascular
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-4 text-primary">Misión</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Promover la excelencia en la cirugía cardiovascular en América
              Latina a través de la educación continua, la investigación
              científica y el intercambio de conocimientos entre profesionales
              de la salud cardiovascular.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-4 text-primary">Visión</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Ser la organización líder en cirugía cardiovascular en América
              Latina, reconocida por su contribución al avance de la medicina
              cardiovascular, la formación de especialistas de alto nivel y la
              mejora de los resultados clínicos en nuestra región.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-4 text-primary">Estatutos</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Capítulo I: Naturaleza y Objetivos
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  La Sociedad Latinoamericana de Cirugía Cardiovascular (SLACC)
                  es una asociación científica sin fines de lucro que agrupa a
                  cirujanos cardiovasculares de América Latina.
                </p>
                <h4 className="font-semibold mb-2">Objetivos:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    Fomentar el desarrollo de la cirugía cardiovascular en
                    América Latina
                  </li>
                  <li>
                    Promover la educación médica continua y la investigación
                    científica
                  </li>
                  <li>
                    Establecer estándares de excelencia en la práctica
                    quirúrgica
                  </li>
                  <li>
                    Facilitar el intercambio de experiencias entre profesionales
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Capítulo II: Membresía
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  La membresía está abierta a cirujanos cardiovasculares,
                  residentes y profesionales relacionados con la especialidad
                  que cumplan con los requisitos establecidos por la sociedad.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Capítulo III: Estructura Organizativa
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  La SLACC está dirigida por un Consejo Directivo elegido
                  democráticamente por sus miembros, conformado por Presidente,
                  Vicepresidente, Secretario, Tesorero y vocales.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Capítulo IV: Actividades
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    Organización de congresos, simposios y cursos de formación
                  </li>
                  <li>Publicación de material científico y educativo</li>
                  <li>
                    Establecimiento de programas de intercambio profesional
                  </li>
                  <li>
                    Colaboración con instituciones nacionales e internacionales
                  </li>
                </ul>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 italic">
                  Para consultar los estatutos completos y actualizaciones, por
                  favor contacte a la secretaría de la sociedad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
