import React, { useState } from "react";
import { BookOpen, Shield, HeartHandshake, LogOut, Menu, X, Sparkles, Compass } from "lucide-react";
import { useStore } from "../lib/store";

interface NavbarProps {
  currentView: string;
  onNavigate: (hash: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { state, dispatch } = useStore();
  const user = state.adminUser;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const disponiblesCount = state.materials.filter((m) => m.estado === "disponible").length;

  const handleNav = (hash: string) => {
    setMobileMenuOpen(false);
    onNavigate(hash);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Zona 1: Logomarca CIRCULA */}
          <button
            onClick={() => handleNav("#/")}
            className="flex items-center gap-2.5 text-left group focus-ring rounded-lg py-1 shrink-0"
            title="Ir al inicio de CIRCULA"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-200 flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-stone-900 block leading-none font-display">
                CIRCULA
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium block leading-tight mt-0.5">
                Libros & Textos de Estudio
              </span>
            </div>
          </button>

          {/* Zona 2: Enlaces Desktop */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button
              onClick={() => handleNav("#/")}
              className={`transition-colors whitespace-nowrap hover:text-stone-900 ${
                currentView === "home" ? "text-emerald-900 font-bold" : ""
              }`}
            >
              Catálogo
              <span className="ml-1.5 text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-mono tabular-nums font-semibold">
                {disponiblesCount}
              </span>
            </button>

            <button
              onClick={() => handleNav("#/como-funciona")}
              className={`transition-colors whitespace-nowrap hover:text-stone-900 ${
                currentView === "como-funciona" ? "text-emerald-900 font-bold" : ""
              }`}
            >
              Cómo funciona
            </button>

            <button
              onClick={() => handleNav("#/admin")}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap hover:text-stone-900 ${
                currentView === "admin" ? "text-emerald-900 font-bold" : ""
              }`}
            >
              <Shield className="w-4 h-4 text-stone-400" />
              <span>Mesa Interna</span>
              {user && (
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                  {user.rol}
                </span>
              )}
            </button>
          </nav>

          {/* Zona 3: Botón Donar + Menú Hamburguesa en Móvil */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user ? (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-stone-200">
                <span className="text-xs text-stone-600 font-medium truncate max-w-[120px]">
                  {user.nombre.split(" ")[0]}
                </span>
                <button
                  onClick={() => dispatch({ type: "LOGOUT" })}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            <button
              onClick={() => handleNav("#/donar")}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-900 hover:bg-emerald-800 active:bg-emerald-950 rounded-xl shadow-xs transition-all focus-ring whitespace-nowrap"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-300" />
              <span>Donar libros</span>
            </button>

            {/* Botón hamburguesa móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg md:hidden transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Menú Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2">
            <button
              onClick={() => handleNav("#/")}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-between ${
                currentView === "home" ? "bg-emerald-50 text-emerald-900" : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Explorar Catálogo</span>
              </div>
              <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-stone-200">
                {disponiblesCount} disponibles
              </span>
            </button>

            <button
              onClick={() => handleNav("#/como-funciona")}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                currentView === "como-funciona" ? "bg-emerald-50 text-emerald-900" : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              <Compass className="w-4 h-4 text-stone-500" />
              <span>Cómo funciona el proyecto</span>
            </button>

            <button
              onClick={() => handleNav("#/admin")}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-between ${
                currentView === "admin" ? "bg-emerald-50 text-emerald-900" : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-stone-500" />
                <span>Mesa Interna (Backoffice)</span>
              </div>
              {user && (
                <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  {user.rol}
                </span>
              )}
            </button>

            {user && (
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between px-3 text-xs text-stone-500">
                <span>Sesión: {user.nombre}</span>
                <button
                  onClick={() => dispatch({ type: "LOGOUT" })}
                  className="text-red-700 font-semibold hover:underline"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Barra de navegación inferior móvil para pulgares (Sticky Mobile Nav) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 py-1.5 px-4 flex items-center justify-around text-[11px] font-medium text-stone-600 shadow-md">
        <button
          onClick={() => handleNav("#/")}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            currentView === "home" ? "text-emerald-900 font-bold" : "text-stone-500"
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Catálogo</span>
        </button>

        <button
          onClick={() => handleNav("#/donar")}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            currentView === "donar" ? "text-emerald-900 font-bold" : "text-stone-500"
          }`}
        >
          <HeartHandshake className="w-5 h-5 mb-0.5 text-emerald-800" />
          <span>Donar</span>
        </button>

        <button
          onClick={() => handleNav("#/como-funciona")}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            currentView === "como-funciona" ? "text-emerald-900 font-bold" : "text-stone-500"
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Proyecto</span>
        </button>

        <button
          onClick={() => handleNav("#/admin")}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            currentView === "admin" ? "text-emerald-900 font-bold" : "text-stone-500"
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span>Gestión</span>
        </button>
      </div>
    </>
  );
};
