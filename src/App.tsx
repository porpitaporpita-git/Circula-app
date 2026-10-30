import React, { useState, useEffect, useCallback } from "react";
import { StoreProvider } from "./lib/store";
import { Navbar } from "./components/Navbar";
import { Home } from "./views/Home";
import { MaterialView } from "./views/Material";
import { DonateView } from "./views/Donate";
import { AdminView } from "./views/Admin";
import { ComoFunciona } from "./views/ComoFunciona";
import { BookOpen, Shield } from "lucide-react";

type Route =
  | { view: "home" }
  | { view: "material"; id: string }
  | { view: "donar" }
  | { view: "como-funciona" }
  | { view: "admin"; tab?: string };

function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "");
  const [path] = clean.split("?");

  if (path.startsWith("material/")) {
    const id = path.replace("material/", "");
    return { view: "material", id };
  }

  if (path === "donar") {
    return { view: "donar" };
  }

  if (path === "como-funciona") {
    return { view: "como-funciona" };
  }

  if (path.startsWith("admin")) {
    const parts = path.split("/");
    return { view: "admin", tab: parts[1] || undefined };
  }

  return { view: "home" };
}

function MainShell() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = useCallback((hash: string) => {
    window.location.hash = hash;
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-100 selection:text-emerald-950">
      
      {/* Barra de Navegación Principal */}
      <Navbar currentView={route.view} onNavigate={navigateTo} />

      {/* Contenido Dinámico según la Ruta */}
      <main className="flex-1">
        {route.view === "home" && (
          <Home
            onSelectMaterial={(id) => navigateTo(`#/material/${id}`)}
            onNavigate={navigateTo}
          />
        )}

        {route.view === "material" && (
          <MaterialView
            id={route.id}
            onBack={() => navigateTo("#/")}
            onGoToAdmin={() => navigateTo("#/admin/solicitudes")}
          />
        )}

        {route.view === "donar" && (
          <DonateView
            onBack={() => navigateTo("#/")}
            onGoToAdmin={() => navigateTo("#/admin/donaciones")}
          />
        )}

        {route.view === "como-funciona" && (
          <ComoFunciona onNavigate={navigateTo} />
        )}

        {route.view === "admin" && (
          <AdminView
            initialTab={route.tab}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Pie de Página Institucional */}
      <footer className="bg-white border-t border-stone-200 mt-auto py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-100">
            
            <div className="space-y-1.5 max-w-md text-left">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-950 text-white flex items-center justify-center font-bold text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <span className="font-extrabold text-stone-900 tracking-tight font-display text-base">
                  CIRCULA
                </span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Plataforma centralizada para la circulación gratuita de libros de todo tipo y textos de estudio universitario y formación docente. Sin perfiles sociales, sin marketplace ni compras.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-stone-600">
              <button onClick={() => navigateTo("#/")} className="hover:text-emerald-900 transition-colors">
                Catálogo
              </button>
              <button onClick={() => navigateTo("#/donar")} className="hover:text-emerald-900 transition-colors">
                Donar libros
              </button>
              <button onClick={() => navigateTo("#/como-funciona")} className="hover:text-emerald-900 transition-colors">
                Cómo funciona
              </button>
              <button
                onClick={() => navigateTo("#/admin")}
                className="hover:text-emerald-900 transition-colors text-emerald-950 flex items-center gap-1 font-bold"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-800" />
                Mesa Interna
              </button>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
            <p>
              CIRCULA · Documento Fundacional v0.1 · Plataforma comunitaria
            </p>
            <div className="flex items-center gap-3">
              <span>Privacidad por diseño (§3)</span>
              <span>·</span>
              <span>Ubicación por zona aproximada</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainShell />
    </StoreProvider>
  );
}
