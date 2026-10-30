import React, { useState } from "react";
import {
  HeartHandshake,
  BookOpen,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Library,
  GraduationCap,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { useStore } from "../lib/store";
import { generateReference, rateCheck, validateDonationInput } from "../lib/api";
import { CondicionMaterial, Donation, TipoMaterial } from "../lib/data";

interface DonateViewProps {
  onBack: () => void;
  onGoToAdmin?: () => void;
}

export const DonateView: React.FC<DonateViewProps> = ({ onBack, onGoToAdmin }) => {
  const { state, dispatch } = useStore();

  const [nombreDonante, setNombreDonante] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [tipoOrigen, setTipoOrigen] = useState<
    "biblioteca_particular" | "estudiante_egresado" | "profesor_docente" | "institucion"
  >("biblioteca_particular");

  const [tipoMaterial, setTipoMaterial] = useState<TipoMaterial>("libro");
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [cantidadEstimada, setCantidadEstimada] = useState(1);
  const [categoriaId, setCategoriaId] = useState(state.categories[0]?.id || "c-lit");
  const [condicion, setCondicion] = useState<CondicionMaterial>("muy_bueno");
  const [descripcion, setDescripcion] = useState("");
  const [zona, setZona] = useState("");
  const [comentarios, setComentarios] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedDonation, setSubmittedDonation] = useState<Donation | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rl = rateCheck(`don:${telefono}`, 3, 10 * 60 * 1000);
    if (!rl.allowed) {
      setFormErrors({
        general: `Has enviado varias propuestas recientemente. Por favor espera ${rl.retryInSec} segundos antes de enviar otra donación.`,
      });
      return;
    }

    const inputData = {
      nombreDonante,
      telefono,
      email: email.trim() || undefined,
      tipoOrigen,
      tipoMaterial,
      titulo,
      autor: autor.trim() || undefined,
      cantidadEstimada,
      descripcion,
      categoriaId,
      condicion,
      zona,
      comentarios: comentarios.trim() || undefined,
    };

    const validation = validateDonationInput(inputData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const ref = generateReference("DON");
    const today = new Date().toISOString().slice(0, 10);

    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      ref,
      nombreDonante: nombreDonante.trim(),
      telefono: telefono.trim(),
      email: email.trim() || undefined,
      tipoOrigen,
      tipoMaterial,
      titulo: titulo.trim(),
      autor: autor.trim() || undefined,
      cantidadEstimada: Number(cantidadEstimada) || 1,
      descripcion: descripcion.trim(),
      categoriaId,
      condicion,
      zona: zona.trim(),
      comentarios: comentarios.trim() || undefined,
      estado: "pendiente",
      fechaCreacion: today,
      fechaActualizacion: today,
      notasInternas: "Propuesta registrada desde formulario web. Pendiente de contacto con donante.",
    };

    dispatch({ type: "SUBMIT_DONATION", donation: newDonation });
    setSubmittedDonation(newDonation);
  };

  // Pantalla de Confirmación de Donación Enviada
  if (submittedDonation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-900 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-emerald-700" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-900 bg-emerald-100/80 px-3 py-1 rounded-full font-bold">
            Propuesta {submittedDonation.ref}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display">
            ¡Muchas gracias por ofrecer tus libros!
          </h2>
          <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            Hemos recibido tu oferta para <strong>{submittedDonation.titulo}</strong> ({submittedDonation.cantidadEstimada} {submittedDonation.cantidadEstimada === 1 ? "ejemplar" : "ejemplares"}).
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 text-left max-w-md mx-auto space-y-3 text-xs">
          <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
            ¿Qué sucede a continuación? (Procedimiento operativo §6.2)
          </h4>
          <ol className="space-y-2 text-stone-600 list-decimal list-inside leading-relaxed">
            <li>El operador revisará la oferta y te contactará por <strong>WhatsApp ({submittedDonation.telefono})</strong>.</li>
            <li>Coordinarán un punto o momento conveniente en tu zona (<strong>{submittedDonation.zona}</strong>).</li>
            <li>Una vez recibidos, la organización clasifica, revisa y fotografía los ejemplares para publicarlos en el catálogo oficial.</li>
          </ol>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors"
          >
            Volver al catálogo
          </button>

          {onGoToAdmin && (
            <button
              onClick={onGoToAdmin}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Ver donación en Mesa Interna</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 pb-24 md:pb-16">
      
      {/* Cabecera Editorial */}
      <div className="space-y-3 text-left">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-950 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full">
          <HeartHandshake className="w-3.5 h-3.5 text-emerald-800" />
          <span>Donación de libros y textos de estudio</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight font-display">
          Donar libros o materiales de estudio
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-stone-600 leading-relaxed">
          Los libros quietos en bibliotecas particulares y los textos de estudio universitario o de profesorado que ya no utilizas pueden transformar la trayectoria de otro lector o estudiante.
        </p>

        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed">
          <strong>Nota de curaduría:</strong> Enviar este formulario inicia una conversación con el equipo de CIRCULA. La organización recibe, revisa y cataloga los materiales antes de publicarlos en el catálogo oficial (§1).
        </div>
      </div>

      {/* Formulario Conciso según §11 */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-8 shadow-xs space-y-6 text-left">
        
        {formErrors.general && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formErrors.general}</span>
          </div>
        )}

        {/* 1. Procedencia */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
            1. Procedencia de la donación
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setTipoOrigen("biblioteca_particular");
                setTipoMaterial("libro");
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                tipoOrigen === "biblioteca_particular"
                  ? "border-emerald-700 bg-emerald-50/70 shadow-2xs"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }`}
            >
              <Library className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-stone-900 block">Biblioteca particular</span>
                <span className="text-[11px] text-stone-500 leading-tight block mt-0.5">
                  Libros de lectura general, novelas, clásicos o ensayos que ya no lees.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setTipoOrigen("estudiante_egresado");
                setTipoMaterial("texto_estudio");
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                tipoOrigen === "estudiante_egresado" || tipoOrigen === "profesor_docente"
                  ? "border-emerald-700 bg-emerald-50/70 shadow-2xs"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }`}
            >
              <GraduationCap className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-stone-900 block">Estudio o profesorado</span>
                <span className="text-[11px] text-stone-500 leading-tight block mt-0.5">
                  Manuales universitarios, formación docente o apuntes de materias aprobadas.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Tipo y Detalles del material (§11) */}
        <div className="space-y-4 pt-2 border-t border-stone-100">
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
            2. Descripción del material ofrecido
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tipo de material * (§11)
              </label>
              <select
                value={tipoMaterial}
                onChange={(e) => setTipoMaterial(e.target.value as TipoMaterial)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
              >
                <option value="libro">Libro de lectura general (Novela, Ensayo, Poesía)</option>
                <option value="texto_estudio">Texto de estudio / Manual universitario o docente</option>
                <option value="apuntes_catedra">Apuntes de cátedra / Cuadernillos de examen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Cantidad estimada de ejemplares *
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={cantidadEstimada}
                onChange={(e) => setCantidadEstimada(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-mono font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Título del libro o descripción del lote *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Rayuela / Lote de 3 libros de Pedagogía..."
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
              />
              {formErrors.titulo && (
                <p className="text-[11px] text-red-600 mt-0.5">{formErrors.titulo}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Autor(es) o Editorial
              </label>
              <input
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Ej. Julio Cortázar / Cengage..."
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Categoría temática
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
              >
                {state.categories
                  .filter((c) => c.activo)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Estado aproximado de conservación
              </label>
              <select
                value={condicion}
                onChange={(e) => setCondicion(e.target.value as CondicionMaterial)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
              >
                <option value="excelente">Excelente (prácticamente nuevo)</option>
                <option value="muy_bueno">Muy bueno (mínimas señales de lectura)</option>
                <option value="bueno">Bueno (subrayados o anotaciones en lápiz)</option>
                <option value="regular">Aceptable (usado, completo y legible)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Descripción breve del material * (§11)
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Edición en tapa blanda, sin hojas sueltas, pertenecía a una biblioteca familiar..."
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
            />
            {formErrors.descripcion && (
              <p className="text-[11px] text-red-600 mt-0.5">{formErrors.descripcion}</p>
            )}
          </div>
        </div>

        {/* 3. Datos de Contacto y Zona (§11) */}
        <div className="space-y-4 pt-2 border-t border-stone-100">
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
            3. Datos de contacto y ubicación
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tu nombre *
              </label>
              <input
                type="text"
                value={nombreDonante}
                onChange={(e) => setNombreDonante(e.target.value)}
                placeholder="Ej. Beatriz Méndez"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
              />
              {formErrors.nombreDonante && (
                <p className="text-[11px] text-red-600 mt-0.5">{formErrors.nombreDonante}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                <span>Teléfono / WhatsApp * (§11)</span>
                <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+598 99 123 456"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-mono font-medium"
              />
              {formErrors.telefono && (
                <p className="text-[11px] text-red-600 mt-0.5">{formErrors.telefono}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Zona aproximada (barrio o localidad) * (§11)
              </label>
              <input
                type="text"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                placeholder="Ej. Cordón, Pocitos, Centro, Unión..."
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
              />
              <p className="text-[11px] text-stone-400 mt-0.5">
                Solo barrio o zona general. No publiques tu dirección exacta.
              </p>
              {formErrors.zona && (
                <p className="text-[11px] text-red-600 mt-0.5">{formErrors.zona}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Correo electrónico (opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="beatriz@correo.com"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
              />
              {formErrors.email && (
                <p className="text-[11px] text-red-600 mt-0.5">{formErrors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Comentarios adicionales (opcional §11)
            </label>
            <textarea
              rows={2}
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Ej. Horarios preferidos de contacto o si tienes otros libros para sumar..."
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
            />
          </div>
        </div>

        {/* Botones de Envío */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 rounded-xl"
          >
            Volver
          </button>

          <button
            type="submit"
            className="px-6 py-3 text-xs font-black text-white bg-emerald-900 hover:bg-emerald-800 active:bg-emerald-950 rounded-xl shadow-xs transition-all focus-ring flex items-center gap-2"
          >
            <HeartHandshake className="w-4 h-4 text-emerald-300" />
            <span>Enviar propuesta de donación</span>
          </button>
        </div>

      </form>

    </div>
  );
};
