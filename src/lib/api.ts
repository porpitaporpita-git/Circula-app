/**
 * CIRCULA — Capa de Servicios y Validación v0.1
 */

import { DEMO_USERS, Donation, Material, PublicMaterial, Request } from "./data";

const RATE_LIMITS_KEY = "circula_rate_limits_v01";

function readRateLimits(): Record<string, number[]> {
  try {
    const raw = sessionStorage.getItem(RATE_LIMITS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeRateLimits(data: Record<string, number[]>): void {
  try {
    sessionStorage.setItem(RATE_LIMITS_KEY, JSON.stringify(data));
  } catch {}
}

export function rateCheck(
  key: string,
  maxAllowed: number,
  windowMs: number
): { allowed: boolean; retryInSec: number } {
  const now = Date.now();
  const all = readRateLimits();
  const timestamps = (all[key] ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxAllowed) {
    const oldest = timestamps[0];
    const retryInSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    return { allowed: false, retryInSec };
  }

  all[key] = [...timestamps, now];
  writeRateLimits(all);
  return { allowed: true, retryInSec: 0 };
}

// DTO Sanitizado: El catálogo público NUNCA expone datos de contacto ni donationId
export function getPublicMaterials(materials: Material[]): PublicMaterial[] {
  return materials
    .filter((m) => m.estado !== "borrador" && m.estado !== "inactivo")
    .map((m) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { donationId, ...rest } = m;
      return rest;
    });
}

export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateReference(prefix: "MAT" | "DON" | "SOL"): string {
  const year = new Date().getFullYear();
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${year}-${num}`;
}

// Validación de Solicitud (§12)
export interface RequestInput {
  materialId: string;
  nombreSolicitante: string;
  telefono: string; // Obligatorio para WhatsApp
  email?: string;
  zona?: string;
  mensaje?: string;
  consentimiento: boolean;
}

export function validateRequestInput(
  input: RequestInput,
  material: Material | undefined
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!material) {
    errors.material = "El material seleccionado ya no está disponible.";
  } else if (material.estado !== "disponible") {
    errors.material = `Este material no se encuentra en estado disponible (actual: ${material.estado}).`;
  }

  if (!input.nombreSolicitante.trim() || input.nombreSolicitante.trim().length < 3) {
    errors.nombreSolicitante = "Indica tu nombre completo para la coordinación.";
  }

  const cleanPhone = input.telefono.replace(/[\s\-\(\)]/g, "");
  if (!cleanPhone || cleanPhone.length < 7) {
    errors.telefono = "Indica un número de teléfono o WhatsApp válido (mínimo 7 dígitos).";
  }

  if (input.email && input.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email.trim())) {
      errors.email = "Si indicas un correo, debe tener un formato válido.";
    }
  }

  if (!input.consentimiento) {
    errors.consentimiento = "Debes aceptar que la organización te contacte respecto a esta solicitud.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validación de Donación (§11)
export interface DonationInput {
  nombreDonante: string;
  telefono: string;
  email?: string;
  tipoOrigen: "biblioteca_particular" | "estudiante_egresado" | "profesor_docente" | "institucion";
  tipoMaterial: "libro" | "texto_estudio" | "apuntes_catedra";
  titulo: string;
  autor?: string;
  cantidadEstimada: number;
  descripcion: string;
  categoriaId: string;
  condicion: "excelente" | "muy_bueno" | "bueno" | "regular";
  zona: string;
  comentarios?: string;
}

export function validateDonationInput(input: DonationInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.nombreDonante.trim() || input.nombreDonante.trim().length < 3) {
    errors.nombreDonante = "Indica tu nombre de contacto o institución.";
  }

  const cleanPhone = input.telefono.replace(/[\s\-\(\)]/g, "");
  if (!cleanPhone || cleanPhone.length < 7) {
    errors.telefono = "Indica tu número de teléfono/WhatsApp para que podamos contactarte.";
  }

  if (input.email && input.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email.trim())) {
      errors.email = "Introduce un correo válido.";
    }
  }

  if (!input.titulo.trim() || input.titulo.trim().length < 2) {
    errors.titulo = "Indica el título del libro o descripción del lote ofrecido.";
  }

  if (!input.descripcion.trim() || input.descripcion.trim().length < 5) {
    errors.descripcion = "Describe brevemente los materiales (mínimo 5 caracteres).";
  }

  if (!input.cantidadEstimada || input.cantidadEstimada < 1) {
    errors.cantidadEstimada = "Indica la cantidad aproximada de ejemplares.";
  }

  if (!input.zona.trim()) {
    errors.zona = "Indica tu barrio o localidad aproximada (ej. Cordón, Pocitos, Centro).";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// Autenticación administrativa
export function authenticateAdmin(
  email: string,
  pass: string
): { ok: boolean; user?: (typeof DEMO_USERS)[0]; error?: string; retryInSec?: number } {
  const rl = rateCheck(`auth:${email.toLowerCase()}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return {
      ok: false,
      error: `Demasiados intentos fallidos. Por seguridad, espera ${rl.retryInSec} segundos.`,
      retryInSec: rl.retryInSec,
    };
  }

  const found = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.pass === pass
  );

  if (!found) {
    return { ok: false, error: "Credenciales inválidas. Comprueba correo y contraseña." };
  }

  return { ok: true, user: found };
}

export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
