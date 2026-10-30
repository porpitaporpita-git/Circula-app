import React, { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  BookOpen,
  Calendar,
  CheckCircle2,
  Shield,
  History,
  QrCode,
  AlertCircle,
  GraduationCap,
  MessageCircle,
  Clock,
} from "lucide-react";
import { useStore } from "../lib/store";
import { generatePin, generateReference, rateCheck, validateRequestInput } from "../lib/api";
import { Material, Request } from "../lib/data";
import { DigitalPassModal } from "../components/DigitalPassModal";

interface MaterialViewProps {
  id: string;
  onBack: () => void;
  onGoToAdmin?: () => void;
}

const CONDICION_DETALLE: Record<string, { label: string; desc: string }> = {
  excelente: {
    label: "Excelente estado",
    desc: "Sin marcas, roturas ni anotaciones. Prácticamente nuevo.",
  },
  muy_bueno: {
    label: "Muy buen estado",
    desc: "Encuadernación firme, leves señales de lectura sin hojas sueltas ni faltantes.",
  },
  bueno: {
    label: "Buen estado",
    desc: "Puede contener algunos subrayados útiles o anotaciones en márgenes que no impiden la lectura.",
  },
  regular: {
    label: "Aceptable / Leído",
    desc: "Signos visibles de uso intenso o paso del tiempo, pero 100% completo y legible.",
  },
};

const AMBITO_LABEL: Record<string, string> = {
  lectura_general: "Lectura general & Literatura",
  universitario: "Estudio universitario",
  profesorado_docente: "Formación docente & Profesorado",
  secundaria: "Enseñanza media & Bachillerato",
};

export const MaterialView: React.FC<MaterialViewProps> = ({ id, onBack, onGoToAdmin }) => {
  const { state, dispatch } = useStore();
  const material = state.materials.find((m) => m.id === id);

  // Estados del modal de solicitud (§12)
  const [modalOpen, setModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [zona, setZona] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activePassRequest, setActivePassRequest] = useState<Request | null>(null);

  if (!material) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Material no encontrado</h2>
        <p className="text-stone-500 text-sm">
          El material que buscas no existe o ha sido retirado del catálogo.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const categoria = state.categories.find((c) => c.id === material.categoriaId);
  const isDisponible = material.estado === "disponible";

  const existingRequest = state.requests.find(
    (r) => r.materialId === material.id && (r.estado === "reservada" || r.estado === "coordinacion")
  );

  const handleOpenSolicitud = () => {
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmitSolicitud = (e: React.FormEvent) => {
    e.preventDefault();

    const rl = rateCheck(`req:${telefono}`, 4, 10 * 60 * 1000);
    if (!rl.allowed) {
      setFormErrors({
        general: `Has realizado varias solicitudes recientes. Por favor espera ${rl.retryInSec} segundos antes de solicitar otro material.`,
      });
      return;
    }

    const inputData = {
      materialId: material.id,
      nombreSolicitante: nombre,
      telefono,
      email: email.trim() || undefined,
      zona: zona.trim() || undefined,
      mensaje: mensaje.trim() || undefined,
      consentimiento,
    };

    const validation = validateRequestInput(inputData, material);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const pin = generatePin();
    const ref = generateReference("SOL");
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const fechaExpiracion = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const newRequest: Request = {
      id: `req-${Date.now()}`,
      ref,
      materialId: material.id,
      nombreSolicitante: nombre.trim(),
      telefono: telefono.trim(),
      email: email.trim() || undefined,
      zona: zona.trim() || undefined,
      mensaje: mensaje.trim() || undefined,
      consentimiento: true,
      pin,
      qrToken: `CIRCULA-PASS-${ref}-${pin}`,
      estado: "reservada",
      fechaCreacion: new Date().toISOString().slice(0, 10),
      fechaExpiracion,
      notasInternas: "Solicitud registrada desde formulario web. Coordinar retiro vía WhatsApp.",
    };

    dispatch({ type: "SUBMIT_REQUEST", request: newRequest });
    setModalOpen(false);
    setActivePassRequest(newRequest);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 pb-24 md:pb-16">
      
      {/* Botón de retorno móvil y migas de pan */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900 font-bold py-1.5 px-2 -ml-2 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-stone-400 text-xs">
          <span>Catálogo</span>
          <span>/</span>
          <span>{categoria?.nombre || "General"}</span>
          <span>/</span>
          <span className="font-mono text-stone-700 font-semibold">{material.ref}</span>
        </div>
      </div>

      {/* Grid Principal: Portada + Ficha de Datos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
        
        {/* Columna Izquierda: Portada del libro y Datos técnicos */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs text-center space-y-4">
            
            {/* Visualización de Portada */}
            <div
              className={`w-full aspect-3/4 max-w-[260px] mx-auto rounded-xl bg-gradient-to-br ${material.portadaGradient} text-white p-6 shadow-md flex flex-col justify-between text-left relative overflow-hidden`}
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-200 opacity-90 block font-semibold">
                  {material.ref} · {material.tipo.replace("_", " ")}
                </span>
                <span className="text-[11px] text-stone-200 block font-medium">
                  {categoria?.nombre}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold leading-tight font-display text-white drop-shadow-xs">
                  {material.titulo}
                </h3>
                {material.subtitulo && (
                  <p className="text-xs text-emerald-100/90 mt-1 line-clamp-2">
                    {material.subtitulo}
                  </p>
                )}
                <p className="text-xs text-white/95 mt-2 font-semibold">{material.autor}</p>
                {material.editorial && (
                  <p className="text-[10px] text-stone-300 mt-1 font-mono">
                    {material.editorial}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-white/80 font-mono">
                <span>CIRCULA</span>
                <span>{material.condicion.replace("_", " ").toUpperCase()}</span>
              </div>
            </div>

            {/* Datos Técnicos */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-xs">
              <div className="bg-stone-50 p-2 rounded-xl">
                <span className="text-[10px] text-stone-400 block font-medium">Tipo</span>
                <span className="font-bold text-stone-800 capitalize truncate block">
                  {material.tipo.replace("_", " ")}
                </span>
              </div>
              <div className="bg-stone-50 p-2 rounded-xl">
                <span className="text-[10px] text-stone-400 block font-medium">Páginas</span>
                <span className="font-bold text-stone-800 font-mono tabular-nums">
                  {material.paginas || "—"}
                </span>
              </div>
              <div className="bg-stone-50 p-2 rounded-xl">
                <span className="text-[10px] text-stone-400 block font-medium">Edición</span>
                <span className="font-bold text-stone-800 text-[11px] truncate block">
                  {material.añoEdicion || material.edicion || "—"}
                </span>
              </div>
            </div>

          </div>

          {/* Zona de retiro aproximada (Privacidad §2) */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Zona aproximada para retiro</span>
            </div>
            <h4 className="text-sm font-extrabold text-stone-900">{material.zonaRetiro}</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Por privacidad y seguridad, no publicamos direcciones exactas. La coordinación del punto de entrega específico se realiza directamente por WhatsApp tras confirmar la solicitud.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Metadatos, Descripción y Solicitud */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-8 shadow-xs space-y-6">
            
            {/* Cabecera y Título */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="font-bold text-emerald-900">{categoria?.nombre}</span>
                <span>·</span>
                <span className="text-stone-600">{AMBITO_LABEL[material.ambito] || "General"}</span>
                <span>·</span>
                <span className="font-mono text-stone-400">{material.ref}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight font-display">
                {material.titulo}
              </h1>

              {material.subtitulo && (
                <p className="text-sm sm:text-base text-stone-600 font-medium">
                  {material.subtitulo}
                </p>
              )}

              <p className="text-base sm:text-lg font-bold text-stone-800 pt-1">
                {material.autor}
              </p>
            </div>

            {/* Tarjeta de Materia / Institución / Carrera (si aplica) */}
            {(material.materia || material.carreraProfesorado || material.institucion) && (
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <GraduationCap className="w-4 h-4 text-emerald-800" />
                  <span>Vinculación de estudio:</span>
                </div>
                <div className="text-stone-700 space-y-0.5 pl-5">
                  {material.materia && (
                    <p>Materia / Asignatura: <strong>{material.materia}</strong></p>
                  )}
                  {material.carreraProfesorado && (
                    <p>Carrera / Formación: <strong>{material.carreraProfesorado}</strong></p>
                  )}
                  {material.institucion && (
                    <p>Institución: <strong>{material.institucion}</strong></p>
                  )}
                </div>
              </div>
            )}

            {/* Barra de Estado y Botón de Solicitud */}
            <div className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50 border-stone-200">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500 block">
                  Disponibilidad
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  {isDisponible ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      Disponible para solicitar gratuitamente
                    </span>
                  ) : material.estado === "reservado" ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      En proceso de entrega / reservado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-400"></span>
                      Material ya entregado a otro lector
                    </span>
                  )}
                </div>
              </div>

              <div>
                {isDisponible ? (
                  <button
                    onClick={handleOpenSolicitud}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-extrabold text-white bg-emerald-900 hover:bg-emerald-800 active:bg-emerald-950 rounded-xl shadow-xs transition-all focus-ring flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-300" />
                    <span>Solicitar material</span>
                  </button>
                ) : existingRequest ? (
                  <button
                    onClick={() => setActivePassRequest(existingRequest)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4 text-emerald-800" />
                    <span>Ver pase de retiro activo</span>
                  </button>
                ) : (
                  <span className="text-xs text-stone-500 italic block">
                    No disponible actualmente
                  </span>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Detalles del contenido
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {material.descripcion}
              </p>
            </div>

            {/* Condición y Conservación */}
            <div className="pt-2 border-t border-stone-100 space-y-1">
              <span className="text-xs font-bold text-stone-900 block">
                Estado físico: {CONDICION_DETALLE[material.condicion]?.label}
              </span>
              <p className="text-xs text-stone-500 leading-relaxed">
                {CONDICION_DETALLE[material.condicion]?.desc}
              </p>
            </div>

            {/* Historial de Trazabilidad */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider">
                <History className="w-4 h-4 text-stone-400" />
                <span>Trazabilidad operativa</span>
              </div>

              <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {material.historial.map((hito, idx) => (
                  <div key={idx} className="relative text-xs space-y-0.5">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-700 border-2 border-white shadow-xs"></span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-800">{hito.evento}</span>
                      <span className="text-stone-400 font-mono text-[11px]">{hito.fecha}</span>
                    </div>
                    {hito.detalle && (
                      <p className="text-stone-500 text-[11px]">{hito.detalle}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Garantía de Privacidad */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950">
            <Shield className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Privacidad por diseño (§3 y §14)</p>
              <p className="text-emerald-900/80 leading-relaxed">
                CIRCULA nunca publica públicamente teléfonos, correos ni direcciones de donantes ni de solicitantes. Tu información solo la utiliza el operador para coordinar el retiro del ejemplar.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de Solicitud de Material (según §12) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-emerald-950 text-white p-6">
              <h3 className="text-lg font-bold font-display">Solicitar material para retiro</h3>
              <p className="text-xs text-emerald-200 mt-1">
                {material.titulo} · {material.autor}
              </p>
            </div>

            <form onSubmit={handleSubmitSolicitud} className="p-6 space-y-4">
              
              {formErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formErrors.general}</span>
                </div>
              )}

              {/* Nombre (Obligatorio) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Lucas García"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
                />
                {formErrors.nombreSolicitante && (
                  <p className="text-[11px] text-red-600 mt-0.5">{formErrors.nombreSolicitante}</p>
                )}
              </div>

              {/* Teléfono / WhatsApp (Obligatorio - Canal principal §12) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                  <span>Teléfono o WhatsApp * (Canal de coordinación)</span>
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+598 99 123 456"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium font-mono"
                />
                <p className="text-[11px] text-stone-400 mt-0.5">
                  El operador te contactará por este número para coordinar el retiro en {material.zonaRetiro}.
                </p>
                {formErrors.telefono && (
                  <p className="text-[11px] text-red-600 mt-0.5">{formErrors.telefono}</p>
                )}
              </div>

              {/* Email (Opcional §12) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Correo electrónico (opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lucas@correo.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
                />
                {formErrors.email && (
                  <p className="text-[11px] text-red-600 mt-0.5">{formErrors.email}</p>
                )}
              </div>

              {/* Zona del solicitante (Opcional §12) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Tu barrio o zona habitual (opcional)
                </label>
                <input
                  type="text"
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  placeholder="Ej. Pocitos, Cordón, Buceo..."
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
                />
              </div>

              {/* Mensaje / Consulta breve (Opcional §12) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Mensaje o consulta breve (opcional)
                </label>
                <textarea
                  rows={2}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Ej. Estudio en la mañana, me queda cómodo coordinar después de las 14hs..."
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
                />
              </div>

              {/* Consentimiento obligatorio (§12) */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentimiento}
                    onChange={(e) => setConsentimiento(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-700 mt-0.5 shrink-0"
                  />
                  <span className="leading-normal">
                    Acepto que la organización de CIRCULA me contacte para coordinar el retiro y me comprometo a cuidar el material para que vuelva a circular al concluir su uso. *
                  </span>
                </label>
                {formErrors.consentimiento && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.consentimiento}</p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-extrabold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
                >
                  Confirmar solicitud
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal del Pase Digital Emitido */}
      {activePassRequest && (
        <DigitalPassModal
          request={activePassRequest}
          material={material}
          punto={undefined}
          onClose={() => setActivePassRequest(null)}
          onGoToAdmin={onGoToAdmin}
        />
      )}

    </div>
  );
};
