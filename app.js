const API_URL = "/api/tickets";
const NOTIFICATIONS_URL = "/api/notifications";

const loginView = document.querySelector("#loginView");
const forgotPasswordView = document.querySelector("#forgotPasswordView");
const appView = document.querySelector("#appView");
const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginMessage = document.querySelector("#loginMessage");
const sessionBar = document.querySelector("#sessionBar");
const sessionName = document.querySelector("#sessionName");
const sessionRole = document.querySelector("#sessionRole");
const logoutButton = document.querySelector("#logoutButton");
const languageToggle = document.querySelector("#languageToggle");
const notificationBell = document.querySelector("#notificationBell");
const notificationCount = document.querySelector("#notificationCount");
const forgotPasswordLink = document.querySelector("#forgotPasswordLink");
const forgotPasswordForm = document.querySelector("#forgotPasswordForm");
const forgotPasswordMessage = document.querySelector("#forgotPasswordMessage");
const forgotPasswordTitle = document.querySelector("#forgotPasswordTitle");
const requestRecoveryButton = document.querySelector("#requestRecoveryButton");
const backToLoginButton = document.querySelector("#backToLoginButton");
const tabButtons = document.querySelectorAll(".tab-button");
const dashboardTabPanel = document.querySelector("#dashboardTabPanel");
const clientsTabPanel = document.querySelector("#clientsTabPanel");
const projectsTabPanel = document.querySelector("#projectsTabPanel");
const ticketsTabPanel = document.querySelector("#ticketsTabPanel");
const invoicesTabPanel = document.querySelector("#invoicesTabPanel");
const notificationsTabPanel = document.querySelector("#notificationsTabPanel");
const usersTabButton = document.querySelector("#usersTabButton");
const usersTabPanel = document.querySelector("#usersTabPanel");
const reportsTabButton = document.querySelector("#reportsTabButton");
const reportsTabPanel = document.querySelector("#reportsTabPanel");
const settingsTabPanel = document.querySelector("#settingsTabPanel");

const addClientButton = document.querySelector("#addClientButton");
const clientSearchInput = document.querySelector("#clientSearchInput");
const clientsTableBody = document.querySelector("#clientsTableBody");
const clientsTotalCount = document.querySelector("#clientsTotalCount");
const clientsMessage = document.querySelector("#clientsMessage");
const clientModal = document.querySelector("#clientModal");
const clientForm = document.querySelector("#clientForm");
const clientModalTitle = document.querySelector("#client-modal-title");
const closeClientModal = document.querySelector("#closeClientModal");
const clientId = document.querySelector("#clientId");
const clientName = document.querySelector("#clientName");
const clientContactName = document.querySelector("#clientContactName");
const clientEmail = document.querySelector("#clientEmail");
const clientPhone = document.querySelector("#clientPhone");
const clientBillingName = document.querySelector("#clientBillingName");
const clientTaxId = document.querySelector("#clientTaxId");
const clientIsActive = document.querySelector("#clientIsActive");
const clientFormMessage = document.querySelector("#clientFormMessage");
const saveClientButton = document.querySelector("#saveClientButton");

const ticketForm = document.querySelector("#ticketForm");
const creatingTicketAsLabel = document.querySelector("#creatingTicketAsLabel");
const creatingTicketAsName = document.querySelector("#creatingTicketAsName");
const descriptionInput = document.querySelector("#description");
const priorityInput = document.querySelector("#priority");
const statusInput = document.querySelector("#status");
const statusHelp = document.querySelector("#statusHelp");
const ticketTableBody = document.querySelector("#ticketTableBody");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const priorityFilter = document.querySelector("#priorityFilter");

const userForm = document.querySelector("#userForm");
const userFullName = document.querySelector("#userFullName");
const userEmail = document.querySelector("#userEmail");
const userPassword = document.querySelector("#userPassword");
const userRole = document.querySelector("#userRole");
const userFormMessage = document.querySelector("#userFormMessage");
const usersTableBody = document.querySelector("#usersTableBody");
const usersTotalCount = document.querySelector("#usersTotalCount");
const passwordResetsTableBody = document.querySelector("#passwordResetsTableBody");
const passwordResetsTotalCount = document.querySelector("#passwordResetsTotalCount");
const notificationsTableBody = document.querySelector("#notificationsTableBody");
const notificationsTotalCount = document.querySelector("#notificationsTotalCount");
const dashboardMetricOne = document.querySelector("#dashboardMetricOne");
const dashboardMetricTwo = document.querySelector("#dashboardMetricTwo");
const dashboardMetricThree = document.querySelector("#dashboardMetricThree");
const dashboardMetricFour = document.querySelector("#dashboardMetricFour");
const dashboardMetricOneLabel = document.querySelector("#dashboardMetricOneLabel");
const dashboardMetricTwoLabel = document.querySelector("#dashboardMetricTwoLabel");
const dashboardMetricThreeLabel = document.querySelector("#dashboardMetricThreeLabel");
const dashboardMetricFourLabel = document.querySelector("#dashboardMetricFourLabel");
const dashboardNotificationsTitle = document.querySelector("#dashboardNotificationsTitle");
const dashboardNotificationsList = document.querySelector("#dashboardNotificationsList");

const editModal = document.querySelector("#editModal");
const editTicketForm = document.querySelector("#editTicketForm");
const closeEditModal = document.querySelector("#closeEditModal");
const editTicketId = document.querySelector("#editTicketId");
const editDescription = document.querySelector("#editDescription");
const editPriority = document.querySelector("#editPriority");
const editStatus = document.querySelector("#editStatus");

const editUserModal = document.querySelector("#editUserModal");
const editUserForm = document.querySelector("#editUserForm");
const closeEditUserModal = document.querySelector("#closeEditUserModal");
const editUserId = document.querySelector("#editUserId");
const editFullName = document.querySelector("#editFullName");
const editEmail = document.querySelector("#editEmail");
const editPassword = document.querySelector("#editPassword");
const temporaryPasswordButton = document.querySelector("#temporaryPasswordButton");
const editRole = document.querySelector("#editRole");
const editUserMessage = document.querySelector("#editUserMessage");

const openCount = document.querySelector("#openCount");
const progressCount = document.querySelector("#progressCount");
const closedCount = document.querySelector("#closedCount");
const totalCount = document.querySelector("#totalCount");
const reportsForm = document.querySelector("#reportsForm");
const reportFrom = document.querySelector("#reportFrom");
const reportTo = document.querySelector("#reportTo");
const reportStatus = document.querySelector("#reportStatus");
const reportPriority = document.querySelector("#reportPriority");
const reportsTableBody = document.querySelector("#reportsTableBody");
const reportsTotalCount = document.querySelector("#reportsTotalCount");
const reportsMessage = document.querySelector("#reportsMessage");
const generateReportButton = document.querySelector("#generateReportButton");
const exportPdfButton = document.querySelector("#exportPdfButton");
const exportExcelButton = document.querySelector("#exportExcelButton");

let tickets = [];
let clients = [];
let users = [];
let notifications = [];
let passwordResets = [];
let reportTickets = [];
let hasGeneratedReport = false;
let currentUser = null;
let activeTab = "tickets";
let currentLanguage = localStorage.getItem("helpdeskLanguage") || "es";

function clearTransientStorage() {
  sessionStorage.clear();

  [
    "tickets",
    "helpdeskTickets",
    "helpdeskUser",
    "helpdeskSession",
    "currentUser"
  ].forEach((key) => localStorage.removeItem(key));
}

function resetClientState({ render = true } = {}) {
  tickets = [];
  clients = [];
  users = [];
  notifications = [];
  passwordResets = [];
  reportTickets = [];
  hasGeneratedReport = false;

  if (render) {
    renderTickets();
    renderClients();
    renderUsers();
    renderPasswordResets();
    renderNotifications();
    renderReportTickets();
    renderDashboard();
  }
}

async function refreshAuthenticatedUser() {
  const response = await fetch("/api/me", {
    cache: "no-store"
  });
  const data = await parseJsonResponse(response);

  if (!response.ok || !data.user) {
    currentUser = null;
    return null;
  }

  setAuthenticatedUser(data.user, { switchToTickets: false });
  return data.user;
}

async function refreshWorkspace() {
  await refreshAuthenticatedUser();

  if (!currentUser) {
    showLogin();
    return;
  }

  if ((activeTab === "users" || activeTab === "reports") && !isAdmin()) {
    await switchTab("tickets");
  }

  await loadTickets();
  await loadUsersIfAdmin();
  await loadPasswordResetsIfAdmin();
  await loadNotifications();
  renderDashboard();
}

const translations = {
  es: {
    documentTitle: "Service Billing System",
    headerEyebrow: "Registro de horas y facturacion",
    headerTitle: "Service Billing System",
    headerSubtitle: "Registra, consulta y prepara informacion de servicios por hora desde el navegador.",
    secureAccess: "Acceso seguro",
    login: "Iniciar sesion",
    password: "Password",
    passwordPlaceholder: "Tu password",
    tickets: "Service Records",
    users: "Users",
    notifications: "Notificaciones",
    dashboard: "Dashboard",
    reports: "Reports",
    clients: "Clients",
    projects: "Projects",
    invoices: "Invoices",
    settings: "Settings",
    clientsEyebrow: "Catalogo de clientes",
    projectsEyebrow: "Catalogo de trabajo",
    invoicesEyebrow: "Area de facturacion",
    settingsEyebrow: "Preferencias del sistema",
    clientsFoundation: "La administracion de clientes esta lista para el flujo de Service Billing. La conexion API se agregara en una fase posterior del frontend.",
    addClient: "Add Client",
    editClient: "Edit Client",
    saveClient: "Save Client",
    clientSearchPlaceholder: "Cliente, email o telefono",
    clientsCount: "clientes",
    noClients: "No hay clientes activos.",
    noClientMatches: "No hay clientes que coincidan con la busqueda.",
    loadClientsError: "No se pudieron cargar los clientes.",
    createClientSuccess: "Cliente creado correctamente.",
    updateClientSuccess: "Cliente actualizado correctamente.",
    deleteClientSuccess: "Cliente desactivado correctamente.",
    clientNameRequired: "ClientName es obligatorio.",
    clientNotFound: "No se encontro el cliente seleccionado.",
    deleteClientConfirm: "Seguro que deseas desactivar este cliente?",
    createClientError: "No se pudo crear el cliente.",
    updateClientError: "No se pudo actualizar el cliente.",
    deleteClientError: "No se pudo desactivar el cliente.",
    projectsFoundation: "La administracion de proyectos organizara el trabajo por cliente, descripcion y tarifa por hora antes de registrar servicios.",
    invoicesFoundation: "Las pantallas de facturas usaran horas registradas para generar encabezados, lineas, totales y estados de facturacion.",
    settingsFoundation: "Configuracion centralizara preferencias de cuenta, notificaciones, valores de facturacion y controles de migracion en una fase posterior.",
    createTicket: "Crear registro",
    addUser: "Agregar usuario",
    createUser: "Crear usuario",
    editTicket: "Editar registro de servicio",
    editUser: "Editar usuario",
    saveChanges: "Guardar cambios",
    saveUser: "Guardar usuario",
    edit: "Editar",
    close: "Cerrar",
    delete: "Eliminar",
    logout: "Cerrar sesion",
    search: "Buscar",
    searchPlaceholder: "Nombre de usuario o descripcion",
    status: "Estado",
    priority: "Prioridad",
    user: "Usuario",
    issue: "Problema",
    date: "Fecha",
    actions: "Acciones",
    message: "Mensaje",
    type: "Tipo",
    reportedBy: "Registrado por",
    createdBy: "Creado por",
    dateFrom: "Fecha desde",
    dateTo: "Fecha hasta",
    generateReport: "Generar reporte",
    exportPdf: "Exportar PDF",
    exportExcel: "Exportar Excel",
    analytics: "Analitica",
    reportReady: "Reporte generado correctamente.",
    reportInitial: "Genera un reporte para ver resultados.",
    noReportTickets: "No hay registros para los filtros seleccionados.",
    reportError: "No se pudo generar el reporte.",
    exportError: "No se pudo exportar el reporte.",
    invalidApiResponse: "El servidor devolvio una respuesta HTML en lugar de JSON. Verifica que el servidor este reiniciado y que el endpoint API exista.",
    passwordResets: "Solicitudes Forgot Password",
    passwordResetRequests: "solicitudes",
    noPasswordResets: "No hay solicitudes de recuperacion.",
    resolve: "Marcar resuelta",
    markResolved: "Marcar como resuelta",
    temporaryPassword: "Asignar password temporal",
    showPassword: "Mostrar password",
    hidePassword: "Ocultar password",
    pending: "Pendiente",
    resolved: "Resuelto",
    forgotSaved: "Solicitud recibida. Contacta a un administrador para restablecer tu contrasena.",
    forgotError: "No se pudo enviar la solicitud.",
    name: "Nombre",
    userName: "Nombre del usuario",
    userNamePlaceholder: "Ej. Ana Gomez",
    creatingTicketAs: "Creando registro como:",
    authenticatedUser: "Usuario autenticado",
    issueDescription: "Descripcion del servicio",
    issuePlaceholder: "Ej. Servicio tecnico realizado al cliente.",
    newCase: "Nuevo registro",
    supportInbox: "Registro operativo",
    allTickets: "Todos los registros de servicio",
    registeredTickets: "registros de servicio",
    ticketCounters: "Contadores de registros de servicio",
    openCountLabel: "Abiertos",
    progressCountLabel: "En progreso",
    closedCountLabel: "Cerrados",
    statusHelp: "Los usuarios crean registros como Abierto.",
    forgot: "\u00bfOlvidaste tu contrase\u00f1a?",
    recoverPassword: "Recuperar contrase\u00f1a",
    forgotMessage: "Contacta a un administrador para restablecer tu contrase\u00f1a.",
    requestReset: "Solicitar recuperaci\u00f3n",
    backToLogin: "Volver al Login",
    enter: "Entrar al sistema",
    emailPlaceholder: "tu@email.com",
    navigationLabel: "Navegacion principal",
    executiveSummary: "Resumen ejecutivo",
    activity: "Actividad",
    noNotifications: "No hay notificaciones.",
    notificationsCount: "notificaciones",
    read: "Leida",
    unread: "Nueva",
    all: "Todos",
    allPriority: "Todas",
    open: "Abierto",
    inProgress: "En Progreso",
    closed: "Cerrado",
    high: "Alta",
    medium: "Media",
    low: "Baja",
    totalTickets: "Total Registros",
    openTickets: "Registros Abiertos",
    progressTickets: "Registros En Progreso",
    closedTickets: "Registros Cerrados",
    totalUsers: "Total Usuarios",
    latestNotifications: "Ultimas notificaciones",
    myTickets: "Mis Registros",
    myOpenTickets: "Mis Registros Abiertos",
    myClosedTickets: "Mis Registros Cerrados",
    myNotifications: "Mis Notificaciones",
    readOnly: "Solo lectura",
    noAudit: "Sin auditoria",
    noTickets: "No hay registros de servicio.",
    noTicketMatches: "No hay registros que coincidan con la busqueda o los filtros.",
    loadUsersError: "No se pudo cargar el panel de usuarios.",
    usersAdminOnly: "Panel disponible solo para administradores.",
    noUsers: "No hay usuarios registrados.",
    registeredUsers: "usuarios registrados",
    administration: "Administracion",
    security: "Seguridad",
    fullName: "Nombre completo",
    fullNamePlaceholder: "Ej. Maria Lopez",
    role: "Rol",
    tempPasswordPlaceholder: "Password temporal",
    newPassword: "Nuevo password",
    keepPasswordPlaceholder: "Dejar vacio para mantener",
    admin: "Administrador",
    closeEditor: "Cerrar editor",
    closeUserEditor: "Cerrar editor de usuario",
    completeTicketFields: "Completa la descripcion del problema.",
    loginError: "No se pudo iniciar sesion.",
    loadTicketsError: "No se pudieron cargar los tickets.",
    serverConnectionError: "No se pudo conectar con el servidor.",
    createTicketError: "No se pudo crear el ticket.",
    createTicketAlertError: "Ocurrio un error al crear el ticket.",
    ticketNotFound: "No se encontro el ticket seleccionado.",
    userNotFound: "No se encontro el usuario seleccionado.",
    createUserError: "No se pudo crear el usuario.",
    editUserError: "No se pudo editar el usuario.",
    deleteUserError: "No se pudo eliminar el usuario.",
    deleteUserConfirm: "Seguro que deseas eliminar este usuario?",
    updateTicketError: "No se pudo editar el ticket.",
    updateTicketAlertError: "Ocurrio un error al editar el ticket.",
    closeTicketError: "No se pudo cerrar el ticket.",
    closeTicketAlertError: "Ocurrio un error al cerrar el ticket.",
    deleteTicketError: "No se pudo eliminar el ticket.",
    deleteTicketAlertError: "Ocurrio un error al eliminar el ticket.",
    deleteTicketConfirm: "Seguro que deseas eliminar este ticket?",
    userNumber: "Usuario",
    notificationTypes: {
      TICKET_CREATED: "Ticket creado",
      TICKET_CLOSED: "Ticket cerrado",
      TICKET_DELETED: "Ticket eliminado",
      USER_CREATED: "Usuario creado",
      USER_UPDATED: "Usuario editado",
      PASSWORD_RESET_REQUESTED: "Recuperacion de contrasena",
      REPORT_GENERATED: "Reporte generado"
    },
    statuses: {
      Abierto: "Abierto",
      "En Progreso": "En Progreso",
      Cerrado: "Cerrado"
    },
    priorities: {
      Alta: "Alta",
      Media: "Media",
      Baja: "Baja"
    }
  },
  en: {
    documentTitle: "Service Billing System",
    headerEyebrow: "Time tracking and billing",
    headerTitle: "Service Billing System",
    headerSubtitle: "Register, review, and prepare hourly service information from the browser.",
    secureAccess: "Secure access",
    login: "Sign in",
    password: "Password",
    passwordPlaceholder: "Your password",
    tickets: "Service Records",
    users: "Users",
    notifications: "Notifications",
    dashboard: "Summary",
    reports: "Reports",
    clients: "Clients",
    projects: "Projects",
    invoices: "Invoices",
    settings: "Settings",
    clientsEyebrow: "Customer catalog",
    projectsEyebrow: "Work catalog",
    invoicesEyebrow: "Billing workspace",
    settingsEyebrow: "System preferences",
    clientsFoundation: "Client management is ready for the Service Billing workflow. API connection will be added in a later frontend phase.",
    addClient: "Add Client",
    editClient: "Edit Client",
    saveClient: "Save Client",
    clientSearchPlaceholder: "Client, email, or phone",
    clientsCount: "clients",
    noClients: "No active clients.",
    noClientMatches: "No clients match the search.",
    loadClientsError: "Clients could not be loaded.",
    createClientSuccess: "Client created successfully.",
    updateClientSuccess: "Client updated successfully.",
    deleteClientSuccess: "Client deactivated successfully.",
    clientNameRequired: "ClientName is required.",
    clientNotFound: "The selected client was not found.",
    deleteClientConfirm: "Are you sure you want to deactivate this client?",
    createClientError: "Could not create the client.",
    updateClientError: "Could not update the client.",
    deleteClientError: "Could not deactivate the client.",
    projectsFoundation: "Project management will organize client work, descriptions, and hourly rates before service records are entered.",
    invoicesFoundation: "Invoice screens will use recorded service hours to generate invoice headers, line items, totals, and billing status.",
    settingsFoundation: "Settings will centralize account preferences, notifications, billing defaults, and migration controls in a later phase.",
    createTicket: "Create record",
    addUser: "Add user",
    createUser: "Create user",
    editTicket: "Edit service record",
    editUser: "Edit user",
    saveChanges: "Save changes",
    saveUser: "Save user",
    edit: "Edit",
    close: "Close",
    delete: "Delete",
    logout: "Sign out",
    search: "Search",
    searchPlaceholder: "User name or issue description",
    status: "Status",
    priority: "Priority",
    user: "User",
    issue: "Issue",
    date: "Date",
    actions: "Actions",
    message: "Message",
    type: "Type",
    reportedBy: "Recorded by",
    createdBy: "Created by",
    dateFrom: "Date from",
    dateTo: "Date to",
    generateReport: "Generate report",
    exportPdf: "Export PDF",
    exportExcel: "Export Excel",
    analytics: "Analytics",
    reportReady: "Report generated successfully.",
    reportInitial: "Generate a report to view results.",
    noReportTickets: "No records found for the selected filters.",
    reportError: "The report could not be generated.",
    exportError: "The report could not be exported.",
    invalidApiResponse: "The server returned HTML instead of JSON. Make sure the server was restarted and the API endpoint exists.",
    passwordResets: "Forgot Password Requests",
    passwordResetRequests: "requests",
    noPasswordResets: "No password recovery requests.",
    resolve: "Mark resolved",
    markResolved: "Mark as resolved",
    temporaryPassword: "Assign temporary password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    pending: "Pending",
    resolved: "Resolved",
    forgotSaved: "Request received. Contact an administrator to reset your password.",
    forgotError: "The request could not be sent.",
    name: "Name",
    userName: "User name",
    userNamePlaceholder: "Ex. Ana Gomez",
    creatingTicketAs: "Creating record as:",
    authenticatedUser: "Authenticated user",
    issueDescription: "Service description",
    issuePlaceholder: "Ex. Technical service performed for the client.",
    newCase: "New record",
    supportInbox: "Operational records",
    allTickets: "All service records",
    registeredTickets: "service records",
    ticketCounters: "Service record counters",
    openCountLabel: "Open",
    progressCountLabel: "In progress",
    closedCountLabel: "Closed",
    statusHelp: "Users create records as Open.",
    forgot: "Forgot your password?",
    recoverPassword: "Recover password",
    forgotMessage: "Contact an administrator to reset your password.",
    requestReset: "Request reset",
    backToLogin: "Back to Login",
    enter: "Sign in",
    emailPlaceholder: "your@email.com",
    navigationLabel: "Main navigation",
    executiveSummary: "Executive summary",
    activity: "Activity",
    noNotifications: "No notifications.",
    notificationsCount: "notifications",
    read: "Read",
    unread: "New",
    all: "All",
    allPriority: "All",
    open: "Open",
    inProgress: "In Progress",
    closed: "Closed",
    high: "High",
    medium: "Medium",
    low: "Low",
    totalTickets: "Total Records",
    openTickets: "Open Records",
    progressTickets: "Records In Progress",
    closedTickets: "Closed Records",
    totalUsers: "Total Users",
    latestNotifications: "Latest notifications",
    myTickets: "My Records",
    myOpenTickets: "My Open Records",
    myClosedTickets: "My Closed Records",
    myNotifications: "My Notifications",
    readOnly: "Read only",
    noAudit: "No audit",
    noTickets: "No service records registered.",
    noTicketMatches: "No records match the search or filters.",
    loadUsersError: "The users panel could not be loaded.",
    usersAdminOnly: "Panel available only to administrators.",
    noUsers: "No users registered.",
    registeredUsers: "registered users",
    administration: "Administration",
    security: "Security",
    fullName: "Full name",
    fullNamePlaceholder: "Ex. Maria Lopez",
    role: "Role",
    tempPasswordPlaceholder: "Temporary password",
    newPassword: "New password",
    keepPasswordPlaceholder: "Leave empty to keep current",
    admin: "Administrator",
    closeEditor: "Close editor",
    closeUserEditor: "Close user editor",
    completeTicketFields: "Complete the issue description.",
    loginError: "Could not sign in.",
    loadTicketsError: "Tickets could not be loaded.",
    serverConnectionError: "Could not connect to the server.",
    createTicketError: "Could not create the ticket.",
    createTicketAlertError: "An error occurred while creating the ticket.",
    ticketNotFound: "The selected ticket was not found.",
    userNotFound: "The selected user was not found.",
    createUserError: "Could not create the user.",
    editUserError: "Could not edit the user.",
    deleteUserError: "Could not delete the user.",
    deleteUserConfirm: "Are you sure you want to delete this user?",
    updateTicketError: "Could not edit the ticket.",
    updateTicketAlertError: "An error occurred while editing the ticket.",
    closeTicketError: "Could not close the ticket.",
    closeTicketAlertError: "An error occurred while closing the ticket.",
    deleteTicketError: "Could not delete the ticket.",
    deleteTicketAlertError: "An error occurred while deleting the ticket.",
    deleteTicketConfirm: "Are you sure you want to delete this ticket?",
    userNumber: "User",
    notificationTypes: {
      TICKET_CREATED: "Ticket created",
      TICKET_CLOSED: "Ticket closed",
      TICKET_DELETED: "Ticket deleted",
      USER_CREATED: "User created",
      USER_UPDATED: "User updated",
      PASSWORD_RESET_REQUESTED: "Password recovery",
      REPORT_GENERATED: "Report generated"
    },
    statuses: {
      Abierto: "Open",
      "En Progreso": "In Progress",
      Cerrado: "Closed"
    },
    priorities: {
      Alta: "High",
      Media: "Medium",
      Baja: "Low"
    }
  }
};

async function checkSession() {
  try {
    clearTransientStorage();
    resetClientState({ render: false });
    const response = await fetch("/api/me", {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (response.ok && data.user) {
      setAuthenticatedUser(data.user);
      await refreshWorkspace();
      return;
    }

    currentUser = null;
    showLogin();
  } catch (error) {
    console.error(error);
    currentUser = null;
    showLogin();
  }
}

async function login(event) {
  event.preventDefault();
  loginMessage.textContent = "";
  clearTransientStorage();
  resetClientState({ render: false });
  currentUser = null;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value
      })
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loginError"));
    }

    loginForm.reset();
    hidePasswordFields();
    setAuthenticatedUser(data.user);
    await refreshWorkspace();
  } catch (error) {
    console.error(error);
    loginMessage.textContent = error.message;
  }
}

async function logout() {
  try {
    await fetch("/api/logout", {
      method: "POST",
      cache: "no-store"
    });
  } catch (error) {
    console.error(error);
  }

  clearTransientStorage();
  resetClientState({ render: false });
  hidePasswordFields();
  currentUser = null;
  showLogin();
}

function setAuthenticatedUser(user, options = {}) {
  const { switchToTickets = true } = options;
  currentUser = user;
  sessionName.textContent = user.FullName;
  sessionRole.textContent = user.Role;
  sessionBar.classList.remove("hidden");
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  notificationBell.classList.remove("hidden");
  setRoleControls();
  usersTabButton.classList.toggle("hidden", !isAdmin());
  reportsTabButton.classList.remove("hidden");
  if (switchToTickets) {
    switchTab("tickets");
  }
  applyLanguage();
}

function showLogin() {
  resetClientState({ render: false });
  sessionBar.classList.add("hidden");
  appView.classList.add("hidden");
  forgotPasswordView.classList.add("hidden");
  loginView.classList.remove("hidden");
  notificationBell.classList.add("hidden");
  usersTabButton.classList.add("hidden");
  reportsTabButton.classList.remove("hidden");
  activeTab = "tickets";
  dashboardTabPanel.classList.add("hidden");
  clientsTabPanel.classList.add("hidden");
  projectsTabPanel.classList.add("hidden");
  ticketsTabPanel.classList.remove("hidden");
  invoicesTabPanel.classList.add("hidden");
  notificationsTabPanel.classList.add("hidden");
  usersTabPanel.classList.add("hidden");
  reportsTabPanel.classList.add("hidden");
  settingsTabPanel.classList.add("hidden");
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === "tickets");
  });
  closeClientEditor();
  closeEditor();
  closeUserEditor();
  applyLanguage();
}

function isAdmin() {
  return currentUser?.Role === "Admin";
}

async function loadUsersIfAdmin() {
  if (!isAdmin()) {
    users = [];
    renderUsers();
    return;
  }

  await loadUsers();
}

async function loadPasswordResetsIfAdmin() {
  if (!isAdmin()) {
    passwordResets = [];
    renderPasswordResets();
    return;
  }

  await loadPasswordResets();
}

async function switchTab(tabName) {
  if (tabName === "users" && !isAdmin()) {
    tabName = "tickets";
  }

  activeTab = tabName;
  dashboardTabPanel.classList.toggle("hidden", activeTab !== "dashboard");
  clientsTabPanel.classList.toggle("hidden", activeTab !== "clients");
  projectsTabPanel.classList.toggle("hidden", activeTab !== "projects");
  ticketsTabPanel.classList.toggle("hidden", activeTab !== "tickets");
  invoicesTabPanel.classList.toggle("hidden", activeTab !== "invoices");
  notificationsTabPanel.classList.toggle("hidden", activeTab !== "notifications");
  usersTabPanel.classList.toggle("hidden", activeTab !== "users");
  reportsTabPanel.classList.toggle("hidden", activeTab !== "reports");
  settingsTabPanel.classList.toggle("hidden", activeTab !== "settings");

  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === activeTab);
  });

  if (activeTab === "users") {
    await loadUsersIfAdmin();
    await loadPasswordResetsIfAdmin();
  }

  if (activeTab === "clients") {
    await loadClients();
  }

  if (activeTab === "notifications") {
    await loadNotifications();
  }

  if (activeTab === "dashboard") {
    renderDashboard();
  }

  if (activeTab === "reports" && reportTickets.length === 0) {
    renderReportTickets();
  }
}

async function loadUsers() {
  try {
    const response = await fetch("/api/users", {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loadUsersError"));
    }

    users = data;
    renderUsers();
    renderDashboard();
  } catch (error) {
    console.error(error);
    users = [];
    showUsersMessage(t("loadUsersError"));
    renderDashboard();
  }
}

async function loadPasswordResets() {
  try {
    const response = await fetch("/api/password-resets", {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("forgotError"));
    }

    passwordResets = data;
    renderPasswordResets();
    renderDashboard();
  } catch (error) {
    console.error(error);
    passwordResets = [];
    showPasswordResetsMessage(error.message || t("forgotError"));
    renderDashboard();
  }
}

async function loadNotifications() {
  try {
    const response = await fetch(NOTIFICATIONS_URL, {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("noNotifications"));
    }

    notifications = data;
    renderNotifications();
    updateNotificationCount();
    renderDashboard();
  } catch (error) {
    console.error(error);
    notifications = [];
    updateNotificationCount();
    showNotificationsMessage(t("noNotifications"));
    renderDashboard();
  }
}

async function loadClients() {
  const search = clientSearchInput.value.trim();
  const params = search ? `?search=${encodeURIComponent(search)}` : "";

  try {
    const response = await fetch(`/api/clients${params}`, {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (response.status === 401) {
      currentUser = null;
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loadClientsError"));
    }

    clients = data;
    renderClients();
  } catch (error) {
    console.error(error);
    clients = [];
    renderClients();
    showClientsMessage(error.message || t("loadClientsError"), "error");
  }
}

function renderClients() {
  if (!clientsTableBody) return;

  const canManageClients = isAdmin();
  clientsTotalCount.textContent = clients.length;
  clientsTotalCount.parentElement.lastChild.textContent = ` ${t("clientsCount")}`;
  addClientButton.classList.toggle("hidden", !canManageClients);

  if (clients.length === 0) {
    const message = clientSearchInput.value.trim() ? t("noClientMatches") : t("noClients");
    showClientsTableMessage(message);
    return;
  }

  clientsTableBody.innerHTML = clients.map((client) => `
    <tr>
      <td>${escapeHTML(client.ClientName || "")}</td>
      <td>${escapeHTML(client.ContactName || "")}</td>
      <td>${escapeHTML(client.Email || "")}</td>
      <td>${escapeHTML(client.Phone || "")}</td>
      <td>${escapeHTML(client.BillingName || "")}</td>
      <td>${escapeHTML(client.TaxID || "")}</td>
      <td><span class="badge ${client.IsActive ? "status-abierto" : "status-cerrado"}">${client.IsActive ? "Active" : "Inactive"}</span></td>
      <td>
        ${canManageClients ? `
          <div class="actions">
            <button type="button" class="action-btn edit-btn" data-client-action="edit" data-id="${client.ClientID}">${t("edit")}</button>
            <button type="button" class="action-btn delete-btn" data-client-action="delete" data-id="${client.ClientID}">${t("delete")}</button>
          </div>
        ` : `<span class="read-only-note">${t("readOnly")}</span>`}
      </td>
    </tr>
  `).join("");
}

function showClientsTableMessage(message) {
  clientsTotalCount.textContent = clients.length;
  clientsTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="empty-state">${escapeHTML(message)}</td>
    </tr>
  `;
}

function showClientsMessage(message, type = "info") {
  clientsMessage.textContent = message;
  clientsMessage.classList.toggle("success", type === "success");
}

function getClientPayloadFromForm() {
  return {
    ClientName: clientName.value.trim(),
    ContactName: clientContactName.value.trim(),
    Email: clientEmail.value.trim().toLowerCase(),
    Phone: clientPhone.value.trim(),
    BillingName: clientBillingName.value.trim(),
    TaxID: clientTaxId.value.trim(),
    IsActive: clientIsActive.checked
  };
}

function openClientEditor(mode, selectedClient = null) {
  clientForm.reset();
  clientFormMessage.textContent = "";
  clientId.value = selectedClient?.ClientID || "";
  clientModalTitle.textContent = mode === "edit" ? t("editClient") : t("addClient");
  clientIsActive.checked = selectedClient?.IsActive ?? true;

  if (selectedClient) {
    clientName.value = selectedClient.ClientName || "";
    clientContactName.value = selectedClient.ContactName || "";
    clientEmail.value = selectedClient.Email || "";
    clientPhone.value = selectedClient.Phone || "";
    clientBillingName.value = selectedClient.BillingName || "";
    clientTaxId.value = selectedClient.TaxID || "";
  }

  clientModal.classList.remove("hidden");
  clientName.focus();
}

function closeClientEditor() {
  if (!clientModal) return;
  clientModal.classList.add("hidden");
  clientForm.reset();
  clientFormMessage.textContent = "";
  clientId.value = "";
}

async function saveClient(event) {
  event.preventDefault();
  clientFormMessage.textContent = "";

  if (!isAdmin()) {
    clientFormMessage.textContent = t("usersAdminOnly");
    return;
  }

  const payload = getClientPayloadFromForm();

  if (!payload.ClientName) {
    clientFormMessage.textContent = t("clientNameRequired");
    clientName.focus();
    return;
  }

  const id = Number(clientId.value);
  const isEditing = Number.isInteger(id) && id > 0;

  try {
    const response = await fetch(isEditing ? `/api/clients/${id}` : "/api/clients", {
      method: isEditing ? "PUT" : "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || (isEditing ? t("updateClientError") : t("createClientError")));
    }

    closeClientEditor();
    showClientsMessage(isEditing ? t("updateClientSuccess") : t("createClientSuccess"), "success");
    await loadClients();
  } catch (error) {
    console.error(error);
    clientFormMessage.textContent = error.message || (isEditing ? t("updateClientError") : t("createClientError"));
  }
}

function handleClientsTableClick(event) {
  const button = event.target.closest("button[data-client-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.clientAction;

  if (action === "edit") {
    const selectedClient = clients.find((client) => Number(client.ClientID) === id);

    if (!selectedClient) {
      alert(t("clientNotFound"));
      return;
    }

    openClientEditor("edit", selectedClient);
  }

  if (action === "delete") {
    deactivateClient(id);
  }
}

async function deactivateClient(id) {
  if (!isAdmin()) return;

  const confirmed = confirm(t("deleteClientConfirm"));

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/clients/${id}`, {
      method: "DELETE",
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("deleteClientError"));
    }

    showClientsMessage(t("deleteClientSuccess"), "success");
    await loadClients();
  } catch (error) {
    console.error(error);
    showClientsMessage(error.message || t("deleteClientError"), "error");
  }
}

function renderNotifications() {
  notificationsTotalCount.textContent = notifications.length;

  if (notifications.length === 0) {
    showNotificationsMessage(t("noNotifications"));
    return;
  }

  notificationsTableBody.innerHTML = notifications.map((notification) => `
    <tr>
      <td>${escapeHTML(translateNotificationMessage(notification.Message))}</td>
      <td><span class="badge role-user">${escapeHTML(translateNotificationType(notification.Type))}</span></td>
      <td>${formatDate(notification.CreatedAt)}</td>
      <td><span class="badge ${getNotificationStatusClass(notification)}">${getNotificationStatusLabel(notification)}</span></td>
      <td>
        <div class="actions">
          ${renderNotificationActions(notification)}
        </div>
      </td>
    </tr>
  `).join("");
}

function showNotificationsMessage(message) {
  notificationsTotalCount.textContent = notifications.length;
  notificationsTableBody.innerHTML = `
    <tr>
      <td colspan="5" class="empty-state">${message}</td>
    </tr>
  `;
}

function renderNotificationActions(notification) {
  if (!isAdmin() || notification.Type !== "PASSWORD_RESET_REQUESTED" || notification.IsRead || isResolvedPasswordResetNotification(notification)) {
    return `<span class="read-only-note">${notification.IsRead ? t("resolved") : t("readOnly")}</span>`;
  }

  return `
    <button class="action-btn close-btn" data-notification-action="resolve-password-reset" data-id="${notification.NotificationID}">
      ${getActionIcon("close")}
      ${t("markResolved")}
    </button>
  `;
}

function getNotificationStatusClass(notification) {
  return notification.IsRead || isResolvedPasswordResetNotification(notification) ? "status-cerrado" : "status-abierto";
}

function getNotificationStatusLabel(notification) {
  if (notification.Type === "PASSWORD_RESET_REQUESTED" && (notification.IsRead || isResolvedPasswordResetNotification(notification))) {
    return t("resolved");
  }

  return notification.IsRead ? t("read") : t("unread");
}

function isResolvedPasswordResetNotification(notification) {
  return notification.Type === "PASSWORD_RESET_REQUESTED" && /resuelt/i.test(notification.Message);
}

function updateNotificationCount() {
  const unreadCount = notifications.filter((notification) => !notification.IsRead).length;
  notificationCount.textContent = unreadCount;
  notificationCount.classList.toggle("hidden", unreadCount === 0);
}

function handleNotificationsClick(event) {
  const button = event.target.closest("button[data-notification-action]");

  if (!button) {
    return;
  }

  if (button.dataset.notificationAction === "resolve-password-reset") {
    resolvePasswordResetNotification(Number(button.dataset.id));
  }
}

async function resolvePasswordResetNotification(notificationId) {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/resolve-password-reset`, {
      method: "PUT",
      cache: "no-store"
    });

    if (!response.ok) {
      const data = await parseJsonResponse(response);
      throw new Error(translateServerMessage(data.message) || t("forgotError"));
    }

    await refreshWorkspace();
  } catch (error) {
    console.error(error);
    alert(error.message || t("forgotError"));
  }
}

function renderDashboard() {
  if (!currentUser) {
    return;
  }

  const visibleTickets = isAdmin()
    ? tickets
    : tickets.filter((ticket) => Number(ticket.CreatedByUserID) === Number(currentUser.UserID));
  const visibleNotifications = notifications;

  dashboardMetricOneLabel.textContent = isAdmin() ? t("totalTickets") : t("myTickets");
  dashboardMetricTwoLabel.textContent = isAdmin() ? t("openTickets") : t("myOpenTickets");
  dashboardMetricThreeLabel.textContent = isAdmin() ? t("closedTickets") : t("myClosedTickets");
  dashboardMetricFourLabel.textContent = isAdmin() ? t("totalUsers") : t("myNotifications");

  dashboardMetricOne.textContent = visibleTickets.length;
  dashboardMetricTwo.textContent = visibleTickets.filter((ticket) => ticket.Status === "Abierto").length;
  dashboardMetricThree.textContent = visibleTickets.filter((ticket) => ticket.Status === "Cerrado").length;
  dashboardMetricFour.textContent = isAdmin() ? users.length : visibleNotifications.length;

  dashboardNotificationsTitle.textContent = t("latestNotifications");
  dashboardNotificationsList.innerHTML = visibleNotifications.slice(0, 5).map((notification) => `
    <article class="notification-item">
      <strong>${escapeHTML(translateNotificationMessage(notification.Message))}</strong>
      <span>${formatDate(notification.CreatedAt)}</span>
    </article>
  `).join("") || `<p class="empty-state">${t("noNotifications")}</p>`;
}

function t(key) {
  return translations[currentLanguage][key] || translations.es[key] || key;
}

function tNested(group, key) {
  return translations[currentLanguage][group]?.[key] || translations.es[group]?.[key] || key;
}

function setButtonText(button, text) {
  const icon = button.querySelector("svg");
  button.textContent = "";

  if (icon) {
    button.appendChild(icon);
  }

  button.append(` ${text}`);
}

function setText(selector, text) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = text;
  }
}

function setPlaceholder(selector, text) {
  const element = document.querySelector(selector);

  if (element) {
    element.placeholder = text;
  }
}

function setAriaLabel(selector, text) {
  const element = document.querySelector(selector);

  if (element) {
    element.setAttribute("aria-label", text);
  }
}

function setTableHeaders(tableSelector, labels) {
  document.querySelectorAll(`${tableSelector} thead th`).forEach((header, index) => {
    if (labels[index]) {
      header.textContent = labels[index];
    }
  });
}

function setSelectLabels(select, labelsByValue) {
  Array.from(select.options).forEach((option) => {
    if (labelsByValue[option.value]) {
      option.textContent = labelsByValue[option.value];
    }
  });
}

function translateStatus(status) {
  return tNested("statuses", status);
}

function translatePriority(priority) {
  return tNested("priorities", priority);
}

function translateNotificationType(type) {
  return tNested("notificationTypes", type);
}

function translateNotificationMessage(message) {
  const prefixes = {
    "Ticket creado": currentLanguage === "es" ? "Ticket creado" : "Ticket created",
    "Ticket cerrado": currentLanguage === "es" ? "Ticket cerrado" : "Ticket closed",
    "Ticket eliminado": currentLanguage === "es" ? "Ticket eliminado" : "Ticket deleted",
    "Usuario creado": currentLanguage === "es" ? "Usuario creado" : "User created",
    "Usuario editado": currentLanguage === "es" ? "Usuario editado" : "User updated",
    "Solicitud de recuperacion": currentLanguage === "es" ? "Solicitud de recuperacion" : "Password recovery request",
    "Reporte generado": currentLanguage === "es" ? "Reporte generado" : "Report generated",
    "Reporte PDF generado": currentLanguage === "es" ? "Reporte PDF generado" : "PDF report generated",
    "Reporte Excel generado": currentLanguage === "es" ? "Reporte Excel generado" : "Excel report generated"
  };

  const match = Object.entries(prefixes).find(([sourcePrefix]) => message.startsWith(`${sourcePrefix}:`));

  if (!match) {
    return message;
  }

  const [sourcePrefix, translatedPrefix] = match;
  return `${translatedPrefix}${message.slice(sourcePrefix.length)}`;
}

function translateServerMessage(message) {
  if (currentLanguage === "es" || !message) {
    return message;
  }

  const messages = {
    "Debes iniciar sesion.": "You must sign in.",
    "No tienes permisos de administrador.": "You do not have administrator permissions.",
    "Email y password son obligatorios.": "Email and password are required.",
    "Credenciales invalidas.": "Invalid credentials.",
    "Error al iniciar sesion.": "Error signing in.",
    "Error al cerrar sesion.": "Error signing out.",
    "Error al obtener notificaciones.": "Error loading notifications.",
    "ID de notificacion invalido.": "Invalid notification ID.",
    "Notificacion no encontrada.": "Notification not found.",
    "Error al marcar notificacion.": "Error marking notification.",
    "Error al obtener usuarios.": "Error loading users.",
    "Todos los campos son obligatorios.": "All fields are required.",
    "Rol invalido.": "Invalid role.",
    "Ya existe un usuario con ese email.": "A user with that email already exists.",
    "Error al crear usuario.": "Error creating user.",
    "ID de usuario invalido.": "Invalid user ID.",
    "Nombre, email y rol son obligatorios.": "Name, email, and role are required.",
    "Usuario no encontrado.": "User not found.",
    "Error al editar usuario.": "Error editing user.",
    "No puedes eliminar tu propio usuario.": "You cannot delete your own user.",
    "Error al eliminar usuario.": "Error deleting user.",
    "Error al obtener tickets.": "Error loading tickets.",
    "Error al crear ticket.": "Error creating ticket.",
    "ID de ticket invalido.": "Invalid ticket ID.",
    "Ticket no encontrado.": "Ticket not found.",
    "Error al editar ticket.": "Error editing ticket.",
    "Error al cerrar ticket.": "Error closing ticket.",
    "Error al eliminar ticket.": "Error deleting ticket.",
    "Email es obligatorio.": "Email is required.",
    "ID de solicitud invalido.": "Invalid request ID.",
    "Solicitud no encontrada.": "Request not found.",
    "No se encontro la solicitud asociada.": "The linked request was not found.",
    "Solicitud recibida. Contacta a un administrador para restablecer tu contrasena.": "Request received. Contact an administrator to reset your password.",
    "Formato de fecha invalido. Usa YYYY-MM-DD.": "Invalid date format. Use YYYY-MM-DD.",
    "Error al generar reporte.": "Error generating report.",
    "Error al exportar Excel.": "Error exporting Excel.",
    "Error al exportar PDF.": "Error exporting PDF."
  };

  return messages[message] || message;
}

function applySelectTranslations() {
  const priorityLabels = {
    Alta: t("high"),
    Media: t("medium"),
    Baja: t("low")
  };
  const statusLabels = {
    Abierto: t("open"),
    "En Progreso": t("inProgress"),
    Cerrado: t("closed")
  };

  setSelectLabels(priorityInput, priorityLabels);
  setSelectLabels(editPriority, priorityLabels);
  setSelectLabels(statusInput, statusLabels);
  setSelectLabels(editStatus, statusLabels);
  setSelectLabels(statusFilter, {
    Todos: t("all"),
    ...statusLabels
  });
  setSelectLabels(priorityFilter, {
    Todas: t("allPriority"),
    ...priorityLabels
  });
  setSelectLabels(reportStatus, {
    "": t("all"),
    ...statusLabels
  });
  setSelectLabels(reportPriority, {
    "": t("allPriority"),
    ...priorityLabels
  });
}

function updatePasswordToggleLabels() {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const input = document.getElementById(button.dataset.passwordToggle);
    const isVisible = input?.type === "text";

    button.setAttribute("aria-label", isVisible ? t("hidePassword") : t("showPassword"));
    button.setAttribute("aria-pressed", String(isVisible));
    button.classList.toggle("is-visible", isVisible);
  });
}

function handlePasswordToggle(event) {
  const button = event.target.closest("[data-password-toggle]");

  if (!button) {
    return;
  }

  const input = document.getElementById(button.dataset.passwordToggle);

  if (!input) {
    return;
  }

  input.type = input.type === "password" ? "text" : "password";
  updatePasswordToggleLabels();
  input.focus();
}

function hidePasswordFields() {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const input = document.getElementById(button.dataset.passwordToggle);

    if (input) {
      input.type = "password";
    }
  });

  updatePasswordToggleLabels();
}

function applyStaticLanguage() {
  document.title = t("documentTitle");
  document.documentElement.lang = currentLanguage;

  setText(".app-header .eyebrow", t("headerEyebrow"));
  setText(".app-header h1", t("headerTitle"));
  setText(".app-header h1 + p", t("headerSubtitle"));
  setAriaLabel("#notificationBell", t("notifications"));
  setAriaLabel(".tabs-nav", t("navigationLabel"));
  setAriaLabel("#dashboardTabPanel .stats-grid", t("executiveSummary"));
  setAriaLabel("#ticketsTabPanel .stats-grid", t("ticketCounters"));

  setText("#loginForm .section-title .eyebrow", t("secureAccess"));
  setText("#loginForm h2", t("login"));
  setText('label[for="loginEmail"]', "Email");
  setText('label[for="loginPassword"]', t("password"));
  setPlaceholder("#loginPassword", t("passwordPlaceholder"));

  setText("#forgotPasswordForm .section-title .eyebrow", t("secureAccess"));
  setText("#forgotPasswordTitle", t("recoverPassword"));
  setText('label[for="forgotEmail"]', "Email");
  setPlaceholder("#forgotEmail", t("emailPlaceholder"));
  forgotPasswordLink.textContent = t("forgot");
  forgotPasswordMessage.textContent = t("forgotMessage");
  requestRecoveryButton.textContent = t("requestReset");
  backToLoginButton.textContent = t("backToLogin");

  setText("#ticketsTabPanel .form-panel .section-title .eyebrow", t("newCase"));
  setText("#form-title", t("createTicket"));
  setText("#creatingTicketAsLabel", t("creatingTicketAs"));
  setText('label[for="description"]', t("issueDescription"));
  setText('label[for="priority"]', t("priority"));
  setText('label[for="status"]', t("status"));
  setText("#statusHelp", t("statusHelp"));
  setPlaceholder("#description", t("issuePlaceholder"));

  setText("#ticketsTabPanel .table-panel .section-title .eyebrow", t("supportInbox"));
  setText("#table-title", t("allTickets"));
  setText('label[for="searchInput"]', t("search"));
  setText('label[for="statusFilter"]', t("status"));
  setText('label[for="priorityFilter"]', t("priority"));
  setPlaceholder("#searchInput", t("searchPlaceholder"));

  const ticketStatLabels = document.querySelectorAll("#ticketsTabPanel .stats-grid .stat-card span");
  if (ticketStatLabels[0]) ticketStatLabels[0].textContent = t("openCountLabel");
  if (ticketStatLabels[1]) ticketStatLabels[1].textContent = t("progressCountLabel");
  if (ticketStatLabels[2]) ticketStatLabels[2].textContent = t("closedCountLabel");
  totalCount.parentElement.lastChild.textContent = ` ${t("registeredTickets")}`;

  setText("#dashboardTabPanel .section-title .eyebrow", t("activity"));
  setText("#dashboardNotificationsTitle", t("latestNotifications"));

  setText("#clientsTabPanel .section-title .eyebrow", t("clientsEyebrow"));
  setText("#clients-title", t("clients"));
  setText("#clientsTabPanel .foundation-copy", t("clientsFoundation"));
  setText('label[for="clientSearchInput"]', t("search"));
  setPlaceholder("#clientSearchInput", t("clientSearchPlaceholder"));
  setText("#clientModal .section-title .eyebrow", t("clients"));
  setText('label[for="clientName"]', "ClientName");
  setText('label[for="clientContactName"]', "ContactName");
  setText('label[for="clientEmail"]', "Email");
  setText('label[for="clientPhone"]', "Phone");
  setText('label[for="clientBillingName"]', "BillingName");
  setText('label[for="clientTaxId"]', "TaxID");
  setText(".checkbox-field span", "IsActive");
  setAriaLabel("#closeClientModal", t("closeEditor"));
  setText("#projectsTabPanel .section-title .eyebrow", t("projectsEyebrow"));
  setText("#projects-title", t("projects"));
  setText("#projectsTabPanel .foundation-copy", t("projectsFoundation"));
  setText("#invoicesTabPanel .section-title .eyebrow", t("invoicesEyebrow"));
  setText("#invoices-title", t("invoices"));
  setText("#invoicesTabPanel .foundation-copy", t("invoicesFoundation"));
  setText("#settingsTabPanel .section-title .eyebrow", t("settingsEyebrow"));
  setText("#settings-title", t("settings"));
  setText("#settingsTabPanel .foundation-copy", t("settingsFoundation"));

  setText("#notificationsTabPanel .section-title .eyebrow", t("activity"));
  setText("#notificationsTitle", t("notifications"));
  notificationsTotalCount.parentElement.lastChild.textContent = ` ${t("notificationsCount")}`;

  setText("#usersTabPanel .form-panel .section-title .eyebrow", t("administration"));
  setText("#users-form-title", t("addUser"));
  setText('label[for="userFullName"]', t("fullName"));
  setText('label[for="userEmail"]', "Email");
  setText('label[for="userPassword"]', t("password"));
  setText('label[for="userRole"]', t("role"));
  setPlaceholder("#userFullName", t("fullNamePlaceholder"));
  setPlaceholder("#userPassword", t("tempPasswordPlaceholder"));

  setText("#usersTabPanel .table-panel .section-title .eyebrow", t("security"));
  setText("#users-table-title", t("users"));
  usersTotalCount.parentElement.lastChild.textContent = ` ${t("registeredUsers")}`;
  setText(".password-resets-panel .section-title .eyebrow", t("security"));
  setText("#password-resets-title", t("passwordResets"));
  passwordResetsTotalCount.parentElement.lastChild.textContent = ` ${t("passwordResetRequests")}`;

  setText("#reportsTabPanel .section-title .eyebrow", t("analytics"));
  setText("#reportsTitle", t("reports"));
  setText('label[for="reportFrom"]', t("dateFrom"));
  setText('label[for="reportTo"]', t("dateTo"));
  setText('label[for="reportStatus"]', t("status"));
  setText('label[for="reportPriority"]', t("priority"));
  reportsTotalCount.parentElement.lastChild.textContent = currentLanguage === "es" ? " registros" : " records";
  generateReportButton.textContent = t("generateReport");
  exportPdfButton.textContent = t("exportPdf");
  exportExcelButton.textContent = t("exportExcel");

  setText("#editModal .section-title .eyebrow", t("admin"));
  setText("#edit-title", t("editTicket"));
  setText('label[for="editDescription"]', t("issueDescription"));
  setText('label[for="editPriority"]', t("priority"));
  setText('label[for="editStatus"]', t("status"));
  setAriaLabel("#closeEditModal", t("closeEditor"));
  updatePasswordToggleLabels();

  setText("#editUserModal .section-title .eyebrow", t("admin"));
  setText("#edit-user-title", t("editUser"));
  setText('label[for="editFullName"]', t("fullName"));
  setText('label[for="editEmail"]', "Email");
  setText('label[for="editPassword"]', t("newPassword"));
  setText('label[for="editRole"]', t("role"));
  setPlaceholder("#editPassword", t("keepPasswordPlaceholder"));
  temporaryPasswordButton.textContent = t("temporaryPassword");
  setAriaLabel("#closeEditUserModal", t("closeUserEditor"));

  setTableHeaders("#ticketsTabPanel table", ["ID", t("issue"), t("priority"), t("status"), t("date"), t("reportedBy"), t("actions")]);
  setTableHeaders("#clientsTabPanel table", ["ClientName", "ContactName", "Email", "Phone", "BillingName", "TaxID", "IsActive", t("actions")]);
  setTableHeaders("#notificationsTabPanel table", [t("message"), t("type"), t("date"), t("status"), t("actions")]);
  setTableHeaders('[aria-labelledby="users-table-title"] table', ["UserID", t("fullName"), "Email", t("role"), t("date"), t("createdBy"), t("actions")]);
  setTableHeaders("#usersTabPanel .password-resets-panel table", ["ID", t("name"), "Email", t("date"), t("status"), t("actions")]);
  setTableHeaders("#reportsTabPanel table", ["TicketID", t("issueDescription"), t("priority"), t("status"), t("date"), t("reportedBy")]);
}

function applyLanguage() {
  languageToggle.textContent = currentLanguage === "es" ? "English" : "Espa\u00f1ol";
  applyStaticLanguage();
  applySelectTranslations();
  setButtonText(document.querySelector('[data-tab="dashboard"]'), t("dashboard"));
  setButtonText(document.querySelector('[data-tab="clients"]'), t("clients"));
  setButtonText(document.querySelector('[data-tab="projects"]'), t("projects"));
  setButtonText(document.querySelector('[data-tab="tickets"]'), t("tickets"));
  setButtonText(document.querySelector('[data-tab="invoices"]'), t("invoices"));
  setButtonText(document.querySelector('[data-tab="notifications"]'), t("notifications"));
  setButtonText(usersTabButton, t("users"));
  setButtonText(reportsTabButton, t("reports"));
  setButtonText(document.querySelector('[data-tab="settings"]'), t("settings"));
  setButtonText(addClientButton, t("addClient"));
  setButtonText(saveClientButton, t("saveClient"));
  setButtonText(logoutButton, t("logout"));
  setButtonText(loginForm.querySelector(".btn-primary"), t("enter"));
  setButtonText(ticketForm.querySelector(".btn-primary"), t("createTicket"));
  setButtonText(userForm.querySelector(".btn-primary"), t("createUser"));
  setButtonText(editTicketForm.querySelector(".btn-primary"), t("saveChanges"));
  setButtonText(editUserForm.querySelector(".btn-primary"), t("saveUser"));

  renderTickets();
  renderClients();
  renderUsers();
  renderPasswordResets();
  renderNotifications();
  renderDashboard();
  renderReportTickets();
  renderCreatingTicketAs();
}

function setRoleControls() {
  statusInput.disabled = !isAdmin();
  statusHelp.classList.toggle("hidden", isAdmin());
  addClientButton.classList.toggle("hidden", !isAdmin());

  if (!isAdmin()) {
    statusInput.value = "Abierto";
  }

  renderCreatingTicketAs();
}

function renderCreatingTicketAs() {
  if (!creatingTicketAsName) {
    return;
  }

  creatingTicketAsName.textContent = currentUser?.FullName || t("authenticatedUser");
}

async function loadTickets() {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (response.status === 401) {
      currentUser = null;
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loadTicketsError"));
    }

    tickets = data;
    renderTickets();
    renderDashboard();
  } catch (error) {
    console.error(error);
    tickets = [];
    updateCounters();
    showTableMessage(t("serverConnectionError"));
    renderDashboard();
  }
}

async function createTicket(event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const priority = priorityInput.value;
  const status = isAdmin() ? statusInput.value : "Abierto";

  if (!description) {
    alert(t("completeTicketFields"));
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        description,
        priority,
        status
      })
    });

    if (!response.ok) {
      throw new Error(t("createTicketError"));
    }

    ticketForm.reset();
    priorityInput.value = "Media";
    statusInput.value = "Abierto";
    setRoleControls();
    await refreshWorkspace();
  } catch (error) {
    console.error(error);
    alert(t("createTicketAlertError"));
  }
}

function renderTickets() {
  updateCounters();

  const visibleTickets = getFilteredTickets();

  if (tickets.length === 0) {
    showTableMessage(t("noTickets"));
    return;
  }

  if (visibleTickets.length === 0) {
    showTableMessage(t("noTicketMatches"));
    return;
  }

  ticketTableBody.innerHTML = visibleTickets.map((ticket) => {
    const priorityClass = getBadgeClass("priority", ticket.Priority);
    const statusClass = getBadgeClass("status", ticket.Status);
    const isClosed = ticket.Status === "Cerrado";

    return `
      <tr>
        <td>#${ticket.TicketID}</td>
        <td class="ticket-description">${escapeHTML(ticket.Description)}</td>
        <td><span class="badge ${priorityClass}">${translatePriority(ticket.Priority)}</span></td>
        <td><span class="badge ${statusClass}">${translateStatus(ticket.Status)}</span></td>
        <td>${formatDate(ticket.CreatedAt)}</td>
        <td>${formatPerson(ticket.ReportedBy, ticket.CreatedByUserID)}</td>
        <td>
          <div class="actions">
            ${renderActions(ticket, isClosed)}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderUsers() {
  usersTotalCount.textContent = users.length;

  if (!isAdmin()) {
    showUsersMessage(t("usersAdminOnly"));
    return;
  }

  if (users.length === 0) {
    showUsersMessage(t("noUsers"));
    return;
  }

  usersTableBody.innerHTML = users.map((user) => `
    <tr>
      <td>#${user.UserID}</td>
      <td>${escapeHTML(user.FullName)}</td>
      <td>${escapeHTML(user.Email)}</td>
      <td><span class="badge ${getUserRoleClass(user.Role)}">${user.Role}</span></td>
      <td>${formatDate(user.CreatedAt)}</td>
      <td>${formatPerson(user.CreatedByFullName, user.CreatedByUserID)}</td>
      <td>
        <div class="actions">
          <button class="action-btn edit-btn" data-user-action="edit" data-id="${user.UserID}">
            ${getActionIcon("edit")}
            ${t("edit")}
          </button>
          <button class="action-btn delete-btn" data-user-action="delete" data-id="${user.UserID}">
            ${getActionIcon("delete")}
            ${t("delete")}
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function showUsersMessage(message) {
  usersTotalCount.textContent = users.length;
  usersTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="empty-state">${message}</td>
    </tr>
  `;
}

function renderPasswordResets() {
  passwordResetsTotalCount.textContent = passwordResets.length;

  if (!isAdmin()) {
    showPasswordResetsMessage(t("usersAdminOnly"));
    return;
  }

  if (passwordResets.length === 0) {
    showPasswordResetsMessage(t("noPasswordResets"));
    return;
  }

  passwordResetsTableBody.innerHTML = passwordResets.map((request) => {
    const isResolved = request.Status === "Resuelto";

    return `
      <tr>
        <td>#${request.RequestID}</td>
        <td>${escapeHTML(request.FullName)}</td>
        <td>${escapeHTML(request.Email)}</td>
        <td>${formatDate(request.CreatedAt)}</td>
        <td><span class="badge ${isResolved ? "status-cerrado" : "status-en-progreso"}">${translateResetStatus(request.Status)}</span></td>
        <td>
          <div class="actions">
            <button class="action-btn close-btn" data-reset-action="resolve" data-id="${request.RequestID}" ${isResolved ? "disabled" : ""}>
              ${getActionIcon("close")}
              ${t("resolve")}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function showPasswordResetsMessage(message) {
  passwordResetsTotalCount.textContent = passwordResets.length;
  passwordResetsTableBody.innerHTML = `
    <tr>
      <td colspan="6" class="empty-state">${message}</td>
    </tr>
  `;
}

function translateResetStatus(status) {
  const labels = {
    Pendiente: t("pending"),
    Resuelto: t("resolved")
  };

  return labels[status] || status;
}

function handlePasswordResetsClick(event) {
  const button = event.target.closest("button[data-reset-action]");

  if (!button) {
    return;
  }

  if (button.dataset.resetAction === "resolve") {
    resolvePasswordReset(Number(button.dataset.id));
  }
}

async function resolvePasswordReset(requestId) {
  try {
    const response = await fetch(`/api/password-resets/${requestId}/resolve`, {
      method: "PUT",
      cache: "no-store"
    });

    if (!response.ok) {
      const data = await parseJsonResponse(response);
      throw new Error(translateServerMessage(data.message) || t("forgotError"));
    }

    await refreshWorkspace();
  } catch (error) {
    console.error(error);
    alert(error.message || t("forgotError"));
  }
}

function getReportQueryString() {
  const params = new URLSearchParams();

  if (reportFrom.value) params.set("from", reportFrom.value);
  if (reportTo.value) params.set("to", reportTo.value);
  if (reportStatus.value) params.set("status", reportStatus.value);
  if (reportPriority.value) params.set("priority", reportPriority.value);

  return params.toString();
}

function getExportQueryString() {
  const params = new URLSearchParams(getReportQueryString());
  params.set("lang", currentLanguage);

  return params.toString();
}

async function generateReport(event) {
  event.preventDefault();
  reportsMessage.textContent = "";

  if (!isAdmin()) {
    reportsMessage.textContent = t("usersAdminOnly");
    switchTab("tickets");
    return;
  }

  try {
    const query = getReportQueryString();
    const response = await fetch(`/api/reports/tickets${query ? `?${query}` : ""}`, {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("reportError"));
    }

    if (!Array.isArray(data)) {
      throw new Error(data.message || t("reportError"));
    }

    reportTickets = data;
    hasGeneratedReport = true;
    renderReportTickets();
    await loadNotifications();
    reportsMessage.textContent = t("reportReady");
  } catch (error) {
    console.error(error);
    reportsMessage.textContent = error.message || t("reportError");
  }
}

function renderReportTickets() {
  reportsTotalCount.textContent = reportTickets.length;

  if (reportTickets.length === 0) {
    const message = hasGeneratedReport ? t("noReportTickets") : t("reportInitial");
    showReportsMessage(message);
    return;
  }

  reportsTableBody.innerHTML = reportTickets.map((ticket) => {
    const priorityClass = getBadgeClass("priority", ticket.Priority);
    const statusClass = getBadgeClass("status", ticket.Status);

    return `
      <tr>
        <td>#${ticket.TicketID}</td>
        <td class="ticket-description">${escapeHTML(ticket.Description)}</td>
        <td><span class="badge ${priorityClass}">${translatePriority(ticket.Priority)}</span></td>
        <td><span class="badge ${statusClass}">${translateStatus(ticket.Status)}</span></td>
        <td>${formatDate(ticket.CreatedAt)}</td>
        <td>${formatPerson(ticket.ReportedBy, ticket.CreatedByUserID)}</td>
      </tr>
    `;
  }).join("");
}

function showReportsMessage(message) {
  reportsTotalCount.textContent = reportTickets.length;
  reportsTableBody.innerHTML = `
    <tr>
      <td colspan="6" class="empty-state">${message}</td>
    </tr>
  `;
}

async function exportReport(format) {
  reportsMessage.textContent = "";

  if (!isAdmin()) {
    reportsMessage.textContent = t("usersAdminOnly");
    switchTab("tickets");
    return;
  }

  try {
    const query = getExportQueryString();
    const url = `/api/reports/tickets/${format}${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
      cache: "no-store"
    });

    if (!response.ok) {
      const data = await parseJsonResponse(response);
      throw new Error(translateServerMessage(data.message) || t("exportError"));
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = format === "pdf" ? "helpdesk-ticket-report.pdf" : "helpdesk-ticket-report.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
    await loadNotifications();
  } catch (error) {
    console.error(error);
    reportsMessage.textContent = error.message || t("exportError");
  }
}

function getUserRoleClass(role) {
  return role === "Admin" ? "role-admin" : "role-user";
}

function renderActions(ticket, isClosed) {
  if (!isAdmin()) {
    return `<span class="read-only-note">${t("readOnly")}</span>`;
  }

  return `
    <button class="action-btn edit-btn" data-action="edit" data-id="${ticket.TicketID}">
      ${getActionIcon("edit")}
      ${t("edit")}
    </button>
    <button
      class="action-btn close-btn"
      data-action="close"
      data-id="${ticket.TicketID}"
      ${isClosed ? "disabled" : ""}
    >
      ${getActionIcon("close")}
      ${t("close")}
    </button>
    <button class="action-btn delete-btn" data-action="delete" data-id="${ticket.TicketID}">
      ${getActionIcon("delete")}
      ${t("delete")}
    </button>
  `;
}

function getActionIcon(type) {
  const icons = {
    edit: `
      <svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
    `,
    close: `
      <svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    `,
    delete: `
      <svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v5"/>
        <path d="M14 11v5"/>
      </svg>
    `
  };

  return icons[type] || "";
}

function getFilteredTickets() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedPriority = priorityFilter.value;

  return tickets.filter((ticket) => {
    const reportedBy = (ticket.ReportedBy || "").toLowerCase();
    const description = ticket.Description.toLowerCase();
    const matchesSearch = reportedBy.includes(searchTerm) || description.includes(searchTerm);
    const matchesStatus = selectedStatus === "Todos" || ticket.Status === selectedStatus;
    const matchesPriority = selectedPriority === "Todas" || ticket.Priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });
}

function showTableMessage(message) {
  ticketTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="empty-state">${message}</td>
    </tr>
  `;
}

function updateCounters() {
  openCount.textContent = countTicketsByStatus("Abierto");
  progressCount.textContent = countTicketsByStatus("En Progreso");
  closedCount.textContent = countTicketsByStatus("Cerrado");
  totalCount.textContent = tickets.length;
}

function countTicketsByStatus(status) {
  return tickets.filter((ticket) => ticket.Status === status).length;
}

function getBadgeClass(type, value) {
  return `${type}-${value.toLowerCase().replaceAll(" ", "-")}`;
}

function handleTableClick(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const ticketId = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "edit") {
    openEditor(ticketId);
  }

  if (action === "close") {
    closeTicket(ticketId);
  }

  if (action === "delete") {
    deleteTicket(ticketId);
  }
}

function openEditor(ticketId) {
  const ticket = tickets.find((item) => Number(item.TicketID) === ticketId);

  if (!ticket) {
    alert(t("ticketNotFound"));
    return;
  }

  editTicketId.value = ticket.TicketID;
  editDescription.value = ticket.Description;
  editPriority.value = ticket.Priority;
  editStatus.value = ticket.Status;
  editModal.classList.remove("hidden");
}

function closeEditor() {
  editModal.classList.add("hidden");
  editTicketForm.reset();
}

async function createUser(event) {
  event.preventDefault();
  userFormMessage.textContent = "";

  try {
    const response = await fetch("/api/users", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: userFullName.value.trim(),
        email: userEmail.value.trim(),
        password: userPassword.value,
        role: userRole.value
      })
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("createUserError"));
    }

    userForm.reset();
    hidePasswordFields();
    userRole.value = "User";
    await refreshWorkspace();
  } catch (error) {
    console.error(error);
    userFormMessage.textContent = error.message;
  }
}

function handleUsersTableClick(event) {
  const button = event.target.closest("button[data-user-action]");

  if (!button) {
    return;
  }

  const userId = Number(button.dataset.id);
  const action = button.dataset.userAction;

  if (action === "edit") {
    openUserEditor(userId);
  }

  if (action === "delete") {
    deleteUser(userId);
  }
}

function openUserEditor(userId) {
  const user = users.find((item) => Number(item.UserID) === userId);

  if (!user) {
    alert(t("userNotFound"));
    return;
  }

  editUserId.value = user.UserID;
  editFullName.value = user.FullName;
  editEmail.value = user.Email;
  editPassword.value = "";
  editRole.value = user.Role;
  editUserMessage.textContent = "";
  editUserModal.classList.remove("hidden");
}

function closeUserEditor() {
  editUserModal.classList.add("hidden");
  editUserForm.reset();
  editUserMessage.textContent = "";
  hidePasswordFields();
}

function assignTemporaryPassword() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  editPassword.value = `Temp${suffix}!`;
  editPassword.focus();
}

async function updateUser(event) {
  event.preventDefault();
  editUserMessage.textContent = "";

  const userId = Number(editUserId.value);

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: editFullName.value.trim(),
        email: editEmail.value.trim(),
        password: editPassword.value,
        role: editRole.value
      })
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("editUserError"));
    }

    if (currentUser.UserID === data.UserID) {
      setAuthenticatedUser(data, { switchToTickets: false });
    }

    closeUserEditor();
    await refreshWorkspace();
  } catch (error) {
    console.error(error);
    editUserMessage.textContent = error.message;
  }
}

async function deleteUser(userId) {
  const confirmed = confirm(t("deleteUserConfirm"));

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      cache: "no-store"
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("deleteUserError"));
    }

    await refreshWorkspace();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

async function updateTicket(event) {
  event.preventDefault();

  const ticketId = Number(editTicketId.value);

  try {
    const response = await fetch(`${API_URL}/${ticketId}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        description: editDescription.value.trim(),
        priority: editPriority.value,
        status: editStatus.value
      })
    });

    if (!response.ok) {
      throw new Error(t("updateTicketError"));
    }

    closeEditor();
    await refreshWorkspace();
  } catch (error) {
    console.error(error);
    alert(t("updateTicketAlertError"));
  }
}

async function closeTicket(ticketId) {
  try {
    const response = await fetch(`${API_URL}/${ticketId}/close`, {
      method: "PUT",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(t("closeTicketError"));
    }

    await refreshWorkspace();
  } catch (error) {
    console.error(error);
    alert(t("closeTicketAlertError"));
  }
}

async function deleteTicket(ticketId) {
  const confirmed = confirm(t("deleteTicketConfirm"));

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${ticketId}`, {
      method: "DELETE",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(t("deleteTicketError"));
    }

    await refreshWorkspace();
  } catch (error) {
    console.error(error);
    alert(t("deleteTicketAlertError"));
  }
}

async function requestPasswordReset() {
  forgotPasswordMessage.textContent = "";
  forgotPasswordMessage.classList.add("hidden");
  forgotPasswordMessage.classList.remove("success");

  try {
    const response = await fetch("/api/forgot-password", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: document.querySelector("#forgotEmail").value.trim()
      })
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("forgotError"));
    }

    forgotPasswordForm.reset();
    forgotPasswordMessage.textContent = translateServerMessage(data.message) || t("forgotSaved");
    forgotPasswordMessage.classList.add("success");
    forgotPasswordMessage.classList.remove("hidden");
  } catch (error) {
    console.error(error);
    forgotPasswordMessage.textContent = error.message || t("forgotError");
    forgotPasswordMessage.classList.remove("success");
    forgotPasswordMessage.classList.remove("hidden");
  }
}

function formatDate(value) {
  const locale = currentLanguage === "es" ? "es-BO" : "en-US";

  return new Date(value).toLocaleString(locale);
}

function formatPerson(fullName, userId) {
  if (fullName) {
    return escapeHTML(fullName);
  }

  if (userId) {
    return `${t("userNumber")} #${userId}`;
  }

  return t("noAudit");
}

function escapeHTML(text) {
  const temporaryElement = document.createElement("div");
  temporaryElement.textContent = text;
  return temporaryElement.innerHTML;
}

async function parseJsonResponse(response) {
  if (response.status === 204) {
    return {};
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const body = await response.text();

  return {
    message: t("invalidApiResponse"),
    raw: body.slice(0, 200)
  };
}

loginForm.addEventListener("submit", login);
document.addEventListener("click", handlePasswordToggle);
logoutButton.addEventListener("click", logout);
languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "es" ? "en" : "es";
  localStorage.setItem("helpdeskLanguage", currentLanguage);
  applyLanguage();
});
forgotPasswordLink.addEventListener("click", () => {
  loginView.classList.add("hidden");
  forgotPasswordView.classList.remove("hidden");
  forgotPasswordMessage.classList.add("hidden");
  forgotPasswordMessage.classList.remove("success");
});
forgotPasswordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  requestPasswordReset();
});
backToLoginButton.addEventListener("click", () => {
  forgotPasswordView.classList.add("hidden");
  loginView.classList.remove("hidden");
  forgotPasswordForm.reset();
  forgotPasswordMessage.classList.add("hidden");
  forgotPasswordMessage.classList.remove("success");
});
notificationBell.addEventListener("click", () => switchTab("notifications"));
tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});
addClientButton.addEventListener("click", () => openClientEditor("create"));
clientSearchInput.addEventListener("input", loadClients);
clientsTableBody.addEventListener("click", handleClientsTableClick);
clientForm.addEventListener("submit", saveClient);
closeClientModal.addEventListener("click", closeClientEditor);
clientModal.addEventListener("click", (event) => {
  if (event.target === clientModal) {
    closeClientEditor();
  }
});
ticketForm.addEventListener("submit", createTicket);
ticketTableBody.addEventListener("click", handleTableClick);
notificationsTableBody.addEventListener("click", handleNotificationsClick);
userForm.addEventListener("submit", createUser);
usersTableBody.addEventListener("click", handleUsersTableClick);
passwordResetsTableBody.addEventListener("click", handlePasswordResetsClick);
reportsForm.addEventListener("submit", generateReport);
exportPdfButton.addEventListener("click", () => exportReport("pdf"));
exportExcelButton.addEventListener("click", () => exportReport("excel"));
editTicketForm.addEventListener("submit", updateTicket);
closeEditModal.addEventListener("click", closeEditor);
editUserForm.addEventListener("submit", updateUser);
temporaryPasswordButton.addEventListener("click", assignTemporaryPassword);
closeEditUserModal.addEventListener("click", closeUserEditor);
editModal.addEventListener("click", (event) => {
  if (event.target === editModal) {
    closeEditor();
  }
});
editUserModal.addEventListener("click", (event) => {
  if (event.target === editUserModal) {
    closeUserEditor();
  }
});
searchInput.addEventListener("input", renderTickets);
statusFilter.addEventListener("change", renderTickets);
priorityFilter.addEventListener("change", renderTickets);

applyLanguage();
checkSession();
