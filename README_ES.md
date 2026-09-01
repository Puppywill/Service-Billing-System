# Solutions By Design — Sistema de Horas y Facturación (Service Billing System)

Idioma: [Español](README_ES.md) | [English](README.MD)

Solutions By Design, Inc. — Service Billing System es una aplicación web interna
para administrar servicios por hora: clientes y proyectos, asignaciones de
Project Manager, registros de servicio y horas trabajadas, un panel operativo,
reportes de horas de servicio con exportación a PDF y Excel, y un generador de
facturas manuales que produce un PDF profesional.

El nombre del repositorio es `Service-Billing-System`. La marca visible de la
aplicación es `Solutions By Design, Inc.`

---

## Vista previa de la aplicación

Capturas de la aplicación en ejecución (tema oscuro, escritorio 1600×900). Las
pantallas que muestran datos reales de clientes o de personal se documentan en
texto en lugar de mostrarse aquí.

![SBD Service — Panel](docs/screenshots/dashboard-dark.png)

### Módulos principales

| Inicio de sesión | Generador de facturas manuales |
| --- | --- |
| ![Inicio de sesión](docs/screenshots/login-dark.png) | ![Facturas](docs/screenshots/invoices-dark.png) |

| Reportes | Panel — tema claro |
| --- | --- |
| ![Reportes](docs/screenshots/reports-dark.png) | ![Panel tema claro](docs/screenshots/dashboard-light.png) |

| Configuración | Acerca de |
| --- | --- |
| ![Configuración](docs/screenshots/settings-dark.png) | ![Acerca de](docs/screenshots/about-dark.png) |

---

## Documentación empresarial

Documentación profesional preparada para la evaluación y las pruebas de
aceptación de usuario (UAT) del Service Billing System.

- 📄 [Ver Manual PDF](docs/manual/service-billing-system-manual.pdf) — 24 páginas, diseño corporativo con numeración
- 📝 [Descargar Manual Word](docs/manual/service-billing-system-manual.docx) — `.docx` nativo y editable
- 🌐 [Ver Manual HTML](docs/manual/service-billing-system-manual.html) — archivo único autocontenido

La documentación presenta el funcionamiento general del sistema, el flujo de
trabajo, los módulos, los roles, los reportes, el proceso de facturación manual,
los controles de acceso, capturas de pantalla y el estado actual de
Development/UAT. Está redactada en español para su presentación interna a
supervisión, administración y personal usuario que evalúa el sistema.

> **Estado actual: Development / UAT.** Esta versión todavía no ha sido promovida
> a `main` ni a producción.

---

## Estado del proyecto

- **Rama:** esta versión se mantiene en **`development`**.
- **Etapa:** funcional y revisada de forma visual y por revisión de código durante
  el desarrollo iterativo. Está **a la espera de pruebas de aceptación formales de
  la organización / del usuario (UAT)** antes de promoverse a `main`.
- **`main` y producción no han sido actualizados con esta versión.** No existe
  release, tag ni despliegue asociado a este estado.
- Este documento describe el sistema tal como está implementado hoy en
  `development`. **No** afirma que el sistema esté listo para producción ni
  certificado por QA.

---

## Tecnologías

La aplicación se construye deliberadamente sin framework de frontend y sin paso de
compilación.

| Capa | Tecnología |
|---|---|
| Frontend | HTML, CSS, JavaScript puro (una sola página, sin framework) |
| Backend | Node.js, Express |
| Base de datos | Microsoft SQL Server |
| Driver de BD | `mssql` con `msnodesqlv8` (Autenticación de Windows por defecto) |
| Autenticación / sesiones | `express-session`, hash de contraseñas con `bcrypt` |
| Generación de PDF | `pdfkit` |
| Exportación a Excel | `exceljs` |
| Otros | `cors` |

Esta versión **no usa React, Angular ni Vue**.

---

## Módulos y funcionalidades

### Panel / Resumen (Dashboard)

- Resumen del negocio con cinco tarjetas KPI: **Clientes, Proyectos, Registros de
  servicio, Horas totales, Horas pendientes de procesar**.
- Las tarjetas KPI abren un panel de detalle con los registros relacionados
  (horas pendientes, horas procesadas, registros del mes en curso, resumen de
  proyecto, últimos registros de servicio).
- Gráficos de barras para **horas por mes, cliente, proyecto y técnico**,
  renderizados sin librerías externas; las barras son interactivas y abren un
  panel de detalle.
- Paneles de actividad reciente de registros de servicio, clientes y proyectos.
- **Panel de proyecto:** buscar un proyecto y revisar su información de contrato y
  totales de horas.
- **Panel de técnico:** filtrar por técnico, proyecto y rango de fechas para
  revisar horas trabajadas, horas por cliente/proyecto, totales y últimos
  registros. El administrador puede elegir cualquier técnico; un técnico ve su
  propio alcance.
- Los datos globales del panel se filtran a clientes, proyectos y técnicos
  activos. Los números usan un formato `en-US` consistente (por ejemplo
  `11,553.25 h`).

### Clientes

- Crear, editar y listar clientes con búsqueda.
- Manejo **Activo / Inactivo** mediante desactivación lógica (soft delete): las
  filas nunca se eliminan físicamente, por lo que se preserva la información
  histórica.
- Incluye contacto, correo, teléfono, nombre de facturación, identificación
  fiscal y dirección.

### Proyectos

- Crear, editar y listar proyectos ligados a un cliente, con búsqueda y filtro por
  cliente.
- Desactivación lógica **Activo / Inactivo**.
- Información de contrato: número de contrato, horas contratadas, horas
  usadas/restantes, fechas de vigencia y alertas visuales de estado de contrato
  (OK, pocas horas, por vencer, agotado/vencido, sin contrato).
- **Asignaciones de Project Manager:** se pueden asignar uno o varios usuarios
  Project Manager a un proyecto desde el editor de proyecto (y desde la pantalla
  de Usuarios).

### Registros de servicio

- Listado con **paginación del lado del servidor de 50 registros por página** y
  navegación Anterior / Siguiente con contador de registros.
- Búsqueda por técnico, cliente, proyecto y descripción; filtros por técnico,
  cliente, proyecto, fecha de servicio y estado
  (`Recorded`, `Billed`, `Canceled`).
- Modal de creación / edición con cálculo automático de `TotalHours` a partir de
  los rangos de mañana y tarde
  `(FinMañana − InicioMañana) + (FinTarde − InicioTarde)`.
- Cancelación lógica (estado `Canceled`): los registros no se eliminan.
- El campo de búsqueda tiene debounce.
- Sensible al rol y a las asignaciones: lo que un usuario ve y puede hacer depende
  de su rol y, para Project Managers, de sus proyectos asignados.

### Reportes

- Reporte de horas de servicio con filtros: rango de fechas, técnico, cliente,
  proyecto y estado; más un resumen (totales, horas facturadas/no
  facturadas/canceladas, desgloses).
- **Exportación a PDF** (PDFKit): diseño corporativo de Solutions By Design, Inc.
  con un desglose de servicios y una sección de hoja de tiempo (Time Sheet)
  agrupada, encabezados/pies de página y numeración `Página X de Y`.
- **Exportación a Excel** (ExcelJS) del reporte de horas de servicio.
- Se puede incluir un campo manual `Invoice #` en el PDF exportado solo para esa
  solicitud; no se guarda en la base de datos.
- Los botones de exportación permanecen deshabilitados hasta que se genere un
  reporte con registros.

### Facturas (facturación manual)

Un generador de facturas basado solo en el formulario que produce un PDF
profesional. **Ningún dato de esta pantalla se guarda en la base de datos.**

- Encabezado editable: Invoice #, Fecha, P.O. No., Terms, Fecha de vencimiento,
  Proyecto, Bill To.
- Sección editable de **Detalle del servicio**: descripción principal del
  servicio, período del servicio, números de cuentas, número de contrato, fechas
  de vigencia (selectores de fecha nativos) y horas contratadas / disponibles /
  trabajadas / finales.
- **Líneas de factura** dinámicas con `Cantidad`, `Descripción`, `Rate` y un
  `Amount` calculado automáticamente (`Cantidad × Rate`). Se pueden agregar y
  eliminar líneas.
- Resumen: **Subtotal**, **IVU** (tasa por defecto `11.5%`, se puede desactivar o
  cambiar) y **Total**.
- Textos de certificación opcionales (dos bloques, cada uno se puede mostrar u
  ocultar en el PDF) y dos bloques de firma configurables (nombre y cargo).
- Mensaje final de factura editable.
- `POST /api/manual-invoices/pdf` genera el PDF con todas las líneas, la marca,
  los metadatos, el Bill To, los totales, las secciones de certificación/firma y
  el pie de página.
- **Validación del formulario** antes de generar: los campos obligatorios
  (Invoice #, Fecha, Proyecto, Bill To y, por cada línea, Cantidad y Descripción)
  muestran un `*` rojo junto al label; al enviar, los campos vacíos o inválidos
  reciben borde rojo y un mensaje en línea "Este campo es obligatorio", se
  establecen `aria-invalid` / `aria-describedby` y el foco se mueve al primer
  campo inválido. El estado rojo se elimina a medida que se corrige cada campo. El
  campo de números de cuentas elimina líneas duplicadas exactas al cargar, al
  pegar, al perder el foco y al construir el PDF.

### Usuarios

- Administración de usuarios con filtros por rol y por estado.
- Estado **Activo / Inactivo** visible en la tabla; el administrador puede activar
  o desactivar un usuario sin eliminar filas. Los usuarios inactivos no pueden
  iniciar sesión, pero sus registros de servicio históricos siguen disponibles.
- El administrador no puede desactivar su propia cuenta con sesión iniciada.
- Gestión de asignaciones de Project Manager, incluida una vista de detalle de
  solo lectura.

### Project Managers

- El rol `Project Manager` está limitado a los proyectos asignados a ese usuario
  (almacenados en `dbo.UserProjectAssignments`).
- Dentro de Clientes, Proyectos, Registros de servicio, Panel y Reportes, un
  Project Manager solo ve datos de sus proyectos asignados; las exportaciones
  PDF/Excel usan el mismo alcance.
- Las solicitudes directas de un proyecto o registro de servicio no asignado
  devuelven `403`.
- Los Project Managers no pueden crear, editar, cancelar ni procesar registros de
  servicio, y no pueden acceder a la administración de usuarios, a la
  configuración ni al endpoint de facturación manual.
- Un Project Manager sin asignaciones puede iniciar sesión y recibe un espacio de
  trabajo vacío con su alcance.

### Notificaciones y experiencia de uso

- **Toasts** dentro de la aplicación: éxito (verde), error (rojo), advertencia
  (ámbar), información (azul), con cierre automático, pausa al pasar el cursor y
  botón para descartar.
- Un **modal de confirmación** con la identidad del sistema reemplaza el
  `confirm()` del navegador para acciones destructivas.
- Avisos de cambios sin guardar en los formularios principales; estados de carga
  consistentes que siempre restauran los botones tras éxito o error.
- Campana de notificaciones con contador de no leídas; el administrador puede
  eliminar notificaciones individuales.
- Flujo de solicitud de recuperación de contraseña
  (`POST /api/forgot-password`); un administrador resuelve la solicitud.

### Tema e interfaz

- Modos de apariencia: **Sistema**, **Claro** y **Oscuro**. El tema resuelto se
  aplica antes del primer render para evitar parpadeo, y la preferencia manual se
  guarda en `localStorage` bajo `sbd-theme` (`system` sigue al sistema operativo).
- Interfaz empresarial de inspiración Apple: bordes finos (hairline), elevación
  sutil, radios consistentes, estados hover/focus/active discretos y soporte de
  `prefers-reduced-motion`.
- Diseño responsivo para escritorio, tablet y móvil.
- El texto de la interfaz está disponible en **español e inglés** mediante un
  sistema de traducción compartido, conmutable desde el encabezado.

---

## Roles y permisos

Los roles están definidos por la implementación del backend. No se deben asumir
permisos más allá de lo aquí listado.

| Rol | Valor persistido | Resumen |
|---|---|---|
| **Admin** | `Admin` | Acceso administrativo completo donde está implementado: Usuarios, Configuración, roles, asignaciones de Project Manager, todos los datos de Clientes / Proyectos / Registros de servicio / Reportes / Panel, y la pantalla de Facturas. |
| **Project Manager** | `ProjectManager` (etiqueta "Project Manager") | Acceso orientado a lectura, acotado a los proyectos asignados en Clientes, Proyectos, Registros de servicio, Panel y Reportes (incluidas exportaciones). No administra usuarios/configuración, no crea/edita/cancela/procesa registros de servicio, no usa el endpoint de facturación manual. Los recursos no asignados devuelven `403`. |
| **Técnico / Usuario** | `Technician` o `User` | Flujo autorizado de registros de servicio: puede ver registros y crear registros bajo su propia identidad de técnico, según las verificaciones de permisos actuales. Sin acceso administrativo. |

La autenticación es por sesión con contraseñas cifradas con bcrypt. Las cuentas
inactivas se bloquean en el inicio de sesión.

---

## Datos y persistencia

- Base de datos: **`ServiceBillingDB`** en SQL Server.
- Conexión por defecto: servidor `localhost`, **Autenticación de Windows**.
  Configurable mediante variables de entorno (`DB_SERVER`, `DB_PORT`, `DB_NAME` y
  credenciales SQL cuando se proporcionan).
- Tablas utilizadas por la aplicación: `Users`, `Notifications`,
  `PasswordResetRequests`, `Clients`, `Projects`, `ServiceRecords`, `Invoices`,
  `InvoiceLines`, `AppSettings` y `UserProjectAssignments`.
- Las eliminaciones en toda la aplicación son **lógicas** (`IsActive = 0` o estado
  `Canceled`). Se preservan los datos históricos.
- La pantalla de Facturas y el campo `Invoice #` de Reportes **no** escriben en la
  base de datos.

---

## Instalación y ejecución

Requisitos: Node.js y npm, y una instancia de SQL Server accesible con
`ServiceBillingDB` disponible.

```bash
# 1. Instalar dependencias
npm install

# 2. (Opcional) cargar datos de demostración si el esquema local lo permite
npm run seed

# 3. Iniciar el servidor
npm start

# 4. Abrir la aplicación
#    http://localhost:3000
```

Variables de entorno opcionales: `DB_SERVER`, `DB_PORT`, `DB_NAME`,
`APP_ASSET_VERSION`, `PORT`.

---

## Launcher de Windows

Se incluye un launcher de conveniencia para demostraciones locales en
`tools/launcher/service_billing_launcher.py`, con su propia documentación en
`tools/launcher/README.md`.

Ejecuta `npm start` desde la carpeta del proyecto, espera a que
`http://localhost:3000` responda, abre el navegador predeterminado, evita iniciar
procesos duplicados y guarda logs en `tools/launcher/logs/`. No modifica la base
de datos ni reemplaza el servidor Node/Express. Opcionalmente se puede empaquetar
como `.exe` con PyInstaller.

---

## Estructura del repositorio

| Ruta | Propósito |
|---|---|
| `index.html` | Estructura de la aplicación: login, navegación, pantallas, tablas, formularios y modales. |
| `style.css` | Sistema de tema (Sistema/Claro/Oscuro), maquetación, componentes y estados visuales. |
| `app.js` | Lógica de frontend: llamadas a la API, traducciones, filtros, interfaz por rol, validación, render dinámico. |
| `server.js` | Backend Express: conexión a SQL Server, autenticación, APIs de todos los módulos, reportes, generación de PDF y Excel. |
| `service-billing-schema.sql` | Crea `ServiceBillingDB`, sus tablas, relaciones, índices y datos de demostración. |
| `phase-34-project-manager-assignments.sql` | Migración idempotente del rol Project Manager y `UserProjectAssignments`. |
| `seed.js`, `seed-demo-data.js` | Utilidades de datos de demostración. |
| `assets/` | Logos y favicons. |
| `tools/launcher/` | Launcher de demostración para Windows y su documentación. |

---

## Estado de pruebas

- Los módulos se han ejercitado durante el desarrollo iterativo y la revisión de
  código, y la interfaz actual se ha revisado de forma visual.
- Las pruebas formales y documentadas de QA y de aceptación de la
  organización / del usuario en todos los roles, navegadores y escenarios de
  datos **siguen pendientes**.
- Hasta que se completen y aprueben las UAT, esta versión permanece en
  `development` y no se promueve a `main` ni se despliega.

---

## Autor

**William Rosado Pérez** — B.S. Computer Science · IT Support Specialist ·
Database Support · Puerto Rico

GitHub: [https://github.com/Puppywill](https://github.com/Puppywill)
