/**
 * CIRCULA — Estado Global y Máquinas de Estado v0.1
 */

import React, { createContext, useContext, useEffect, useReducer } from "react";
import {
  AdminUser,
  AuditEntry,
  Category,
  Donation,
  DonationStatus,
  DONATION_FLOW,
  Material,
  MaterialStatus,
  MATERIAL_FLOW,
  Request,
  RequestStatus,
  REQUEST_FLOW,
  seedAudit,
  seedCategories,
  seedDonations,
  seedMaterials,
  seedRequests,
} from "./data";

export interface DBState {
  materials: Material[];
  donations: Donation[];
  requests: Request[];
  categories: Category[];
  audit: AuditEntry[];
  adminUser: AdminUser | null;
  metrics: {
    searches: number;
    searchesWithResults: number;
  };
}

const STORAGE_KEY = "circula_v01_db";

function getInitialState(): DBState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.materials && parsed.categories && parsed.donations) {
        return parsed;
      }
    }
  } catch {}

  return {
    materials: seedMaterials,
    donations: seedDonations,
    requests: seedRequests,
    categories: seedCategories,
    audit: seedAudit,
    adminUser: null,
    metrics: { searches: 64, searchesWithResults: 58 },
  };
}

export type Action =
  | { type: "LOGIN"; user: AdminUser }
  | { type: "LOGOUT" }
  | { type: "SUBMIT_DONATION"; donation: Donation }
  | { type: "UPDATE_DONATION_STATUS"; id: string; status: DonationStatus; usuario: string; notas?: string }
  | { type: "CONVERT_DONATION_TO_MATERIAL"; donationId: string; material: Material; usuario: string }
  | { type: "SUBMIT_REQUEST"; request: Request }
  | { type: "UPDATE_REQUEST_STATUS"; id: string; status: RequestStatus; usuario: string; notas?: string }
  | { type: "VERIFY_AND_DELIVER"; requestId: string; usuario: string }
  | { type: "UPDATE_MATERIAL_STATUS"; id: string; status: MaterialStatus; usuario: string; motivo?: string }
  | { type: "ADD_MATERIAL"; material: Material; usuario: string }
  | { type: "ADD_CATEGORY"; nombre: string; usuario: string; rol: "operador" | "admin" }
  | { type: "TOGGLE_CATEGORY"; id: string; usuario: string; rol: "operador" | "admin" }
  | { type: "REGISTER_SEARCH"; withResults: boolean }
  | { type: "LOG_AUDIT"; entry: Omit<AuditEntry, "id" | "fecha"> }
  | { type: "RESET_DATABASE" };

function nowFormatted(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function createAudit(
  entidad: AuditEntry["entidad"],
  entidadRef: string,
  accion: string,
  usuario: string,
  detalle: string
): AuditEntry {
  return {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fecha: nowFormatted(),
    entidad,
    entidadRef,
    accion,
    usuario,
    detalle,
  };
}

function reducer(state: DBState, action: Action): DBState {
  switch (action.type) {
    case "LOGIN": {
      const entry = createAudit(
        "Sistema",
        "—",
        "Inicio de sesión",
        action.user.email,
        `Ingreso al backoffice con rol ${action.user.rol} (${action.user.nombre}).`
      );
      return {
        ...state,
        adminUser: action.user,
        audit: [entry, ...state.audit],
      };
    }

    case "LOGOUT": {
      const user = state.adminUser?.email ?? "usuario";
      const entry = createAudit("Sistema", "—", "Cierre de sesión", user, "Sesión cerrada.");
      return {
        ...state,
        adminUser: null,
        audit: [entry, ...state.audit],
      };
    }

    case "SUBMIT_DONATION": {
      const entry = createAudit(
        "Donación",
        action.donation.ref,
        "Propuesta de donación",
        action.donation.nombreDonante,
        `Propuesta para '${action.donation.titulo}' en zona ${action.donation.zona}.`
      );
      return {
        ...state,
        donations: [action.donation, ...state.donations],
        audit: [entry, ...state.audit],
      };
    }

    case "UPDATE_DONATION_STATUS": {
      const don = state.donations.find((d) => d.id === action.id);
      if (!don) return state;

      const allowed = DONATION_FLOW[don.estado];
      if (!allowed.includes(action.status)) {
        const denyEntry = createAudit(
          "Donación",
          don.ref,
          "Transición bloqueada",
          action.usuario,
          `No se permite pasar de '${don.estado}' a '${action.status}'.`
        );
        return { ...state, audit: [denyEntry, ...state.audit] };
      }

      const updatedDonations = state.donations.map((d) =>
        d.id === action.id
          ? {
              ...d,
              estado: action.status,
              fechaActualizacion: nowFormatted().slice(0, 10),
              notasInternas: action.notas ?? d.notasInternas,
            }
          : d
      );

      const entry = createAudit(
        "Donación",
        don.ref,
        `Estado: ${action.status}`,
        action.usuario,
        `Donación actualizada de '${don.estado}' a '${action.status}'.`
      );

      return {
        ...state,
        donations: updatedDonations,
        audit: [entry, ...state.audit],
      };
    }

    case "CONVERT_DONATION_TO_MATERIAL": {
      const don = state.donations.find((d) => d.id === action.donationId);
      if (!don) return state;

      const updatedDonations = state.donations.map((d) =>
        d.id === action.donationId
          ? {
              ...d,
              estado: "recibida" as DonationStatus,
              notasInternas: `Material catalogado como ${action.material.ref}`,
            }
          : d
      );

      const entry = createAudit(
        "Material",
        action.material.ref,
        "Catalogación desde donación",
        action.usuario,
        `Se creó el registro '${action.material.titulo}' a partir de la donación ${don.ref}.`
      );

      return {
        ...state,
        materials: [action.material, ...state.materials],
        donations: updatedDonations,
        audit: [entry, ...state.audit],
      };
    }

    case "SUBMIT_REQUEST": {
      const updatedMaterials = state.materials.map((m) => {
        if (m.id === action.request.materialId) {
          return {
            ...m,
            estado: "reservado" as MaterialStatus,
            historial: [
              ...m.historial,
              {
                fecha: nowFormatted().slice(0, 10),
                evento: "Solicitud de retiro registrada",
                detalle: `Reservado bajo solicitud ${action.request.ref}`,
              },
            ],
          };
        }
        return m;
      });

      const entry = createAudit(
        "Solicitud",
        action.request.ref,
        "Nueva solicitud de material",
        action.request.nombreSolicitante,
        `Solicitud creada para material ${action.request.materialId}. PIN generado.`
      );

      return {
        ...state,
        requests: [action.request, ...state.requests],
        materials: updatedMaterials,
        audit: [entry, ...state.audit],
      };
    }

    case "VERIFY_AND_DELIVER": {
      const req = state.requests.find((r) => r.id === action.requestId);
      if (!req) return state;

      const updatedRequests = state.requests.map((r) =>
        r.id === action.requestId
          ? {
              ...r,
              estado: "entregada" as RequestStatus,
              fechaEntrega: nowFormatted().slice(0, 10),
              notasInternas: "Retiro completado y validado en coordinación.",
            }
          : r
      );

      const updatedMaterials = state.materials.map((m) =>
        m.id === req.materialId
          ? {
              ...m,
              estado: "entregado" as MaterialStatus,
              fechaBaja: nowFormatted().slice(0, 10),
              historial: [
                ...m.historial,
                {
                  fecha: nowFormatted().slice(0, 10),
                  evento: "Entrega completada",
                  detalle: `Validado y entregado por ${action.usuario}. El material está en circulación.`,
                },
              ],
            }
          : m
      );

      const entry = createAudit(
        "Solicitud",
        req.ref,
        "Entrega concretada",
        action.usuario,
        `Material ${req.materialId} entregado satisfactoriamente al solicitante.`
      );

      return {
        ...state,
        requests: updatedRequests,
        materials: updatedMaterials,
        audit: [entry, ...state.audit],
      };
    }

    case "UPDATE_REQUEST_STATUS": {
      const req = state.requests.find((r) => r.id === action.id);
      if (!req) return state;

      const allowed = REQUEST_FLOW[req.estado];
      if (!allowed.includes(action.status)) {
        const denyEntry = createAudit(
          "Solicitud",
          req.ref,
          "Transición bloqueada",
          action.usuario,
          `No se permite pasar de '${req.estado}' a '${action.status}'.`
        );
        return { ...state, audit: [denyEntry, ...state.audit] };
      }

      let materials = state.materials;
      if (action.status === "cancelada" || action.status === "vencida") {
        materials = materials.map((m) =>
          m.id === req.materialId ? { ...m, estado: "disponible" as MaterialStatus } : m
        );
      }

      const updatedRequests = state.requests.map((r) =>
        r.id === action.id
          ? {
              ...r,
              estado: action.status,
              notasInternas: action.notas ?? r.notasInternas,
            }
          : r
      );

      const entry = createAudit(
        "Solicitud",
        req.ref,
        `Estado: ${action.status}`,
        action.usuario,
        `Solicitud actualizada a ${action.status}.`
      );

      return {
        ...state,
        requests: updatedRequests,
        materials,
        audit: [entry, ...state.audit],
      };
    }

    case "UPDATE_MATERIAL_STATUS": {
      const mat = state.materials.find((m) => m.id === action.id);
      if (!mat) return state;

      const allowed = MATERIAL_FLOW[mat.estado];
      if (!allowed.includes(action.status)) {
        const deny = createAudit(
          "Material",
          mat.ref,
          "Transición bloqueada",
          action.usuario,
          `No se puede pasar de '${mat.estado}' a '${action.status}'.`
        );
        return { ...state, audit: [deny, ...state.audit] };
      }

      const updated = state.materials.map((m) =>
        m.id === action.id
          ? {
              ...m,
              estado: action.status,
              historial: [
                ...m.historial,
                {
                  fecha: nowFormatted().slice(0, 10),
                  evento: `Estado cambiado a ${action.status}`,
                  detalle: action.motivo,
                },
              ],
            }
          : m
      );

      const entry = createAudit(
        "Material",
        mat.ref,
        `Estado: ${action.status}`,
        action.usuario,
        `Material ${mat.titulo} actualizado a ${action.status}.`
      );

      return {
        ...state,
        materials: updated,
        audit: [entry, ...state.audit],
      };
    }

    case "ADD_MATERIAL": {
      const entry = createAudit(
        "Material",
        action.material.ref,
        "Alta directa en catálogo",
        action.usuario,
        `Catalogado: '${action.material.titulo}' por ${action.material.autor}.`
      );
      return {
        ...state,
        materials: [action.material, ...state.materials],
        audit: [entry, ...state.audit],
      };
    }

    case "ADD_CATEGORY": {
      if (action.rol !== "admin") {
        const deny = createAudit(
          "Categoría",
          action.nombre,
          "Acción bloqueada: falta de rol admin",
          action.usuario,
          `El usuario tiene rol '${action.rol}'. Crear categorías requiere rol 'admin'.`
        );
        return { ...state, audit: [deny, ...state.audit] };
      }

      const newCat: Category = {
        id: `c-${Date.now()}`,
        nombre: action.nombre,
        orden: state.categories.length + 1,
        activo: true,
      };

      const entry = createAudit(
        "Categoría",
        newCat.nombre,
        "Creación de Categoría",
        action.usuario,
        `Nueva categoría agregada al catálogo.`
      );

      return {
        ...state,
        categories: [...state.categories, newCat],
        audit: [entry, ...state.audit],
      };
    }

    case "TOGGLE_CATEGORY": {
      if (action.rol !== "admin") {
        const deny = createAudit(
          "Categoría",
          action.id,
          "Acción bloqueada: falta de rol admin",
          action.usuario,
          `Modificar categorías requiere rol 'admin'.`
        );
        return { ...state, audit: [deny, ...state.audit] };
      }

      const updatedCats = state.categories.map((c) =>
        c.id === action.id ? { ...c, activo: !c.activo } : c
      );

      const entry = createAudit(
        "Categoría",
        action.id,
        "Modificación de visibilidad",
        action.usuario,
        `Categoría alternada.`
      );

      return {
        ...state,
        categories: updatedCats,
        audit: [entry, ...state.audit],
      };
    }

    case "REGISTER_SEARCH": {
      return {
        ...state,
        metrics: {
          searches: state.metrics.searches + 1,
          searchesWithResults: action.withResults
            ? state.metrics.searchesWithResults + 1
            : state.metrics.searchesWithResults,
        },
      };
    }

    case "LOG_AUDIT": {
      const entry = createAudit(
        action.entry.entidad,
        action.entry.entidadRef,
        action.entry.accion,
        action.entry.usuario,
        action.entry.detalle
      );
      return {
        ...state,
        audit: [entry, ...state.audit],
      };
    }

    case "RESET_DATABASE": {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      return {
        materials: seedMaterials,
        donations: seedDonations,
        requests: seedRequests,
        categories: seedCategories,
        audit: seedAudit,
        adminUser: null,
        metrics: { searches: 64, searchesWithResults: 58 },
      };
    }

    default:
      return state;
  }
}

interface StoreContextValue {
  state: DBState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
