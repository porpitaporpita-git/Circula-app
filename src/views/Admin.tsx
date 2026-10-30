import React, { useState } from "react";
import {
  Shield,
  BarChart3,
  QrCode,
  HeartHandshake,
  BookOpen,
  Inbox,
  FolderTree,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Plus,
  MessageCircle,
  Phone,
  UserCheck,
  Check,
  X,
  GraduationCap,
} from "lucide-react";
import { useStore } from "../lib/store";
import { authenticateAdmin, generateReference } from "../lib/api";
import {
  Category,
  DEMO_USERS,
  Donation,
  DonationStatus,
  DONATION_FLOW,
  Material,
  MaterialStatus,
  MATERIAL_FLOW,
  Request,
  RequestStatus,
  REQUEST_FLOW,
  TipoMaterial,
  AmbitoMaterial,
} from "../lib/data";

interface AdminViewProps {
  initialTab?: string;
  onNavigate: (hash: string) => void;
}

type AdminTab =
  | "panel"
  | "donaciones"
  | "catalogo"
  | "solicitudes"
  | "categorias"
  | "auditoria"
  | "escaner";

export const AdminView: React.FC<AdminViewProps> = ({ initialTab, onNavigate }) => {
  const { state, dispatch } = useStore();
  const user = state.adminUser;

  const [activeTab, setActiveTab] = useState<AdminTab>(
    (initialTab as AdminTab) || "panel"
  );

  // Estados de Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (email: string, pass: string) => {
    const res = authenticateAdmin(email, pass);
    if (!res.ok) {
      setLoginError(res.error || "Error de autenticación");
    } else if (res.user) {
      setLoginError("");
      dispatch({ type: "LOGIN", user: res.user });
    }
  };

  // Pantalla de Login si no hay usuario
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-950 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-6 h-6 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
            Mesa Interna de Operaciones
          </h1>
          <p className="text-xs text-stone-500">
            Acceso administrativo para operadores y catalogadores de CIRCULA.
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(loginEmail, loginPass);
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Correo institucional
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="operador@circula.uy"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 text-xs font-extrabold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs"
            >
              Ingresar a Mesa Interna
            </button>
          </form>

          {/* Accesos rápidos de prueba */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Cuentas demo de prueba (§4):
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleLogin("operador@circula.uy", "operador")}
                className="w-full text-left p-3 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-stone-900 block">Mariana Silva</span>
                  <span className="text-[11px] text-stone-500">Rol: Operador / Catalogador</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  Entrar
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin("admin@circula.uy", "admin")}
                className="w-full text-left p-3 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-stone-900 block">Ignacio Techera</span>
                  <span className="text-[11px] text-stone-500">Rol: Administrador (Permisos elevados)</span>
                </div>
                <span className="font-mono text-[11px] text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                  Entrar
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 md:pb-16 text-left">
      
      {/* Cabecera del Backoffice con Conmutador */}
      <div className="bg-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-800/40 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black font-display">Mesa Interna de Operaciones</h2>
              <span className={`text-[10px] font-mono uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-lg ${
                user.rol === "admin"
                  ? "bg-purple-900 text-purple-200 border border-purple-700"
                  : "bg-emerald-800 text-emerald-200 border border-emerald-600"
              }`}>
                {user.rol}
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Operador conectado: <strong className="text-white">{user.nombre}</strong> ({user.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              const target = user.rol === "admin" ? DEMO_USERS[0] : DEMO_USERS[1];
              dispatch({ type: "LOGIN", user: target });
            }}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700/60 rounded-xl transition-colors flex items-center gap-1.5"
            title="Alternar rol para probar permisos de administrador vs operador"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Cambiar a {user.rol === "admin" ? "Operador" : "Admin"}</span>
          </button>

          <button
            onClick={() => dispatch({ type: "LOGOUT" })}
            className="px-3 py-1.5 text-xs font-bold text-emerald-200 hover:text-white hover:bg-emerald-900/60 rounded-xl transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación del Backoffice (§13) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab("panel")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "panel"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Métricas (§19)</span>
        </button>

        <button
          onClick={() => setActiveTab("donaciones")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "donaciones"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <span>Donaciones</span>
          <span className="font-mono text-[10px] bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded-full tabular-nums">
            {state.donations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("catalogo")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "catalogo"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Catálogo de libros</span>
          <span className="font-mono text-[10px] bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded-full tabular-nums">
            {state.materials.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("solicitudes")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "solicitudes"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Solicitudes</span>
          <span className="font-mono text-[10px] bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded-full tabular-nums">
            {state.requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("escaner")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "escaner"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <QrCode className="w-4 h-4 text-emerald-500" />
          <span>Entrega rápida por PIN</span>
        </button>

        <button
          onClick={() => setActiveTab("categorias")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "categorias"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categorías</span>
        </button>

        <button
          onClick={() => setActiveTab("auditoria")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "auditoria"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Auditoría</span>
          <span className="font-mono text-[10px] bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded-full tabular-nums">
            {state.audit.length}
          </span>
        </button>
      </div>

      {/* Vistas de Pestañas */}
      {activeTab === "panel" && <TabPanelMetrics />}
      {activeTab === "donaciones" && <TabDonaciones />}
      {activeTab === "catalogo" && <TabCatalogo />}
      {activeTab === "solicitudes" && <TabSolicitudes />}
      {activeTab === "escaner" && <TabEscanerPIN />}
      {activeTab === "categorias" && <TabCategorias />}
      {activeTab === "auditoria" && <TabAuditoria />}

    </div>
  );
};

// -----------------------------------------------------------------
// PESTAÑA: PANEL & MÉTRICAS PARA VALIDAR EL PROYECTO (§19)
// -----------------------------------------------------------------
function TabPanelMetrics() {
  const { state, dispatch } = useStore();

  const total = state.materials.length;
  const disponibles = state.materials.filter((m) => m.estado === "disponible").length;
  const reservados = state.materials.filter((m) => m.estado === "reservado").length;
  const entregados = state.materials.filter((m) => m.estado === "entregado").length;
  const donacionesPendientes = state.donations.filter((d) => d.estado === "pendiente").length;
  const donacionesRecibidas = state.donations.filter((d) => d.estado === "recibida").length;

  const ratio =
    state.metrics.searches > 0
      ? Math.round((state.metrics.searchesWithResults / state.metrics.searches) * 100)
      : 100;

  return (
    <div className="space-y-6">
      
      {/* Tarjetas de Métricas (§19) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Catálogo disponible
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-emerald-900 font-mono tabular-nums">
              {disponibles}
            </span>
            <span className="text-xs text-stone-400 font-medium">de {total} catalogados</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            Inventario activo listo para ser solicitado.
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Materiales en circulación
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-stone-900 font-mono tabular-nums">
              {entregados}
            </span>
            <span className="text-xs text-amber-700 font-bold">+ {reservados} reservados</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            Libros que salieron de estanterías quietas hacia lectores.
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Efectividad de catálogo (§19)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-stone-900 font-mono tabular-nums">
              {ratio}%
            </span>
            <span className="text-xs text-stone-400 font-mono tabular-nums">
              ({state.metrics.searches} búsquedas)
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            Porcentaje de búsquedas con resultados pertinentes.
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Oferta / Donaciones (§19)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-amber-700 font-mono tabular-nums">
              {donacionesPendientes}
            </span>
            <span className="text-xs text-emerald-700 font-bold">({donacionesRecibidas} recibidas)</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            Propuestas entrantes pendientes de revisión y contacto.
          </p>
        </div>

      </div>

      {/* Restablecer DB a valores de fábrica */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-stone-900">Restablecer datos demo del prototipo</h4>
          <p className="text-[11px] text-stone-500">
            Reinicia las donaciones, solicitudes y catálogo a las semillas del documento v0.1.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("¿Deseas restablecer todos los datos del prototipo a su estado semilla?")) {
              dispatch({ type: "RESET_DATABASE" });
            }
          }}
          className="px-3.5 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
          <span>Restablecer datos demo</span>
        </button>
      </div>

    </div>
  );
}

// -----------------------------------------------------------------
// PESTAÑA: DONACIONES & CONVERSIÓN EN CATÁLOGO (§6.2 y §13)
// -----------------------------------------------------------------
function TabDonaciones() {
  const { state, dispatch } = useStore();
  const user = state.adminUser;

  const [filterEstado, setFilterEstado] = useState<string>("todas");
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const donacionesFiltradas = state.donations.filter((d) => {
    if (filterEstado === "todas") return true;
    return d.estado === filterEstado;
  });

  const handleUpdateStatus = (id: string, newStatus: DonationStatus) => {
    if (!user) return;
    dispatch({
      type: "UPDATE_DONATION_STATUS",
      id,
      status: newStatus,
      usuario: user.email,
    });
  };

  const handleConvertirEnMaterial = (donation: Donation) => {
    if (!user) return;
    const ref = generateReference("MAT");
    const today = new Date().toISOString().slice(0, 10);

    const newMaterial: Material = {
      id: `m-${Date.now()}`,
      ref,
      titulo: donation.titulo,
      autor: donation.autor || "Autor a verificar",
      tipo: donation.tipoMaterial,
      ambito: donation.tipoOrigen === "biblioteca_particular" ? "lectura_general" : "universitario",
      categoriaId: donation.categoriaId,
      condicion: donation.condicion,
      descripcion: donation.descripcion,
      estado: "disponible",
      zonaRetiro: donation.zona,
      donationId: donation.id,
      fechaAlta: today,
      historial: [
        {
          fecha: today,
          evento: "Catalogado desde donación",
          detalle: `Donación ${donation.ref} revisada, fotografiada y publicada por ${user.nombre}.`,
        },
      ],
      portadaGradient: "from-stone-800 via-amber-950 to-neutral-950",
    };

    dispatch({
      type: "CONVERT_DONATION_TO_MATERIAL",
      donationId: donation.id,
      material: newMaterial,
      usuario: user.email,
    });

    setSelectedDonation(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-600">Filtrar por estado:</span>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
          >
            <option value="todas">Todas ({state.donations.length})</option>
            <option value="pendiente">Pendientes</option>
            <option value="contactada">Contactadas</option>
            <option value="aceptada">Aceptadas</option>
            <option value="recepcion">En recepción</option>
            <option value="recibida">Recibidas</option>
            <option value="rechazada">Rechazadas</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Ref</th>
                <th className="py-3 px-4">Material / Título</th>
                <th className="py-3 px-4">Donante & WhatsApp</th>
                <th className="py-3 px-4">Zona</th>
                <th className="py-3 px-4">Estado (§9.1)</th>
                <th className="py-3 px-4 text-right">Acciones de Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {donacionesFiltradas.map((don) => {
                const allowedTransitions = DONATION_FLOW[don.estado] || [];

                return (
                  <tr key={don.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-800 whitespace-nowrap">
                      {don.ref}
                    </td>
                    <td className="py-3 px-4 max-w-[220px]">
                      <span className="font-bold text-stone-900 block truncate">{don.titulo}</span>
                      <span className="text-stone-500 text-[11px] truncate block">
                        {don.autor || "—"} · Cant: {don.cantidadEstimada}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-stone-900 block">{don.nombreDonante}</span>
                      <a
                        href={`https://wa.me/${don.telefono.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-800 font-semibold hover:underline flex items-center gap-1 font-mono"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>{don.telefono}</span>
                      </a>
                    </td>
                    <td className="py-3 px-4 text-stone-700 whitespace-nowrap font-medium">
                      {don.zona}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg ${
                        don.estado === "pendiente"
                          ? "bg-amber-100 text-amber-900"
                          : don.estado === "recibida"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-stone-100 text-stone-700"
                      }`}>
                        {don.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                      {/* Botón de conversión a catálogo si está recibida o aceptada */}
                      {(don.estado === "recibida" || don.estado === "aceptada") && (
                        <button
                          onClick={() => handleConvertirEnMaterial(don)}
                          className="px-2.5 py-1 text-[11px] font-black text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                          title="Crear ficha en el catálogo público"
                        >
                          Publicar en Catálogo
                        </button>
                      )}

                      {/* Transiciones permitidas por la máquina de estados */}
                      {allowedTransitions.map((nextStatus) => (
                        <button
                          key={nextStatus}
                          onClick={() => handleUpdateStatus(don.id, nextStatus)}
                          className="px-2 py-1 text-[10px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors capitalize"
                        >
                          ➔ {nextStatus}
                        </button>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// PESTAÑA: CATÁLOGO DE MATERIALES (§13)
// -----------------------------------------------------------------
function TabCatalogo() {
  const { state, dispatch } = useStore();
  const user = state.adminUser;

  const [filterEstado, setFilterEstado] = useState<string>("todos");

  const materialesFiltrados = state.materials.filter((m) => {
    if (filterEstado === "todos") return true;
    return m.estado === filterEstado;
  });

  const handleUpdateStatus = (id: string, newStatus: MaterialStatus) => {
    if (!user) return;
    dispatch({
      type: "UPDATE_MATERIAL_STATUS",
      id,
      status: newStatus,
      usuario: user.email,
      motivo: "Actualización operativa desde backoffice",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-600">Filtrar por estado:</span>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
          >
            <option value="todos">Todos ({state.materials.length})</option>
            <option value="disponible">Disponibles</option>
            <option value="reservado">Reservados</option>
            <option value="entregado">Entregados</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Ref</th>
                <th className="py-3 px-4">Título & Autor</th>
                <th className="py-3 px-4">Tipo & Vinculación</th>
                <th className="py-3 px-4">Zona</th>
                <th className="py-3 px-4">Estado (§9.2)</th>
                <th className="py-3 px-4 text-right">Cambiar Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {materialesFiltrados.map((m) => {
                const allowedTransitions = MATERIAL_FLOW[m.estado] || [];

                return (
                  <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-800 whitespace-nowrap">
                      {m.ref}
                    </td>
                    <td className="py-3 px-4 max-w-[240px]">
                      <span className="font-bold text-stone-900 block truncate">{m.titulo}</span>
                      <span className="text-stone-500 text-[11px] truncate block">{m.autor}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="capitalize font-semibold text-stone-800">{m.tipo.replace("_", " ")}</span>
                      {m.materia && (
                        <span className="text-emerald-900 font-medium text-[11px] block truncate max-w-[150px]">
                          {m.materia}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-700 whitespace-nowrap font-medium">
                      {m.zonaRetiro}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg ${
                        m.estado === "disponible"
                          ? "bg-emerald-100 text-emerald-900"
                          : m.estado === "reservado"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-stone-100 text-stone-700"
                      }`}>
                        {m.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                      {allowedTransitions.map((nextStatus) => (
                        <button
                          key={nextStatus}
                          onClick={() => handleUpdateStatus(m.id, nextStatus)}
                          className="px-2.5 py-1 text-[10px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors capitalize"
                        >
                          ➔ {nextStatus}
                        </button>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// PESTAÑA: SOLICITUDES & COORDINACIÓN POR WHATSAPP (§6.1 y §13)
// -----------------------------------------------------------------
function TabSolicitudes() {
  const { state, dispatch } = useStore();
  const user = state.adminUser;

  const handleUpdateStatus = (id: string, newStatus: RequestStatus) => {
    if (!user) return;
    dispatch({
      type: "UPDATE_REQUEST_STATUS",
      id,
      status: newStatus,
      usuario: user.email,
    });
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold text-[10px]">
            <tr>
              <th className="py-3 px-4">Ref Solicitud</th>
              <th className="py-3 px-4">PIN Retiro</th>
              <th className="py-3 px-4">Material Solicitado</th>
              <th className="py-3 px-4">Solicitante (WhatsApp)</th>
              <th className="py-3 px-4">Estado (§9.3)</th>
              <th className="py-3 px-4 text-right">Workflow de Entrega</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {state.requests.map((r) => {
              const mat = state.materials.find((m) => m.id === r.materialId);
              const allowedTransitions = REQUEST_FLOW[r.estado] || [];

              return (
                <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-stone-800 whitespace-nowrap">
                    {r.ref}
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-emerald-900 text-sm whitespace-nowrap tabular-nums">
                    {r.pin}
                  </td>
                  <td className="py-3 px-4 max-w-[200px]">
                    <span className="font-bold text-stone-900 block truncate">{mat?.titulo || r.materialId}</span>
                    <span className="text-[11px] text-stone-500 block truncate">{mat?.autor}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-stone-900 block">{r.nombreSolicitante}</span>
                    <a
                      href={`https://wa.me/${r.telefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hola ${r.nombreSolicitante}, te escribo de CIRCULA por tu solicitud del libro '${mat?.titulo}'.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-800 font-semibold hover:underline flex items-center gap-1 font-mono"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>{r.telefono}</span>
                    </a>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg ${
                      r.estado === "reservada"
                        ? "bg-amber-100 text-amber-900"
                        : r.estado === "entregada"
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-stone-100 text-stone-700"
                    }`}>
                      {r.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                    {allowedTransitions.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => handleUpdateStatus(r.id, nextStatus)}
                        className="px-2 py-1 text-[10px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors capitalize"
                      >
                        ➔ {nextStatus}
                      </button>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// PESTAÑA: ENTREGA RÁPIDA POR PIN
// -----------------------------------------------------------------
function TabEscanerPIN() {
  const { state, dispatch } = useStore();
  const user = state.adminUser;

  const [inputPin, setInputPin] = useState("");
  const [resultado, setResultado] = useState<{
    request: Request;
    material: Material;
  } | null>(null);
  const [errorPin, setErrorPin] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleBuscar = (pinSearch?: string) => {
    setErrorPin("");
    setSuccessMsg("");
    const val = (pinSearch || inputPin).trim();

    if (!val) {
      setErrorPin("Ingresa el PIN de 4 dígitos o referencia.");
      return;
    }

    const found = state.requests.find(
      (r) => r.pin === val || r.qrToken === val || r.ref === val
    );

    if (!found) {
      setErrorPin(`No se encontró ninguna solicitud activa con '${val}'.`);
      setResultado(null);
      return;
    }

    const mat = state.materials.find((m) => m.id === found.materialId);
    if (!mat) {
      setErrorPin("El material asociado ya no existe en el catálogo.");
      setResultado(null);
      return;
    }

    setResultado({ request: found, material: mat });
  };

  const handleEntregar = () => {
    if (!resultado || !user) return;

    dispatch({
      type: "VERIFY_AND_DELIVER",
      requestId: resultado.request.id,
      usuario: user.email,
    });

    setSuccessMsg(
      `¡Pase verificado y material '${resultado.material.titulo}' entregado exitosamente a ${resultado.request.nombreSolicitante}!`
    );
    setResultado(null);
    setInputPin("");
  };

  const reservadas = state.requests.filter((r) => r.estado === "reservada");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            Validar retiro con PIN del solicitante
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Ingresa el PIN de 4 dígitos que el estudiante o lector presenta al retirar su material.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputPin}
            onChange={(e) => setInputPin(e.target.value)}
            placeholder="PIN de 4 dígitos (ej. 4921)..."
            className="flex-1 px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring font-mono"
          />
          <button
            onClick={() => handleBuscar()}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-colors"
          >
            Verificar
          </button>
        </div>

        {errorPin && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorPin}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {resultado && (
          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="font-mono text-xs font-bold text-emerald-900">
                {resultado.request.ref} · PIN: {resultado.request.pin}
              </span>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                {resultado.request.estado}
              </span>
            </div>

            <div className="text-xs space-y-1">
              <p>Libro: <strong>{resultado.material.titulo}</strong> ({resultado.material.autor})</p>
              <p>Lector: <strong>{resultado.request.nombreSolicitante}</strong> ({resultado.request.telefono})</p>
            </div>

            {resultado.request.estado === "reservada" ? (
              <button
                onClick={handleEntregar}
                className="w-full py-2.5 text-xs font-black text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Entrega y Concretar Circulación</span>
              </button>
            ) : (
              <span className="text-xs text-stone-400 italic block">
                Este material ya fue marcado como entregado.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Acceso rápido a solicitudes reservadas */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
          Solicitudes actualmente reservadas ({reservadas.length})
        </h4>

        <div className="space-y-2">
          {reservadas.map((req) => (
            <div
              key={req.id}
              className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-bold text-stone-900 block">{req.nombreSolicitante}</span>
                <span className="font-mono text-[11px] text-stone-500">
                  PIN: <strong className="text-emerald-900">{req.pin}</strong> · Ref: {req.ref}
                </span>
              </div>
              <button
                onClick={() => {
                  setInputPin(req.pin);
                  handleBuscar(req.pin);
                }}
                className="px-3 py-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                Probar entrega
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// PESTAÑA: CATEGORÍAS CON AUTORIZACIÓN POR ROL (§4 y §13)
// -----------------------------------------------------------------
function TabCategorias() {
  const { state, dispatch } = useStore();
  const user = state.adminUser;
  const esAdmin = user?.rol === "admin";

  const [nuevaCat, setNuevaCat] = useState("");

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCat.trim() || !user) return;

    dispatch({
      type: "ADD_CATEGORY",
      nombre: nuevaCat.trim(),
      usuario: user.email,
      rol: user.rol,
    });

    setNuevaCat("");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {!esAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Modo lectura para rol Operador (§4)</span>
            <p className="mt-0.5 text-amber-800">
              Tu rol es <strong>Operador</strong>. La creación y activación de categorías requiere rol <strong>Administrador</strong>. Si intentas realizar una mutación, se registrará una acción denegada en auditoría.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleCrear} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <input
          type="text"
          value={nuevaCat}
          onChange={(e) => setNuevaCat(e.target.value)}
          placeholder={esAdmin ? "Nombre de la nueva categoría..." : "Requiere rol Administrador..."}
          disabled={!esAdmin}
          className="flex-1 px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-700 focus-ring disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!esAdmin}
          className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir</span>
        </button>
      </form>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs divide-y divide-stone-100">
        {state.categories.map((cat) => (
          <div key={cat.id} className="p-4 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-stone-900 block">{cat.nombre}</span>
              <span className="text-[11px] text-stone-400 font-mono">ID: {cat.id}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                cat.activo ? "bg-emerald-50 text-emerald-900" : "bg-stone-100 text-stone-500"
              }`}>
                {cat.activo ? "Activa" : "Inactiva"}
              </span>

              <button
                disabled={!esAdmin}
                onClick={() => {
                  if (user) {
                    dispatch({
                      type: "TOGGLE_CATEGORY",
                      id: cat.id,
                      usuario: user.email,
                      rol: user.rol,
                    });
                  }
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-40"
              >
                {cat.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// PESTAÑA: REGISTRO DE AUDITORÍA OPERATIVO (§13)
// -----------------------------------------------------------------
function TabAuditoria() {
  const { state } = useStore();
  const [filterEntidad, setFilterEntidad] = useState<string>("todas");

  const auditFiltrada = state.audit.filter((a) => {
    if (filterEntidad === "todas") return true;
    return a.entidad === filterEntidad;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="text-stone-500 font-medium">Registro de auditoría ({auditFiltrada.length} eventos)</span>
        <select
          value={filterEntidad}
          onChange={(e) => setFilterEntidad(e.target.value)}
          className="bg-white border border-stone-200 rounded-xl px-2.5 py-1 text-xs"
        >
          <option value="todas">Todas las entidades</option>
          <option value="Material">Material</option>
          <option value="Donación">Donación</option>
          <option value="Solicitud">Solicitud</option>
          <option value="Categoría">Categoría</option>
          <option value="Sistema">Sistema</option>
        </select>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4">Entidad</th>
                <th className="py-3 px-4">Acción</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {auditFiltrada.map((entry) => (
                <tr key={entry.id} className="hover:bg-stone-50/70">
                  <td className="py-2.5 px-4 text-stone-500 whitespace-nowrap">{entry.fecha}</td>
                  <td className="py-2.5 px-4 font-bold text-stone-800 whitespace-nowrap">
                    {entry.entidad}
                    {entry.entidadRef !== "—" && (
                      <span className="text-stone-400 font-normal ml-1">({entry.entidadRef})</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-emerald-900 font-bold whitespace-nowrap">
                    {entry.accion}
                  </td>
                  <td className="py-2.5 px-4 text-stone-600 whitespace-nowrap">{entry.usuario}</td>
                  <td className="py-2.5 px-4 text-stone-700 font-sans text-xs">{entry.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
