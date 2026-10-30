import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  BookOpen,
  GraduationCap,
  Sparkles,
  X,
  HeartHandshake,
  ArrowRight,
  Library,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useStore } from "../lib/store";
import { getPublicMaterials, normalizeSearch } from "../lib/api";
import { MaterialCard } from "../components/MaterialCard";
import { TipoMaterial } from "../lib/data";

interface HomeProps {
  onSelectMaterial: (id: string) => void;
  onNavigate: (hash: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectMaterial, onNavigate }) => {
  const { state, dispatch } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<"todos" | TipoMaterial>("todos");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [selectedZona, setSelectedZona] = useState<string>("todas");
  const [soloDisponibles, setSoloDisponibles] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Obtener zonas únicas disponibles
  const zonasDisponibles = useMemo(() => {
    const set = new Set<string>();
    state.materials.forEach((m) => {
      if (m.zonaRetiro) set.add(m.zonaRetiro);
    });
    return Array.from(set).sort();
  }, [state.materials]);

  // Obtener catálogo público sanitizado (sin donationId ni datos de contacto)
  const publicMaterials = useMemo(() => getPublicMaterials(state.materials), [state.materials]);

  // Filtrado reactivo de materiales
  const filteredMaterials = useMemo(() => {
    return publicMaterials.filter((m) => {
      if (soloDisponibles && m.estado !== "disponible") {
        return false;
      }

      if (selectedTipo !== "todos" && m.tipo !== selectedTipo) {
        return false;
      }

      if (selectedCategory !== "todas" && m.categoriaId !== selectedCategory) {
        return false;
      }

      if (selectedZona !== "todas" && m.zonaRetiro !== selectedZona) {
        return false;
      }

      if (searchQuery.trim().length > 0) {
        const queryNorm = normalizeSearch(searchQuery);
        const textBlob = normalizeSearch(
          [
            m.titulo,
            m.subtitulo || "",
            m.autor,
            m.materia || "",
            m.carreraProfesorado || "",
            m.institucion || "",
            m.editorial || "",
            m.zonaRetiro,
            m.descripcion,
          ].join(" ")
        );
        const words = queryNorm.split(/\s+/).filter(Boolean);
        const matchesAll = words.every((w) => textBlob.includes(w));
        if (!matchesAll) return false;
      }

      return true;
    });
  }, [publicMaterials, searchQuery, selectedTipo, selectedCategory, selectedZona, soloDisponibles]);

  // Registrar analítica de búsqueda
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      dispatch({
        type: "REGISTER_SEARCH",
        withResults: filteredMaterials.length > 0,
      });
    }
  }, [searchQuery, filteredMaterials.length, dispatch]);

  const disponiblesCount = state.materials.filter((m) => m.estado === "disponible").length;
  const entregadosCount = state.materials.filter((m) => m.estado === "entregado").length;
  const librosLecturaCount = state.materials.filter((m) => m.tipo === "libro").length;
  const textosEstudioCount = state.materials.filter((m) => m.tipo !== "libro").length;

  return (
    <div className="space-y-6 sm:space-y-10 pb-20 md:pb-16">
      
      {/* Hero Section Editorial Cálido y Atractivo */}
      <section className="bg-gradient-to-b from-stone-100 to-stone-50 border-b border-stone-200/80 py-8 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-950 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Plataforma comunitaria gratuita · Sin compraventa</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-[1.12] font-display">
              Libros y textos de estudio que buscan nuevos lectores.
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-stone-600 leading-relaxed max-w-2xl">
              Facilitamos que los libros de bibliotecas particulares y los textos de estudio universitario o profesorado vuelvan a circular gratuitamente entre quienes los necesitan.
            </p>

            {/* Buscador Central Principal */}
            <div className="pt-2">
              <div className="relative flex items-center shadow-sm">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar libro, autor, materia (ej. Cálculo, Pedagogía), carrera o zona..."
                  className="w-full pl-11 sm:pl-12 pr-10 py-3.5 text-sm sm:text-base bg-white border border-stone-300 rounded-2xl focus:border-emerald-700 focus-ring transition-all placeholder:text-stone-400 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Métricas en cifras tabulares */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-stone-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span><strong className="font-mono text-stone-900 tabular-nums">{disponiblesCount}</strong> disponibles para retiro</span>
              </div>
              <span className="text-stone-300">·</span>
              <div>
                <span><strong className="font-mono text-stone-900 tabular-nums">{librosLecturaCount}</strong> libros de lectura</span>
              </div>
              <span className="text-stone-300">·</span>
              <div>
                <span><strong className="font-mono text-stone-900 tabular-nums">{textosEstudioCount}</strong> textos de estudio</span>
              </div>
              <span className="text-stone-300">·</span>
              <div>
                <span><strong className="font-mono text-stone-900 tabular-nums">{entregadosCount}</strong> ya en circulación</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contenedor Principal de Catálogo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Selector de Ámbito / Tipo de Material */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto scrollbar-none text-xs font-semibold">
            <button
              onClick={() => setSelectedTipo("todos")}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                selectedTipo === "todos"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Todos ({publicMaterials.length})
            </button>

            <button
              onClick={() => setSelectedTipo("libro")}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedTipo === "libro"
                  ? "bg-white text-emerald-950 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span>📖 Libros de lectura</span>
              <span className="text-[10px] font-mono text-stone-400">({librosLecturaCount})</span>
            </button>

            <button
              onClick={() => setSelectedTipo("texto_estudio")}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedTipo === "texto_estudio"
                  ? "bg-white text-emerald-950 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span>🎓 Textos de estudio</span>
            </button>

            <button
              onClick={() => setSelectedTipo("apuntes_catedra")}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedTipo === "apuntes_catedra"
                  ? "bg-white text-emerald-950 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span>📝 Apuntes de cátedra</span>
            </button>
          </div>

          {/* Toggle de filtros en móvil */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-stone-600">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg font-semibold text-stone-800"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros avanzados</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMobileFilters ? "rotate-180" : ""}`} />
            </button>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={soloDisponibles}
                onChange={(e) => setSoloDisponibles(e.target.checked)}
                className="w-4 h-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-700"
              />
              <span className="font-medium">Solo disponibles</span>
            </label>
          </div>
        </div>

        {/* Barra de Filtros Complementarios (Visible en Desktop o con toggle en móvil) */}
        <div className={`space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4 p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs ${
          showMobileFilters ? "block" : "hidden sm:flex"
        }`}>
          
          {/* Filtro por Categoría */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 font-medium focus-ring"
            >
              <option value="todas">Todas las categorías</option>
              {state.categories
                .filter((c) => c.activo)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
            </select>
          </div>

          {/* Filtro por Zona aproximada */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Zona de retiro
            </label>
            <select
              value={selectedZona}
              onChange={(e) => setSelectedZona(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 font-medium focus-ring"
            >
              <option value="todas">Todas las zonas ({zonasDisponibles.length})</option>
              {zonasDisponibles.map((zona) => (
                <option key={zona} value={zona}>
                  {zona}
                </option>
              ))}
            </select>
          </div>

          {/* Resetear filtros si hay activos */}
          {(selectedCategory !== "todas" ||
            selectedZona !== "todas" ||
            selectedTipo !== "todos" ||
            searchQuery !== "" ||
            !soloDisponibles) && (
            <div className="pt-2 sm:pt-4 sm:ml-auto">
              <button
                onClick={() => {
                  setSelectedCategory("todas");
                  setSelectedZona("todas");
                  setSelectedTipo("todos");
                  setSearchQuery("");
                  setSoloDisponibles(true);
                }}
                className="text-xs text-emerald-900 hover:text-emerald-950 font-bold underline underline-offset-4"
              >
                Limpiar filtros
              </button>
            </div>
          )}

        </div>

        {/* Resultados del Catálogo */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              No se encontraron materiales con esos criterios
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Prueba con términos más generales (como el apellido del autor o la materia). Si tienes este libro o texto en tu estantería particular, ¡puedes donarlo para que circule!
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("todas");
                  setSelectedZona("todas");
                  setSelectedTipo("todos");
                  setSoloDisponibles(false);
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Ver todo el catálogo
              </button>
              <button
                onClick={() => onNavigate("#/donar")}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Donar libros</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMaterials.map((mat) => (
              <MaterialCard
                key={mat.id}
                material={mat}
                onSelect={onSelectMaterial}
              />
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
