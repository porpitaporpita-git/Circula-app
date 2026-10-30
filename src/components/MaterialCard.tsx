import React from "react";
import { BookOpen, MapPin, ArrowRight, GraduationCap, Sparkles } from "lucide-react";
import { Material } from "../lib/data";

interface MaterialCardProps {
  material: Material;
  onSelect: (id: string) => void;
}

const TIPO_LABEL: Record<string, { label: string; icon: string }> = {
  libro: { label: "Libro de lectura", icon: "📖" },
  texto_estudio: { label: "Texto de estudio", icon: "🎓" },
  apuntes_catedra: { label: "Apuntes de cátedra", icon: "📝" },
};

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onSelect }) => {
  const isDisponible = material.estado === "disponible";

  return (
    <div
      onClick={() => onSelect(material.id)}
      className="group bg-white rounded-2xl border border-stone-200/90 hover:border-stone-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer text-left overflow-hidden relative"
    >
      <div>
        {/* Cabecera visual del libro con gradiente elegante */}
        <div
          className={`h-36 sm:h-40 bg-gradient-to-br ${material.portadaGradient} text-white p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden`}
        >
          {/* Textura sutil y marca de agua de libro */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>

          <div className="relative z-10 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider text-white/80">
            <span className="bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded font-semibold text-emerald-200">
              {TIPO_LABEL[material.tipo]?.label || "Libro"}
            </span>
            <span className="text-white/60 tabular-nums">{material.ref}</span>
          </div>

          <div className="relative z-10">
            <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight font-display line-clamp-2 drop-shadow-xs">
              {material.titulo}
            </h3>
            <p className="text-xs text-white/90 font-medium mt-1 truncate">
              {material.autor}
            </p>
          </div>
        </div>

        {/* Cuerpo informativo de la tarjeta */}
        <div className="p-4 sm:p-5 space-y-3">
          
          {/* Metadatos de estudio si aplica */}
          {(material.materia || material.institucion || material.carreraProfesorado) && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-900 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100 font-medium">
              <GraduationCap className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
              <span className="truncate">
                {material.materia || material.carreraProfesorado || material.institucion}
              </span>
            </div>
          )}

          {/* Subtítulo o descripción breve */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {material.subtitulo || material.descripcion}
          </p>

          {/* Metadatos limpios sin píldoras */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-500 pt-1">
            {material.editorial && (
              <>
                <span className="font-medium text-stone-700">{material.editorial}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
              </>
            )}
            {material.añoEdicion && (
              <>
                <span>{material.añoEdicion}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
              </>
            )}
            <span className="capitalize">{material.condicion.replace("_", " ")}</span>
          </div>

        </div>
      </div>

      {/* Pie de tarjeta: Zona y Estado de Disponibilidad */}
      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-1.5 text-stone-600 truncate max-w-[160px]">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate text-[11px] font-medium">{material.zonaRetiro}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isDisponible ? (
            <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Solicitar</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          ) : material.estado === "reservado" ? (
            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Reservado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-stone-400 font-medium text-xs">
              <span className="w-2 h-2 rounded-full bg-stone-400"></span>
              {material.estado}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
