# CIRCULA — Documento de Desarrollador v0.1

Plataforma centralizada para la circulación gratuita de **libros de todo tipo** y **textos/materiales de estudio** (foco en estudiantes universitarios, profesorado y lectores en general).

---

## 1. Alineación con el Plan Ejecutivo v0.1

1. **Núcleo del producto**:
   - **50% Libros de lectura general**: Literatura, novelas, ensayos humanísticos, divulgación y poesía (rescatados de bibliotecas particulares para que continúen circulando).
   - **50% Textos y apuntes de estudio**: Manuales universitarios, textos de formación docente / profesorado (IPA, Humanidades, FING, FCEA) y cuadernillos de cátedra.
   - **Fuera de alcance del MVP**: Instrumental físico como calculadoras u objetos que no sean de lectura.

2. **Privacidad por diseño (§3 y §14)**:
   - Los datos personales de donantes y solicitantes (teléfono, email, dirección exacta) nunca se publican en el catálogo.
   - El catálogo solo expone la **zona aproximada** (barrio / localidad: ej. *Cordón*, *Parque Rodó*, *Pocitos*, *Centro*).
   - El punto y horario exacto de retiro se coordina directamente por WhatsApp o email con el operador.

3. **Curaduría y centralización (§2)**:
   - No es red social, ni marketplace ni sitio de autopublicación.
   - Quien dona completa un formulario breve de ofrecimiento (§11).
   - La organización revisa, contacta, recibe físicamente, clasifica, fotografía y publica los materiales en el catálogo en estado *Disponible*.

4. **Experiencia Mobile-First y Diseño Atractivo**:
   - Navegación superior compacta + barra de navegación táctil inferior para pulgares en celulares.
   - Tarjetas de libro con maquetas editoriales que evocan portadas reales.
   - Búsqueda en texto libre tolerante: título, autor, materia, carrera/profesorado, institución y descripción.

---

## 2. Máquinas de Estado Oficiales (§9)

- **Donación**:
  `Pendiente` ➔ `Contactada` ➔ `Aceptada` ➔ `En recepción` ➔ `Recibida` (o `Rechazada` / `Cancelada`).
- **Material**:
  `Borrador` ➔ `Disponible` ⇄ `Reservado` ➔ `Entregado` (o `Inactivo`).
- **Solicitud**:
  `Recibida` ➔ `En coordinación` ➔ `Reservada` ➔ `Entregada` (o `Cancelada` / `Vencida`).
