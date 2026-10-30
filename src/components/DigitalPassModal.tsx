import React, { useState } from "react";
import { Check, Copy, Download, MapPin, X, Calendar, ArrowRight, MessageCircle, BookOpen } from "lucide-react";
import { Material, Request } from "../lib/data";

interface DigitalPassModalProps {
  request: Request;
  material: Material;
  punto?: unknown;
  onClose: () => void;
  onGoToAdmin?: () => void;
}

function renderQrMatrix(token: string) {
  const size = 17;
  const cells: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const drawCorner = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          cells[r + i][c + j] = true;
        }
      }
    }
  };

  drawCorner(0, 0);
  drawCorner(0, size - 7);
  drawCorner(size - 7, 0);

  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = (hash << 5) - hash + token.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8)
      ) {
        continue;
      }
      const val = (hash ^ (r * 31 + c * 17)) % 100;
      cells[r][c] = Math.abs(val) > 42;
    }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full text-stone-900" fill="currentColor">
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" /> : null
        )
      )}
    </svg>
  );
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({
  request,
  material,
  onClose,
  onGoToAdmin,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(request.pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cabecera del Pase */}
        <div className="bg-emerald-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-emerald-200 hover:text-white hover:bg-emerald-900/60 rounded-xl transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 text-xs">
            <span className="uppercase tracking-widest font-mono font-bold text-emerald-300">
              Pase Digital de Retiro
            </span>
            <span className="text-emerald-500">·</span>
            <span className="font-mono text-emerald-100 font-semibold">{request.ref}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display leading-snug">{material.titulo}</h2>
          <p className="text-emerald-200 text-sm mt-0.5 font-medium">{material.autor}</p>
        </div>

        {/* Contenido Central: Código QR y PIN */}
        <div className="p-6 space-y-5">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
            
            {/* Contenedor QR */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs shrink-0 flex items-center justify-center">
              {renderQrMatrix(request.qrToken)}
            </div>

            {/* Bloque PIN */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                PIN de verificación
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-mono text-4xl font-black tracking-widest text-emerald-950 bg-white px-3.5 py-1.5 rounded-xl border border-stone-300 shadow-2xs tabular-nums">
                  {request.pin}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-2.5 text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl border border-stone-200 transition-colors"
                  title="Copiar PIN"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[12px] text-stone-500 leading-normal">
                Indica este PIN al operador cuando coordines la entrega.
              </p>
            </div>
          </div>

          {/* Coordinación y Zona de Retiro */}
          <div className="border border-stone-200 rounded-2xl p-4 bg-white space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900">Zona de retiro: {material.zonaRetiro}</h4>
                <p className="text-stone-500 mt-0.5">
                  El operador se contactará a tu WhatsApp (<strong>{request.telefono}</strong>) para fijar el día y punto exacto.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-stone-700 bg-amber-50/80 border border-amber-200/60 px-3 py-2 rounded-xl">
              <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Reserva válida hasta el: <strong>{request.fechaExpiracion}</strong> (7 días de plazo)</span>
            </div>
          </div>

          {/* Atajo para probar en Backoffice */}
          {onGoToAdmin && (
            <div className="bg-stone-100 rounded-2xl p-3 flex items-center justify-between text-xs text-stone-700">
              <span className="font-medium">¿Deseas probar la entrega como operador?</span>
              <button
                onClick={() => {
                  onClose();
                  onGoToAdmin();
                }}
                className="font-bold text-emerald-900 hover:underline flex items-center gap-1 shrink-0 ml-2"
              >
                Abrir Mesa Interna
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 text-xs font-bold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Guardar comprobante
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-colors shadow-2xs"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
