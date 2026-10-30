import React from "react";
import { BookOpen, HeartHandshake, Shield, GraduationCap, CheckCircle2, ArrowRight, Library, Users } from "lucide-react";

interface ComoFuncionaProps {
  onNavigate: (hash: string) => void;
}

export const ComoFunciona: React.FC<ComoFuncionaProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12 pb-24 md:pb-16 text-left">
      
      {/* Encabezado */}
      <div className="space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-950 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full">
          Documento Fundacional v0.1
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight font-display">
          ¿Cómo funciona CIRCULA?
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
          Una plataforma centralizada para la circulación gratuita de libros de lectura y materiales educativos entre estudiantes universitarios, estudiantes de profesorado y lectores en general.
        </p>
      </div>

      {/* Principios Fundamentales del Producto (§3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
            01
          </div>
          <h3 className="text-base font-bold text-stone-900">
            Utilidad antes que comunidad
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            La plataforma no es una red social ni un marketplace: no hay perfiles sociales, seguidores ni algoritmos opacos. Existe para resolver una necesidad concreta: <em>"necesito este libro para estudiar o leer"</em> o <em>"tengo libros guardados que quiero donar"</em>.
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
            02
          </div>
          <h3 className="text-base font-bold text-stone-900">
            Curaduría central y calidad de catálogo
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Los donantes no publican directamente nada en la web. La organización recibe las propuestas, revisa el estado de conservación, clasifica los ejemplares y los carga con información precisa y verificada.
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
            03
          </div>
          <h3 className="text-base font-bold text-stone-900">
            Privacidad por diseño (§3 y §14)
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Nunca se exponen públicamente teléfonos, correos ni domicilios exactos. El catálogo muestra únicamente la zona aproximada (barrio o localidad), y la entrega se coordina de manera privada y segura.
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
            04
          </div>
          <h3 className="text-base font-bold text-stone-900">
            Circulación, no acumulación
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            La regla de negocio central es la gratuidad estricta. El objetivo es que los materiales que están almacenados sin uso vuelvan a estar en manos de quien los necesita hoy, y regresen al circuito al finalizar su lectura o semestre.
          </p>
        </div>

      </div>

      {/* Los Dos Flujos Clave (§6) */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-display">
          Los dos circuitos operativos
        </h2>

        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-emerald-800" />
              <span>Flujo de Demanda: Para quien busca un libro o material</span>
            </div>
            <ol className="text-xs sm:text-sm text-stone-600 space-y-2 list-decimal list-inside leading-relaxed pl-1">
              <li>Ingresas al catálogo y buscas por título, autor, materia o carrera.</li>
              <li>Revisas la ficha técnica, el estado de conservación y la zona aproximada.</li>
              <li>Pulsas <strong>"Solicitar material"</strong> completando solo tu nombre y WhatsApp para coordinación.</li>
              <li>El operador se pondrá en contacto para acordar el retiro del ejemplar.</li>
            </ol>
          </div>

          <div className="pt-4 border-t border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <HeartHandshake className="w-4 h-4 text-emerald-800" />
              <span>Flujo de Oferta: Para quien tiene libros o textos para donar</span>
            </div>
            <ol className="text-xs sm:text-sm text-stone-600 space-y-2 list-decimal list-inside leading-relaxed pl-1">
              <li>Pulsas <strong>"Donar libros"</strong> y completas un formulario breve con la cantidad y zona.</li>
              <li>La organización revisa la propuesta y te escribe por WhatsApp para acordar la recepción.</li>
              <li>Una vez recibidos físicamente, el equipo clasifica, fotografía y publica los materiales en estado disponible.</li>
            </ol>
          </div>

        </div>
      </div>

      {/* Llamado a la acción */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
        <button
          onClick={() => onNavigate("#/")}
          className="w-full sm:w-auto px-6 py-3 text-xs font-black text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs"
        >
          Explorar catálogo disponible
        </button>
        <button
          onClick={() => onNavigate("#/donar")}
          className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors"
        >
          Ofrecer donación
        </button>
      </div>

    </div>
  );
};
