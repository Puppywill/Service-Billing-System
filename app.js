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
const manualInvoicesTabButton = document.querySelector("#manualInvoicesTabButton");
const manualInvoicesTabPanel = document.querySelector("#manualInvoicesTabPanel");
const settingsTabButton = document.querySelector("#settingsTabButton");
const settingsTabPanel = document.querySelector("#settingsTabPanel");

const addClientButton = document.querySelector("#addClientButton");
const clientSearchInput = document.querySelector("#clientSearchInput");
const clientStatusFilter = document.querySelector("#clientStatusFilter");
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

const addProjectButton = document.querySelector("#addProjectButton");
const projectSearchInput = document.querySelector("#projectSearchInput");
const projectClientFilter = document.querySelector("#projectClientFilter");
const projectStatusFilter = document.querySelector("#projectStatusFilter");
const projectsTableBody = document.querySelector("#projectsTableBody");
const projectsTotalCount = document.querySelector("#projectsTotalCount");
const projectsMessage = document.querySelector("#projectsMessage");
const projectModal = document.querySelector("#projectModal");
const projectForm = document.querySelector("#projectForm");
const projectModalTitle = document.querySelector("#project-modal-title");
const closeProjectModal = document.querySelector("#closeProjectModal");
const projectId = document.querySelector("#projectId");
const projectClientId = document.querySelector("#projectClientId");
const projectName = document.querySelector("#projectName");
const projectDescription = document.querySelector("#projectDescription");
const projectHourlyRate = document.querySelector("#projectHourlyRate");
const projectIsActive = document.querySelector("#projectIsActive");
const projectCurrentStatusBadge = document.querySelector("#projectCurrentStatusBadge");
const projectContractNumber = document.querySelector("#projectContractNumber");
const projectContractType = document.querySelector("#projectContractType");
const projectSignedBy = document.querySelector("#projectSignedBy");
const projectContractStartDate = document.querySelector("#projectContractStartDate");
const projectContractEndDate = document.querySelector("#projectContractEndDate");
const projectContractedHours = document.querySelector("#projectContractedHours");
const projectLowHoursThreshold = document.querySelector("#projectLowHoursThreshold");
const projectExpirationAlertDays = document.querySelector("#projectExpirationAlertDays");
const projectContractSummary = document.querySelector("#projectContractSummary");
const projectContractStatusGrid = document.querySelector("#projectContractStatusGrid");
const projectNoContractDisplay = document.querySelector("#projectNoContractDisplay");
const projectUsedHoursDisplay = document.querySelector("#projectUsedHoursDisplay");
const projectRemainingHoursDisplay = document.querySelector("#projectRemainingHoursDisplay");
const projectHoursAlertStatusDisplay = document.querySelector("#projectHoursAlertStatusDisplay");
const projectContractStatusDisplay = document.querySelector("#projectContractStatusDisplay");
const projectContractEndDateDisplay = document.querySelector("#projectContractEndDateDisplay");
const projectManagerAssignmentsSection = document.querySelector("#projectManagerAssignmentsSection");
const projectManagerAssignments = document.querySelector("#projectManagerAssignments");
const projectFormMessage = document.querySelector("#projectFormMessage");
const saveProjectButton = document.querySelector("#saveProjectButton");
const projectManagersDetailModal = document.querySelector("#projectManagersDetailModal");
const closeProjectManagersDetailModal = document.querySelector("#closeProjectManagersDetailModal");
const projectManagersDetailTitle = document.querySelector("#project-managers-detail-title");
const projectManagersDetailProject = document.querySelector("#projectManagersDetailProject");
const projectManagersDetailList = document.querySelector("#projectManagersDetailList");
const manageProjectManagersButton = document.querySelector("#manageProjectManagersButton");

const addServiceRecordButton = document.querySelector("#addServiceRecordButton");
const serviceRecordSearchInput = document.querySelector("#serviceRecordSearchInput");
const serviceRecordTechnicianFilter = document.querySelector("#serviceRecordTechnicianFilter");
const serviceRecordClientFilter = document.querySelector("#serviceRecordClientFilter");
const serviceRecordProjectFilter = document.querySelector("#serviceRecordProjectFilter");
const serviceRecordDateFilter = document.querySelector("#serviceRecordDateFilter");
const serviceRecordStatusFilter = document.querySelector("#serviceRecordStatusFilter");
const serviceRecordsTableBody = document.querySelector("#serviceRecordsTableBody");
const serviceRecordsTotalCount = document.querySelector("#serviceRecordsTotalCount");
const serviceRecordsMessage = document.querySelector("#serviceRecordsMessage");
const serviceRecordModal = document.querySelector("#serviceRecordModal");
const serviceRecordForm = document.querySelector("#serviceRecordForm");
const serviceRecordModalTitle = document.querySelector("#service-record-modal-title");
const closeServiceRecordModal = document.querySelector("#closeServiceRecordModal");
const serviceRecordId = document.querySelector("#serviceRecordId");
const serviceRecordTechnicianId = document.querySelector("#serviceRecordTechnicianId");
const serviceRecordDate = document.querySelector("#serviceRecordDate");
const serviceRecordClientId = document.querySelector("#serviceRecordClientId");
const serviceRecordProjectId = document.querySelector("#serviceRecordProjectId");
const morningStart = document.querySelector("#morningStart");
const morningEnd = document.querySelector("#morningEnd");
const afternoonStart = document.querySelector("#afternoonStart");
const afternoonEnd = document.querySelector("#afternoonEnd");
const serviceRecordStatus = document.querySelector("#serviceRecordStatus");
const serviceRecordTotalPreview = document.querySelector("#serviceRecordTotalPreview");
const serviceDescription = document.querySelector("#serviceDescription");
const serviceRecordFormMessage = document.querySelector("#serviceRecordFormMessage");
const saveServiceRecordButton = document.querySelector("#saveServiceRecordButton");

const generateInvoiceButton = document.querySelector("#generateInvoiceButton");
const invoiceSearchInput = document.querySelector("#invoiceSearchInput");
const invoiceClientFilter = document.querySelector("#invoiceClientFilter");
const invoiceFromFilter = document.querySelector("#invoiceFromFilter");
const invoiceToFilter = document.querySelector("#invoiceToFilter");
const invoiceStatusFilter = document.querySelector("#invoiceStatusFilter");
const invoicesTableBody = document.querySelector("#invoicesTableBody");
const invoicesTotalCount = document.querySelector("#invoicesTotalCount");
const invoicesMessage = document.querySelector("#invoicesMessage");
const invoiceGenerateModal = document.querySelector("#invoiceGenerateModal");
const invoiceGenerateForm = document.querySelector("#invoiceGenerateForm");
const closeInvoiceGenerateModal = document.querySelector("#closeInvoiceGenerateModal");
const invoiceGenerateClientId = document.querySelector("#invoiceGenerateClientId");
const invoiceGeneratePeriodFrom = document.querySelector("#invoiceGeneratePeriodFrom");
const invoiceGeneratePeriodTo = document.querySelector("#invoiceGeneratePeriodTo");
const invoiceGenerateTaxRate = document.querySelector("#invoiceGenerateTaxRate");
const invoiceGenerateNotes = document.querySelector("#invoiceGenerateNotes");
const invoiceGenerateMessage = document.querySelector("#invoiceGenerateMessage");
const saveGeneratedInvoiceButton = document.querySelector("#saveGeneratedInvoiceButton");
const invoiceStatusModal = document.querySelector("#invoiceStatusModal");
const invoiceStatusForm = document.querySelector("#invoiceStatusForm");
const closeInvoiceStatusModal = document.querySelector("#closeInvoiceStatusModal");
const invoiceStatusId = document.querySelector("#invoiceStatusId");
const invoiceStatusValue = document.querySelector("#invoiceStatusValue");
const invoiceStatusNotes = document.querySelector("#invoiceStatusNotes");
const invoiceStatusMessage = document.querySelector("#invoiceStatusMessage");
const saveInvoiceStatusButton = document.querySelector("#saveInvoiceStatusButton");
const invoiceDetailModal = document.querySelector("#invoiceDetailModal");
const closeInvoiceDetailModal = document.querySelector("#closeInvoiceDetailModal");
const invoiceDetailSummary = document.querySelector("#invoiceDetailSummary");
const invoiceLinesTableBody = document.querySelector("#invoiceLinesTableBody");

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
const userProjectAssignmentsSection = document.querySelector("#userProjectAssignmentsSection");
const userProjectAssignments = document.querySelector("#userProjectAssignments");
const userFormMessage = document.querySelector("#userFormMessage");
const userSearchInput = document.querySelector("#userSearchInput");
const userStatusFilter = document.querySelector("#userStatusFilter");
const userRoleFilter = document.querySelector("#userRoleFilter");
const usersTableBody = document.querySelector("#usersTableBody");
const usersTotalCount = document.querySelector("#usersTotalCount");
const passwordResetsTableBody = document.querySelector("#passwordResetsTableBody");
const passwordResetsTotalCount = document.querySelector("#passwordResetsTotalCount");
const notificationsTableBody = document.querySelector("#notificationsTableBody");
const notificationsTotalCount = document.querySelector("#notificationsTotalCount");
const dashboardTitle = document.querySelector("#dashboardTitle");
const dashboardMessage = document.querySelector("#dashboardMessage");
const dashboardSummaryGrid = document.querySelector("#dashboardSummaryGrid");
const dashboardDetailPanel = document.querySelector("#dashboardDetailPanel");
const dashboardDetailTitle = document.querySelector("#dashboardDetailTitle");
const dashboardDetailMessage = document.querySelector("#dashboardDetailMessage");
const dashboardDetailHeaderRow = document.querySelector("#dashboardDetailHeaderRow");
const dashboardDetailTableBody = document.querySelector("#dashboardDetailTableBody");
const closeDashboardDetailButton = document.querySelector("#closeDashboardDetailButton");
const dashboardProjectSearchInput = document.querySelector("#dashboardProjectSearchInput");
const dashboardProjectSelect = document.querySelector("#dashboardProjectSelect");
const dashboardProjectMessage = document.querySelector("#dashboardProjectMessage");
const dashboardProjectSummaryGrid = document.querySelector("#dashboardProjectSummaryGrid");
const dashboardProjectInfoGrid = document.querySelector("#dashboardProjectInfoGrid");
const dashboardProjectRecordsTitle = document.querySelector("#dashboardProjectRecordsTitle");
const dashboardProjectRecordsCount = document.querySelector("#dashboardProjectRecordsCount");
const dashboardProjectRecordsBody = document.querySelector("#dashboardProjectRecordsBody");
const dashboardTechnicianSearchInput = document.querySelector("#dashboardTechnicianSearchInput");
const dashboardTechnicianSelect = document.querySelector("#dashboardTechnicianSelect");
const dashboardTechnicianProjectSelect = document.querySelector("#dashboardTechnicianProjectSelect");
const dashboardTechnicianDateFrom = document.querySelector("#dashboardTechnicianDateFrom");
const dashboardTechnicianDateTo = document.querySelector("#dashboardTechnicianDateTo");
const dashboardTechnicianMessage = document.querySelector("#dashboardTechnicianMessage");
const dashboardTechnicianSummaryGrid = document.querySelector("#dashboardTechnicianSummaryGrid");
const dashboardTechnicianInfoGrid = document.querySelector("#dashboardTechnicianInfoGrid");
const dashboardTechnicianProjectsTitle = document.querySelector("#dashboardTechnicianProjectsTitle");
const dashboardTechnicianProjectsBody = document.querySelector("#dashboardTechnicianProjectsBody");
const dashboardTechnicianProjectsChart = document.querySelector("#dashboardTechnicianProjectsChart");
const dashboardTechnicianClientsTitle = document.querySelector("#dashboardTechnicianClientsTitle");
const dashboardTechnicianClientsBody = document.querySelector("#dashboardTechnicianClientsBody");
const dashboardTechnicianClientsChart = document.querySelector("#dashboardTechnicianClientsChart");
const dashboardTechnicianMonthsTitle = document.querySelector("#dashboardTechnicianMonthsTitle");
const dashboardTechnicianMonthsChart = document.querySelector("#dashboardTechnicianMonthsChart");
const dashboardTechnicianRecordsTitle = document.querySelector("#dashboardTechnicianRecordsTitle");
const dashboardTechnicianRecordsCount = document.querySelector("#dashboardTechnicianRecordsCount");
const dashboardTechnicianRecordsBody = document.querySelector("#dashboardTechnicianRecordsBody");
const dashboardTechnicianDescriptionModal = document.querySelector("#dashboardTechnicianDescriptionModal");
const dashboardTechnicianDescriptionForm = document.querySelector("#dashboardTechnicianDescriptionForm");
const closeDashboardTechnicianDescriptionModal = document.querySelector("#closeDashboardTechnicianDescriptionModal");
const dashboardTechnicianDescriptionRecordId = document.querySelector("#dashboardTechnicianDescriptionRecordId");
const dashboardTechnicianDescriptionText = document.querySelector("#dashboardTechnicianDescriptionText");
const dashboardTechnicianDescriptionMessage = document.querySelector("#dashboardTechnicianDescriptionMessage");
const hoursByMonthTitle = document.querySelector("#hoursByMonthTitle");
const billingByMonthTitle = document.querySelector("#billingByMonthTitle");
const hoursByClientTitle = document.querySelector("#hoursByClientTitle");
const hoursByProjectTitle = document.querySelector("#hoursByProjectTitle");
const hoursByTechnicianTitle = document.querySelector("#hoursByTechnicianTitle");
const invoicesByStatusTitle = document.querySelector("#invoicesByStatusTitle");
const hoursByMonthChart = document.querySelector("#hoursByMonthChart");
const billingByMonthChart = document.querySelector("#billingByMonthChart");
const hoursByClientChart = document.querySelector("#hoursByClientChart");
const hoursByProjectChart = document.querySelector("#hoursByProjectChart");
const hoursByTechnicianChart = document.querySelector("#hoursByTechnicianChart");
const invoicesByStatusChart = document.querySelector("#invoicesByStatusChart");
const recentServiceRecordsTitle = document.querySelector("#recentServiceRecordsTitle");
const recentInvoicesTitle = document.querySelector("#recentInvoicesTitle");
const recentClientsTitle = document.querySelector("#recentClientsTitle");
const recentProjectsTitle = document.querySelector("#recentProjectsTitle");
const recentServiceRecordsList = document.querySelector("#recentServiceRecordsList");
const recentInvoicesList = document.querySelector("#recentInvoicesList");
const recentClientsList = document.querySelector("#recentClientsList");
const recentProjectsList = document.querySelector("#recentProjectsList");

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
const editUserIsActive = document.querySelector("#editUserIsActive");
const editUserProjectAssignmentsSection = document.querySelector("#editUserProjectAssignmentsSection");
const editUserProjectAssignments = document.querySelector("#editUserProjectAssignments");
const editUserMessage = document.querySelector("#editUserMessage");
const userProjectsDetailModal = document.querySelector("#userProjectsDetailModal");
const closeUserProjectsDetailModal = document.querySelector("#closeUserProjectsDetailModal");
const userProjectsDetailTitle = document.querySelector("#user-projects-detail-title");
const userProjectsDetailSummary = document.querySelector("#userProjectsDetailSummary");
const userProjectsDetailBody = document.querySelector("#userProjectsDetailBody");
const manageUserProjectAssignmentsButton = document.querySelector("#manageUserProjectAssignmentsButton");

const openCount = document.querySelector("#openCount");
const progressCount = document.querySelector("#progressCount");
const closedCount = document.querySelector("#closedCount");
const totalCount = document.querySelector("#totalCount");
const reportsForm = document.querySelector("#reportsForm");
const reportFrom = document.querySelector("#reportFrom");
const reportTo = document.querySelector("#reportTo");
const reportStatus = document.querySelector("#reportStatus");
const reportTechnician = document.querySelector("#reportTechnician");
const reportClient = document.querySelector("#reportClient");
const reportProject = document.querySelector("#reportProject");
const reportInvoiceNumber = document.querySelector("#reportInvoiceNumber");
const reportsTableBody = document.querySelector("#reportsTableBody");
const reportsTotalCount = document.querySelector("#reportsTotalCount");
const reportsMessage = document.querySelector("#reportsMessage");
const reportsSummaryGrid = document.querySelector("#reportsSummaryGrid");
const generateReportButton = document.querySelector("#generateReportButton");
const exportPdfButton = document.querySelector("#exportPdfButton");
const exportExcelButton = document.querySelector("#exportExcelButton");
const manualInvoiceForm = document.querySelector("#manualInvoiceForm");
const manualInvoiceNumber = document.querySelector("#manualInvoiceNumber");
const manualInvoiceDate = document.querySelector("#manualInvoiceDate");
const manualInvoiceBillTo = document.querySelector("#manualInvoiceBillTo");
const manualInvoicePoNumber = document.querySelector("#manualInvoicePoNumber");
const manualInvoiceTerms = document.querySelector("#manualInvoiceTerms");
const manualInvoiceDueDate = document.querySelector("#manualInvoiceDueDate");
const manualInvoiceProject = document.querySelector("#manualInvoiceProject");
const manualInvoiceLinesBody = document.querySelector("#manualInvoiceLinesBody");
const addManualInvoiceLineButton = document.querySelector("#addManualInvoiceLineButton");
const manualInvoiceApplyTax = document.querySelector("#manualInvoiceApplyTax");
const manualInvoiceTaxRate = document.querySelector("#manualInvoiceTaxRate");
const manualInvoiceSubtotalDisplay = document.querySelector("#manualInvoiceSubtotalDisplay");
const manualInvoiceTaxLabel = document.querySelector("#manualInvoiceTaxLabel");
const manualInvoiceTaxDisplay = document.querySelector("#manualInvoiceTaxDisplay");
const manualInvoiceTotalDisplay = document.querySelector("#manualInvoiceTotalDisplay");
const manualInvoiceSignature1Name = document.querySelector("#manualInvoiceSignature1Name");
const manualInvoiceSignature1Title = document.querySelector("#manualInvoiceSignature1Title");
const manualInvoiceSignature2Name = document.querySelector("#manualInvoiceSignature2Name");
const manualInvoiceSignature2Title = document.querySelector("#manualInvoiceSignature2Title");
const manualInvoiceMessage = document.querySelector("#manualInvoiceMessage");
const generateManualInvoicePdfButton = document.querySelector("#generateManualInvoicePdfButton");

let tickets = [];
let clients = [];
let projectClients = [];
let projects = [];
let serviceRecords = [];
let serviceRecordTechnicians = [];
let serviceRecordClients = [];
let serviceRecordProjects = [];
let reportTechnicians = [];
let manualInvoiceLines = [];
let nextManualInvoiceLineId = 1;
let invoices = [];
let invoiceClients = [];
let dashboardSummary = null;
let dashboardCharts = null;
let dashboardRecentActivity = null;
let dashboardServiceHourRecords = [];
let dashboardActiveClients = [];
let dashboardProjectOptions = [];
let dashboardSelectedProject = null;
let dashboardProjectServiceRecords = [];
let dashboardTechnicianOptions = [];
let dashboardSelectedTechnician = null;
let dashboardTechnicianServiceRecords = [];
let dashboardSelectedTechnicianProject = "";
let dashboardTechnicianDateFromValue = "";
let dashboardTechnicianDateToValue = "";
let dashboardTechnicianDescriptionRecord = null;
let users = [];
let assignableProjectManagers = [];
let assignableProjects = [];
let activeUserProjectDetailUserId = null;
const projectAssignmentPickerStates = new WeakMap();
let notifications = [];
let passwordResets = [];
let reportServiceRecords = [];
let reportSummary = null;
let hasGeneratedReport = false;
let currentUser = null;
let activeTab = "tickets";
let currentLanguage = localStorage.getItem("helpdeskLanguage") || "es";

const technicianDashboardMainProjectKeys = [
  "hosting y mantenimiento 2025-2026 - municipio de bayamon - programa wioa",
  "desarrollo de pagina web 2025 - aldl la montana",
  "webpage 2025 - conexion laboral area local sureste",
  "programa continuo de cuidado (coc) - departamento de la familia",
  "solutions by design"
];

const dashboardMainClientKeys = [
  "municipio de bayamon - programa wioa",
  "aldl la montana",
  "departamento de la familia",
  "wioa se",
  "solutions by design"
];

const dashboardMainProjectKeys = [
  "hosting y mantenimiento 2025-2026",
  "desarrollo de pagina web 2025",
  "webpage 2025",
  "programa continuo de cuidado (coc)"
];

function normalizeSearchKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

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
  projectClients = [];
  projects = [];
  serviceRecords = [];
  serviceRecordTechnicians = [];
  serviceRecordClients = [];
  serviceRecordProjects = [];
  invoices = [];
  invoiceClients = [];
  dashboardSummary = null;
  dashboardCharts = null;
  dashboardRecentActivity = null;
  dashboardServiceHourRecords = [];
  dashboardProjectOptions = [];
  dashboardSelectedProject = null;
  dashboardProjectServiceRecords = [];
  dashboardTechnicianOptions = [];
  dashboardSelectedTechnician = null;
  dashboardTechnicianServiceRecords = [];
  dashboardSelectedTechnicianProject = "";
  dashboardTechnicianDateFromValue = "";
  dashboardTechnicianDateToValue = "";
  dashboardTechnicianDescriptionRecord = null;
  users = [];
  assignableProjectManagers = [];
  assignableProjects = [];
  activeUserProjectDetailUserId = null;
  projectAssignmentPickerStates.delete(projectManagerAssignments);
  projectAssignmentPickerStates.delete(userProjectAssignments);
  projectAssignmentPickerStates.delete(editUserProjectAssignments);
  notifications = [];
  passwordResets = [];
  reportServiceRecords = [];
  reportSummary = null;
  hasGeneratedReport = false;

  if (render) {
    renderTickets();
    renderClients();
    renderProjects();
    renderServiceRecords();
    renderInvoices();
    renderUsers();
    renderPasswordResets();
    renderNotifications();
    renderServiceHoursReport();
    renderDashboard();
  }
}

async function refreshAuthenticatedUser() {
  const response = await fetch("/api/me", {
    cache: "no-store"
  });
  const data = await parseJsonResponse(response);

  console.info(`[auth] Session validation returned ${response.status}.`);

  if (!response.ok) {
    const error = new Error(translateServerMessage(data.message) || t("sessionValidationError"));
    error.status = response.status;
    throw error;
  }

  if (!data.user) {
    console.info("[auth] No active session was returned by /api/me.");
    currentUser = null;
    return null;
  }

  console.info(`[auth] Session valid for role ${normalizeClientRole(data.user.Role)}.`);
  setAuthenticatedUser(data.user, { switchToTickets: false });
  return data.user;
}

async function refreshWorkspace() {
  await refreshAuthenticatedUser();

  if (!currentUser) {
    showLogin();
    return;
  }

  if (activeTab === "users" && !isAdmin()) {
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
    documentTitle: "Solutions By Design - Service Billing System",
    headerEyebrow: "Registro de horas y facturacion de servicios",
    headerTitle: "Solutions By Design",
    headerSubtitle: "Solutions By Design ofrece una plataforma para registrar, administrar y supervisar servicios por hora de forma eficiente.",
    secureAccess: "Acceso seguro",
    login: "Iniciar sesion",
    password: "Contrasena",
    passwordPlaceholder: "Tu contrasena",
    tickets: "Registros de servicio",
    users: "Usuarios",
    notifications: "Notificaciones",
    dashboard: "Resumen",
    reports: "Reportes",
    clients: "Clientes",
    projects: "Proyectos",
    invoices: "Facturas",
    manualInvoices: "Facturas",
    manualInvoicesEyebrow: "Facturacion manual",
    manualInvoicePdfButton: "Generar factura PDF",
    manualInvoiceGenerating: "Generando factura PDF...",
    manualInvoiceReady: "Factura PDF generada correctamente.",
    manualInvoiceError: "No se pudo generar la factura PDF.",
    manualInvoiceLineRequired: "Agrega al menos una linea valida antes de generar la factura.",
    manualInvoiceLineInvalid: "Cada linea debe tener cantidad mayor que 0, descripcion y rate valido.",
    settings: "Configuracion",
    dashboardTitle: "Resumen",
    dashboardLoadError: "No se pudo cargar el resumen.",
    noDashboardData: "No hay datos para mostrar.",
    businessOverview: "Resumen del negocio",
    recentActivity: "Actividad reciente",
    dashboardMetrics: {
      TotalClients: "Clientes",
      TotalProjects: "Proyectos",
      TotalServiceRecords: "Registros de servicio",
      TotalHours: "Horas totales",
      CurrentMonthHours: "Horas del mes actual",
      UnbilledHours: "Horas pendientes de procesar",
      BilledHours: "Horas procesadas"
    },
    dashboardCharts: {
      HoursByMonth: "Horas de servicio por mes",
      HoursByClient: "Horas de servicio por cliente",
      HoursByProject: "Horas por proyecto de servicio",
      HoursByTechnician: "Horas de servicio por tecnico"
    },
    dashboardSectionLabels: {
      hours: "HORAS",
      clients: "CLIENTES",
      projects: "PROYECTOS",
      technicians: "TECNICOS",
      months: "MESES",
      serviceRecords: "REGISTROS DE SERVICIO"
    },
    dashboardActivity: {
      ServiceRecords: "Registros de servicio",
      Invoices: "Facturas",
      Clients: "Clientes",
      Projects: "Proyectos"
    },
    projectDashboard: {
      eyebrow: "Enfoque por proyecto",
      title: "Panel de proyecto",
      searchLabel: "Buscar proyecto",
      searchPlaceholder: "Proyecto o cliente",
      projectLabel: "Proyecto",
      selectProject: "Selecciona un proyecto",
      selectedPrompt: "Selecciona un proyecto para ver detalles.",
      loading: "Cargando informacion del proyecto...",
      loadError: "No se pudo cargar la informacion del proyecto.",
      noProjectMatches: "No hay proyectos que coincidan con la busqueda.",
      latestRecords: "Ultimos registros de servicio",
      recordsCount: "registros",
      noRecords: "No hay registros de servicio para este proyecto.",
      totalProjectHours: "Total horas del proyecto",
      currentMonthProjectHours: "Horas del mes actual",
      pendingProjectHours: "Horas pendientes",
      processedProjectHours: "Horas procesadas",
      canceledProjectHours: "Horas canceladas"
    },
    technicianDashboard: {
      eyebrow: "Enfoque por tecnico",
      title: "Panel de tecnico",
      searchLabel: "Buscar tecnico",
      searchPlaceholder: "Nombre del tecnico",
      technicianLabel: "Tecnico",
      projectLabel: "Proyecto",
      dateFromLabel: "Fecha desde",
      dateToLabel: "Fecha hasta",
      selectTechnician: "Selecciona un tecnico",
      selectProject: "Selecciona un proyecto",
      allProjects: "Todos los proyectos",
      selectedPrompt: "Selecciona un tecnico para ver sus estadisticas.",
      loading: "Cargando informacion del tecnico...",
      loadError: "No se pudo cargar la informacion del tecnico.",
      noTechnicianMatches: "No hay tecnicos que coincidan con la busqueda.",
      hoursByProject: "Horas por proyecto",
      hoursByClient: "Horas por cliente",
      hoursByMonth: "Horas por mes",
      latestRecords: "Ultimos registros de servicio",
      recordsCount: "registros",
      noRecords: "No hay registros de servicio para este tecnico.",
      noProjectHours: "No hay horas por proyecto para este tecnico.",
      noClientHours: "No hay horas por cliente para este tecnico.",
      totalTechnicianHours: "Total horas trabajadas",
      currentMonthTechnicianHours: "Horas del mes actual",
      pendingTechnicianHours: "Horas pendientes",
      processedTechnicianHours: "Horas procesadas",
      canceledTechnicianHours: "Horas canceladas",
      totalTechnicianRecords: "Total registros"
    },
    clientsEyebrow: "Catalogo de clientes",
    projectsEyebrow: "Catalogo de trabajo",
    invoicesEyebrow: "Area de facturacion",
    settingsEyebrow: "Preferencias del sistema",
    clientsFoundation: "La administracion de clientes esta lista para el flujo operativo de Solutions By Design.",
    addClient: "Agregar cliente",
    editClient: "Editar cliente",
    saveClient: "Guardar cliente",
    clientSearchPlaceholder: "Cliente, email o telefono",
    clientsCount: "clientes",
    activeCount: "activos",
    inactiveCount: "inactivos",
    statusFilter: "Estado",
    allEntityStatuses: "Todos",
    activeOnly: "Activos",
    inactiveOnly: "Inactivos",
    noClients: "No hay clientes para mostrar.",
    noClientMatches: "No hay clientes que coincidan con la busqueda.",
    loadClientsError: "No se pudieron cargar los clientes.",
    createClientSuccess: "Cliente creado correctamente.",
    updateClientSuccess: "Cliente actualizado correctamente.",
    deleteClientSuccess: "Cliente desactivado correctamente.",
    activateClient: "Activar",
    deactivateClient: "Desactivar",
    activateClientSuccess: "Cliente activado correctamente.",
    deactivateClientSuccess: "Cliente desactivado correctamente.",
    activateClientConfirm: "¿Seguro que deseas activar nuevamente este cliente?",
    deactivateClientConfirm: "¿Seguro que deseas desactivar este cliente? No se eliminarán sus registros históricos.",
    clientStatusError: "No se pudo actualizar el estado del cliente.",
    clientNameRequired: "El nombre del cliente es obligatorio.",
    clientNotFound: "No se encontro el cliente seleccionado.",
    deleteClientConfirm: "Seguro que deseas desactivar este cliente?",
    createClientError: "No se pudo crear el cliente.",
    updateClientError: "No se pudo actualizar el cliente.",
    deleteClientError: "No se pudo desactivar el cliente.",
    projectsFoundation: "La administracion de proyectos organizara el trabajo por cliente y descripcion antes de registrar servicios.",
    addProject: "Agregar proyecto",
    editProject: "Editar proyecto",
    saveProject: "Guardar proyecto",
    projectSearchPlaceholder: "Proyecto, cliente o descripcion",
    allClients: "Todos los clientes",
    selectClient: "Selecciona cliente",
    projectsCount: "proyectos",
    noProjects: "No hay proyectos para mostrar.",
    noProjectMatches: "No hay proyectos que coincidan con los filtros.",
    loadProjectsError: "No se pudieron cargar los proyectos.",
    loadProjectClientsError: "No se pudieron cargar los clientes para proyectos.",
    createProjectSuccess: "Proyecto creado correctamente.",
    updateProjectSuccess: "Proyecto actualizado correctamente.",
    deleteProjectSuccess: "Proyecto desactivado correctamente.",
    activateProject: "Activar",
    deactivateProject: "Desactivar",
    activateProjectSuccess: "Proyecto activado correctamente.",
    deactivateProjectSuccess: "Proyecto desactivado correctamente.",
    activateProjectConfirm: "¿Seguro que deseas activar nuevamente este proyecto?",
    deactivateProjectConfirm: "¿Seguro que deseas desactivar este proyecto? No se eliminarán sus registros históricos.",
    projectStatusError: "No se pudo actualizar el estado del proyecto.",
    projectClientRequired: "El cliente es obligatorio.",
    projectNameRequired: "El nombre del proyecto es obligatorio.",
    projectRateRequired: "La configuracion interna del proyecto debe ser numerica.",
    projectRateNegative: "La configuracion interna del proyecto no puede ser negativa.",
    projectNotFound: "No se encontro el proyecto seleccionado.",
    deleteProjectConfirm: "Seguro que deseas desactivar este proyecto?",
    createProjectError: "No se pudo crear el proyecto.",
    updateProjectError: "No se pudo actualizar el proyecto.",
    deleteProjectError: "No se pudo desactivar el proyecto.",
    addServiceRecord: "Agregar registro de servicio",
    editServiceRecord: "Editar registro de servicio",
    saveServiceRecord: "Guardar registro",
    serviceRecordSearchPlaceholder: "Tecnico, cliente, proyecto o descripcion",
    allTechnicians: "Todos los tecnicos",
    allProjects: "Todos los proyectos",
    allStatuses: "Todos los estados",
    serviceRecordsCount: "registros",
    noServiceRecords: "No hay registros de servicio.",
    noServiceRecordMatches: "No hay registros que coincidan con los filtros.",
    loadServiceRecordsError: "No se pudieron cargar los registros de servicio.",
    loadServiceRecordLookupsError: "No se pudieron cargar los datos del formulario.",
    createServiceRecordSuccess: "Registro de servicio creado correctamente.",
    updateServiceRecordSuccess: "Registro de servicio actualizado correctamente.",
    cancelServiceRecordSuccess: "Registro de servicio cancelado correctamente.",
    serviceRecordTechnicianRequired: "El tecnico es obligatorio.",
    serviceRecordClientRequired: "El cliente es obligatorio.",
    serviceRecordProjectRequired: "El proyecto es obligatorio.",
    serviceRecordDateRequired: "La fecha del servicio es obligatoria.",
    serviceRecordDescriptionRequired: "La descripcion del servicio es obligatoria.",
    serviceRecordTimeError: "Las horas deben tener entrada y salida, y no pueden ser negativas.",
    serviceRecordStatusInvalid: "El estado seleccionado no es valido.",
    serviceRecordNotFound: "No se encontro el registro seleccionado.",
    cancelServiceRecordConfirm: "Seguro que deseas cancelar este registro de servicio?",
    createServiceRecordError: "No se pudo crear el registro de servicio.",
    updateServiceRecordError: "No se pudo actualizar el registro de servicio.",
    cancelServiceRecordError: "No se pudo cancelar el registro de servicio.",
    generateInvoice: "Generar factura",
    editInvoiceStatus: "Editar estado de factura",
    saveInvoiceStatus: "Guardar estado",
    invoiceSearchPlaceholder: "Factura, cliente o notas",
    invoicesCount: "facturas",
    noInvoices: "No hay facturas.",
    noInvoiceMatches: "No hay facturas que coincidan con los filtros.",
    loadInvoicesError: "No se pudieron cargar las facturas.",
    loadInvoiceClientsError: "No se pudieron cargar los clientes para facturas.",
    invoiceGeneratedSuccess: "Factura generada correctamente.",
    invoiceStatusUpdatedSuccess: "Estado de factura actualizado correctamente.",
    invoiceCanceledSuccess: "Factura cancelada correctamente.",
    invoiceClientRequired: "El cliente es obligatorio.",
    invoicePeriodFromRequired: "La fecha desde es obligatoria.",
    invoicePeriodToRequired: "La fecha hasta es obligatoria.",
    invoicePeriodInvalid: "La fecha desde no puede ser posterior a la fecha hasta.",
    invoiceTaxRateInvalid: "La configuracion interna de la factura debe ser un numero no negativo.",
    invoiceStatusInvalid: "El estado seleccionado no es valido.",
    invoiceNotFound: "No se encontro la factura seleccionada.",
    cancelInvoiceConfirm: "Seguro que deseas cancelar esta factura?",
    generateInvoiceError: "No se pudo generar la factura.",
    updateInvoiceError: "No se pudo actualizar la factura.",
    cancelInvoiceError: "No se pudo cancelar la factura.",
    loadInvoiceDetailError: "No se pudo cargar el detalle de la factura.",
    noInvoiceLines: "No hay lineas para esta factura.",
    invoicesFoundation: "Las pantallas de facturas usaran horas registradas para generar encabezados, lineas y estados del documento.",
    settingsFoundation: "Configuracion centralizara preferencias de cuenta, notificaciones, valores de flujo de trabajo y controles de migracion en una fase posterior.",
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
    pdfReady: "PDF generado correctamente.",
    pdfNoData: "Genera un reporte con registros antes de exportar PDF.",
    excelReady: "Excel generado correctamente.",
    excelNoData: "Genera un reporte con registros antes de exportar Excel.",
    excelError: "No se pudo exportar el reporte a Excel.",
    exportError: "No se pudo exportar el reporte.",
    invalidApiResponse: "El servidor devolvio una respuesta HTML en lugar de JSON. Verifica que el servidor este reiniciado y que el endpoint API exista.",
    passwordResets: "Solicitudes de recuperacion",
    passwordResetRequests: "solicitudes",
    noPasswordResets: "No hay solicitudes de recuperacion.",
    resolve: "Marcar resuelta",
    markResolved: "Marcar como resuelta",
    deleteNotification: "Borrar",
    deleteNotificationConfirm: "Seguro que deseas borrar esta notificacion?",
    deleteNotificationSuccess: "Notificacion borrada correctamente.",
    deleteNotificationError: "No se pudo borrar la notificacion.",
    temporaryPassword: "Asignar contrasena temporal",
    showPassword: "Mostrar contrasena",
    hidePassword: "Ocultar contrasena",
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
    noUserMatches: "No hay usuarios que coincidan con la busqueda y el estado seleccionado.",
    userSearchPlaceholder: "Nombre, email o rol",
    usersCount: "usuarios",
    roleFilter: "Rol",
    allRoles: "Todos los roles",
    assignedProjects: "Proyectos asignados",
    assignedProjectsHelp: "Selecciona uno o varios proyectos activos.",
    assignedProjectCount: "proyectos",
    assignedProjectCountSingular: "proyecto",
    assignedProjectManagers: "Project Managers asignados",
    assignedProjectManagersHelp: "Selecciona uno o varios Project Managers activos.",
    selectedManagerSingular: "Project Manager asignado",
    selectedManagerPlural: "Project Managers asignados",
    managerSearchPlaceholder: "Nombre o email",
    noAssignableManagers: "No hay Project Managers activos disponibles.",
    noManagerMatches: "No hay Project Managers que coincidan con la busqueda.",
    removeManagerAssignment: "Quitar Project Manager",
    assignedAt: "Asignado el",
    assignedProjectsDetail: "Proyectos asignados",
    manageAssignments: "Administrar asignaciones",
    userInformation: "Informacion del usuario",
    activeUser: "Usuario activo",
    changeProjectManagerRoleConfirm: "Este usuario tiene proyectos asignados. Si cambias el rol, sus asignaciones activas se quitaran. Deseas continuar?",
    projectAssignmentsError: "No se pudieron cargar o guardar las asignaciones de proyectos.",
    projectAssignmentsLoading: "Cargando proyectos asignados...",
    assignmentSearch: "Buscar Project Managers",
    assignmentSearchPlaceholder: "Cliente o proyecto",
    selectVisibleProjects: "Seleccionar todos los proyectos visibles",
    clearProjectSelection: "Limpiar seleccion",
    selectedProjectSingular: "proyecto seleccionado",
    selectedProjectPlural: "proyectos seleccionados",
    noAssignableProjects: "No hay proyectos activos disponibles.",
    noAssignmentMatches: "No hay proyectos que coincidan con la busqueda.",
    removeProjectAssignment: "Quitar proyecto",
    inactiveAssignmentsHelp: "Los proyectos inactivos asignados anteriormente se conservan por historial, pero no pueden seleccionarse como nuevas asignaciones.",
    clearAssignedProjectsConfirm: "Seguro que deseas limpiar las asignaciones activas seleccionadas? Las asignaciones historicas inactivas se conservaran.",
    unassigned: "Sin asignar",
    registeredUsers: "usuarios registrados",
    administration: "Administracion",
    security: "Seguridad",
    fullName: "Nombre completo",
    fullNamePlaceholder: "Ej. Maria Lopez",
    role: "Rol",
    tempPasswordPlaceholder: "Contrasena temporal",
    newPassword: "Nueva contrasena",
    keepPasswordPlaceholder: "Dejar vacio para mantener",
    admin: "Administrador",
    closeEditor: "Cerrar editor",
    closeUserEditor: "Cerrar editor de usuario",
    completeTicketFields: "Completa la descripcion del servicio.",
    loginError: "No se pudo iniciar sesion.",
    sessionValidationError: "No se pudo verificar la sesion. Intenta nuevamente.",
    loadTicketsError: "No se pudieron cargar los registros.",
    serverConnectionError: "No se pudo conectar con el servidor.",
    createTicketError: "No se pudo crear el registro.",
    createTicketAlertError: "Ocurrio un error al crear el registro.",
    ticketNotFound: "No se encontro el registro seleccionado.",
    userNotFound: "No se encontro el usuario seleccionado.",
    createUserError: "No se pudo crear el usuario.",
    editUserError: "No se pudo editar el usuario.",
    deleteUserError: "No se pudo actualizar el estado del usuario.",
    deleteUserConfirm: "Seguro que deseas cambiar el estado de este usuario?",
    activateUser: "Activar",
    deactivateUser: "Desactivar",
    active: "Activo",
    inactive: "Inactivo",
    detail: "Detalle",
    dashboardDetail: "Detalle del resumen",
    selectDashboardCard: "Selecciona una tarjeta del resumen.",
    closeDashboardDetail: "Cerrar detalle del resumen",
    updateTicketError: "No se pudo editar el registro.",
    updateTicketAlertError: "Ocurrio un error al editar el registro.",
    closeTicketError: "No se pudo cerrar el registro.",
    closeTicketAlertError: "Ocurrio un error al cerrar el registro.",
    deleteTicketError: "No se pudo eliminar el registro.",
    deleteTicketAlertError: "Ocurrio un error al eliminar el registro.",
    deleteTicketConfirm: "Seguro que deseas eliminar este registro?",
    userNumber: "Usuario",
    notificationTypes: {
      TICKET_CREATED: "Registro de servicio creado",
      TICKET_CLOSED: "Registro de servicio cerrado",
      TICKET_DELETED: "Registro de servicio eliminado",
      USER_CREATED: "Usuario creado",
      USER_UPDATED: "Usuario editado",
      PASSWORD_RESET_REQUESTED: "Recuperacion de contrasena",
      REPORT_GENERATED: "Reporte generado",
      SERVICE_RECORDS_PROCESSED: "Registros procesados"
    },
    statuses: {
      Abierto: "Abierto",
      "En Progreso": "En Progreso",
      Cerrado: "Cerrado"
    },
    serviceRecordStatuses: {
      Recorded: "Pendiente",
      Billed: "Procesado",
      Canceled: "Cancelado"
    },
    invoiceStatuses: {
      Draft: "Borrador",
      Issued: "Emitida",
      Paid: "Pagada",
      Canceled: "Cancelada"
    },
    contractStatuses: {
      OK: "OK",
      LOW_HOURS: "Pocas horas",
      NO_HOURS_REMAINING: "Sin horas restantes",
      EXPIRING_SOON: "Por vencer",
      EXPIRED: "Vencido",
      NO_CONTRACT: "Sin contrato",
      WARNING: "Advertencia",
      CRITICAL: "Critico"
    },
    contractTypes: {
      Direct: "Directo",
      Signed: "Firmado",
      Other: "Otro",
      "": "Sin contrato"
    },
    priorities: {
      Alta: "Alta",
      Media: "Media",
      Baja: "Baja"
    }
  },
  en: {
    documentTitle: "Solutions By Design - Service Billing System",
    headerEyebrow: "Service time tracking and billing",
    headerTitle: "Solutions By Design",
    headerSubtitle: "Solutions By Design provides a platform to record, manage, and monitor hourly service work efficiently.",
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
    manualInvoices: "Invoices",
    manualInvoicesEyebrow: "Manual invoicing",
    manualInvoicePdfButton: "Generate invoice PDF",
    manualInvoiceGenerating: "Generating invoice PDF...",
    manualInvoiceReady: "Invoice PDF generated successfully.",
    manualInvoiceError: "Invoice PDF could not be generated.",
    manualInvoiceLineRequired: "Add at least one valid line before generating the invoice.",
    manualInvoiceLineInvalid: "Each line must include quantity greater than 0, description, and a valid rate.",
    settings: "Settings",
    dashboardTitle: "Summary",
    dashboardLoadError: "Dashboard could not be loaded.",
    noDashboardData: "No data to display.",
    businessOverview: "Business overview",
    recentActivity: "Recent activity",
    dashboardMetrics: {
      TotalClients: "Clients",
      TotalProjects: "Projects",
      TotalServiceRecords: "Service Records",
      TotalHours: "Total Hours",
      CurrentMonthHours: "Current Month Hours",
      UnbilledHours: "Pending Service Hours",
      BilledHours: "Processed Hours"
    },
    dashboardCharts: {
      HoursByMonth: "Service Hours by Month",
      HoursByClient: "Service Hours by Client",
      HoursByProject: "Service Hours by Project",
      HoursByTechnician: "Service Hours by Technician"
    },
    dashboardSectionLabels: {
      hours: "HOURS",
      clients: "CLIENTS",
      projects: "PROJECTS",
      technicians: "TECHNICIANS",
      months: "MONTHS",
      serviceRecords: "SERVICE RECORDS"
    },
    dashboardActivity: {
      ServiceRecords: "Service Records",
      Invoices: "Invoices",
      Clients: "Clients",
      Projects: "Projects"
    },
    projectDashboard: {
      eyebrow: "Project focus",
      title: "Project Dashboard",
      searchLabel: "Search project",
      searchPlaceholder: "Project or client",
      projectLabel: "Project",
      selectProject: "Select a project",
      selectedPrompt: "Select a project to view details.",
      loading: "Loading project information...",
      loadError: "Project information could not be loaded.",
      noProjectMatches: "No projects match the search.",
      latestRecords: "Latest Service Records",
      recordsCount: "records",
      noRecords: "No service records for this project.",
      totalProjectHours: "Total project hours",
      currentMonthProjectHours: "Current month hours",
      pendingProjectHours: "Pending hours",
      processedProjectHours: "Processed hours",
      canceledProjectHours: "Canceled hours"
    },
    technicianDashboard: {
      eyebrow: "Technician focus",
      title: "Technician Dashboard",
      searchLabel: "Search technician",
      searchPlaceholder: "Technician name",
      technicianLabel: "Technician",
      projectLabel: "Project",
      dateFromLabel: "Date from",
      dateToLabel: "Date to",
      selectTechnician: "Select a technician",
      selectProject: "Select a project",
      allProjects: "All projects",
      selectedPrompt: "Select a technician to view statistics.",
      loading: "Loading technician information...",
      loadError: "Technician information could not be loaded.",
      noTechnicianMatches: "No technicians match the search.",
      hoursByProject: "Hours By Project",
      hoursByClient: "Hours By Client",
      hoursByMonth: "Hours By Month",
      latestRecords: "Latest Service Records",
      recordsCount: "records",
      noRecords: "No service records for this technician.",
      noProjectHours: "No project hours for this technician.",
      noClientHours: "No client hours for this technician.",
      totalTechnicianHours: "Total worked hours",
      currentMonthTechnicianHours: "Current month hours",
      pendingTechnicianHours: "Pending hours",
      processedTechnicianHours: "Processed hours",
      canceledTechnicianHours: "Canceled hours",
      totalTechnicianRecords: "Total records"
    },
    clientsEyebrow: "Customer catalog",
    projectsEyebrow: "Work catalog",
    invoicesEyebrow: "Billing workspace",
    settingsEyebrow: "System preferences",
    clientsFoundation: "Client management is ready for the Solutions By Design operational workflow.",
    addClient: "Add Client",
    editClient: "Edit Client",
    saveClient: "Save Client",
    clientSearchPlaceholder: "Client, email, or phone",
    clientsCount: "clients",
    activeCount: "active",
    inactiveCount: "inactive",
    statusFilter: "Status",
    allEntityStatuses: "All",
    activeOnly: "Active",
    inactiveOnly: "Inactive",
    noClients: "No clients to display.",
    noClientMatches: "No clients match the search.",
    loadClientsError: "Clients could not be loaded.",
    createClientSuccess: "Client created successfully.",
    updateClientSuccess: "Client updated successfully.",
    deleteClientSuccess: "Client deactivated successfully.",
    activateClient: "Activate",
    deactivateClient: "Deactivate",
    activateClientSuccess: "Client activated successfully.",
    deactivateClientSuccess: "Client deactivated successfully.",
    activateClientConfirm: "Are you sure you want to activate this client again?",
    deactivateClientConfirm: "Are you sure you want to deactivate this client? Historical records will not be deleted.",
    clientStatusError: "Could not update the client status.",
    clientNameRequired: "Client name is required.",
    clientNotFound: "The selected client was not found.",
    deleteClientConfirm: "Are you sure you want to deactivate this client?",
    createClientError: "Could not create the client.",
    updateClientError: "Could not update the client.",
    deleteClientError: "Could not deactivate the client.",
    projectsFoundation: "Project management will organize client work and descriptions before service records are entered.",
    addProject: "Add Project",
    editProject: "Edit Project",
    saveProject: "Save Project",
    projectSearchPlaceholder: "Project, client, or description",
    allClients: "All clients",
    selectClient: "Select client",
    projectsCount: "projects",
    noProjects: "No projects to display.",
    noProjectMatches: "No projects match the filters.",
    loadProjectsError: "Projects could not be loaded.",
    loadProjectClientsError: "Clients for projects could not be loaded.",
    createProjectSuccess: "Project created successfully.",
    updateProjectSuccess: "Project updated successfully.",
    deleteProjectSuccess: "Project deactivated successfully.",
    activateProject: "Activate",
    deactivateProject: "Deactivate",
    activateProjectSuccess: "Project activated successfully.",
    deactivateProjectSuccess: "Project deactivated successfully.",
    activateProjectConfirm: "Are you sure you want to activate this project again?",
    deactivateProjectConfirm: "Are you sure you want to deactivate this project? Historical records will not be deleted.",
    projectStatusError: "Could not update the project status.",
    projectClientRequired: "Client is required.",
    projectNameRequired: "Project name is required.",
    projectRateRequired: "The internal project setting must be numeric.",
    projectRateNegative: "The internal project setting cannot be negative.",
    projectNotFound: "The selected project was not found.",
    deleteProjectConfirm: "Are you sure you want to deactivate this project?",
    createProjectError: "Could not create the project.",
    updateProjectError: "Could not update the project.",
    deleteProjectError: "Could not deactivate the project.",
    addServiceRecord: "Add Service Record",
    editServiceRecord: "Edit Service Record",
    saveServiceRecord: "Save Service Record",
    serviceRecordSearchPlaceholder: "Technician, client, project, or description",
    allTechnicians: "All technicians",
    allProjects: "All projects",
    allStatuses: "All statuses",
    serviceRecordsCount: "records",
    noServiceRecords: "No service records.",
    noServiceRecordMatches: "No service records match the filters.",
    loadServiceRecordsError: "Service records could not be loaded.",
    loadServiceRecordLookupsError: "Form data could not be loaded.",
    createServiceRecordSuccess: "Service record created successfully.",
    updateServiceRecordSuccess: "Service record updated successfully.",
    cancelServiceRecordSuccess: "Service record canceled successfully.",
    serviceRecordTechnicianRequired: "Technician is required.",
    serviceRecordClientRequired: "Client is required.",
    serviceRecordProjectRequired: "Project is required.",
    serviceRecordDateRequired: "Service date is required.",
    serviceRecordDescriptionRequired: "Service description is required.",
    serviceRecordTimeError: "Time ranges require start and end values, and cannot be negative.",
    serviceRecordStatusInvalid: "The selected status is not valid.",
    serviceRecordNotFound: "The selected service record was not found.",
    cancelServiceRecordConfirm: "Are you sure you want to cancel this service record?",
    createServiceRecordError: "Could not create the service record.",
    updateServiceRecordError: "Could not update the service record.",
    cancelServiceRecordError: "Could not cancel the service record.",
    generateInvoice: "Generate Invoice",
    editInvoiceStatus: "Edit Invoice Status",
    saveInvoiceStatus: "Save Status",
    invoiceSearchPlaceholder: "Invoice, client, or notes",
    invoicesCount: "invoices",
    noInvoices: "No invoices.",
    noInvoiceMatches: "No invoices match the filters.",
    loadInvoicesError: "Invoices could not be loaded.",
    loadInvoiceClientsError: "Clients for invoices could not be loaded.",
    invoiceGeneratedSuccess: "Invoice generated successfully.",
    invoiceStatusUpdatedSuccess: "Invoice status updated successfully.",
    invoiceCanceledSuccess: "Invoice canceled successfully.",
    invoiceClientRequired: "Client is required.",
    invoicePeriodFromRequired: "From date is required.",
    invoicePeriodToRequired: "To date is required.",
    invoicePeriodInvalid: "From date cannot be after to date.",
    invoiceTaxRateInvalid: "The internal invoice setting must be a non-negative number.",
    invoiceStatusInvalid: "The selected status is not valid.",
    invoiceNotFound: "The selected invoice was not found.",
    cancelInvoiceConfirm: "Are you sure you want to cancel this invoice?",
    generateInvoiceError: "Could not generate the invoice.",
    updateInvoiceError: "Could not update the invoice.",
    cancelInvoiceError: "Could not cancel the invoice.",
    loadInvoiceDetailError: "Could not load invoice detail.",
    noInvoiceLines: "This invoice has no lines.",
    invoicesFoundation: "Invoice screens will use recorded service hours to generate invoice headers, line items, and document status.",
    settingsFoundation: "Settings will centralize account preferences, notifications, workflow defaults, and migration controls in a later phase.",
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
    pdfReady: "PDF generated successfully.",
    pdfNoData: "Generate a report with records before exporting PDF.",
    excelReady: "Excel generated successfully.",
    excelNoData: "Generate a report with records before exporting Excel.",
    excelError: "The report could not be exported to Excel.",
    exportError: "The report could not be exported.",
    invalidApiResponse: "The server returned HTML instead of JSON. Make sure the server was restarted and the API endpoint exists.",
    passwordResets: "Forgot Password Requests",
    passwordResetRequests: "requests",
    noPasswordResets: "No password recovery requests.",
    resolve: "Mark resolved",
    markResolved: "Mark as resolved",
    deleteNotification: "Delete",
    deleteNotificationConfirm: "Are you sure you want to delete this notification?",
    deleteNotificationSuccess: "Notification deleted successfully.",
    deleteNotificationError: "The notification could not be deleted.",
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
    noUserMatches: "No users match the search and selected status.",
    userSearchPlaceholder: "Name, email, or role",
    usersCount: "users",
    roleFilter: "Role",
    allRoles: "All roles",
    assignedProjects: "Assigned projects",
    assignedProjectsHelp: "Select one or more active projects.",
    assignedProjectCount: "projects",
    assignedProjectCountSingular: "project",
    assignedProjectManagers: "Assigned Project Managers",
    assignedProjectManagersHelp: "Select one or more active Project Managers.",
    selectedManagerSingular: "Project Manager assigned",
    selectedManagerPlural: "Project Managers assigned",
    managerSearchPlaceholder: "Name or email",
    noAssignableManagers: "No active Project Managers are available.",
    noManagerMatches: "No Project Managers match the search.",
    removeManagerAssignment: "Remove Project Manager",
    assignedAt: "Assigned at",
    assignedProjectsDetail: "Assigned projects",
    manageAssignments: "Manage assignments",
    userInformation: "User information",
    activeUser: "Active user",
    changeProjectManagerRoleConfirm: "This user has assigned projects. Changing the role will remove active assignments. Do you want to continue?",
    projectAssignmentsError: "Project assignments could not be loaded or saved.",
    projectAssignmentsLoading: "Loading assigned projects...",
    assignmentSearch: "Search Project Managers",
    assignmentSearchPlaceholder: "Client or project",
    selectVisibleProjects: "Select all visible projects",
    clearProjectSelection: "Clear selection",
    selectedProjectSingular: "project selected",
    selectedProjectPlural: "projects selected",
    noAssignableProjects: "No active projects are available.",
    noAssignmentMatches: "No projects match the search.",
    removeProjectAssignment: "Remove project",
    inactiveAssignmentsHelp: "Previously assigned inactive projects are kept for history, but they cannot be selected as new assignments.",
    clearAssignedProjectsConfirm: "Are you sure you want to clear the selected active assignments? Historical inactive assignments will be preserved.",
    unassigned: "Unassigned",
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
    completeTicketFields: "Complete the service description.",
    loginError: "Could not sign in.",
    sessionValidationError: "The session could not be verified. Please try again.",
    loadTicketsError: "Service records could not be loaded.",
    serverConnectionError: "Could not connect to the server.",
    createTicketError: "Could not create the record.",
    createTicketAlertError: "An error occurred while creating the record.",
    ticketNotFound: "The selected record was not found.",
    userNotFound: "The selected user was not found.",
    createUserError: "Could not create the user.",
    editUserError: "Could not edit the user.",
    deleteUserError: "Could not update the user status.",
    deleteUserConfirm: "Are you sure you want to change this user's status?",
    activateUser: "Activate",
    deactivateUser: "Deactivate",
    active: "Active",
    inactive: "Inactive",
    detail: "Detail",
    dashboardDetail: "Dashboard Detail",
    selectDashboardCard: "Select a dashboard card.",
    closeDashboardDetail: "Close dashboard detail",
    updateTicketError: "Could not edit the record.",
    updateTicketAlertError: "An error occurred while editing the record.",
    closeTicketError: "Could not close the record.",
    closeTicketAlertError: "An error occurred while closing the record.",
    deleteTicketError: "Could not delete the record.",
    deleteTicketAlertError: "An error occurred while deleting the record.",
    deleteTicketConfirm: "Are you sure you want to delete this record?",
    userNumber: "User",
    notificationTypes: {
      TICKET_CREATED: "Service record created",
      TICKET_CLOSED: "Service record closed",
      TICKET_DELETED: "Service record deleted",
      USER_CREATED: "User created",
      USER_UPDATED: "User updated",
      PASSWORD_RESET_REQUESTED: "Password recovery",
      REPORT_GENERATED: "Report generated",
      SERVICE_RECORDS_PROCESSED: "Processed records"
    },
    statuses: {
      Abierto: "Open",
      "En Progreso": "In Progress",
      Cerrado: "Closed"
    },
    serviceRecordStatuses: {
      Recorded: "Pending",
      Billed: "Processed",
      Canceled: "Canceled"
    },
    invoiceStatuses: {
      Draft: "Draft",
      Issued: "Issued",
      Paid: "Paid",
      Canceled: "Canceled"
    },
    contractStatuses: {
      OK: "OK",
      LOW_HOURS: "Low hours",
      NO_HOURS_REMAINING: "No hours remaining",
      EXPIRING_SOON: "Expiring soon",
      EXPIRED: "Expired",
      NO_CONTRACT: "No contract",
      WARNING: "Warning",
      CRITICAL: "Critical"
    },
    contractTypes: {
      Direct: "Direct",
      Signed: "Signed",
      Other: "Other",
      "": "No contract"
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

    console.info(`[auth] Initial session check returned ${response.status}.`);

    if (!response.ok) {
      const error = new Error(translateServerMessage(data.message) || t("sessionValidationError"));
      error.status = response.status;
      throw error;
    }

    if (data.user) {
      setAuthenticatedUser(data.user);
      await refreshWorkspace();
      return;
    }

    currentUser = null;
    showLogin();
  } catch (error) {
    console.error("[auth] Initial session validation failed.", error);
    if (error.status === 401) {
      currentUser = null;
      showLogin();
    }
    loginMessage.textContent = error.message || t("sessionValidationError");
  }
}

async function login(event) {
  event.preventDefault();
  loginMessage.textContent = "";
  clearTransientStorage();
  resetClientState({ render: false });
  currentUser = null;

  try {
    console.info("[auth] Sending login request.");
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
    console.info(`[auth] Login returned ${response.status}; user=${Boolean(data.user)}; role=${normalizeClientRole(data.user?.Role) || "none"}.`);

    if (!response.ok || !data.user) {
      throw new Error(translateServerMessage(data.message) || t("loginError"));
    }

    loginForm.reset();
    hidePasswordFields();
    setAuthenticatedUser(data.user);
    console.info("[auth] Session cookie accepted; loading authenticated workspace.");
    await refreshWorkspace();
  } catch (error) {
    console.error("[auth] Login or workspace initialization failed.", error);
    if (currentUser) {
      dashboardMessage.textContent = error.message || t("sessionValidationError");
      return;
    }
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
  currentUser = {
    ...user,
    Role: normalizeClientRole(user.Role)
  };
  sessionName.textContent = user.FullName;
  sessionRole.textContent = getRoleDisplayLabel(currentUser.Role);
  sessionBar.classList.remove("hidden");
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  notificationBell.classList.remove("hidden");
  setRoleControls();
  usersTabButton.classList.toggle("hidden", !isAdmin());
  settingsTabButton.classList.toggle("hidden", !isAdmin());
  manualInvoicesTabButton.classList.toggle("hidden", !isAdmin());
  reportsTabButton.classList.remove("hidden");
  if (switchToTickets || !canAccessTab(activeTab)) {
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
  settingsTabButton.classList.add("hidden");
  manualInvoicesTabButton.classList.add("hidden");
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
  closeProjectEditor();
  closeServiceRecordEditor();
  closeInvoiceGenerateEditor();
  closeInvoiceStatusEditor();
  closeInvoiceDetail();
  closeEditor();
  closeUserEditor();
  applyLanguage();
}

function isAdmin() {
  return currentUser?.Role === "Admin";
}

function isTechnician() {
  return currentUser?.Role === "Technician";
}

function isProjectManager() {
  return currentUser?.Role === "ProjectManager";
}

function normalizeClientRole(role) {
  return role === "Project Manager" ? "ProjectManager" : role;
}

function getRoleDisplayLabel(role) {
  return normalizeClientRole(role) === "ProjectManager" ? "Project Manager" : role;
}

function canAccessTab(tabName) {
  return !["users", "settings", "manual-invoices", "invoices"].includes(tabName) || isAdmin();
}

function canManageOwnServiceRecords() {
  return ["Technician", "User"].includes(currentUser?.Role);
}

function canCreateServiceRecords() {
  return isAdmin() || canManageOwnServiceRecords();
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
  if (!canAccessTab(tabName)) {
    tabName = "tickets";
  }

  if (tabName === "invoices" && !isAdmin()) {
    tabName = "dashboard";
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
  manualInvoicesTabPanel.classList.toggle("hidden", activeTab !== "manual-invoices");
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

  if (activeTab === "projects") {
    await loadProjectClients();
    await loadProjects();
  }

  if (activeTab === "tickets") {
    await loadServiceRecordLookups();
    await loadServiceRecords();
  }

  if (activeTab === "invoices") {
    await loadInvoiceClients();
    await loadInvoices();
  }

  if (activeTab === "notifications") {
    await loadNotifications();
  }

  if (activeTab === "dashboard") {
    await loadDashboardData();
  }

  if (activeTab === "reports") {
    await loadReportLookups();
    renderServiceHoursReport();
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
    assignableProjectManagers = users
      .filter((user) => normalizeClientRole(user.Role) === "ProjectManager" && isUserActive(user))
      .sort((first, second) => String(first.FullName || "").localeCompare(String(second.FullName || ""), undefined, { sensitivity: "base" }));
    renderProjectManagerAssignmentOptions(projectManagerAssignments);
    renderUsers();
    renderDashboard();
  } catch (error) {
    console.error(error);
    users = [];
    showUsersMessage(t("loadUsersError"));
    renderDashboard();
  }
}

function getProjectAssignmentPickerState(picker) {
  if (!picker) return null;

  if (!projectAssignmentPickerStates.has(picker)) {
    projectAssignmentPickerStates.set(picker, {
      search: "",
      selectedIds: new Set(),
      initialSelectedIds: new Set(),
      lockedIds: new Set(),
      status: "active"
    });
  }

  return projectAssignmentPickerStates.get(picker);
}

function getProjectManagerAssignmentLabel(user) {
  return [user.FullName, user.Email].filter(Boolean).join(" - ") || `#${user.UserID}`;
}

function getAssignableProjectLabel(project) {
  return [project.ClientName, project.ProjectName].filter(Boolean).join(" - ") || `#${project.ProjectID}`;
}

function isProjectActive(project) {
  return project?.IsActive === true || project?.IsActive === 1 || project?.IsActive === "1";
}

function normalizeAssignmentIds(ids) {
  if (Array.isArray(ids)) {
    return ids.map(Number).filter(Number.isInteger);
  }

  if (typeof ids === "string") {
    return ids.split(",").map((id) => Number(id.trim())).filter(Number.isInteger);
  }

  return [];
}

function escapeHTMLAttribute(value) {
  return escapeHTML(String(value ?? ""))
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderProjectManagerAssignmentOptions(picker, selectedUserIds) {
  const state = getProjectAssignmentPickerState(picker);
  if (!state) return;

  if (selectedUserIds !== undefined) {
    state.selectedIds = new Set(normalizeAssignmentIds(selectedUserIds));
  }

  const managerById = new Map(assignableProjectManagers.map((user) => [Number(user.UserID), user]));
  const searchKey = normalizeSearchKey(state.search);
  const visibleManagers = assignableProjectManagers.filter((user) => !searchKey
    || normalizeSearchKey(getProjectManagerAssignmentLabel(user)).includes(searchKey));
  const selectedManagers = Array.from(state.selectedIds)
    .map((userId) => managerById.get(Number(userId)))
    .filter(Boolean);
  const selectedCount = selectedManagers.length;
  const selectedLabel = selectedCount === 1 ? t("selectedManagerSingular") : t("selectedManagerPlural");
  const emptyMessage = assignableProjectManagers.length === 0 ? t("noAssignableManagers") : t("noManagerMatches");

  picker.innerHTML = `
    <div class="assignment-picker-summary">
      <div class="assignment-chips" aria-live="polite">
        ${selectedManagers.map((user) => `
          <span class="assignment-chip" title="${escapeHTMLAttribute(getProjectManagerAssignmentLabel(user))}">
            <span>${escapeHTML(getProjectManagerAssignmentLabel(user))}</span>
            <button type="button" data-assignment-action="remove" data-user-id="${user.UserID}" aria-label="${escapeHTMLAttribute(`${t("removeManagerAssignment")}: ${getProjectManagerAssignmentLabel(user)}`)}">&times;</button>
          </span>
        `).join("") || `<span class="assignment-empty-selection">${escapeHTML(t("unassigned"))}</span>`}
      </div>
      <strong class="assignment-count">${formatNumber(selectedCount, 0)} ${escapeHTML(selectedLabel)}</strong>
    </div>
    <div class="assignment-picker-toolbar">
      <label class="assignment-search-field">
        <span>${escapeHTML(t("assignmentSearch"))}</span>
        <input type="search" data-assignment-search value="${escapeHTMLAttribute(state.search)}" placeholder="${escapeHTMLAttribute(t("managerSearchPlaceholder"))}">
      </label>
      <div class="assignment-picker-actions">
        <button type="button" class="btn session-button assignment-tool-button" data-assignment-action="clear" ${selectedCount === 0 ? "disabled" : ""}>${escapeHTML(t("clearProjectSelection"))}</button>
      </div>
    </div>
    <div class="assignment-project-list" role="group" aria-label="${escapeHTML(t("assignedProjectManagers"))}">
      ${visibleManagers.map((user) => {
        const userId = Number(user.UserID);
        const label = getProjectManagerAssignmentLabel(user);
        return `
          <label class="assignment-project-option">
            <input type="checkbox" value="${userId}" ${state.selectedIds.has(userId) ? "checked" : ""}>
            <span>${escapeHTML(label)}</span>
          </label>
        `;
      }).join("") || `<p class="assignment-list-empty">${escapeHTML(emptyMessage)}</p>`}
    </div>
  `;
}

function getSelectedProjectManagerUserIds(picker) {
  const state = getProjectAssignmentPickerState(picker);
  return state ? Array.from(state.selectedIds).sort((first, second) => first - second) : [];
}

function renderUserProjectAssignmentOptions(picker, selectedProjectIds) {
  const state = getProjectAssignmentPickerState(picker);
  if (!state) return;

  if (selectedProjectIds !== undefined) {
    const normalizedSelectedIds = normalizeAssignmentIds(selectedProjectIds);
    state.selectedIds = new Set(normalizedSelectedIds);
    state.initialSelectedIds = new Set(normalizedSelectedIds);
  }

  const projectById = new Map(assignableProjects.map((project) => [Number(project.ProjectID), project]));
  state.lockedIds = new Set(Array.from(state.selectedIds).filter((projectId) => {
    const project = projectById.get(Number(projectId));
    return project && !isProjectActive(project);
  }));
  const searchKey = normalizeSearchKey(state.search);
  const selectedStatus = state.status || "active";
  const visibleProjects = assignableProjects.filter((project) => {
    const active = isProjectActive(project);
    const matchesStatus = selectedStatus === "all"
      || (selectedStatus === "active" && active)
      || (selectedStatus === "inactive" && !active);
    const matchesSearch = !searchKey || normalizeSearchKey(getAssignableProjectLabel(project)).includes(searchKey);
    return matchesStatus && matchesSearch;
  });
  const selectedProjects = Array.from(state.selectedIds)
    .map((projectId) => projectById.get(Number(projectId)))
    .filter(Boolean);
  const selectedCount = selectedProjects.length;
  const selectedActiveCount = selectedProjects.filter(isProjectActive).length;
  const selectedInactiveCount = selectedProjects.length - selectedActiveCount;
  const selectedLabel = selectedCount === 1 ? t("selectedProjectSingular") : t("selectedProjectPlural");
  const emptyMessage = assignableProjects.length === 0 ? t("noAssignableProjects") : t("noAssignmentMatches");
  const visibleActiveProjects = visibleProjects.filter(isProjectActive);

  picker.innerHTML = `
    <div class="assignment-picker-summary">
      <div class="assignment-chips" aria-live="polite">
        ${selectedProjects.map((project) => {
          const label = getAssignableProjectLabel(project);
          const active = isProjectActive(project);
          return `
            <span class="assignment-chip ${active ? "" : "assignment-chip-inactive"}" title="${escapeHTMLAttribute(label)}">
              <span>${escapeHTML(label)}</span>
              <span class="badge ${active ? "user-status-active" : "user-status-inactive"}">${escapeHTML(active ? t("active") : t("inactive"))}</span>
              ${active ? `<button type="button" data-assignment-action="remove" data-project-id="${project.ProjectID}" aria-label="${escapeHTMLAttribute(`${t("removeProjectAssignment")}: ${label}`)}">&times;</button>` : ""}
            </span>
          `;
        }).join("") || `<span class="assignment-empty-selection">${escapeHTML(t("unassigned"))}</span>`}
      </div>
      <strong class="assignment-count">${formatNumber(selectedCount, 0)} ${escapeHTML(selectedLabel)} · ${formatNumber(selectedActiveCount, 0)} ${escapeHTML(t("activeOnly").toLowerCase())} · ${formatNumber(selectedInactiveCount, 0)} ${escapeHTML(t("inactiveOnly").toLowerCase())}</strong>
    </div>
    <div class="assignment-picker-toolbar">
      <label class="assignment-search-field">
        <span>${escapeHTML(t("assignmentSearchPlaceholder"))}</span>
        <input type="search" data-assignment-search value="${escapeHTMLAttribute(state.search)}" placeholder="${escapeHTMLAttribute(t("assignmentSearchPlaceholder"))}">
      </label>
      <label class="assignment-status-field">
        <span>${escapeHTML(t("status"))}</span>
        <select data-assignment-status>
          <option value="active" ${selectedStatus === "active" ? "selected" : ""}>${escapeHTML(t("activeOnly"))}</option>
          <option value="inactive" ${selectedStatus === "inactive" ? "selected" : ""}>${escapeHTML(t("inactiveOnly"))}</option>
          <option value="all" ${selectedStatus === "all" ? "selected" : ""}>${escapeHTML(t("allEntityStatuses"))}</option>
        </select>
      </label>
      <div class="assignment-picker-actions">
        <button type="button" class="btn session-button assignment-tool-button" data-assignment-action="select-visible" ${visibleActiveProjects.length === 0 ? "disabled" : ""}>${escapeHTML(t("selectVisibleProjects"))}</button>
        <button type="button" class="btn session-button assignment-tool-button" data-assignment-action="clear" ${selectedCount === 0 ? "disabled" : ""}>${escapeHTML(t("clearProjectSelection"))}</button>
      </div>
    </div>
    <p class="assignment-history-note">${escapeHTML(t("inactiveAssignmentsHelp"))}</p>
    <div class="assignment-project-list" role="group" aria-label="${escapeHTML(t("assignedProjects"))}">
      ${visibleProjects.map((project) => {
        const projectId = Number(project.ProjectID);
        const label = getAssignableProjectLabel(project);
        const active = isProjectActive(project);
        const selected = state.selectedIds.has(projectId);
        return `
          <label class="assignment-project-option ${active ? "" : "assignment-project-option-disabled"}">
            <input type="checkbox" value="${projectId}" ${selected ? "checked" : ""} ${active ? "" : "disabled"}>
            <span>${escapeHTML(label)}</span>
            <span class="badge ${active ? "user-status-active" : "user-status-inactive"}">${escapeHTML(active ? t("active") : t("inactive"))}</span>
          </label>
        `;
      }).join("") || `<p class="assignment-list-empty">${escapeHTML(emptyMessage)}</p>`}
    </div>
  `;
}

function getSelectedProjectIds(picker) {
  const state = getProjectAssignmentPickerState(picker);
  return state ? Array.from(state.selectedIds).sort((first, second) => first - second) : [];
}

function renderAssignmentPicker(picker) {
  if (!picker) return;
  if (picker.dataset.assignmentKind === "projects") {
    renderUserProjectAssignmentOptions(picker);
    return;
  }
  renderProjectManagerAssignmentOptions(picker);
}

function handleProjectAssignmentPickerInput(event) {
  const searchInput = event.target.closest("[data-assignment-search]");
  if (!searchInput) return;

  const picker = event.currentTarget;
  const state = getProjectAssignmentPickerState(picker);
  state.search = searchInput.value;
  renderAssignmentPicker(picker);
  picker.querySelector("[data-assignment-search]")?.focus();
}

function handleProjectAssignmentPickerChange(event) {
  const statusSelect = event.target.closest("[data-assignment-status]");
  if (statusSelect) {
    const picker = event.currentTarget;
    const state = getProjectAssignmentPickerState(picker);
    state.status = statusSelect.value || "active";
    renderAssignmentPicker(picker);
    return;
  }

  const checkbox = event.target.closest('.assignment-project-option input[type="checkbox"]');
  if (!checkbox) return;

  const picker = event.currentTarget;
  const state = getProjectAssignmentPickerState(picker);
  const selectedId = Number(checkbox.value);
  if (picker.dataset.assignmentKind === "projects") {
    const project = assignableProjects.find((item) => Number(item.ProjectID) === selectedId);
    if (project && !isProjectActive(project)) {
      renderAssignmentPicker(picker);
      return;
    }
  }

  if (checkbox.checked) state.selectedIds.add(selectedId);
  else state.selectedIds.delete(selectedId);
  renderAssignmentPicker(picker);
}

function handleProjectAssignmentPickerClick(event) {
  const button = event.target.closest("button[data-assignment-action]");
  if (!button) return;

  const picker = event.currentTarget;
  const state = getProjectAssignmentPickerState(picker);
  const action = button.dataset.assignmentAction;

  if (action === "remove") {
    state.selectedIds.delete(Number(button.dataset.userId || button.dataset.projectId));
  } else if (action === "select-visible" && picker.dataset.assignmentKind === "projects") {
    const searchKey = normalizeSearchKey(state.search);
    const selectedStatus = state.status || "active";
    assignableProjects
      .filter((project) => {
        const active = isProjectActive(project);
        const matchesStatus = selectedStatus === "all"
          || (selectedStatus === "active" && active)
          || (selectedStatus === "inactive" && !active);
        const matchesSearch = !searchKey || normalizeSearchKey(getAssignableProjectLabel(project)).includes(searchKey);
        return active && matchesStatus && matchesSearch;
      })
      .forEach((project) => state.selectedIds.add(Number(project.ProjectID)));
  } else if (action === "clear") {
    if (picker.dataset.assignmentKind === "projects" && state.initialSelectedIds?.size > 0 && !confirm(t("clearAssignedProjectsConfirm"))) {
      return;
    }

    if (picker.dataset.assignmentKind === "projects") {
      state.selectedIds = new Set(state.lockedIds || []);
    } else {
      state.selectedIds.clear();
    }
  }

  renderAssignmentPicker(picker);
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
  const params = new URLSearchParams();
  const search = clientSearchInput.value.trim();

  if (search) params.set("search", search);
  params.set("status", clientStatusFilter?.value || "all");

  try {
    const response = await fetch(`/api/clients?${params.toString()}`, {
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
  const selectedStatus = clientStatusFilter?.value || "all";
  const countLabel = selectedStatus === "active"
    ? t("activeCount")
    : selectedStatus === "inactive"
      ? t("inactiveCount")
      : t("clientsCount");
  clientsTotalCount.textContent = formatNumber(clients.length, 0);
  clientsTotalCount.parentElement.lastChild.textContent = ` ${countLabel}`;
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
        <td><span class="badge ${client.IsActive ? "user-status-active" : "user-status-inactive"}">${client.IsActive ? t("active") : t("inactive")}</span></td>
      <td class="client-admin-actions ${canManageClients ? "" : "hidden"}">
        ${canManageClients ? `
          <div class="actions">
            <button type="button" class="action-btn edit-btn" data-client-action="edit" data-id="${client.ClientID}">${t("edit")}</button>
            <button type="button" class="action-btn ${client.IsActive ? "delete-btn" : "close-btn"}" data-client-action="toggle-status" data-next-active="${client.IsActive ? "false" : "true"}" data-id="${client.ClientID}">${client.IsActive ? t("deactivateClient") : t("activateClient")}</button>
          </div>
        ` : ""}
      </td>
    </tr>
  `).join("");
}

function showClientsTableMessage(message) {
  clientsTotalCount.textContent = formatNumber(clients.length, 0);
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
  clientIsActive.disabled = true;

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

  if (action === "toggle-status") {
    toggleClientStatus(id, button.dataset.nextActive === "true");
  }
}

async function toggleClientStatus(id, nextIsActive) {
  if (!isAdmin()) return;

  const confirmed = confirm(t(nextIsActive ? "activateClientConfirm" : "deactivateClientConfirm"));

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/clients/${id}/status`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ IsActive: nextIsActive })
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("clientStatusError"));
    }

    showClientsMessage(t(nextIsActive ? "activateClientSuccess" : "deactivateClientSuccess"), "success");
    await loadClients();
  } catch (error) {
    console.error(error);
    showClientsMessage(error.message || t("clientStatusError"), "error");
  }
}

async function loadProjectClients() {
  try {
    const response = await fetch("/api/clients", {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loadProjectClientsError"));
    }

    projectClients = data;
    renderProjectClientOptions();
  } catch (error) {
    console.error(error);
    projectClients = [];
    renderProjectClientOptions();
    showProjectsMessage(error.message || t("loadProjectClientsError"), "error");
  }
}

async function loadProjects() {
  const params = new URLSearchParams();
  const search = projectSearchInput.value.trim();
  const selectedClientId = projectClientFilter.value;

  if (search) params.set("search", search);
  if (selectedClientId) params.set("clientId", selectedClientId);
  params.set("status", projectStatusFilter?.value || "all");

  try {
    const response = await fetch(`/api/projects${params.toString() ? `?${params.toString()}` : ""}`, {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (response.status === 401) {
      currentUser = null;
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loadProjectsError"));
    }

    projects = data;
    renderProjects();
  } catch (error) {
    console.error(error);
    projects = [];
    renderProjects();
    showProjectsMessage(error.message || t("loadProjectsError"), "error");
  }
}

async function loadAssignableProjects() {
  try {
    const response = await fetch("/api/projects?status=all", {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loadProjectsError"));
    }

    assignableProjects = data
      .sort((first, second) => {
        const firstLabel = getAssignableProjectLabel(first);
        const secondLabel = getAssignableProjectLabel(second);
        return firstLabel.localeCompare(secondLabel, undefined, { sensitivity: "base" });
      });
    renderUserProjectAssignmentOptions(userProjectAssignments);
    renderUserProjectAssignmentOptions(editUserProjectAssignments);
  } catch (error) {
    console.error(error);
    assignableProjects = [];
    renderUserProjectAssignmentOptions(userProjectAssignments);
    renderUserProjectAssignmentOptions(editUserProjectAssignments);
  }
}

function renderProjectClientOptions() {
  if (!projectClientFilter || !projectClientId) return;

  const options = projectClients.map((client) => `
    <option value="${client.ClientID}">${escapeHTML(client.ClientName || "")}</option>
  `).join("");

  projectClientFilter.innerHTML = `<option value="">${escapeHTML(t("allClients"))}</option>${options}`;
  projectClientId.innerHTML = `<option value="">${escapeHTML(t("selectClient"))}</option>${options}`;
}

function formatProjectHours(value) {
  return value === null || value === undefined || value === "" ? "-" : formatNumber(value);
}

function getContractAlertClass(status) {
  if (status === "OK") return "contract-ok";
  if (status === "LOW_HOURS" || status === "WARNING") return "contract-low";
  if (status === "EXPIRING_SOON") return "contract-warning";
  if (status === "NO_HOURS_REMAINING" || status === "EXPIRED" || status === "CRITICAL") return "contract-danger";
  return "contract-neutral";
}

function renderContractBadge(status) {
  const value = status || "NO_CONTRACT";

  return `<span class="badge ${getContractAlertClass(value)}">${escapeHTML(translateContractStatus(value))}</span>`;
}

function renderProjectManagers(project) {
  const managerNames = String(project.ProjectManagerNames || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const totalManagers = Math.max(Number(project.ProjectManagerCount || 0), managerNames.length);

  if (totalManagers === 0 || managerNames.length === 0) {
    return `<span class="project-manager-unassigned">${escapeHTML(t("unassigned"))}</span>`;
  }

  const summary = totalManagers > 1 ? `${managerNames[0]} +${totalManagers - 1}` : managerNames[0];
  return `<button type="button" class="project-manager-summary" data-project-manager-action="view" data-project-id="${project.ProjectID}" title="${escapeHTMLAttribute(managerNames.join(", "))}">${escapeHTML(summary)}</button>`;
}

function renderProjects() {
  if (!projectsTableBody) return;

  const canManageProjects = isAdmin();
  const selectedStatus = projectStatusFilter?.value || "all";
  const countLabel = selectedStatus === "active"
    ? t("activeCount")
    : selectedStatus === "inactive"
      ? t("inactiveCount")
      : t("projectsCount");
  projectsTotalCount.textContent = formatNumber(projects.length, 0);
  projectsTotalCount.parentElement.lastChild.textContent = ` ${countLabel}`;
  addProjectButton.classList.toggle("hidden", !canManageProjects);

  if (projects.length === 0) {
    const hasFilters = projectSearchInput.value.trim() || projectClientFilter.value || projectStatusFilter?.value !== "all";
    showProjectsTableMessage(hasFilters ? t("noProjectMatches") : t("noProjects"));
    return;
  }

  projectsTableBody.innerHTML = projects.map((project) => `
    <tr>
      <td>${escapeHTML(project.ProjectName || "")}</td>
      <td>${escapeHTML(project.ClientName || "")}</td>
      <td class="ticket-description">${escapeHTML(project.Description || "")}</td>
      <td>${escapeHTML(project.ContractNumber || "-")}</td>
      <td>${formatProjectHours(project.ContractedHours)}</td>
      <td>${formatProjectHours(project.UsedHours)}</td>
      <td>${formatProjectHours(project.RemainingHours)}</td>
      <td>${escapeHTML(formatDateOnly(project.ContractEndDate) || "-")}</td>
      <td>${renderContractBadge(project.ContractStatus)}</td>
      <td>${renderProjectManagers(project)}</td>
      <td><span class="badge ${project.IsActive ? "user-status-active" : "user-status-inactive"}">${project.IsActive ? t("active") : t("inactive")}</span></td>
      <td class="project-admin-actions ${canManageProjects ? "" : "hidden"}">
        ${canManageProjects ? `
          <div class="actions">
            <button type="button" class="action-btn edit-btn" data-project-action="edit" data-id="${project.ProjectID}">${t("edit")}</button>
            <button type="button" class="action-btn ${project.IsActive ? "delete-btn" : "close-btn"}" data-project-action="toggle-status" data-next-active="${project.IsActive ? "false" : "true"}" data-id="${project.ProjectID}">${project.IsActive ? t("deactivateProject") : t("activateProject")}</button>
          </div>
        ` : ""}
      </td>
    </tr>
  `).join("");
}

function showProjectsTableMessage(message) {
  projectsTotalCount.textContent = formatNumber(projects.length, 0);
  projectsTableBody.innerHTML = `
    <tr>
      <td colspan="12" class="empty-state">${escapeHTML(message)}</td>
    </tr>
  `;
}

function showProjectsMessage(message, type = "info") {
  projectsMessage.textContent = message;
  projectsMessage.classList.toggle("success", type === "success");
}

function getProjectPayloadFromForm() {
  return {
    ClientID: Number(projectClientId.value),
    ProjectName: projectName.value.trim(),
    Description: projectDescription.value.trim(),
    HourlyRate: projectHourlyRate.value === "" ? 0 : Number(projectHourlyRate.value),
    ContractNumber: projectContractNumber.value.trim(),
    ContractType: projectContractType.value,
    SignedBy: projectSignedBy.value.trim(),
    ContractStartDate: projectContractStartDate.value,
    ContractEndDate: projectContractEndDate.value,
    ContractedHours: projectContractedHours.value === "" ? null : Number(projectContractedHours.value),
    LowHoursThreshold: projectLowHoursThreshold.value === "" ? null : Number(projectLowHoursThreshold.value),
    ExpirationAlertDays: projectExpirationAlertDays.value === "" ? null : Number(projectExpirationAlertDays.value),
    projectManagerUserIds: getSelectedProjectManagerUserIds(projectManagerAssignments),
    IsActive: projectIsActive.checked
  };
}

function setProjectContractFieldsDisabled(disabled) {
  [
    projectContractNumber,
    projectContractType,
    projectSignedBy,
    projectContractStartDate,
    projectContractEndDate,
    projectContractedHours,
    projectLowHoursThreshold,
    projectExpirationAlertDays
  ].forEach((field) => {
    field.disabled = disabled;
  });
}

function projectHasContractData(project = {}) {
  return Boolean(
    project.ContractNumber
    || project.ContractType
    || project.SignedBy
    || project.ContractStartDate
    || project.ContractEndDate
    || (project.ContractedHours !== null && project.ContractedHours !== undefined && project.ContractedHours !== "")
  );
}

function renderProjectContractStatus(project = {}, showSummary = false) {
  projectContractSummary.classList.toggle("hidden", !showSummary);
  if (!showSummary) return;

  const hasContract = projectHasContractData(project) && project.ContractStatus !== "NO_CONTRACT";
  projectNoContractDisplay.classList.toggle("hidden", hasContract);
  projectContractStatusGrid.classList.toggle("hidden", !hasContract);

  if (!hasContract) {
    projectNoContractDisplay.innerHTML = renderContractBadge("NO_CONTRACT");
    return;
  }

  projectUsedHoursDisplay.textContent = formatProjectHours(project.UsedHours);
  projectRemainingHoursDisplay.textContent = formatProjectHours(project.RemainingHours);
  projectHoursAlertStatusDisplay.innerHTML = renderContractBadge(project.HoursAlertStatus);
  projectContractStatusDisplay.innerHTML = renderContractBadge(project.ContractStatus);
  projectContractEndDateDisplay.textContent = formatDateOnly(project.ContractEndDate) || "-";
}

function renderProjectCurrentStatusBadge(selectedProject = null) {
  if (!projectCurrentStatusBadge) return;

  const isEditing = Boolean(selectedProject);
  const isActive = selectedProject?.IsActive !== false && Number(selectedProject?.IsActive) !== 0;
  projectCurrentStatusBadge.classList.toggle("hidden", !isEditing || isActive);

  if (!isEditing || isActive) {
    projectCurrentStatusBadge.innerHTML = "";
    return;
  }

  projectCurrentStatusBadge.innerHTML = `
    <span class="badge user-status-inactive">${escapeHTML(t("inactive"))}</span>
    <span>${escapeHTML(currentLanguage === "es"
      ? "Este proyecto esta inactivo. Puedes editarlo sin reactivarlo."
      : "This project is inactive. You can edit it without reactivating it.")}</span>
  `;
}

async function openProjectEditor(mode, selectedProject = null) {
  if (projectClients.length === 0) {
    await loadProjectClients();
  }
  if (isAdmin() && users.length === 0) {
    await loadUsers();
  }

  projectForm.reset();
  projectFormMessage.textContent = "";
  projectId.value = selectedProject?.ProjectID || "";
  projectModalTitle.textContent = mode === "edit" ? t("editProject") : t("addProject");
  projectIsActive.checked = selectedProject?.IsActive ?? true;
  projectIsActive.disabled = true;
  projectHourlyRate.value = "0";
  setProjectContractFieldsDisabled(!isAdmin());
  renderProjectContractStatus(selectedProject || {}, Boolean(selectedProject));
  renderProjectCurrentStatusBadge(selectedProject);
  projectManagerAssignmentsSection.classList.toggle("hidden", !isAdmin());
  renderProjectManagerAssignmentOptions(
    projectManagerAssignments,
    selectedProject?.ProjectManagerUserIDs || []
  );

  if (selectedProject) {
    const hasSelectedClient = Array.from(projectClientId.options).some((option) => Number(option.value) === Number(selectedProject.ClientID));

    if (!hasSelectedClient) {
      const option = document.createElement("option");
      option.value = String(selectedProject.ClientID);
      option.textContent = `${selectedProject.ClientName || t("clients")} (${t("inactive")})`;
      projectClientId.append(option);
    }

    projectClientId.value = selectedProject.ClientID || "";
    projectName.value = selectedProject.ProjectName || "";
    projectDescription.value = selectedProject.Description || "";
    projectHourlyRate.value = selectedProject.HourlyRate ?? "";
    projectContractNumber.value = selectedProject.ContractNumber || "";
    projectContractType.value = selectedProject.ContractType || "";
    projectSignedBy.value = selectedProject.SignedBy || "";
    projectContractStartDate.value = formatDateOnly(selectedProject.ContractStartDate) || "";
    projectContractEndDate.value = formatDateOnly(selectedProject.ContractEndDate) || "";
    projectContractedHours.value = selectedProject.ContractedHours ?? "";
    projectLowHoursThreshold.value = selectedProject.LowHoursThreshold ?? "";
    projectExpirationAlertDays.value = selectedProject.ExpirationAlertDays ?? "";
  }

  projectModal.classList.remove("hidden");
  projectClientId.focus();
}

function closeProjectEditor() {
  if (!projectModal) return;
  projectModal.classList.add("hidden");
  projectForm.reset();
  projectFormMessage.textContent = "";
  projectId.value = "";
  projectContractSummary.classList.add("hidden");
  renderProjectCurrentStatusBadge(null);
  renderProjectManagerAssignmentOptions(projectManagerAssignments, []);
}

async function saveProject(event) {
  event.preventDefault();
  projectFormMessage.textContent = "";

  if (!isAdmin()) {
    projectFormMessage.textContent = t("usersAdminOnly");
    return;
  }

  const payload = getProjectPayloadFromForm();

  if (!Number.isInteger(payload.ClientID) || payload.ClientID <= 0) {
    projectFormMessage.textContent = t("projectClientRequired");
    projectClientId.focus();
    return;
  }

  if (!payload.ProjectName) {
    projectFormMessage.textContent = t("projectNameRequired");
    projectName.focus();
    return;
  }

  if (!Number.isFinite(payload.HourlyRate)) {
    projectFormMessage.textContent = t("projectRateRequired");
    projectHourlyRate.focus();
    return;
  }

  if (payload.HourlyRate < 0) {
    projectFormMessage.textContent = t("projectRateNegative");
    projectHourlyRate.focus();
    return;
  }

  if (payload.ContractedHours !== null && (!Number.isFinite(payload.ContractedHours) || payload.ContractedHours < 0)) {
    projectFormMessage.textContent = currentLanguage === "es" ? "ContractedHours no puede ser negativo." : "ContractedHours cannot be negative.";
    projectContractedHours.focus();
    return;
  }

  if (payload.LowHoursThreshold !== null && (!Number.isFinite(payload.LowHoursThreshold) || payload.LowHoursThreshold < 0)) {
    projectFormMessage.textContent = currentLanguage === "es" ? "LowHoursThreshold no puede ser negativo." : "LowHoursThreshold cannot be negative.";
    projectLowHoursThreshold.focus();
    return;
  }

  if (payload.ExpirationAlertDays !== null && (!Number.isInteger(payload.ExpirationAlertDays) || payload.ExpirationAlertDays < 0)) {
    projectFormMessage.textContent = currentLanguage === "es" ? "ExpirationAlertDays no puede ser negativo." : "ExpirationAlertDays cannot be negative.";
    projectExpirationAlertDays.focus();
    return;
  }

  if (payload.ContractStartDate && payload.ContractEndDate && payload.ContractStartDate > payload.ContractEndDate) {
    projectFormMessage.textContent = currentLanguage === "es" ? "ContractStartDate no puede ser mayor que ContractEndDate." : "ContractStartDate cannot be after ContractEndDate.";
    projectContractStartDate.focus();
    return;
  }

  const id = Number(projectId.value);
  const isEditing = Number.isInteger(id) && id > 0;

  try {
    const response = await fetch(isEditing ? `/api/projects/${id}` : "/api/projects", {
      method: isEditing ? "PUT" : "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || (isEditing ? t("updateProjectError") : t("createProjectError")));
    }

    closeProjectEditor();
    showProjectsMessage(isEditing ? t("updateProjectSuccess") : t("createProjectSuccess"), "success");
    await Promise.all([
      loadProjects(),
      isAdmin() ? loadAssignableProjects() : Promise.resolve(),
      isAdmin() ? loadUsers() : Promise.resolve()
    ]);
  } catch (error) {
    console.error(error);
    projectFormMessage.textContent = error.message || (isEditing ? t("updateProjectError") : t("createProjectError"));
  }
}

function handleProjectsTableClick(event) {
  const managerButton = event.target.closest("button[data-project-manager-action='view']");
  if (managerButton) {
    openProjectManagersDetail(Number(managerButton.dataset.projectId));
    return;
  }

  const button = event.target.closest("button[data-project-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.projectAction;

  if (action === "edit") {
    const selectedProject = projects.find((project) => Number(project.ProjectID) === id);

    if (!selectedProject) {
      alert(t("projectNotFound"));
      return;
    }

    openProjectEditor("edit", selectedProject);
  }

  if (action === "toggle-status") {
    toggleProjectStatus(id, button.dataset.nextActive === "true");
  }
}

function getProjectManagerNames(project) {
  return String(project?.ProjectManagerNames || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

function openProjectManagersDetail(projectIdValue) {
  const selectedProject = projects.find((project) => Number(project.ProjectID) === Number(projectIdValue));

  if (!selectedProject || !projectManagersDetailModal) {
    return;
  }

  const managerNames = getProjectManagerNames(selectedProject);
  projectManagersDetailModal.dataset.projectId = String(selectedProject.ProjectID);
  projectManagersDetailTitle.textContent = t("assignedProjectManagers");
  projectManagersDetailProject.textContent = `${selectedProject.ProjectName || t("projects")} - ${selectedProject.ClientName || t("clients")}`;
  projectManagersDetailList.innerHTML = managerNames.length
    ? managerNames.map((name) => `
      <li>
        <span class="project-manager-check" aria-hidden="true">✓</span>
        <span>${escapeHTML(name)}</span>
      </li>
    `).join("")
    : `<li class="project-manager-empty">${escapeHTML(t("unassigned"))}</li>`;
  manageProjectManagersButton?.classList.toggle("hidden", !isAdmin());
  projectManagersDetailModal.classList.remove("hidden");
}

function closeProjectManagersDetail() {
  if (!projectManagersDetailModal) return;
  projectManagersDetailModal.classList.add("hidden");
  projectManagersDetailModal.dataset.projectId = "";
  projectManagersDetailList.innerHTML = "";
}

async function manageProjectManagersFromDetail() {
  const projectIdValue = Number(projectManagersDetailModal?.dataset.projectId);
  const selectedProject = projects.find((project) => Number(project.ProjectID) === projectIdValue);

  if (!selectedProject || !isAdmin()) return;

  closeProjectManagersDetail();
  await openProjectEditor("edit", selectedProject);
  projectManagerAssignmentsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function toggleProjectStatus(id, nextIsActive) {
  if (!isAdmin()) return;

  const confirmed = confirm(t(nextIsActive ? "activateProjectConfirm" : "deactivateProjectConfirm"));

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/projects/${id}/status`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ IsActive: nextIsActive })
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("projectStatusError"));
    }

    showProjectsMessage(t(nextIsActive ? "activateProjectSuccess" : "deactivateProjectSuccess"), "success");
    await Promise.all([
      loadProjects(),
      loadAssignableProjects(),
      loadUsers()
    ]);
  } catch (error) {
    console.error(error);
    showProjectsMessage(error.message || t("projectStatusError"), "error");
  }
}

async function loadServiceRecordLookups() {
  try {
    const [clientsResponse, projectsResponse] = await Promise.all([
      fetch("/api/clients", { cache: "no-store" }),
      fetch("/api/projects", { cache: "no-store" })
    ]);
    const clientsData = await parseJsonResponse(clientsResponse);
    const projectsData = await parseJsonResponse(projectsResponse);

    if (clientsResponse.status === 401 || projectsResponse.status === 401) {
      currentUser = null;
      showLogin();
      return;
    }

    if (!clientsResponse.ok) {
      throw new Error(translateServerMessage(clientsData.message) || t("loadClientsError"));
    }

    if (!projectsResponse.ok) {
      throw new Error(translateServerMessage(projectsData.message) || t("loadProjectsError"));
    }

    serviceRecordClients = clientsData.filter((client) => client.IsActive !== false);
    serviceRecordProjects = projectsData.filter((project) => project.IsActive !== false);

    if (isAdmin()) {
      if (users.length === 0) {
        await loadUsers();
      }

      serviceRecordTechnicians = users.filter((user) => user.IsActive !== false && (user.Role === "Technician" || user.Role === "User"));
    } else if (isProjectManager()) {
      const techniciansResponse = await fetch("/api/reports/service-hours/technicians", { cache: "no-store" });
      const techniciansData = await parseJsonResponse(techniciansResponse);

      if (!techniciansResponse.ok) {
        throw new Error(translateServerMessage(techniciansData.message) || t("loadServiceRecordLookupsError"));
      }

      serviceRecordTechnicians = techniciansData;
    } else {
      serviceRecordTechnicians = currentUser ? [currentUser] : [];
    }

    renderServiceRecordOptions();
  } catch (error) {
    console.error(error);
    serviceRecordClients = [];
    serviceRecordProjects = [];
    serviceRecordTechnicians = currentUser ? [currentUser] : [];
    showServiceRecordsMessage(error.message || t("loadServiceRecordLookupsError"), "error");
    renderServiceRecordOptions();
  }
}

function renderServiceRecordOptions() {
  if (!serviceRecordClientFilter || !serviceRecordProjectFilter) return;

  const technicianFilterValue = serviceRecordTechnicianFilter.value;
  const clientFilterValue = serviceRecordClientFilter.value;
  const projectFilterValue = serviceRecordProjectFilter.value;
  const modalTechnicianValue = serviceRecordTechnicianId.value;
  const modalClientValue = serviceRecordClientId.value;
  const modalProjectValue = serviceRecordProjectId.value;

  serviceRecordTechnicianFilter.innerHTML = `
    <option value="">${t("allTechnicians")}</option>
    ${serviceRecordTechnicians.map((user) => `
      <option value="${user.UserID}">${escapeHTML(user.FullName || user.Email || `#${user.UserID}`)}</option>
    `).join("")}
  `;
  const canFilterTechnicians = isAdmin() || isProjectManager();
  serviceRecordTechnicianFilter.value = !canFilterTechnicians && currentUser ? String(currentUser.UserID) : technicianFilterValue;
  serviceRecordTechnicianFilter.disabled = !canFilterTechnicians;

  serviceRecordClientFilter.innerHTML = `
    <option value="">${t("allClients")}</option>
    ${serviceRecordClients.map((client) => `
      <option value="${client.ClientID}">${escapeHTML(client.ClientName || `#${client.ClientID}`)}</option>
    `).join("")}
  `;
  serviceRecordClientFilter.value = clientFilterValue;

  const visibleFilterProjects = clientFilterValue
    ? serviceRecordProjects.filter((project) => Number(project.ClientID) === Number(clientFilterValue))
    : serviceRecordProjects;
  serviceRecordProjectFilter.innerHTML = `
    <option value="">${t("allProjects")}</option>
    ${visibleFilterProjects.map((project) => `
      <option value="${project.ProjectID}">${escapeHTML(project.ProjectName || `#${project.ProjectID}`)}</option>
    `).join("")}
  `;
  serviceRecordProjectFilter.value = visibleFilterProjects.some((project) => String(project.ProjectID) === projectFilterValue)
    ? projectFilterValue
    : "";

  serviceRecordTechnicianId.innerHTML = `
    <option value="">${t("allTechnicians")}</option>
    ${serviceRecordTechnicians.map((user) => `
      <option value="${user.UserID}">${escapeHTML(user.FullName || user.Email || `#${user.UserID}`)}</option>
    `).join("")}
  `;
  serviceRecordTechnicianId.value = modalTechnicianValue || (!isAdmin() && currentUser ? String(currentUser.UserID) : "");

  serviceRecordClientId.innerHTML = `
    <option value="">${t("allClients")}</option>
    ${serviceRecordClients.map((client) => `
      <option value="${client.ClientID}">${escapeHTML(client.ClientName || `#${client.ClientID}`)}</option>
    `).join("")}
  `;
  serviceRecordClientId.value = modalClientValue;

  const visibleModalProjects = modalClientValue
    ? serviceRecordProjects.filter((project) => Number(project.ClientID) === Number(modalClientValue))
    : serviceRecordProjects;
  serviceRecordProjectId.innerHTML = `
    <option value="">${t("allProjects")}</option>
    ${visibleModalProjects.map((project) => `
      <option value="${project.ProjectID}">${escapeHTML(project.ProjectName || `#${project.ProjectID}`)}</option>
    `).join("")}
  `;
  serviceRecordProjectId.value = visibleModalProjects.some((project) => String(project.ProjectID) === modalProjectValue)
    ? modalProjectValue
    : "";

  applySelectTranslations();
}

async function loadServiceRecords() {
  const params = new URLSearchParams();
  const search = serviceRecordSearchInput.value.trim();

  if (search) params.set("search", search);
  if (serviceRecordTechnicianFilter.value) params.set("technicianUserId", serviceRecordTechnicianFilter.value);
  if (serviceRecordClientFilter.value) params.set("clientId", serviceRecordClientFilter.value);
  if (serviceRecordProjectFilter.value) params.set("projectId", serviceRecordProjectFilter.value);
  if (serviceRecordDateFilter.value) params.set("serviceDate", serviceRecordDateFilter.value);
  if (serviceRecordStatusFilter.value) params.set("status", serviceRecordStatusFilter.value);

  try {
    const response = await fetch(`/api/service-records?${params.toString()}`, {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (response.status === 401) {
      currentUser = null;
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loadServiceRecordsError"));
    }

    serviceRecords = data;
    renderServiceRecords();
  } catch (error) {
    console.error(error);
    serviceRecords = [];
    showServiceRecordsTableMessage(t("loadServiceRecordsError"));
    showServiceRecordsMessage(error.message || t("loadServiceRecordsError"), "error");
  }
}

function renderServiceRecords() {
  if (!serviceRecordsTableBody) return;

  serviceRecordsTotalCount.textContent = formatNumber(serviceRecords.length, 0);
  serviceRecordsTotalCount.parentElement.lastChild.textContent = ` ${t("serviceRecordsCount")}`;
  addServiceRecordButton.classList.toggle("hidden", !canCreateServiceRecords());

  if (serviceRecords.length === 0) {
    const hasFilters = serviceRecordSearchInput.value.trim()
      || serviceRecordTechnicianFilter.value
      || serviceRecordClientFilter.value
      || serviceRecordProjectFilter.value
      || serviceRecordDateFilter.value
      || serviceRecordStatusFilter.value;
    showServiceRecordsTableMessage(hasFilters ? t("noServiceRecordMatches") : t("noServiceRecords"));
    return;
  }

  serviceRecordsTableBody.innerHTML = serviceRecords.map((record) => {
    const canEdit = isAdmin() || (canManageOwnServiceRecords() && Number(record.TechnicianUserID) === Number(currentUser?.UserID));
    const canCancel = isAdmin() && record.Status !== "Canceled";

    return `
      <tr>
        <td>${escapeHTML(record.TechnicianName || "")}</td>
        <td>${escapeHTML(record.ClientName || "")}</td>
        <td>${escapeHTML(record.ProjectName || "")}</td>
        <td>${escapeHTML(formatDateOnly(record.ServiceDate))}</td>
        <td>${escapeHTML(formatServiceRecordTime(record.MorningStart))}</td>
        <td>${escapeHTML(formatServiceRecordTime(record.MorningEnd))}</td>
        <td>${escapeHTML(formatServiceRecordTime(record.AfternoonStart))}</td>
        <td>${escapeHTML(formatServiceRecordTime(record.AfternoonEnd))}</td>
        <td>${formatNumber(record.TotalHours)}</td>
        <td class="ticket-description">${escapeHTML(cleanDisplayText(record.ServiceDescription))}</td>
        <td><span class="badge ${getServiceRecordStatusClass(record.Status)}">${escapeHTML(translateServiceRecordStatus(record.Status))}</span></td>
        <td>
          ${canEdit ? `
            <div class="actions">
              <button type="button" class="action-btn edit-btn" data-service-record-action="edit" data-id="${record.ServiceRecordID}">${t("edit")}</button>
              ${canCancel ? `<button type="button" class="action-btn delete-btn" data-service-record-action="cancel" data-id="${record.ServiceRecordID}">${currentLanguage === "es" ? "Cancelar" : "Cancel"}</button>` : ""}
            </div>
          ` : `<span class="read-only-note">${t("readOnly")}</span>`}
        </td>
      </tr>
    `;
  }).join("");
}

function showServiceRecordsTableMessage(message) {
  serviceRecordsTotalCount.textContent = formatNumber(serviceRecords.length, 0);
  serviceRecordsTableBody.innerHTML = `
    <tr>
      <td colspan="12" class="empty-state">${escapeHTML(message)}</td>
    </tr>
  `;
}

function showServiceRecordsMessage(message, type = "info") {
  serviceRecordsMessage.textContent = message;
  serviceRecordsMessage.classList.toggle("success", type === "success");
}

function getServiceRecordPayloadFromForm() {
  return {
    TechnicianUserID: Number(serviceRecordTechnicianId.value),
    ClientID: Number(serviceRecordClientId.value),
    ProjectID: Number(serviceRecordProjectId.value),
    ServiceDate: serviceRecordDate.value,
    MorningStart: morningStart.value || null,
    MorningEnd: morningEnd.value || null,
    AfternoonStart: afternoonStart.value || null,
    AfternoonEnd: afternoonEnd.value || null,
    ServiceDescription: serviceDescription.value.trim(),
    Status: isAdmin() ? serviceRecordStatus.value : (serviceRecordStatus.value || "Recorded")
  };
}

async function openServiceRecordEditor(mode, selectedRecord = null) {
  if (serviceRecordClients.length === 0 || serviceRecordProjects.length === 0 || serviceRecordTechnicians.length === 0) {
    await loadServiceRecordLookups();
  }

  serviceRecordForm.reset();
  serviceRecordFormMessage.textContent = "";
  serviceRecordId.value = selectedRecord?.ServiceRecordID || "";
  serviceRecordModalTitle.textContent = mode === "edit" ? t("editServiceRecord") : t("addServiceRecord");
  serviceRecordStatus.value = selectedRecord?.Status || "Recorded";
  serviceRecordStatus.disabled = !isAdmin();
  serviceRecordTechnicianId.disabled = !isAdmin();

  if (selectedRecord) {
    serviceRecordTechnicianId.value = selectedRecord.TechnicianUserID || "";
    serviceRecordDate.value = formatDateOnly(selectedRecord.ServiceDate);
    serviceRecordClientId.value = selectedRecord.ClientID || "";
    serviceRecordProjectId.value = selectedRecord.ProjectID || "";
    morningStart.value = normalizeTimeInput(selectedRecord.MorningStart);
    morningEnd.value = normalizeTimeInput(selectedRecord.MorningEnd);
    afternoonStart.value = normalizeTimeInput(selectedRecord.AfternoonStart);
    afternoonEnd.value = normalizeTimeInput(selectedRecord.AfternoonEnd);
    serviceDescription.value = selectedRecord.ServiceDescription || "";
  } else if (!isAdmin() && currentUser) {
    serviceRecordTechnicianId.value = currentUser.UserID;
  }

  renderServiceRecordOptions();
  updateServiceRecordTotalPreview();
  serviceRecordModal.classList.remove("hidden");
  (isAdmin() ? serviceRecordTechnicianId : serviceRecordDate).focus();
}

function closeServiceRecordEditor() {
  if (!serviceRecordModal) return;
  serviceRecordModal.classList.add("hidden");
  serviceRecordForm.reset();
  serviceRecordFormMessage.textContent = "";
  serviceRecordId.value = "";
  updateServiceRecordTotalPreview();
}

async function saveServiceRecord(event) {
  event.preventDefault();
  serviceRecordFormMessage.textContent = "";

  const payload = getServiceRecordPayloadFromForm();
  const validationMessage = getServiceRecordValidationMessage(payload);

  if (validationMessage) {
    serviceRecordFormMessage.textContent = validationMessage;
    return;
  }

  const editingId = serviceRecordId.value;
  const method = editingId ? "PUT" : "POST";
  const url = editingId ? `/api/service-records/${editingId}` : "/api/service-records";

  try {
    const response = await fetch(url, {
      method,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || (editingId ? t("updateServiceRecordError") : t("createServiceRecordError")));
    }

    closeServiceRecordEditor();
    showServiceRecordsMessage(editingId ? t("updateServiceRecordSuccess") : t("createServiceRecordSuccess"), "success");
    await loadServiceRecords();
  } catch (error) {
    console.error(error);
    serviceRecordFormMessage.textContent = error.message || (editingId ? t("updateServiceRecordError") : t("createServiceRecordError"));
  }
}

function getServiceRecordValidationMessage(payload) {
  const allowedStatuses = new Set(["Recorded", "Billed", "Canceled"]);
  const timeResult = calculateServiceRecordHours(payload);

  if (!Number.isInteger(payload.TechnicianUserID) || payload.TechnicianUserID <= 0) return t("serviceRecordTechnicianRequired");
  if (!Number.isInteger(payload.ClientID) || payload.ClientID <= 0) return t("serviceRecordClientRequired");
  if (!Number.isInteger(payload.ProjectID) || payload.ProjectID <= 0) return t("serviceRecordProjectRequired");
  if (!payload.ServiceDate) return t("serviceRecordDateRequired");
  if (!payload.ServiceDescription) return t("serviceRecordDescriptionRequired");
  if (!allowedStatuses.has(payload.Status)) return t("serviceRecordStatusInvalid");
  if (timeResult.error) return timeResult.error;

  return "";
}

function handleServiceRecordsTableClick(event) {
  const button = event.target.closest("button[data-service-record-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.serviceRecordAction;

  if (action === "edit") {
    const selectedRecord = serviceRecords.find((record) => Number(record.ServiceRecordID) === id);

    if (!selectedRecord) {
      alert(t("serviceRecordNotFound"));
      return;
    }

    openServiceRecordEditor("edit", selectedRecord);
  }

  if (action === "cancel") {
    cancelServiceRecord(id);
  }
}

async function cancelServiceRecord(id) {
  if (!isAdmin()) return;

  const confirmed = confirm(t("cancelServiceRecordConfirm"));

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/service-records/${id}`, {
      method: "DELETE",
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("cancelServiceRecordError"));
    }

    showServiceRecordsMessage(t("cancelServiceRecordSuccess"), "success");
    await loadServiceRecords();
  } catch (error) {
    console.error(error);
    showServiceRecordsMessage(error.message || t("cancelServiceRecordError"), "error");
  }
}

async function loadInvoiceClients() {
  try {
    const response = await fetch("/api/clients", {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (response.status === 401) {
      currentUser = null;
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loadInvoiceClientsError"));
    }

    invoiceClients = data.filter((client) => client.IsActive !== false);
    renderInvoiceClientOptions();
  } catch (error) {
    console.error(error);
    invoiceClients = [];
    renderInvoiceClientOptions();
    showInvoicesMessage(error.message || t("loadInvoiceClientsError"), "error");
  }
}

function renderInvoiceClientOptions() {
  if (!invoiceClientFilter || !invoiceGenerateClientId) return;

  const filterValue = invoiceClientFilter.value;
  const generateValue = invoiceGenerateClientId.value;
  const options = invoiceClients.map((client) => `
    <option value="${client.ClientID}">${escapeHTML(client.ClientName || `#${client.ClientID}`)}</option>
  `).join("");

  invoiceClientFilter.innerHTML = `<option value="">${escapeHTML(t("allClients"))}</option>${options}`;
  invoiceGenerateClientId.innerHTML = `<option value="">${escapeHTML(t("selectClient"))}</option>${options}`;
  invoiceClientFilter.value = filterValue;
  invoiceGenerateClientId.value = generateValue;
}

async function loadInvoices() {
  const params = new URLSearchParams();
  const search = invoiceSearchInput.value.trim();

  if (search) params.set("search", search);
  if (invoiceClientFilter.value) params.set("clientId", invoiceClientFilter.value);
  if (invoiceFromFilter.value) params.set("periodFrom", invoiceFromFilter.value);
  if (invoiceToFilter.value) params.set("periodTo", invoiceToFilter.value);
  if (invoiceStatusFilter.value) params.set("status", invoiceStatusFilter.value);

  try {
    const response = await fetch(`/api/invoices?${params.toString()}`, {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (response.status === 401) {
      currentUser = null;
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loadInvoicesError"));
    }

    invoices = data;
    renderInvoices();
  } catch (error) {
    console.error(error);
    invoices = [];
    showInvoicesTableMessage(t("loadInvoicesError"));
    showInvoicesMessage(error.message || t("loadInvoicesError"), "error");
  }
}

function renderInvoices() {
  if (!invoicesTableBody) return;

  invoicesTotalCount.textContent = formatNumber(invoices.length, 0);
  invoicesTotalCount.parentElement.lastChild.textContent = ` ${t("invoicesCount")}`;
  generateInvoiceButton.classList.toggle("hidden", !isAdmin());

  if (invoices.length === 0) {
    const hasFilters = invoiceSearchInput.value.trim()
      || invoiceClientFilter.value
      || invoiceFromFilter.value
      || invoiceToFilter.value
      || invoiceStatusFilter.value;
    showInvoicesTableMessage(hasFilters ? t("noInvoiceMatches") : t("noInvoices"));
    return;
  }

  invoicesTableBody.innerHTML = invoices.map((invoice) => {
    const canManage = isAdmin();
    const canCancel = canManage && invoice.Status !== "Canceled";

    return `
      <tr>
        <td>${escapeHTML(invoice.InvoiceNumber || "")}</td>
        <td>${escapeHTML(invoice.ClientName || "")}</td>
        <td>${escapeHTML(formatDateOnly(invoice.InvoiceDate))}</td>
        <td>${escapeHTML(formatDateOnly(invoice.PeriodFrom))}</td>
        <td>${escapeHTML(formatDateOnly(invoice.PeriodTo))}</td>
        <td><span class="badge ${getInvoiceStatusClass(invoice.Status)}">${escapeHTML(translateInvoiceStatus(invoice.Status))}</span></td>
        <td>
          <div class="actions">
            <button type="button" class="action-btn edit-btn" data-invoice-action="detail" data-id="${invoice.InvoiceID}">${currentLanguage === "es" ? "Detalle" : "Detail"}</button>
            ${canManage ? `<button type="button" class="action-btn edit-btn" data-invoice-action="status" data-id="${invoice.InvoiceID}">${currentLanguage === "es" ? "Estado" : "Status"}</button>` : ""}
            ${canCancel ? `<button type="button" class="action-btn delete-btn" data-invoice-action="cancel" data-id="${invoice.InvoiceID}">${currentLanguage === "es" ? "Cancelar" : "Cancel"}</button>` : ""}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function showInvoicesTableMessage(message) {
  invoicesTotalCount.textContent = formatNumber(invoices.length, 0);
  invoicesTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="empty-state">${escapeHTML(message)}</td>
    </tr>
  `;
}

function showInvoicesMessage(message, type = "info") {
  invoicesMessage.textContent = message;
  invoicesMessage.classList.toggle("success", type === "success");
}

function openInvoiceGenerateModal() {
  if (!isAdmin()) return;

  invoiceGenerateForm.reset();
  invoiceGenerateMessage.textContent = "";
  invoiceGenerateTaxRate.value = "0";
  renderInvoiceClientOptions();
  invoiceGenerateModal.classList.remove("hidden");
  invoiceGenerateClientId.focus();
}

function closeInvoiceGenerateEditor() {
  invoiceGenerateModal.classList.add("hidden");
  invoiceGenerateForm.reset();
  invoiceGenerateMessage.textContent = "";
}

function getInvoiceGeneratePayload() {
  return {
    ClientID: Number(invoiceGenerateClientId.value),
    PeriodFrom: invoiceGeneratePeriodFrom.value,
    PeriodTo: invoiceGeneratePeriodTo.value,
    TaxRate: invoiceGenerateTaxRate.value === "" ? 0 : Number(invoiceGenerateTaxRate.value),
    Notes: invoiceGenerateNotes.value.trim()
  };
}

function getInvoiceValidationMessage(payload, { requireStatus = false } = {}) {
  const allowedStatuses = new Set(["Draft", "Issued", "Paid", "Canceled"]);

  if (!Number.isInteger(payload.ClientID) || payload.ClientID <= 0) return t("invoiceClientRequired");
  if (!payload.PeriodFrom) return t("invoicePeriodFromRequired");
  if (!payload.PeriodTo) return t("invoicePeriodToRequired");
  if (payload.PeriodFrom > payload.PeriodTo) return t("invoicePeriodInvalid");
  if (!Number.isFinite(payload.TaxRate) || payload.TaxRate < 0) return t("invoiceTaxRateInvalid");
  if (requireStatus && !allowedStatuses.has(payload.Status)) return t("invoiceStatusInvalid");

  return "";
}

async function generateInvoice(event) {
  event.preventDefault();
  invoiceGenerateMessage.textContent = "";

  if (!isAdmin()) return;

  const payload = getInvoiceGeneratePayload();
  const validationMessage = getInvoiceValidationMessage(payload);

  if (validationMessage) {
    invoiceGenerateMessage.textContent = validationMessage;
    return;
  }

  try {
    const response = await fetch("/api/invoices/generate", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("generateInvoiceError"));
    }

    closeInvoiceGenerateEditor();
    showInvoicesMessage(t("invoiceGeneratedSuccess"), "success");
    await loadInvoices();
  } catch (error) {
    console.error(error);
    invoiceGenerateMessage.textContent = error.message || t("generateInvoiceError");
  }
}

function openInvoiceStatusEditor(invoice) {
  if (!isAdmin()) return;

  invoiceStatusForm.reset();
  invoiceStatusMessage.textContent = "";
  invoiceStatusId.value = invoice.InvoiceID;
  invoiceStatusValue.value = invoice.Status || "Draft";
  invoiceStatusNotes.value = invoice.Notes || "";
  invoiceStatusModal.classList.remove("hidden");
  invoiceStatusValue.focus();
}

function closeInvoiceStatusEditor() {
  invoiceStatusModal.classList.add("hidden");
  invoiceStatusForm.reset();
  invoiceStatusMessage.textContent = "";
  invoiceStatusId.value = "";
}

async function saveInvoiceStatus(event) {
  event.preventDefault();
  invoiceStatusMessage.textContent = "";

  const invoiceId = Number(invoiceStatusId.value);
  const invoice = invoices.find((item) => Number(item.InvoiceID) === invoiceId);

  if (!invoice) {
    invoiceStatusMessage.textContent = t("invoiceNotFound");
    return;
  }

  const payload = {
    InvoiceNumber: invoice.InvoiceNumber,
    ClientID: Number(invoice.ClientID),
    InvoiceDate: formatDateOnly(invoice.InvoiceDate),
    PeriodFrom: formatDateOnly(invoice.PeriodFrom),
    PeriodTo: formatDateOnly(invoice.PeriodTo),
    TaxRate: Number(invoice.TaxRate || 0),
    Status: invoiceStatusValue.value,
    Notes: invoiceStatusNotes.value.trim(),
    IsActive: invoice.IsActive
  };
  const validationMessage = getInvoiceValidationMessage(payload, { requireStatus: true });

  if (validationMessage) {
    invoiceStatusMessage.textContent = validationMessage;
    return;
  }

  try {
    const response = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("updateInvoiceError"));
    }

    closeInvoiceStatusEditor();
    showInvoicesMessage(t("invoiceStatusUpdatedSuccess"), "success");
    await loadInvoices();
  } catch (error) {
    console.error(error);
    invoiceStatusMessage.textContent = error.message || t("updateInvoiceError");
  }
}

async function openInvoiceDetail(invoiceId) {
  try {
    const response = await fetch(`/api/invoices/${invoiceId}`, {
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loadInvoiceDetailError"));
    }

    renderInvoiceDetail(data);
    invoiceDetailModal.classList.remove("hidden");
  } catch (error) {
    console.error(error);
    showInvoicesMessage(error.message || t("loadInvoiceDetailError"), "error");
  }
}

function renderInvoiceDetail(invoice) {
  const lines = invoice.Lines || [];

  invoiceDetailSummary.innerHTML = `
    <div class="detail-summary-grid">
      <div><span>InvoiceNumber</span><strong>${escapeHTML(invoice.InvoiceNumber || "")}</strong></div>
      <div><span>ClientName</span><strong>${escapeHTML(invoice.ClientName || "")}</strong></div>
      <div><span>InvoiceDate</span><strong>${escapeHTML(formatDateOnly(invoice.InvoiceDate))}</strong></div>
      <div><span>${escapeHTML(t("status"))}</span><strong>${escapeHTML(translateInvoiceStatus(invoice.Status))}</strong></div>
    </div>
  `;

  if (lines.length === 0) {
    invoiceLinesTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">${escapeHTML(t("noInvoiceLines"))}</td>
      </tr>
    `;
    return;
  }

  invoiceLinesTableBody.innerHTML = lines.map((line) => `
    <tr>
      <td>${escapeHTML(formatDateOnly(line.ServiceDate))}</td>
      <td>${escapeHTML(line.ProjectName || "")}</td>
      <td class="ticket-description">${escapeHTML(line.Description || "")}</td>
      <td>${formatNumber(line.Hours)}</td>
    </tr>
  `).join("");
}

function closeInvoiceDetail() {
  invoiceDetailModal.classList.add("hidden");
  invoiceDetailSummary.innerHTML = "";
  invoiceLinesTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="empty-state">${escapeHTML(t("noInvoiceLines"))}</td>
    </tr>
  `;
}

function handleInvoicesTableClick(event) {
  const button = event.target.closest("button[data-invoice-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.invoiceAction;

  if (action === "detail") {
    openInvoiceDetail(id);
  }

  if (action === "status") {
    const invoice = invoices.find((item) => Number(item.InvoiceID) === id);

    if (!invoice) {
      alert(t("invoiceNotFound"));
      return;
    }

    openInvoiceStatusEditor(invoice);
  }

  if (action === "cancel") {
    cancelInvoice(id);
  }
}

async function cancelInvoice(id) {
  if (!isAdmin()) return;

  const confirmed = confirm(t("cancelInvoiceConfirm"));

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/invoices/${id}`, {
      method: "DELETE",
      cache: "no-store"
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("cancelInvoiceError"));
    }

    showInvoicesMessage(t("invoiceCanceledSuccess"), "success");
    await loadInvoices();
  } catch (error) {
    console.error(error);
    showInvoicesMessage(error.message || t("cancelInvoiceError"), "error");
  }
}

function renderNotifications() {
  notificationsTotalCount.textContent = formatNumber(notifications.length, 0);

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
      <td class="notifications-admin-actions ${isAdmin() ? "" : "hidden"}">
        <div class="actions">
          ${renderNotificationActions(notification)}
        </div>
      </td>
    </tr>
  `).join("");
}

function showNotificationsMessage(message) {
  notificationsTotalCount.textContent = formatNumber(notifications.length, 0);
  notificationsTableBody.innerHTML = `
    <tr>
      <td colspan="5" class="empty-state">${message}</td>
    </tr>
  `;
}

function renderNotificationActions(notification) {
  if (!isAdmin()) {
    return `<span class="read-only-note">${notification.IsRead ? t("resolved") : t("readOnly")}</span>`;
  }

  const actions = [];
  const canResolve = notification.Type === "PASSWORD_RESET_REQUESTED" && !notification.IsRead && !isResolvedPasswordResetNotification(notification);

  if (canResolve) {
    actions.push(`
      <button class="action-btn close-btn" data-notification-action="resolve-password-reset" data-id="${notification.NotificationID}">
        ${getActionIcon("close")}
        ${t("markResolved")}
      </button>
    `);
  }

  actions.push(`
    <button class="action-btn delete-btn" data-notification-action="delete" data-id="${notification.NotificationID}">
      ${getActionIcon("delete")}
      ${t("deleteNotification")}
    </button>
  `);

  return actions.join("");
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
  notificationCount.textContent = formatNumber(unreadCount, 0);
  notificationCount.classList.toggle("hidden", unreadCount === 0);
}

function handleNotificationsClick(event) {
  const button = event.target.closest("button[data-notification-action]");

  if (!button) {
    return;
  }

  if (button.dataset.notificationAction === "resolve-password-reset") {
    resolvePasswordResetNotification(Number(button.dataset.id));
    return;
  }

  if (button.dataset.notificationAction === "delete") {
    deleteNotification(Number(button.dataset.id));
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

async function deleteNotification(notificationId) {
  if (!window.confirm(t("deleteNotificationConfirm"))) {
    return;
  }

  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: "DELETE",
      cache: "no-store"
    });

    if (!response.ok) {
      const data = await parseJsonResponse(response);
      throw new Error(translateServerMessage(data.message) || t("deleteNotificationError"));
    }

    await loadNotifications();
    alert(t("deleteNotificationSuccess"));
  } catch (error) {
    console.error(error);
    alert(error.message || t("deleteNotificationError"));
  }
}

async function loadDashboardData() {
  try {
    const [summaryResponse, chartsResponse, activityResponse, serviceHoursResponse] = await Promise.all([
      fetch("/api/dashboard/summary", { cache: "no-store" }),
      fetch("/api/dashboard/charts", { cache: "no-store" }),
      fetch("/api/dashboard/recent-activity", { cache: "no-store" }),
      fetch("/api/reports/service-hours", { cache: "no-store" })
    ]);
    const summaryData = await parseJsonResponse(summaryResponse);
    const chartsData = await parseJsonResponse(chartsResponse);
    const activityData = await parseJsonResponse(activityResponse);
    const serviceHoursData = await parseJsonResponse(serviceHoursResponse);

    if ([summaryResponse, chartsResponse, activityResponse, serviceHoursResponse].some((response) => response.status === 401)) {
      currentUser = null;
      showLogin();
      return;
    }

    if (!summaryResponse.ok) {
      throw new Error(translateServerMessage(summaryData.message) || t("dashboardLoadError"));
    }

    if (!chartsResponse.ok) {
      throw new Error(translateServerMessage(chartsData.message) || t("dashboardLoadError"));
    }

    if (!activityResponse.ok) {
      throw new Error(translateServerMessage(activityData.message) || t("dashboardLoadError"));
    }

    if (!serviceHoursResponse.ok) {
      throw new Error(translateServerMessage(serviceHoursData.message) || t("dashboardLoadError"));
    }

    dashboardSummary = summaryData;
    dashboardCharts = chartsData;
    dashboardRecentActivity = activityData;
    dashboardServiceHourRecords = Array.isArray(serviceHoursData) ? serviceHoursData : [];
    dashboardMessage.textContent = "";
    await loadDashboardActiveClients();
    await loadDashboardProjectOptions();
    await loadDashboardTechnicianOptions();
    renderDashboard();
  } catch (error) {
    console.error(error);
    dashboardSummary = null;
    dashboardCharts = null;
    dashboardRecentActivity = null;
    dashboardServiceHourRecords = [];
    dashboardActiveClients = [];
    dashboardMessage.textContent = error.message || t("dashboardLoadError");
    renderDashboard();
  }
}

function renderDashboard() {
  if (!dashboardSummaryGrid) return;

  renderDashboardSummary();
  renderDashboardProjectPanel();
  renderDashboardTechnicianPanel();
  renderDashboardCharts();
  renderDashboardRecentActivity();
}

async function loadDashboardActiveClients() {
  try {
    const response = await fetch("/api/clients", { cache: "no-store" });
    const data = await parseJsonResponse(response);

    if (response.status === 401) {
      currentUser = null;
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("loadClientsError"));
    }

    dashboardActiveClients = Array.isArray(data)
      ? data.filter((client) => client.IsActive !== false)
      : [];
  } catch (error) {
    console.error(error);
    dashboardActiveClients = [];
  }
}

function showDashboardProjectMessage(message, type = "info") {
  if (!dashboardProjectMessage) return;

  dashboardProjectMessage.textContent = message;
  dashboardProjectMessage.classList.toggle("success", type === "success");
}

function getDashboardProjectPlaceholder() {
  return escapeHTML(tNested("projectDashboard", "selectedPrompt"));
}

function renderDashboardProjectPrompt(message = getDashboardProjectPlaceholder()) {
  if (dashboardProjectSummaryGrid) {
    dashboardProjectSummaryGrid.innerHTML = "";
  }

  if (dashboardProjectInfoGrid) {
    dashboardProjectInfoGrid.innerHTML = `<p class="empty-state">${message}</p>`;
  }

  if (dashboardProjectRecordsCount) {
    dashboardProjectRecordsCount.textContent = formatNumber(0, 0);
    dashboardProjectRecordsCount.parentElement.lastChild.textContent = ` ${tNested("projectDashboard", "recordsCount")}`;
  }

  if (dashboardProjectRecordsBody) {
    dashboardProjectRecordsBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">${message}</td>
      </tr>
    `;
  }
}

function getFilteredDashboardProjects() {
  const search = (dashboardProjectSearchInput?.value || "").trim().toLowerCase();

  if (!search) return dashboardProjectOptions;

  return dashboardProjectOptions.filter((project) => [
    project.ProjectName,
    project.ClientName
  ].some((value) => String(value || "").toLowerCase().includes(search)));
}

function renderDashboardProjectOptions() {
  if (!dashboardProjectSelect) return;

  const selectedValue = dashboardProjectSelect.value;
  const filteredProjects = getFilteredDashboardProjects();
  dashboardProjectSelect.innerHTML = `
    <option value="">${escapeHTML(tNested("projectDashboard", "selectProject"))}</option>
    ${filteredProjects.map((project) => `
      <option value="${project.ProjectID}">${escapeHTML(project.ProjectName || `#${project.ProjectID}`)} - ${escapeHTML(project.ClientName || "")}</option>
    `).join("")}
  `;

  dashboardProjectSelect.value = filteredProjects.some((project) => String(project.ProjectID) === selectedValue)
    ? selectedValue
    : "";

  if (!filteredProjects.length && dashboardProjectOptions.length) {
    showDashboardProjectMessage(tNested("projectDashboard", "noProjectMatches"));
  } else if (!dashboardSelectedProject) {
    showDashboardProjectMessage("");
  }
}

async function loadDashboardProjectOptions() {
  if (!dashboardProjectSelect) return;

  try {
    const response = await fetch("/api/projects", { cache: "no-store" });
    const data = await parseJsonResponse(response);

    if (response.status === 401) {
      currentUser = null;
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || tNested("projectDashboard", "loadError"));
    }

    dashboardProjectOptions = Array.isArray(data)
      ? data.filter(isDashboardProjectActive)
      : [];
    if (dashboardSelectedProject) {
      dashboardSelectedProject = dashboardProjectOptions.find((project) => Number(project.ProjectID) === Number(dashboardSelectedProject.ProjectID)) || null;
    }

    renderDashboardProjectOptions();
    renderDashboardProjectPanel();
  } catch (error) {
    console.error(error);
    dashboardProjectOptions = [];
    dashboardSelectedProject = null;
    dashboardProjectServiceRecords = [];
    renderDashboardProjectOptions();
    renderDashboardProjectPrompt(escapeHTML(error.message || tNested("projectDashboard", "loadError")));
    showDashboardProjectMessage(error.message || tNested("projectDashboard", "loadError"), "error");
  }
}

function getDashboardProjectHoursSummary(records) {
  const range = getCurrentMonthDateRange();
  const currentMonthPrefix = range.from.slice(0, 7);
  const summary = {
    total: 0,
    currentMonth: 0,
    pending: 0,
    processed: 0,
    canceled: 0
  };

  records.forEach((record) => {
    const hours = Number(record.TotalHours || 0);
    const status = record.Status;

    summary.total += hours;
    if (String(record.ServiceDate || "").slice(0, 7) === currentMonthPrefix) summary.currentMonth += hours;
    if (status === "Recorded") summary.pending += hours;
    if (status === "Billed") summary.processed += hours;
    if (status === "Canceled") summary.canceled += hours;
  });

  return summary;
}

function renderDashboardProjectSummary(records) {
  if (!dashboardProjectSummaryGrid) return;

  const summary = getDashboardProjectHoursSummary(records);
  const metrics = [
    { label: tNested("projectDashboard", "totalProjectHours"), value: summary.total },
    { label: tNested("projectDashboard", "currentMonthProjectHours"), value: summary.currentMonth },
    { label: tNested("projectDashboard", "pendingProjectHours"), value: summary.pending },
    { label: tNested("projectDashboard", "processedProjectHours"), value: summary.processed },
    { label: tNested("projectDashboard", "canceledProjectHours"), value: summary.canceled }
  ];

  dashboardProjectSummaryGrid.innerHTML = metrics.map((metric, index) => `
    <article class="stat-card dashboard-summary-card">
      <div class="stat-icon ${index % 3 === 0 ? "stat-open" : index % 3 === 1 ? "stat-progress" : "stat-closed"}" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-3"/></svg>
      </div>
      <div>
        <span>${escapeHTML(metric.label)}</span>
        <strong>${formatDashboardMetric(metric.value, "hours")}</strong>
      </div>
    </article>
  `).join("");
}

function renderDashboardProjectInfo(project) {
  if (!dashboardProjectInfoGrid) return;

  const fields = [
    [labelText("Proyecto", "Project"), project.ProjectName],
    [labelText("Cliente", "Client"), project.ClientName],
    [labelText("Descripcion", "Description"), project.Description],
    [labelText("Numero de contrato", "Contract number"), project.ContractNumber],
    [labelText("Tipo de contrato", "Contract type"), translateContractType(project.ContractType)],
    [labelText("Fecha de comienzo", "Start date"), formatDateOnly(project.ContractStartDate)],
    [labelText("Fecha de vencimiento", "End date"), formatDateOnly(project.ContractEndDate)],
    [labelText("Horas contratadas", "Contracted hours"), formatProjectHours(project.ContractedHours)],
    [labelText("Horas usadas", "Used hours"), formatProjectHours(project.UsedHours)],
    [labelText("Horas restantes", "Remaining hours"), formatProjectHours(project.RemainingHours)],
    [labelText("Alerta de horas", "Hours alert"), project.HoursAlertStatus, "badge"],
    [labelText("Alerta de vencimiento", "Expiration alert"), project.ExpirationAlertStatus, "badge"],
    [labelText("Estado del contrato", "Contract status"), project.ContractStatus, "badge"],
    [t("status"), project.IsActive ? t("active") : t("inactive")]
  ];

  dashboardProjectInfoGrid.innerHTML = fields.map(([label, value, type]) => `
    <article class="project-dashboard-info-item">
      <span>${escapeHTML(label)}</span>
      <strong>${type === "badge" ? renderContractBadge(value) : escapeHTML(value || "-")}</strong>
    </article>
  `).join("");
}

function renderDashboardProjectRecords(records) {
  if (!dashboardProjectRecordsBody) return;

  const visibleRecords = records.slice(0, 8);
  dashboardProjectRecordsCount.textContent = formatNumber(records.length, 0);
  dashboardProjectRecordsCount.parentElement.lastChild.textContent = ` ${tNested("projectDashboard", "recordsCount")}`;

  if (!visibleRecords.length) {
    dashboardProjectRecordsBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">${escapeHTML(tNested("projectDashboard", "noRecords"))}</td>
      </tr>
    `;
    return;
  }

  dashboardProjectRecordsBody.innerHTML = visibleRecords.map((record) => `
    <tr>
      <td>${escapeHTML(formatDateOnly(record.ServiceDate))}</td>
      <td>${escapeHTML(record.TechnicianName || "")}</td>
      <td>${escapeHTML(record.ClientName || "")}</td>
      <td>${formatNumber(record.TotalHours)}</td>
      <td><span class="badge ${getServiceRecordStatusClass(record.Status)}">${escapeHTML(translateServiceRecordStatus(record.Status))}</span></td>
      <td class="ticket-description">${escapeHTML(cleanDisplayText(record.ServiceDescription))}</td>
    </tr>
  `).join("");
}

function renderDashboardProjectPanel() {
  if (!dashboardProjectSelect) return;

  renderDashboardProjectOptions();

  if (!dashboardSelectedProject) {
    renderDashboardProjectPrompt();
    return;
  }

  const activeRecords = getDashboardActiveServiceRecords(dashboardProjectServiceRecords);

  renderDashboardProjectSummary(activeRecords);
  renderDashboardProjectInfo(dashboardSelectedProject);
  renderDashboardProjectRecords(activeRecords);
}

async function selectDashboardProject(projectId) {
  dashboardSelectedProject = dashboardProjectOptions.find((project) => Number(project.ProjectID) === Number(projectId)) || null;
  dashboardProjectServiceRecords = [];

  if (!dashboardSelectedProject) {
    renderDashboardProjectPanel();
    return;
  }

  showDashboardProjectMessage(tNested("projectDashboard", "loading"));
  renderDashboardProjectSummary([]);
  renderDashboardProjectInfo(dashboardSelectedProject);
  renderDashboardProjectRecords([]);

  try {
    const params = new URLSearchParams({ projectId: String(dashboardSelectedProject.ProjectID) });
    dashboardProjectServiceRecords = await fetchDashboardServiceHours(params.toString());
    renderDashboardProjectPanel();
    showDashboardProjectMessage("");
  } catch (error) {
    console.error(error);
    dashboardProjectServiceRecords = [];
    renderDashboardProjectPanel();
    showDashboardProjectMessage(error.message || tNested("projectDashboard", "loadError"), "error");
  }
}

function handleDashboardProjectSearch() {
  renderDashboardProjectOptions();
}

function handleDashboardProjectSelect() {
  selectDashboardProject(dashboardProjectSelect.value);
}

function showDashboardTechnicianMessage(message, type = "info") {
  if (!dashboardTechnicianMessage) return;

  dashboardTechnicianMessage.textContent = message;
  dashboardTechnicianMessage.classList.toggle("success", type === "success");
}

function getDashboardTechnicianPlaceholder() {
  return escapeHTML(tNested("technicianDashboard", "selectedPrompt"));
}

function renderDashboardTechnicianPrompt(message = getDashboardTechnicianPlaceholder()) {
  if (dashboardTechnicianProjectSelect) {
    dashboardTechnicianProjectSelect.innerHTML = `<option value="">${escapeHTML(tNested("technicianDashboard", "allProjects"))}</option>`;
    dashboardTechnicianProjectSelect.value = "";
    dashboardTechnicianProjectSelect.disabled = true;
  }

  if (dashboardTechnicianSummaryGrid) {
    dashboardTechnicianSummaryGrid.innerHTML = "";
  }

  if (dashboardTechnicianInfoGrid) {
    dashboardTechnicianInfoGrid.innerHTML = `<p class="empty-state">${message}</p>`;
  }

  if (dashboardTechnicianProjectsBody) {
    dashboardTechnicianProjectsBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">${message}</td>
      </tr>
    `;
  }

  if (dashboardTechnicianProjectsChart) {
    dashboardTechnicianProjectsChart.innerHTML = `<p class="empty-state">${message}</p>`;
  }

  if (dashboardTechnicianClientsBody) {
    dashboardTechnicianClientsBody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-state">${message}</td>
      </tr>
    `;
  }

  if (dashboardTechnicianClientsChart) {
    dashboardTechnicianClientsChart.innerHTML = `<p class="empty-state">${message}</p>`;
  }

  if (dashboardTechnicianMonthsChart) {
    dashboardTechnicianMonthsChart.innerHTML = `<p class="empty-state">${message}</p>`;
  }

  if (dashboardTechnicianRecordsCount) {
    dashboardTechnicianRecordsCount.textContent = formatNumber(0, 0);
    dashboardTechnicianRecordsCount.parentElement.lastChild.textContent = ` ${tNested("technicianDashboard", "recordsCount")}`;
  }

  if (dashboardTechnicianRecordsBody) {
    dashboardTechnicianRecordsBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">${message}</td>
      </tr>
    `;
  }
}

function getDashboardTechnicianProjectValue(record) {
  if (record.ProjectID !== undefined && record.ProjectID !== null && record.ProjectID !== "") {
    return `id:${record.ProjectID}`;
  }

  return `name:${record.ClientName || ""}|${record.ProjectName || ""}`;
}

function getDashboardTechnicianProjectOptions() {
  const projectsByKey = new Map();

  getDashboardActiveServiceRecords(dashboardTechnicianServiceRecords).forEach((record) => {
    const key = getDashboardTechnicianProjectValue(record);
    if (!key || projectsByKey.has(key)) return;

    projectsByKey.set(key, {
      value: key,
      ProjectName: record.ProjectName || "",
      ClientName: record.ClientName || ""
    });
  });

  dashboardProjectOptions
    .filter((project) => isDashboardProjectActive(project) && getDashboardTechnicianProjectPriority(project) < Number.MAX_SAFE_INTEGER)
    .forEach((project) => {
      const key = `id:${project.ProjectID}`;
      if (projectsByKey.has(key)) return;

      projectsByKey.set(key, {
        value: key,
        ProjectName: project.ProjectName || "",
        ClientName: project.ClientName || ""
      });
    });

  return Array.from(projectsByKey.values())
    .sort((a, b) => {
      const priorityDiff = getDashboardTechnicianProjectPriority(a) - getDashboardTechnicianProjectPriority(b);
      if (priorityDiff !== 0) return priorityDiff;

      return String(a.ProjectName || "").localeCompare(String(b.ProjectName || ""))
        || String(a.ClientName || "").localeCompare(String(b.ClientName || ""));
    });
}

function getDashboardTechnicianProjectPriority(project) {
  const labelKey = normalizeSearchKey([project.ProjectName, project.ClientName].filter(Boolean).join(" - "));
  const projectKey = normalizeSearchKey(project.ProjectName);
  const labelIndex = technicianDashboardMainProjectKeys.indexOf(labelKey);
  const projectIndex = technicianDashboardMainProjectKeys.findIndex((key) => key.startsWith(`${projectKey} -`) || key === projectKey);
  const priority = labelIndex >= 0 ? labelIndex : projectIndex;

  return priority >= 0 ? priority : Number.MAX_SAFE_INTEGER;
}

function renderDashboardTechnicianProjectOptions() {
  if (!dashboardTechnicianProjectSelect) return;

  const projectOptions = getDashboardTechnicianProjectOptions();
  const selectedValue = dashboardSelectedTechnicianProject;
  dashboardTechnicianProjectSelect.innerHTML = `
    <option value="">${escapeHTML(tNested("technicianDashboard", "allProjects"))}</option>
    ${projectOptions.map((project) => `
      <option value="${escapeHTML(project.value)}">${escapeHTML([project.ProjectName, project.ClientName].filter(Boolean).join(" - ") || project.value)}</option>
    `).join("")}
  `;

  dashboardSelectedTechnicianProject = projectOptions.some((project) => project.value === selectedValue)
    ? selectedValue
    : "";
  dashboardTechnicianProjectSelect.value = dashboardSelectedTechnicianProject;
  dashboardTechnicianProjectSelect.disabled = !dashboardSelectedTechnician || projectOptions.length === 0;
}

function getDashboardTechnicianFilteredRecords() {
  let records = getDashboardActiveServiceRecords(dashboardTechnicianServiceRecords);

  if (dashboardSelectedTechnicianProject) {
    records = records.filter((record) => getDashboardTechnicianProjectValue(record) === dashboardSelectedTechnicianProject);
  }

  if (dashboardTechnicianDateFromValue) {
    records = records.filter((record) => String(record.ServiceDate || "").slice(0, 10) >= dashboardTechnicianDateFromValue);
  }

  if (dashboardTechnicianDateToValue) {
    records = records.filter((record) => String(record.ServiceDate || "").slice(0, 10) <= dashboardTechnicianDateToValue);
  }

  return records;
}

function getFilteredDashboardTechnicians() {
  const search = (dashboardTechnicianSearchInput?.value || "").trim().toLowerCase();

  if (!search) return dashboardTechnicianOptions;

  return dashboardTechnicianOptions.filter((technician) => [
    technician.FullName,
    technician.Email,
    technician.Role
  ].some((value) => String(value || "").toLowerCase().includes(search)));
}

function renderDashboardTechnicianOptions() {
  if (!dashboardTechnicianSelect) return;

  const selectedValue = dashboardTechnicianSelect.value;
  const filteredTechnicians = getFilteredDashboardTechnicians();
  dashboardTechnicianSelect.innerHTML = `
    <option value="">${escapeHTML(tNested("technicianDashboard", "selectTechnician"))}</option>
    ${filteredTechnicians.map((technician) => `
      <option value="${technician.UserID}">${escapeHTML(technician.FullName || technician.Email || `#${technician.UserID}`)}</option>
    `).join("")}
  `;

  dashboardTechnicianSelect.value = filteredTechnicians.some((technician) => String(technician.UserID) === selectedValue)
    ? selectedValue
    : "";

  if (!filteredTechnicians.length && dashboardTechnicianOptions.length) {
    showDashboardTechnicianMessage(tNested("technicianDashboard", "noTechnicianMatches"));
  } else if (!dashboardSelectedTechnician) {
    showDashboardTechnicianMessage("");
  }
}

async function loadDashboardTechnicianOptions() {
  if (!dashboardTechnicianSelect) return;

  try {
    if (isProjectManager()) {
      const response = await fetch("/api/reports/service-hours/technicians", { cache: "no-store" });
      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(translateServerMessage(data.message) || tNested("technicianDashboard", "loadError"));
      }

      dashboardTechnicianOptions = data;
      dashboardSelectedTechnician = null;
      renderDashboardTechnicianOptions();
      renderDashboardTechnicianPanel();
      return;
    }

    if (!isAdmin()) {
      dashboardTechnicianOptions = currentUser ? [currentUser] : [];
      dashboardSelectedTechnician = currentUser || null;
      renderDashboardTechnicianOptions();
      renderDashboardTechnicianPanel();

      if (dashboardSelectedTechnician) {
        await selectDashboardTechnician(dashboardSelectedTechnician.UserID);
      }
      return;
    }

    if (!Array.isArray(users) || users.length === 0) {
      await loadUsers();
    }

    dashboardTechnicianOptions = users
      .filter((user) => user.IsActive !== false && (user.Role === "Admin" || user.Role === "Technician" || user.IsTechnician))
      .sort((a, b) => String(a.FullName || "").localeCompare(String(b.FullName || "")));

    if (dashboardSelectedTechnician) {
      dashboardSelectedTechnician = dashboardTechnicianOptions.find((technician) => Number(technician.UserID) === Number(dashboardSelectedTechnician.UserID)) || null;
    }

    renderDashboardTechnicianOptions();
    renderDashboardTechnicianPanel();
  } catch (error) {
    console.error(error);
    dashboardTechnicianOptions = [];
    dashboardSelectedTechnician = null;
    dashboardTechnicianServiceRecords = [];
    renderDashboardTechnicianOptions();
    renderDashboardTechnicianPrompt(escapeHTML(error.message || tNested("technicianDashboard", "loadError")));
    showDashboardTechnicianMessage(error.message || tNested("technicianDashboard", "loadError"), "error");
  }
}

function getDashboardTechnicianHoursSummary(records) {
  const summary = {
    total: 0,
    pending: 0,
    processed: 0,
    canceled: 0,
    records: records.length
  };

  records.forEach((record) => {
    const hours = Number(record.TotalHours || 0);
    const status = record.Status;

    summary.total += hours;
    if (status === "Recorded") summary.pending += hours;
    if (status === "Billed") summary.processed += hours;
    if (status === "Canceled") summary.canceled += hours;
  });

  return summary;
}

function renderDashboardTechnicianSummary(records) {
  if (!dashboardTechnicianSummaryGrid) return;

  const summary = getDashboardTechnicianHoursSummary(records);
  const metrics = [
    { label: tNested("technicianDashboard", "totalTechnicianHours"), value: summary.total, type: "hours" },
    { label: tNested("technicianDashboard", "totalTechnicianRecords"), value: summary.records, type: "count" },
    { label: tNested("technicianDashboard", "pendingTechnicianHours"), value: summary.pending, type: "hours" },
    { label: tNested("technicianDashboard", "processedTechnicianHours"), value: summary.processed, type: "hours" },
    { label: tNested("technicianDashboard", "canceledTechnicianHours"), value: summary.canceled, type: "hours" }
  ];

  dashboardTechnicianSummaryGrid.innerHTML = metrics.map((metric, index) => `
    <article class="stat-card dashboard-summary-card">
      <div class="stat-icon ${index % 3 === 0 ? "stat-open" : index % 3 === 1 ? "stat-progress" : "stat-closed"}" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-3"/></svg>
      </div>
      <div>
        <span>${escapeHTML(metric.label)}</span>
        <strong>${formatDashboardMetric(metric.value, metric.type)}</strong>
      </div>
    </article>
  `).join("");
}

function getSelectedDashboardTechnicianProjectOption() {
  if (!dashboardSelectedTechnicianProject) return null;

  return getDashboardTechnicianProjectOptions()
    .find((project) => project.value === dashboardSelectedTechnicianProject) || null;
}

function renderDashboardTechnicianInfo(technician, records = []) {
  if (!dashboardTechnicianInfoGrid) return;

  const selectedProject = getSelectedDashboardTechnicianProjectOption();
  const firstRecord = records[0] || {};
  const allProjectsLabel = tNested("technicianDashboard", "allProjects");
  const allClientsLabel = currentLanguage === "es" ? "Todos los clientes" : "All clients";
  const fields = [
    [currentLanguage === "es" ? "Tecnico" : "Technician", technician.FullName],
    [currentLanguage === "es" ? "Cliente" : "Client", dashboardSelectedTechnicianProject ? firstRecord.ClientName || selectedProject?.ClientName : allClientsLabel],
    [currentLanguage === "es" ? "Proyecto" : "Project", dashboardSelectedTechnicianProject ? firstRecord.ProjectName || selectedProject?.ProjectName : allProjectsLabel]
  ];

  dashboardTechnicianInfoGrid.innerHTML = fields.map(([label, value]) => `
    <article class="project-dashboard-info-item">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(value || "-")}</strong>
    </article>
  `).join("");
}

function getDashboardTechnicianProjectRows(records) {
  const rowsByProject = new Map();

  records.forEach((record) => {
    const key = `${record.ProjectName || ""}|${record.ClientName || ""}`;
    const existing = rowsByProject.get(key) || {
      ProjectName: record.ProjectName || "",
      ClientName: record.ClientName || "",
      TotalHours: 0,
      LastServiceDate: ""
    };

    existing.TotalHours += Number(record.TotalHours || 0);
    if (!existing.LastServiceDate || String(record.ServiceDate || "") > existing.LastServiceDate) {
      existing.LastServiceDate = String(record.ServiceDate || "");
    }

    rowsByProject.set(key, existing);
  });

  return Array.from(rowsByProject.values())
    .sort((a, b) => b.TotalHours - a.TotalHours || String(b.LastServiceDate).localeCompare(String(a.LastServiceDate)));
}

function getDashboardTechnicianClientRows(records) {
  const rowsByClient = new Map();

  records.forEach((record) => {
    const key = record.ClientName || "";
    const existing = rowsByClient.get(key) || {
      ClientName: record.ClientName || "",
      TotalHours: 0,
      TotalRecords: 0
    };

    existing.TotalHours += Number(record.TotalHours || 0);
    existing.TotalRecords += 1;
    rowsByClient.set(key, existing);
  });

  return Array.from(rowsByClient.values())
    .sort((a, b) => b.TotalHours - a.TotalHours || b.TotalRecords - a.TotalRecords);
}

function getDashboardTechnicianMonthRows(records) {
  const rowsByMonth = new Map();

  records.forEach((record) => {
    const month = String(record.ServiceDate || "").slice(0, 7);
    if (!month) return;

    rowsByMonth.set(month, (rowsByMonth.get(month) || 0) + Number(record.TotalHours || 0));
  });

  return Array.from(rowsByMonth, ([Month, TotalHours]) => ({ Month, TotalHours }))
    .sort((a, b) => String(a.Month).localeCompare(String(b.Month)));
}

function renderDashboardTechnicianProjects(records) {
  if (!dashboardTechnicianProjectsBody) return;

  const projectRows = getDashboardTechnicianProjectRows(records);

  if (!projectRows.length) {
    dashboardTechnicianProjectsBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">${escapeHTML(tNested("technicianDashboard", "noProjectHours"))}</td>
      </tr>
    `;
    return;
  }

  dashboardTechnicianProjectsBody.innerHTML = projectRows.map((row) => `
    <tr>
      <td>${escapeHTML(row.ProjectName)}</td>
      <td>${escapeHTML(row.ClientName)}</td>
      <td>${formatNumber(row.TotalHours)}</td>
      <td>${escapeHTML(formatDateOnly(row.LastServiceDate))}</td>
    </tr>
  `).join("");
}

function renderDashboardTechnicianClients(records) {
  if (!dashboardTechnicianClientsBody) return;

  const clientRows = getDashboardTechnicianClientRows(records);

  if (!clientRows.length) {
    dashboardTechnicianClientsBody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-state">${escapeHTML(tNested("technicianDashboard", "noClientHours"))}</td>
      </tr>
    `;
    return;
  }

  dashboardTechnicianClientsBody.innerHTML = clientRows.map((row) => `
    <tr>
      <td>${escapeHTML(row.ClientName)}</td>
      <td>${formatNumber(row.TotalHours)}</td>
      <td>${formatNumber(row.TotalRecords, 0)}</td>
    </tr>
  `).join("");
}

function renderDashboardTechnicianCharts(records) {
  renderBarChart(dashboardTechnicianProjectsChart, getDashboardTechnicianProjectRows(records), "ProjectName", "TotalHours", "hours");
  renderBarChart(dashboardTechnicianClientsChart, getDashboardTechnicianClientRows(records), "ClientName", "TotalHours", "hours");
  renderBarChart(dashboardTechnicianMonthsChart, getDashboardTechnicianMonthRows(records), "Month", "TotalHours", "hours");
}

function renderDashboardTechnicianRecords(records) {
  if (!dashboardTechnicianRecordsBody) return;

  const visibleRecords = records.slice(0, 8);
  dashboardTechnicianRecordsCount.textContent = formatNumber(records.length, 0);
  dashboardTechnicianRecordsCount.parentElement.lastChild.textContent = ` ${tNested("technicianDashboard", "recordsCount")}`;

  if (!visibleRecords.length) {
    dashboardTechnicianRecordsBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">${escapeHTML(tNested("technicianDashboard", "noRecords"))}</td>
      </tr>
    `;
    return;
  }

  dashboardTechnicianRecordsBody.innerHTML = visibleRecords.map((record) => `
    <tr>
      <td>${escapeHTML(formatDateOnly(record.ServiceDate))}</td>
      <td>${escapeHTML(record.ClientName || "")}</td>
      <td>${escapeHTML(record.ProjectName || "")}</td>
      <td>${formatNumber(record.TotalHours)}</td>
      <td><span class="badge ${getServiceRecordStatusClass(record.Status)}">${escapeHTML(translateServiceRecordStatus(record.Status))}</span></td>
      <td class="ticket-description">${escapeHTML(cleanDisplayText(record.ServiceDescription))}</td>
      <td class="dashboard-technician-admin-actions ${isAdmin() ? "" : "hidden"}">
        ${isAdmin() ? `
          <button type="button" class="action-btn edit-btn" data-dashboard-technician-record-action="edit-description" data-id="${record.ServiceRecordID}">
            ${t("edit")}
          </button>
        ` : ""}
      </td>
    </tr>
  `).join("");
}

function renderDashboardTechnicianPanel() {
  if (!dashboardTechnicianSelect) return;

  renderDashboardTechnicianOptions();
  renderDashboardTechnicianProjectOptions();

  if (!dashboardSelectedTechnician) {
    renderDashboardTechnicianPrompt();
    return;
  }

  const filteredRecords = getDashboardTechnicianFilteredRecords();

  renderDashboardTechnicianSummary(filteredRecords);
  renderDashboardTechnicianInfo(dashboardSelectedTechnician, filteredRecords);
  renderDashboardTechnicianCharts(filteredRecords);
  renderDashboardTechnicianRecords(filteredRecords);
}

async function selectDashboardTechnician(technicianId) {
  dashboardSelectedTechnician = dashboardTechnicianOptions.find((technician) => Number(technician.UserID) === Number(technicianId)) || null;
  dashboardTechnicianServiceRecords = [];
  dashboardSelectedTechnicianProject = "";

  if (!dashboardSelectedTechnician) {
    renderDashboardTechnicianPanel();
    return;
  }

  showDashboardTechnicianMessage(tNested("technicianDashboard", "loading"));
  renderDashboardTechnicianSummary([]);
  renderDashboardTechnicianInfo(dashboardSelectedTechnician, []);
  renderDashboardTechnicianCharts([]);
  renderDashboardTechnicianRecords([]);

  try {
    const params = new URLSearchParams({ technicianUserId: String(dashboardSelectedTechnician.UserID) });
    dashboardTechnicianServiceRecords = await fetchDashboardServiceHours(params.toString());
    renderDashboardTechnicianPanel();
    showDashboardTechnicianMessage("");
  } catch (error) {
    console.error(error);
    dashboardTechnicianServiceRecords = [];
    renderDashboardTechnicianPanel();
    showDashboardTechnicianMessage(error.message || tNested("technicianDashboard", "loadError"), "error");
  }
}

function handleDashboardTechnicianSearch() {
  renderDashboardTechnicianOptions();
}

function handleDashboardTechnicianSelect() {
  selectDashboardTechnician(dashboardTechnicianSelect.value);
}

function handleDashboardTechnicianProjectSelect() {
  dashboardSelectedTechnicianProject = dashboardTechnicianProjectSelect.value;
  renderDashboardTechnicianPanel();
}

function handleDashboardTechnicianDateChange() {
  dashboardTechnicianDateFromValue = dashboardTechnicianDateFrom?.value || "";
  dashboardTechnicianDateToValue = dashboardTechnicianDateTo?.value || "";
  renderDashboardTechnicianPanel();
}

async function openDashboardTechnicianDescriptionEditor(recordId) {
  if (!isAdmin() || !dashboardTechnicianDescriptionModal) return;

  let selectedRecord = dashboardTechnicianServiceRecords.find((record) => Number(record.ServiceRecordID) === Number(recordId));

  if (!selectedRecord) {
    showDashboardTechnicianMessage(t("serviceRecordNotFound"), "error");
    return;
  }

  try {
    const response = await fetch(`/api/service-records/${recordId}`, { cache: "no-store" });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("serviceRecordNotFound"));
    }

    selectedRecord = data;
    dashboardTechnicianDescriptionRecord = selectedRecord;
    dashboardTechnicianDescriptionRecordId.value = selectedRecord.ServiceRecordID;
    dashboardTechnicianDescriptionText.value = cleanDisplayText(selectedRecord.ServiceDescription);
    dashboardTechnicianDescriptionMessage.textContent = "";
    dashboardTechnicianDescriptionModal.classList.remove("hidden");
    dashboardTechnicianDescriptionText.focus();
  } catch (error) {
    console.error(error);
    showDashboardTechnicianMessage(error.message || t("serviceRecordNotFound"), "error");
  }
}

function closeDashboardTechnicianDescriptionEditor() {
  if (!dashboardTechnicianDescriptionModal) return;

  dashboardTechnicianDescriptionModal.classList.add("hidden");
  dashboardTechnicianDescriptionForm.reset();
  dashboardTechnicianDescriptionRecordId.value = "";
  dashboardTechnicianDescriptionMessage.textContent = "";
  dashboardTechnicianDescriptionRecord = null;
}

function getDashboardTechnicianDescriptionPayload(record, description) {
  return {
    TechnicianUserID: Number(record.TechnicianUserID),
    ClientID: Number(record.ClientID),
    ProjectID: Number(record.ProjectID),
    ServiceDate: formatDateOnly(record.ServiceDate),
    MorningStart: record.MorningStart || null,
    MorningEnd: record.MorningEnd || null,
    AfternoonStart: record.AfternoonStart || null,
    AfternoonEnd: record.AfternoonEnd || null,
    ServiceDescription: description,
    Status: record.Status || "Recorded"
  };
}

async function saveDashboardTechnicianDescription(event) {
  event.preventDefault();

  if (!isAdmin()) return;

  dashboardTechnicianDescriptionMessage.textContent = "";
  const recordId = Number(dashboardTechnicianDescriptionRecordId.value);
  const selectedRecord = dashboardTechnicianDescriptionRecord;
  const description = dashboardTechnicianDescriptionText.value.trim();

  if (!selectedRecord || Number(selectedRecord.ServiceRecordID) !== recordId) {
    dashboardTechnicianDescriptionMessage.textContent = t("serviceRecordNotFound");
    return;
  }

  if (!description) {
    dashboardTechnicianDescriptionMessage.textContent = t("serviceRecordDescriptionRequired");
    return;
  }

  try {
    const response = await fetch(`/api/service-records/${recordId}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(getDashboardTechnicianDescriptionPayload(selectedRecord, description))
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("updateServiceRecordError"));
    }

    dashboardTechnicianServiceRecords = dashboardTechnicianServiceRecords.map((record) => (
      Number(record.ServiceRecordID) === recordId ? data : record
    ));
    closeDashboardTechnicianDescriptionEditor();
    renderDashboardTechnicianPanel();
    showDashboardTechnicianMessage(t("updateServiceRecordSuccess"), "success");
  } catch (error) {
    console.error(error);
    dashboardTechnicianDescriptionMessage.textContent = error.message || t("updateServiceRecordError");
  }
}

function handleDashboardTechnicianRecordsClick(event) {
  const button = event.target.closest("button[data-dashboard-technician-record-action]");

  if (!button) return;

  if (button.dataset.dashboardTechnicianRecordAction === "edit-description") {
    openDashboardTechnicianDescriptionEditor(Number(button.dataset.id));
  }
}

function getCurrentMonthKey() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getCurrentMonthHours() {
  const currentMonth = getCurrentMonthKey();
  const monthRow = getDashboardChartRows().HoursByMonth.find((row) => String(row.Month) === currentMonth);

  return Number(monthRow?.TotalHours || 0);
}

function getDashboardSummaryMetrics() {
  const activeRecords = getDashboardActiveServiceRecords();

  return {
    ...(dashboardSummary || {}),
    TotalClients: dashboardActiveClients.length,
    TotalProjects: dashboardProjectOptions.filter(isDashboardProjectActive).length,
    TotalServiceRecords: activeRecords.length,
    TotalHours: sumDashboardHours(activeRecords),
    UnbilledHours: sumDashboardHours(activeRecords.filter((record) => record.Status === "Recorded")),
    BilledHours: sumDashboardHours(activeRecords.filter((record) => record.Status === "Billed"))
  };
}

function sumDashboardHours(records) {
  return records.reduce((total, record) => total + Number(record.TotalHours || 0), 0);
}

function normalizeDashboardKey(value) {
  return String(value || "").trim().toLowerCase();
}

function getActiveDashboardProjectRefs() {
  const activeProjects = dashboardProjectOptions.filter(isDashboardProjectActive);

  return {
    ids: new Set(activeProjects.map((project) => Number(project.ProjectID)).filter(Number.isFinite)),
    names: new Set(activeProjects.map((project) => normalizeDashboardKey(`${project.ProjectName}|${project.ClientName}`)))
  };
}

function getActiveDashboardClientRefs() {
  return {
    ids: new Set(dashboardActiveClients.map((client) => Number(client.ClientID)).filter(Number.isFinite)),
    names: new Set(dashboardActiveClients.map((client) => normalizeDashboardKey(client.ClientName)))
  };
}

function isDashboardProjectActive(project) {
  if (!project || project.IsActive === false) return false;

  const clientRefs = getActiveDashboardClientRefs();
  const clientId = Number(project.ClientID);
  const clientName = normalizeDashboardKey(project.ClientName);

  return clientRefs.ids.has(clientId) || clientRefs.names.has(clientName);
}

function getActiveDashboardTechnicianRefs() {
  const activeTechnicians = dashboardTechnicianOptions.filter((technician) => technician.IsActive !== false);

  return {
    ids: new Set(activeTechnicians.map((technician) => Number(technician.UserID)).filter(Number.isFinite)),
    names: new Set(activeTechnicians.map((technician) => normalizeDashboardKey(technician.FullName || technician.Email)))
  };
}

function isDashboardRecordActive(record) {
  const projectRefs = getActiveDashboardProjectRefs();
  const clientRefs = getActiveDashboardClientRefs();
  const technicianRefs = getActiveDashboardTechnicianRefs();
  const projectId = Number(record.ProjectID);
  const clientId = Number(record.ClientID);
  const technicianId = Number(record.TechnicianUserID);
  const projectKey = normalizeDashboardKey(`${record.ProjectName}|${record.ClientName}`);
  const clientKey = normalizeDashboardKey(record.ClientName);
  const technicianKey = normalizeDashboardKey(record.TechnicianName);
  const hasActiveProject = projectRefs.ids.has(projectId) || projectRefs.names.has(projectKey);
  const hasActiveClient = clientRefs.ids.has(clientId) || clientRefs.names.has(clientKey);
  const hasActiveTechnician = technicianRefs.ids.has(technicianId) || technicianRefs.names.has(technicianKey);

  return hasActiveProject && hasActiveClient && hasActiveTechnician;
}

function getDashboardActiveServiceRecords(records = dashboardServiceHourRecords) {
  return records.filter(isDashboardRecordActive);
}

function getDashboardPriority(value, priorityKeys) {
  const normalizedValue = normalizeSearchKey(value);
  const priority = priorityKeys.findIndex((key) => normalizedValue === key || normalizedValue.includes(key) || key.includes(normalizedValue));

  return priority >= 0 ? priority : Number.MAX_SAFE_INTEGER;
}

function getDashboardMainClientPriority(clientName) {
  return getDashboardPriority(clientName, dashboardMainClientKeys);
}

function getDashboardMainProjectPriority(projectName) {
  return getDashboardPriority(projectName, dashboardMainProjectKeys);
}

function sortDashboardClientRows(a, b) {
  const priorityDiff = getDashboardMainClientPriority(a.ClientName) - getDashboardMainClientPriority(b.ClientName);
  if (priorityDiff !== 0) return priorityDiff;

  return b.TotalHours - a.TotalHours || String(a.ClientName || "").localeCompare(String(b.ClientName || ""));
}

function sortDashboardProjectRows(a, b) {
  const priorityDiff = getDashboardMainProjectPriority(a.ProjectName) - getDashboardMainProjectPriority(b.ProjectName);
  if (priorityDiff !== 0) return priorityDiff;

  return b.TotalHours - a.TotalHours || String(a.ProjectName || "").localeCompare(String(b.ProjectName || ""));
}

function getDashboardChartRows() {
  const rowsByMonth = new Map();
  const rowsByClient = new Map();
  const rowsByProject = new Map();
  const rowsByTechnician = new Map();

  getDashboardActiveServiceRecords().forEach((record) => {
    const hours = Number(record.TotalHours || 0);
    const month = String(record.ServiceDate || "").slice(0, 7);
    const client = record.ClientName || "";
    const project = record.ProjectName || "";
    const technician = record.TechnicianName || "";

    if (month) rowsByMonth.set(month, (rowsByMonth.get(month) || 0) + hours);
    if (client) rowsByClient.set(client, (rowsByClient.get(client) || 0) + hours);
    if (project) rowsByProject.set(project, (rowsByProject.get(project) || 0) + hours);
    if (technician) rowsByTechnician.set(technician, (rowsByTechnician.get(technician) || 0) + hours);
  });

  const byHoursDesc = (a, b) => b.TotalHours - a.TotalHours;

  return {
    HoursByMonth: Array.from(rowsByMonth, ([Month, TotalHours]) => ({ Month, TotalHours }))
      .sort((a, b) => String(a.Month).localeCompare(String(b.Month))),
    HoursByClient: Array.from(rowsByClient, ([ClientName, TotalHours]) => ({ ClientName, TotalHours })).sort(sortDashboardClientRows),
    HoursByProject: Array.from(rowsByProject, ([ProjectName, TotalHours]) => ({ ProjectName, TotalHours })).sort(sortDashboardProjectRows),
    HoursByTechnician: Array.from(rowsByTechnician, ([TechnicianName, TotalHours]) => ({ TechnicianName, TotalHours })).sort(byHoursDesc)
  };
}

function renderDashboardSummary() {
  const summaryMetrics = getDashboardSummaryMetrics();
  const metrics = [
    { key: "TotalClients", type: "count", detail: "clients" },
    { key: "TotalProjects", type: "count", detail: "projects" },
    { key: "TotalServiceRecords", type: "count", detail: "records" },
    { key: "TotalHours", type: "hours", detail: "records" },
    { key: "UnbilledHours", type: "hours", detail: "pending" }
  ];

  dashboardSummaryGrid.innerHTML = metrics.map((metric, index) => `
    <article
      class="stat-card dashboard-summary-card ${metric.detail ? "interactive-card" : ""}"
      ${metric.detail ? `data-dashboard-detail="${metric.detail}" role="button" tabindex="0"` : ""}
    >
      <div class="stat-icon ${index % 3 === 0 ? "stat-open" : index % 3 === 1 ? "stat-progress" : "stat-closed"}" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-3"/></svg>
      </div>
      <div>
        <span>${escapeHTML(tNested("dashboardMetrics", metric.key))}</span>
        <strong>${formatDashboardMetric(metric.value ?? summaryMetrics?.[metric.key], metric.type)}</strong>
      </div>
    </article>
  `).join("");
}

function renderDashboardCharts() {
  const chartRows = getDashboardChartRows();

  renderBarChart(hoursByMonthChart, chartRows.HoursByMonth, "Month", "TotalHours", "hours", {
    action: "dashboard-month",
    valueKey: "Month"
  });
  renderBarChart(hoursByClientChart, chartRows.HoursByClient, "ClientName", "TotalHours", "hours", {
    action: "dashboard-client",
    valueKey: "ClientName"
  });
  renderBarChart(hoursByProjectChart, chartRows.HoursByProject, "ProjectName", "TotalHours", "hours", {
    action: "dashboard-project",
    valueKey: "ProjectName"
  });
  renderBarChart(hoursByTechnicianChart, chartRows.HoursByTechnician, "TechnicianName", "TotalHours", "hours", {
    action: "dashboard-technician",
    valueKey: "TechnicianName"
  });
}

function getCurrentMonthDateRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();

  return {
    from: `${year}-${String(month).padStart(2, "0")}-01`,
    to: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
  };
}

function getDashboardDetailTitle(detailType) {
  const titles = {
    clients: currentLanguage === "es" ? "Clientes activos" : "Active Clients",
    "current-month": currentLanguage === "es" ? "Registros de servicio del mes actual" : "Current Month Service Records",
    pending: currentLanguage === "es" ? "Horas pendientes" : "Pending Hours",
    processed: currentLanguage === "es" ? "Horas procesadas" : "Processed Hours",
    projects: currentLanguage === "es" ? "Resumen de proyectos" : "Projects Summary",
    records: currentLanguage === "es" ? "Registros de servicio recientes" : "Latest Service Records"
  };

  return titles[detailType] || (currentLanguage === "es" ? "Detalle" : "Detail");
}

function showDashboardDetailLoading(detailType) {
  dashboardDetailPanel.classList.remove("hidden");
  dashboardDetailTitle.textContent = getDashboardDetailTitle(detailType);
  dashboardDetailMessage.textContent = currentLanguage === "es" ? "Cargando detalle..." : "Loading detail...";
  dashboardDetailHeaderRow.innerHTML = "";
  dashboardDetailTableBody.innerHTML = "";
  scrollDashboardDetailIntoView();
}

function scrollDashboardDetailIntoView() {
  if (!dashboardDetailPanel) return;

  dashboardDetailPanel.classList.remove("detail-panel-highlight");
  void dashboardDetailPanel.offsetWidth;
  dashboardDetailPanel.classList.add("detail-panel-highlight");
  dashboardDetailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openDashboardDetailPanel(title, message = "") {
  dashboardDetailPanel.classList.remove("hidden");
  dashboardDetailTitle.textContent = title;
  dashboardDetailMessage.textContent = message;
}

function renderDashboardDetailTable(headers, rows, emptyMessage) {
  dashboardDetailHeaderRow.innerHTML = headers.map((header) => `<th>${escapeHTML(header)}</th>`).join("");

  if (!rows.length) {
    dashboardDetailTableBody.innerHTML = `
      <tr>
        <td colspan="${Math.max(headers.length, 1)}" class="empty-state">${escapeHTML(emptyMessage)}</td>
      </tr>
    `;
    return;
  }

  dashboardDetailTableBody.innerHTML = rows.join("");
}

function renderDashboardServiceRecordDetail(records, variant = "full") {
  const headers = variant === "status"
    ? [
      currentLanguage === "es" ? "Proyecto" : "Project",
      currentLanguage === "es" ? "Cliente" : "Client",
      currentLanguage === "es" ? "Tecnico" : "Technician",
      currentLanguage === "es" ? "Fecha" : "Date",
      currentLanguage === "es" ? "Horas" : "Hours",
      currentLanguage === "es" ? "Descripcion" : "Description"
    ]
    : [
      currentLanguage === "es" ? "Fecha" : "Date",
      currentLanguage === "es" ? "Tecnico" : "Technician",
      currentLanguage === "es" ? "Cliente" : "Client",
      currentLanguage === "es" ? "Proyecto" : "Project",
      currentLanguage === "es" ? "Horas" : "Hours",
      currentLanguage === "es" ? "Estado" : "Status",
      currentLanguage === "es" ? "Descripcion" : "Description"
    ];
  const rows = records.map((record) => variant === "status" ? `
    <tr>
      <td>${escapeHTML(record.ProjectName || "")}</td>
      <td>${escapeHTML(record.ClientName || "")}</td>
      <td>${escapeHTML(record.TechnicianName || "")}</td>
      <td>${escapeHTML(formatDateOnly(record.ServiceDate))}</td>
      <td>${formatNumber(record.TotalHours)}</td>
      <td class="ticket-description">${escapeHTML(cleanDisplayText(record.ServiceDescription))}</td>
    </tr>
  ` : `
    <tr>
      <td>${escapeHTML(formatDateOnly(record.ServiceDate))}</td>
      <td>${escapeHTML(record.TechnicianName || "")}</td>
      <td>${escapeHTML(record.ClientName || "")}</td>
      <td>${escapeHTML(record.ProjectName || "")}</td>
      <td>${formatNumber(record.TotalHours)}</td>
      <td><span class="badge ${getServiceRecordStatusClass(record.Status)}">${escapeHTML(translateServiceRecordStatus(record.Status))}</span></td>
      <td class="ticket-description">${escapeHTML(cleanDisplayText(record.ServiceDescription))}</td>
    </tr>
  `);

  renderDashboardDetailTable(headers, rows, currentLanguage === "es" ? "No hay registros para mostrar." : "No records to display.");
}

function renderDashboardProjectsDetail(projectRows) {
  const headers = [
    currentLanguage === "es" ? "Proyecto" : "Project",
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Horas usadas" : "Used hours",
    currentLanguage === "es" ? "Horas restantes" : "Remaining hours",
    currentLanguage === "es" ? "Estado contrato" : "Contract status",
    currentLanguage === "es" ? "Fin contrato" : "Contract end date"
  ];
  const rows = projectRows.map((project) => `
    <tr>
      <td>${escapeHTML(project.ProjectName || "")}</td>
      <td>${escapeHTML(project.ClientName || "")}</td>
      <td>${formatProjectHours(project.UsedHours)}</td>
      <td>${formatProjectHours(project.RemainingHours)}</td>
      <td>${renderContractBadge(project.ContractStatus)}</td>
      <td>${escapeHTML(formatDateOnly(project.ContractEndDate) || "-")}</td>
    </tr>
  `);

  renderDashboardDetailTable(headers, rows, currentLanguage === "es" ? "No hay proyectos para mostrar." : "No projects to display.");
}

function renderDashboardClientsDetail(records) {
  const rowsByClient = new Map();

  records.forEach((record) => {
    const key = normalizeDashboardKey(record.ClientName);
    const existing = rowsByClient.get(key) || {
      ClientName: record.ClientName || "",
      TotalHours: 0,
      TotalRecords: 0,
      TotalProjects: new Set(),
      LastServiceDate: ""
    };

    existing.TotalHours += Number(record.TotalHours || 0);
    existing.TotalRecords += 1;
    if (record.ProjectName) existing.TotalProjects.add(normalizeDashboardKey(record.ProjectName));
    if (!existing.LastServiceDate || String(record.ServiceDate || "") > existing.LastServiceDate) {
      existing.LastServiceDate = String(record.ServiceDate || "");
    }
    rowsByClient.set(key, existing);
  });

  const headers = [
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Proyectos activos" : "Active projects",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Registros" : "Records",
    currentLanguage === "es" ? "Ultima fecha" : "Last date"
  ];
  const rows = Array.from(rowsByClient.values())
    .sort(sortDashboardClientRows)
    .map((client) => `
      <tr>
        <td>${escapeHTML(client.ClientName || "")}</td>
        <td>${formatNumber(client.TotalProjects.size, 0)}</td>
        <td>${formatNumber(client.TotalHours)}</td>
        <td>${formatNumber(client.TotalRecords, 0)}</td>
        <td>${escapeHTML(formatDateOnly(client.LastServiceDate) || "-")}</td>
      </tr>
    `);

  renderDashboardDetailTable(headers, rows, currentLanguage === "es" ? "No hay clientes activos para mostrar." : "No active clients to display.");
}

function renderDashboardClientBarDetail(clientName) {
  const records = getDashboardActiveServiceRecords()
    .filter((record) => normalizeDashboardKey(record.ClientName) === normalizeDashboardKey(clientName));
  const rowsByProject = new Map();

  records.forEach((record) => {
    const key = normalizeDashboardKey(record.ProjectName);
    const existing = rowsByProject.get(key) || {
      ProjectName: record.ProjectName || "",
      ClientName: record.ClientName || "",
      TotalHours: 0,
      TotalRecords: 0,
      LastServiceDate: ""
    };

    existing.TotalHours += Number(record.TotalHours || 0);
    existing.TotalRecords += 1;
    if (!existing.LastServiceDate || String(record.ServiceDate || "") > existing.LastServiceDate) {
      existing.LastServiceDate = String(record.ServiceDate || "");
    }
    rowsByProject.set(key, existing);
  });

  const headers = [
    currentLanguage === "es" ? "Proyecto" : "Project",
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Registros" : "Records",
    currentLanguage === "es" ? "Ultima fecha" : "Last date"
  ];
  const rows = Array.from(rowsByProject.values())
    .sort(sortDashboardProjectRows)
    .map((project) => `
      <tr>
        <td>${escapeHTML(project.ProjectName || "")}</td>
        <td>${escapeHTML(project.ClientName || "")}</td>
        <td>${formatNumber(project.TotalHours)}</td>
        <td>${formatNumber(project.TotalRecords, 0)}</td>
        <td>${escapeHTML(formatDateOnly(project.LastServiceDate) || "-")}</td>
      </tr>
    `);

  dashboardDetailPanel.classList.remove("hidden");
  dashboardDetailTitle.textContent = currentLanguage === "es" ? `Cliente: ${clientName}` : `Client: ${clientName}`;
  dashboardDetailMessage.textContent = "";
  renderDashboardDetailTable(headers, rows, currentLanguage === "es" ? "No hay proyectos activos para este cliente." : "No active projects for this client.");
}

function renderDashboardProjectBarDetail(projectName) {
  const records = getDashboardActiveServiceRecords()
    .filter((record) => normalizeDashboardKey(record.ProjectName) === normalizeDashboardKey(projectName));
  const totalHours = sumDashboardHours(records);
  const clientName = records[0]?.ClientName || "";
  const headers = [
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Proyecto" : "Project",
    currentLanguage === "es" ? "Fecha" : "Date",
    currentLanguage === "es" ? "Tecnico" : "Technician",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Estado" : "Status",
    currentLanguage === "es" ? "Descripcion" : "Description"
  ];
  const rows = records.slice(0, 20).map((record) => `
    <tr>
      <td>${escapeHTML(record.ClientName || "")}</td>
      <td>${escapeHTML(record.ProjectName || "")}</td>
      <td>${escapeHTML(formatDateOnly(record.ServiceDate))}</td>
      <td>${escapeHTML(record.TechnicianName || "")}</td>
      <td>${formatNumber(record.TotalHours)}</td>
      <td><span class="badge ${getServiceRecordStatusClass(record.Status)}">${escapeHTML(translateServiceRecordStatus(record.Status))}</span></td>
      <td class="ticket-description">${escapeHTML(cleanDisplayText(record.ServiceDescription))}</td>
    </tr>
  `);

  dashboardDetailPanel.classList.remove("hidden");
  dashboardDetailTitle.textContent = currentLanguage === "es" ? `Proyecto: ${projectName}` : `Project: ${projectName}`;
  dashboardDetailMessage.textContent = `${clientName}${clientName ? " · " : ""}${formatDashboardMetric(totalHours, "hours")} · ${formatNumber(records.length, 0)} ${currentLanguage === "es" ? "registros" : "records"}`;
  renderDashboardDetailTable(headers, rows, currentLanguage === "es" ? "No hay registros activos para este proyecto." : "No active records for this project.");
}

function getDashboardLastServiceDate(records) {
  return records.reduce((latest, record) => {
    const serviceDate = String(record.ServiceDate || "");
    return serviceDate > latest ? serviceDate : latest;
  }, "");
}

function getDashboardTechnicianProjectDetailHeaders() {
  return [
    currentLanguage === "es" ? "Tecnico" : "Technician",
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Proyecto" : "Project",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Registros" : "Records",
    currentLanguage === "es" ? "Ultima fecha" : "Last date"
  ];
}

function getDashboardTechnicianProjectDetailRows(records) {
  const rowsByTechnicianProject = new Map();

  records.forEach((record) => {
    const key = normalizeDashboardKey(`${record.TechnicianName}|${record.ClientName}|${record.ProjectName}`);
    const existing = rowsByTechnicianProject.get(key) || {
      TechnicianName: record.TechnicianName || "",
      ClientName: record.ClientName || "",
      ProjectName: record.ProjectName || "",
      TotalHours: 0,
      TotalRecords: 0,
      LastServiceDate: ""
    };

    existing.TotalHours += Number(record.TotalHours || 0);
    existing.TotalRecords += 1;
    if (!existing.LastServiceDate || String(record.ServiceDate || "") > existing.LastServiceDate) {
      existing.LastServiceDate = String(record.ServiceDate || "");
    }
    rowsByTechnicianProject.set(key, existing);
  });

  return Array.from(rowsByTechnicianProject.values())
    .sort((a, b) => b.TotalHours - a.TotalHours || String(a.TechnicianName).localeCompare(String(b.TechnicianName)));
}

function getDashboardProjectRows(records) {
  const rowsByProject = new Map();

  records.forEach((record) => {
    const key = normalizeDashboardKey(`${record.ProjectName}|${record.ClientName}`);
    const existing = rowsByProject.get(key) || {
      ProjectName: record.ProjectName || "",
      ClientName: record.ClientName || "",
      TotalHours: 0,
      TotalRecords: 0,
      LastServiceDate: "",
      Technicians: new Set()
    };

    existing.TotalHours += Number(record.TotalHours || 0);
    existing.TotalRecords += 1;
    if (record.TechnicianName) existing.Technicians.add(record.TechnicianName);
    if (!existing.LastServiceDate || String(record.ServiceDate || "") > existing.LastServiceDate) {
      existing.LastServiceDate = String(record.ServiceDate || "");
    }
    rowsByProject.set(key, existing);
  });

  return Array.from(rowsByProject.values())
    .sort((a, b) => b.TotalHours - a.TotalHours || String(a.ProjectName).localeCompare(String(b.ProjectName)));
}

function getDashboardClientRows(records) {
  const rowsByClient = new Map();

  records.forEach((record) => {
    const key = normalizeDashboardKey(record.ClientName);
    const existing = rowsByClient.get(key) || {
      ClientName: record.ClientName || "",
      TotalHours: 0,
      TotalRecords: 0,
      LastServiceDate: "",
      Projects: new Set()
    };

    existing.TotalHours += Number(record.TotalHours || 0);
    existing.TotalRecords += 1;
    if (record.ProjectName) existing.Projects.add(record.ProjectName);
    if (!existing.LastServiceDate || String(record.ServiceDate || "") > existing.LastServiceDate) {
      existing.LastServiceDate = String(record.ServiceDate || "");
    }
    rowsByClient.set(key, existing);
  });

  return Array.from(rowsByClient.values())
    .sort((a, b) => b.TotalHours - a.TotalHours || String(a.ClientName).localeCompare(String(b.ClientName)));
}

function renderDashboardDetailSection(label, colspan = 6) {
  return `<tr class="detail-section-row"><td colspan="${colspan}">${escapeHTML(label)}</td></tr>`;
}

function renderDashboardDetailSubheader(headers, colspan = headers.length) {
  const filler = headers.length < colspan ? `<th colspan="${colspan - headers.length}"></th>` : "";
  return `<tr class="detail-subheader-row">${headers.map((header) => `<th>${escapeHTML(header)}</th>`).join("")}${filler}</tr>`;
}

function renderDashboardServiceRecordRows(records, columns) {
  return records.map((record) => `
    <tr>
      ${columns.includes("date") ? `<td>${escapeHTML(formatDateOnly(record.ServiceDate))}</td>` : ""}
      ${columns.includes("technician") ? `<td>${escapeHTML(record.TechnicianName || "")}</td>` : ""}
      ${columns.includes("client") ? `<td>${escapeHTML(record.ClientName || "")}</td>` : ""}
      ${columns.includes("project") ? `<td>${escapeHTML(record.ProjectName || "")}</td>` : ""}
      ${columns.includes("hours") ? `<td>${formatNumber(record.TotalHours)}</td>` : ""}
      ${columns.includes("status") ? `<td><span class="badge ${getServiceRecordStatusClass(record.Status)}">${escapeHTML(translateServiceRecordStatus(record.Status))}</span></td>` : ""}
      ${columns.includes("description") ? `<td class="ticket-description">${escapeHTML(cleanDisplayText(record.ServiceDescription))}</td>` : ""}
    </tr>
  `);
}

function renderDashboardTechnicianProjectDetailRow(row) {
  return `
    <tr>
      <td>${escapeHTML(row.TechnicianName || "")}</td>
      <td>${escapeHTML(row.ClientName || "")}</td>
      <td>${escapeHTML(row.ProjectName || "")}</td>
      <td>${formatNumber(row.TotalHours)}</td>
      <td>${formatNumber(row.TotalRecords, 0)}</td>
      <td>${escapeHTML(formatDateOnly(row.LastServiceDate) || "-")}</td>
    </tr>
  `;
}

function renderDashboardClientBarDetail(clientName) {
  const records = getDashboardActiveServiceRecords()
    .filter((record) => normalizeDashboardKey(record.ClientName) === normalizeDashboardKey(clientName));
  const totalHours = sumDashboardHours(records);
  const projectCount = new Set(records.map((record) => normalizeDashboardKey(record.ProjectName))).size;
  const technicianCount = new Set(records.map((record) => normalizeDashboardKey(record.TechnicianName))).size;
  const lastServiceDate = getDashboardLastServiceDate(records);
  const rows = getDashboardTechnicianProjectDetailRows(records).map(renderDashboardTechnicianProjectDetailRow);

  dashboardDetailPanel.classList.remove("hidden");
  dashboardDetailTitle.textContent = currentLanguage === "es" ? `Cliente: ${clientName}` : `Client: ${clientName}`;
  dashboardDetailMessage.textContent = `${formatNumber(projectCount, 0)} ${currentLanguage === "es" ? "proyectos" : "projects"} · ${formatNumber(technicianCount, 0)} ${currentLanguage === "es" ? "tecnicos" : "technicians"} · ${formatDashboardMetric(totalHours, "hours")} · ${formatNumber(records.length, 0)} ${currentLanguage === "es" ? "registros" : "records"} · ${currentLanguage === "es" ? "Ultima fecha" : "Last date"}: ${formatDateOnly(lastServiceDate) || "-"}`;
  renderDashboardDetailTable(getDashboardTechnicianProjectDetailHeaders(), rows, currentLanguage === "es" ? "No hay proyectos activos para este cliente." : "No active projects for this client.");
  scrollDashboardDetailIntoView();
}

function renderDashboardProjectBarDetail(projectName) {
  const records = getDashboardActiveServiceRecords()
    .filter((record) => normalizeDashboardKey(record.ProjectName) === normalizeDashboardKey(projectName));
  const totalHours = sumDashboardHours(records);
  const clientName = records[0]?.ClientName || "";
  const technicianCount = new Set(records.map((record) => normalizeDashboardKey(record.TechnicianName))).size;
  const lastServiceDate = getDashboardLastServiceDate(records);
  const technicianRows = getDashboardTechnicianProjectDetailRows(records).map(renderDashboardTechnicianProjectDetailRow);
  const serviceRecordHeaders = [
    currentLanguage === "es" ? "Fecha" : "Date",
    currentLanguage === "es" ? "Tecnico" : "Technician",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Estado" : "Status",
    currentLanguage === "es" ? "Descripcion" : "Description"
  ];
  const serviceRecordRows = records.slice(0, 10).map((record) => `
    <tr>
      <td>${escapeHTML(formatDateOnly(record.ServiceDate))}</td>
      <td>${escapeHTML(record.TechnicianName || "")}</td>
      <td>${formatNumber(record.TotalHours)}</td>
      <td><span class="badge ${getServiceRecordStatusClass(record.Status)}">${escapeHTML(translateServiceRecordStatus(record.Status))}</span></td>
      <td class="ticket-description">${escapeHTML(cleanDisplayText(record.ServiceDescription))}</td>
      <td></td>
    </tr>
  `);
  const rows = [
    ...technicianRows,
    `<tr class="detail-section-row"><td colspan="6">${escapeHTML(currentLanguage === "es" ? "Ultimos registros de servicio relacionados" : "Latest related service records")}</td></tr>`,
    `<tr class="detail-subheader-row">${serviceRecordHeaders.map((header) => `<th>${escapeHTML(header)}</th>`).join("")}<th></th></tr>`,
    ...serviceRecordRows
  ];

  dashboardDetailPanel.classList.remove("hidden");
  dashboardDetailTitle.textContent = currentLanguage === "es" ? `Proyecto: ${projectName}` : `Project: ${projectName}`;
  dashboardDetailMessage.textContent = `${clientName}${clientName ? " · " : ""}${formatNumber(technicianCount, 0)} ${currentLanguage === "es" ? "tecnicos" : "technicians"} · ${formatDashboardMetric(totalHours, "hours")} · ${formatNumber(records.length, 0)} ${currentLanguage === "es" ? "registros" : "records"} · ${currentLanguage === "es" ? "Ultima fecha" : "Last date"}: ${formatDateOnly(lastServiceDate) || "-"}`;
  renderDashboardDetailTable(getDashboardTechnicianProjectDetailHeaders(), rows, currentLanguage === "es" ? "No hay registros activos para este proyecto." : "No active records for this project.");
  scrollDashboardDetailIntoView();
}

function renderDashboardClientBarDetail(clientName) {
  const records = getDashboardActiveServiceRecords()
    .filter((record) => normalizeDashboardKey(record.ClientName) === normalizeDashboardKey(clientName));
  const totalHours = sumDashboardHours(records);
  const projectRows = getDashboardProjectRows(records);
  const technicianCount = new Set(records.map((record) => normalizeDashboardKey(record.TechnicianName))).size;
  const lastServiceDate = getDashboardLastServiceDate(records);
  const headers = [
    currentLanguage === "es" ? "Proyecto" : "Project",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Tecnicos" : "Technicians",
    currentLanguage === "es" ? "Registros" : "Records",
    currentLanguage === "es" ? "Ultima actividad" : "Last activity",
    currentLanguage === "es" ? "Cliente" : "Client"
  ];
  const rows = projectRows.map((project) => `
    <tr>
      <td>${escapeHTML(project.ProjectName || "")}</td>
      <td>${formatNumber(project.TotalHours)}</td>
      <td>${escapeHTML(Array.from(project.Technicians).filter(Boolean).join(", ") || "-")}</td>
      <td>${formatNumber(project.TotalRecords, 0)}</td>
      <td>${escapeHTML(formatDateOnly(project.LastServiceDate) || "-")}</td>
      <td>${escapeHTML(project.ClientName || clientName || "")}</td>
    </tr>
  `);

  openDashboardDetailPanel(
    currentLanguage === "es" ? `Cliente: ${clientName}` : `Client: ${clientName}`,
    `${formatNumber(projectRows.length, 0)} ${currentLanguage === "es" ? "proyectos activos" : "active projects"} · ${formatNumber(technicianCount, 0)} ${currentLanguage === "es" ? "tecnicos" : "technicians"} · ${formatDashboardMetric(totalHours, "hours")} · ${formatNumber(records.length, 0)} ${currentLanguage === "es" ? "registros" : "records"} · ${currentLanguage === "es" ? "Ultima actividad" : "Last activity"}: ${formatDateOnly(lastServiceDate) || "-"}`
  );
  renderDashboardDetailTable(headers, rows, currentLanguage === "es" ? "No hay proyectos activos para este cliente." : "No active projects for this client.");
  scrollDashboardDetailIntoView();
}

function renderDashboardProjectBarDetail(projectName) {
  const records = getDashboardActiveServiceRecords()
    .filter((record) => normalizeDashboardKey(record.ProjectName) === normalizeDashboardKey(projectName));
  const totalHours = sumDashboardHours(records);
  const clientName = records[0]?.ClientName || "";
  const technicianCount = new Set(records.map((record) => normalizeDashboardKey(record.TechnicianName))).size;
  const lastServiceDate = getDashboardLastServiceDate(records);
  const technicianRows = getDashboardTechnicianProjectDetailRows(records).map(renderDashboardTechnicianProjectDetailRow);
  const recordHeaders = [
    currentLanguage === "es" ? "Fecha" : "Date",
    currentLanguage === "es" ? "Tecnico" : "Technician",
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Estado" : "Status",
    currentLanguage === "es" ? "Descripcion" : "Description"
  ];
  const recordRows = renderDashboardServiceRecordRows(records.slice(0, 10), ["date", "technician", "client", "hours", "status", "description"]);
  const rows = [
    ...technicianRows,
    renderDashboardDetailSection(currentLanguage === "es" ? "Ultimos registros de servicio relacionados" : "Latest related service records"),
    renderDashboardDetailSubheader(recordHeaders, 6),
    ...recordRows
  ];

  openDashboardDetailPanel(
    currentLanguage === "es" ? `Proyecto: ${projectName}` : `Project: ${projectName}`,
    `${clientName}${clientName ? " · " : ""}${formatNumber(technicianCount, 0)} ${currentLanguage === "es" ? "tecnicos asignados" : "assigned technicians"} · ${formatDashboardMetric(totalHours, "hours")} · ${formatNumber(records.length, 0)} ${currentLanguage === "es" ? "registros" : "records"} · ${currentLanguage === "es" ? "Ultima actividad" : "Last activity"}: ${formatDateOnly(lastServiceDate) || "-"}`
  );
  renderDashboardDetailTable(getDashboardTechnicianProjectDetailHeaders(), rows, currentLanguage === "es" ? "No hay registros activos para este proyecto." : "No active records for this project.");
  scrollDashboardDetailIntoView();
}

function renderDashboardMonthBarDetail(month) {
  const records = getDashboardActiveServiceRecords()
    .filter((record) => String(record.ServiceDate || "").slice(0, 7) === String(month));
  const totalHours = sumDashboardHours(records);
  const projectCount = new Set(records.map((record) => normalizeDashboardKey(record.ProjectName))).size;
  const clientCount = new Set(records.map((record) => normalizeDashboardKey(record.ClientName))).size;
  const technicianCount = new Set(records.map((record) => normalizeDashboardKey(record.TechnicianName))).size;
  const headers = [
    currentLanguage === "es" ? "Fecha" : "Date",
    currentLanguage === "es" ? "Tecnico" : "Technician",
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Proyecto" : "Project",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Estado" : "Status",
    currentLanguage === "es" ? "Descripcion" : "Description"
  ];

  openDashboardDetailPanel(
    currentLanguage === "es" ? `Mes: ${month}` : `Month: ${month}`,
    `${formatDashboardMetric(totalHours, "hours")} · ${formatNumber(records.length, 0)} ${currentLanguage === "es" ? "registros" : "records"} · ${formatNumber(projectCount, 0)} ${currentLanguage === "es" ? "proyectos" : "projects"} · ${formatNumber(clientCount, 0)} ${currentLanguage === "es" ? "clientes" : "clients"} · ${formatNumber(technicianCount, 0)} ${currentLanguage === "es" ? "tecnicos" : "technicians"}`
  );
  renderDashboardDetailTable(headers, renderDashboardServiceRecordRows(records.slice(0, 20), ["date", "technician", "client", "project", "hours", "status", "description"]), currentLanguage === "es" ? "No hay registros activos para este mes." : "No active records for this month.");
  scrollDashboardDetailIntoView();
}

function renderDashboardTechnicianBarDetail(technicianName) {
  const records = getDashboardActiveServiceRecords()
    .filter((record) => normalizeDashboardKey(record.TechnicianName) === normalizeDashboardKey(technicianName));
  const totalHours = sumDashboardHours(records);
  const projectRows = getDashboardProjectRows(records);
  const clientRows = getDashboardClientRows(records);
  const lastServiceDate = getDashboardLastServiceDate(records);
  const projectHeaders = [
    currentLanguage === "es" ? "Proyecto" : "Project",
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Registros" : "Records",
    currentLanguage === "es" ? "Ultima actividad" : "Last activity",
    currentLanguage === "es" ? "Tecnico" : "Technician"
  ];
  const clientHeaders = [
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Proyectos" : "Projects",
    currentLanguage === "es" ? "Registros" : "Records",
    currentLanguage === "es" ? "Ultima actividad" : "Last activity",
    currentLanguage === "es" ? "Tecnico" : "Technician"
  ];
  const recordHeaders = [
    currentLanguage === "es" ? "Fecha" : "Date",
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Proyecto" : "Project",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Estado" : "Status",
    currentLanguage === "es" ? "Descripcion" : "Description"
  ];
  const rows = [
    renderDashboardDetailSection(currentLanguage === "es" ? "Horas por proyecto" : "Hours by project"),
    renderDashboardDetailSubheader(projectHeaders, 6),
    ...projectRows.map((project) => `
      <tr>
        <td>${escapeHTML(project.ProjectName || "")}</td>
        <td>${escapeHTML(project.ClientName || "")}</td>
        <td>${formatNumber(project.TotalHours)}</td>
        <td>${formatNumber(project.TotalRecords, 0)}</td>
        <td>${escapeHTML(formatDateOnly(project.LastServiceDate) || "-")}</td>
        <td>${escapeHTML(technicianName)}</td>
      </tr>
    `),
    renderDashboardDetailSection(currentLanguage === "es" ? "Horas por cliente" : "Hours by client"),
    renderDashboardDetailSubheader(clientHeaders, 6),
    ...clientRows.map((client) => `
      <tr>
        <td>${escapeHTML(client.ClientName || "")}</td>
        <td>${formatNumber(client.TotalHours)}</td>
        <td>${escapeHTML(Array.from(client.Projects).filter(Boolean).join(", ") || "-")}</td>
        <td>${formatNumber(client.TotalRecords, 0)}</td>
        <td>${escapeHTML(formatDateOnly(client.LastServiceDate) || "-")}</td>
        <td>${escapeHTML(technicianName)}</td>
      </tr>
    `),
    renderDashboardDetailSection(currentLanguage === "es" ? "Ultimos registros de servicio" : "Latest service records"),
    renderDashboardDetailSubheader(recordHeaders, 6),
    ...renderDashboardServiceRecordRows(records.slice(0, 12), ["date", "client", "project", "hours", "status", "description"])
  ];

  openDashboardDetailPanel(
    currentLanguage === "es" ? `Tecnico: ${technicianName}` : `Technician: ${technicianName}`,
    `${formatDashboardMetric(totalHours, "hours")} · ${formatNumber(projectRows.length, 0)} ${currentLanguage === "es" ? "proyectos" : "projects"} · ${formatNumber(clientRows.length, 0)} ${currentLanguage === "es" ? "clientes" : "clients"} · ${formatNumber(records.length, 0)} ${currentLanguage === "es" ? "registros" : "records"} · ${currentLanguage === "es" ? "Ultima actividad" : "Last activity"}: ${formatDateOnly(lastServiceDate) || "-"}`
  );
  renderDashboardDetailTable(getDashboardTechnicianProjectDetailHeaders(), rows, currentLanguage === "es" ? "No hay registros activos para este tecnico." : "No active records for this technician.");
  scrollDashboardDetailIntoView();
}

async function fetchDashboardServiceHours(params = "") {
  const response = await fetch(`/api/reports/service-hours${params ? `?${params}` : ""}`, {
    cache: "no-store"
  });
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(translateServerMessage(data.message) || t("dashboardLoadError"));
  }

  return Array.isArray(data) ? data : [];
}

async function showDashboardDetail(detailType) {
  showDashboardDetailLoading(detailType);

  try {
    if (detailType === "clients") {
      renderDashboardClientsDetail(getDashboardActiveServiceRecords());
      dashboardDetailMessage.textContent = "";
      return;
    }

    if (detailType === "projects") {
      const response = await fetch("/api/projects", { cache: "no-store" });
      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(translateServerMessage(data.message) || t("loadProjectsError"));
      }

      renderDashboardProjectsDetail(Array.isArray(data) ? data.filter(isDashboardProjectActive) : []);
      dashboardDetailMessage.textContent = "";
      return;
    }

    const params = new URLSearchParams();

    if (detailType === "current-month") {
      const range = getCurrentMonthDateRange();
      params.set("from", range.from);
      params.set("to", range.to);
    }

    if (detailType === "pending") {
      params.set("status", "Recorded");
    }

    if (detailType === "processed") {
      params.set("status", "Billed");
    }

    const records = getDashboardActiveServiceRecords(await fetchDashboardServiceHours(params.toString()));
    const visibleRecords = detailType === "records" ? records.slice(0, 20) : records;

    renderDashboardServiceRecordDetail(visibleRecords, detailType === "pending" || detailType === "processed" ? "status" : "full");
    dashboardDetailMessage.textContent = "";
  } catch (error) {
    console.error(error);
    dashboardDetailMessage.textContent = error.message || t("dashboardLoadError");
    renderDashboardDetailTable([], [], "");
  }
}

function closeDashboardDetail() {
  dashboardDetailPanel.classList.add("hidden");
  dashboardDetailTitle.textContent = "";
  dashboardDetailMessage.textContent = "";
  dashboardDetailHeaderRow.innerHTML = "";
  dashboardDetailTableBody.innerHTML = "";
}

function handleDashboardCardAction(event) {
  const card = event.target.closest("[data-dashboard-detail]");

  if (!card) return;

  showDashboardDetail(card.dataset.dashboardDetail);
}

function handleDashboardCardKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;

  const card = event.target.closest("[data-dashboard-detail]");

  if (!card) return;

  event.preventDefault();
  showDashboardDetail(card.dataset.dashboardDetail);
}

function renderBarChart(container, rows = [], labelKey, valueKey, valueType, options = {}) {
  if (!container) return;

  if (!rows || rows.length === 0) {
    container.innerHTML = `<p class="empty-state">${escapeHTML(t("noDashboardData"))}</p>`;
    return;
  }

  const maxValue = Math.max(...rows.map((row) => Number(row[valueKey] || 0)), 1);
  container.innerHTML = rows.slice(0, 8).map((row) => {
    const value = Number(row[valueKey] || 0);
    const width = Math.max((value / maxValue) * 100, value > 0 ? 6 : 0);
    const label = String(row[labelKey] || "");
    const content = `
      <div class="bar-row-header">
        <span>${escapeHTML(label)}</span>
        <strong>${formatDashboardMetric(value, valueType)}</strong>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width: ${width}%"></div></div>
    `;

    if (options.action) {
      return `
        <button type="button" class="bar-row interactive-bar-row" data-dashboard-bar-action="${escapeHTML(options.action)}" data-value="${escapeHTML(String(row[options.valueKey || labelKey] || ""))}">
          ${content}
        </button>
      `;
    }

    return `
      <div class="bar-row">
        ${content}
      </div>
    `;
  }).join("");
}

function handleDashboardBarClick(event) {
  const button = event.target.closest("[data-dashboard-bar-action]");
  if (!button) return;

  const value = button.dataset.value || "";

  if (button.dataset.dashboardBarAction === "dashboard-client") {
    renderDashboardClientBarDetail(value);
  }

  if (button.dataset.dashboardBarAction === "dashboard-project") {
    renderDashboardProjectBarDetail(value);
  }

  if (button.dataset.dashboardBarAction === "dashboard-month") {
    renderDashboardMonthBarDetail(value);
  }

  if (button.dataset.dashboardBarAction === "dashboard-technician") {
    renderDashboardTechnicianBarDetail(value);
  }
}

function renderDashboardRecentActivity() {
  renderActivityList(recentServiceRecordsList, getDashboardActiveServiceRecords(dashboardRecentActivity?.ServiceRecords || []), renderServiceRecordActivity);
  renderActivityList(recentClientsList, getDashboardActiveActivityClients(), renderClientActivity);
  renderActivityList(recentProjectsList, getDashboardActiveActivityProjects(), renderProjectActivity);
}

function getDashboardActiveActivityClients() {
  const clientRefs = getActiveDashboardClientRefs();

  return (dashboardRecentActivity?.Clients || []).filter((client) => (
    clientRefs.ids.has(Number(client.ClientID)) || clientRefs.names.has(normalizeDashboardKey(client.ClientName))
  ));
}

function getDashboardActiveActivityProjects() {
  const projectRefs = getActiveDashboardProjectRefs();

  return (dashboardRecentActivity?.Projects || []).filter((project) => (
    projectRefs.ids.has(Number(project.ProjectID))
      || projectRefs.names.has(normalizeDashboardKey(`${project.ProjectName}|${project.ClientName}`))
  ));
}

function renderActivityList(container, rows = [], renderer) {
  if (!container) return;

  container.innerHTML = rows && rows.length
    ? rows.slice(0, 6).map(renderer).join("")
    : `<p class="empty-state">${escapeHTML(t("noDashboardData"))}</p>`;
}

function renderServiceRecordActivity(record) {
  return `
    <article class="notification-item">
      <strong>${escapeHTML(record.ClientName || "")} · ${escapeHTML(record.ProjectName || "")}</strong>
      <span>${escapeHTML(record.TechnicianName || "")} · ${formatDateOnly(record.ServiceDate)} · ${formatNumber(record.TotalHours)}h · ${escapeHTML(translateServiceRecordStatus(record.Status))}</span>
    </article>
  `;
}

function renderInvoiceActivity(invoice) {
  return `
    <article class="notification-item">
      <strong>${escapeHTML(invoice.InvoiceNumber || "")} · ${escapeHTML(invoice.ClientName || "")}</strong>
      <span>${formatDateOnly(invoice.InvoiceDate)} · ${escapeHTML(translateInvoiceStatus(invoice.Status))}</span>
    </article>
  `;
}

function renderClientActivity(client) {
  return `
    <article class="notification-item">
      <strong>${escapeHTML(client.ClientName || "")}</strong>
      <span>${escapeHTML(client.ContactName || client.Email || client.Phone || "")}</span>
    </article>
  `;
}

function renderProjectActivity(project) {
  return `
    <article class="notification-item">
      <strong>${escapeHTML(project.ProjectName || "")}</strong>
      <span>${escapeHTML(project.ClientName || "")}</span>
    </article>
  `;
}

function t(key) {
  return translations[currentLanguage][key] || translations.es[key] || key;
}

function tNested(group, key) {
  return translations[currentLanguage][group]?.[key] || translations.es[group]?.[key] || key;
}

function labelText(esText, enText) {
  return currentLanguage === "es" ? esText : enText;
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

function translateServiceRecordStatus(status) {
  return tNested("serviceRecordStatuses", status);
}

function translateInvoiceStatus(status) {
  return tNested("invoiceStatuses", status);
}

function translateContractStatus(status) {
  return tNested("contractStatuses", status || "NO_CONTRACT");
}

function translateContractType(type) {
  return tNested("contractTypes", type || "");
}

function translatePriority(priority) {
  return tNested("priorities", priority);
}

function translateNotificationType(type) {
  return tNested("notificationTypes", type);
}

function translateNotificationMessage(message) {
  const prefixes = {
    "Ticket creado": currentLanguage === "es" ? "Registro de servicio creado" : "Service record created",
    "Ticket cerrado": currentLanguage === "es" ? "Registro de servicio cerrado" : "Service record closed",
    "Ticket eliminado": currentLanguage === "es" ? "Registro de servicio eliminado" : "Service record deleted",
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
  if (!message) {
    return message;
  }

  if (currentLanguage === "es") {
    const spanishMessages = {
      "Email y password son obligatorios.": "Email y contrasena son obligatorios.",
      "Error al obtener tickets.": "Error al cargar registros.",
      "Error al crear ticket.": "Error al crear registro.",
      "Error al editar ticket.": "Error al editar registro.",
      "Error al cerrar ticket.": "Error al cerrar registro.",
      "Error al eliminar ticket.": "Error al eliminar registro."
    };

    return spanishMessages[message] || message;
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
    "Error al borrar notificacion.": "Error deleting notification.",
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
    "Error al obtener tickets.": "Error loading records.",
    "Error al crear ticket.": "Error creating record.",
    "ID de ticket invalido.": "Invalid ticket ID.",
    "Ticket no encontrado.": "Ticket not found.",
    "Error al editar ticket.": "Error editing record.",
    "Error al cerrar ticket.": "Error closing record.",
    "Error al eliminar ticket.": "Error deleting record.",
    "Email es obligatorio.": "Email is required.",
    "ID de solicitud invalido.": "Invalid request ID.",
    "Solicitud no encontrada.": "Request not found.",
    "No se encontro la solicitud asociada.": "The linked request was not found.",
    "Solicitud recibida. Contacta a un administrador para restablecer tu contrasena.": "Request received. Contact an administrator to reset your password.",
    "Formato de fecha invalido. Usa YYYY-MM-DD.": "Invalid date format. Use YYYY-MM-DD.",
    "Error al generar reporte.": "Error generating report.",
    "No hay registros para generar el Excel.": "There are no records to export to Excel.",
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
    Recorded: translateServiceRecordStatus("Recorded"),
    Billed: translateServiceRecordStatus("Billed"),
    Canceled: translateServiceRecordStatus("Canceled")
  });
  setSelectLabels(serviceRecordStatusFilter, {
    "": t("allStatuses"),
    Recorded: translateServiceRecordStatus("Recorded"),
    Billed: translateServiceRecordStatus("Billed"),
    Canceled: translateServiceRecordStatus("Canceled")
  });
  setSelectLabels(serviceRecordStatus, {
    Recorded: translateServiceRecordStatus("Recorded"),
    Billed: translateServiceRecordStatus("Billed"),
    Canceled: translateServiceRecordStatus("Canceled")
  });
  setSelectLabels(invoiceStatusFilter, {
    "": t("allStatuses"),
    Draft: translateInvoiceStatus("Draft"),
    Issued: translateInvoiceStatus("Issued"),
    Paid: translateInvoiceStatus("Paid"),
    Canceled: translateInvoiceStatus("Canceled")
  });
  setSelectLabels(invoiceStatusValue, {
    Draft: translateInvoiceStatus("Draft"),
    Issued: translateInvoiceStatus("Issued"),
    Paid: translateInvoiceStatus("Paid"),
    Canceled: translateInvoiceStatus("Canceled")
  });
  setSelectLabels(projectContractType, {
    "": translateContractType(""),
    Direct: translateContractType("Direct"),
    Signed: translateContractType("Signed"),
    Other: translateContractType("Other")
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
  setText(".brand-copy > p:last-child", t("headerSubtitle"));
  setAriaLabel("#notificationBell", t("notifications"));
  setAriaLabel(".tabs-nav", t("navigationLabel"));
  setAriaLabel("#dashboardTabPanel .stats-grid", t("executiveSummary"));
  setAriaLabel("#ticketsTabPanel .stats-grid", t("ticketCounters"));

  setText("#loginForm .section-title .eyebrow", t("secureAccess"));
  setText("#loginForm h2", t("login"));
  setText('label[for="loginEmail"]', "Email");
  setPlaceholder("#loginEmail", t("emailPlaceholder"));
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
  setText(".service-records-panel .section-title .eyebrow", t("supportInbox"));
  setText("#service-records-title", t("tickets"));
  setText('label[for="searchInput"]', t("search"));
  setText('label[for="statusFilter"]', t("status"));
  setText('label[for="priorityFilter"]', t("priority"));
  setText('label[for="serviceRecordSearchInput"]', t("search"));
  setText('label[for="serviceRecordTechnicianFilter"]', labelText("Tecnico", "Technician"));
  setText('label[for="serviceRecordClientFilter"]', labelText("Cliente", "Client"));
  setText('label[for="serviceRecordProjectFilter"]', labelText("Proyecto", "Project"));
  setText('label[for="serviceRecordDateFilter"]', t("date"));
  setText('label[for="serviceRecordStatusFilter"]', t("status"));
  setPlaceholder("#searchInput", t("searchPlaceholder"));
  setPlaceholder("#serviceRecordSearchInput", t("serviceRecordSearchPlaceholder"));
  setText("#serviceRecordModal .section-title .eyebrow", t("tickets"));
  setText('label[for="serviceRecordTechnicianId"]', labelText("Tecnico", "Technician"));
  setText('label[for="serviceRecordDate"]', t("date"));
  setText('label[for="serviceRecordClientId"]', labelText("Cliente", "Client"));
  setText('label[for="serviceRecordProjectId"]', labelText("Proyecto", "Project"));
  setText('label[for="morningStart"]', labelText("Entrada manana", "Morning start"));
  setText('label[for="morningEnd"]', labelText("Salida manana", "Morning end"));
  setText('label[for="afternoonStart"]', labelText("Entrada tarde", "Afternoon start"));
  setText('label[for="afternoonEnd"]', labelText("Salida tarde", "Afternoon end"));
  setText('label[for="serviceRecordStatus"]', t("status"));
  setText('label[for="serviceDescription"]', labelText("Descripcion del servicio", "Service description"));
  setAriaLabel("#closeServiceRecordModal", t("closeEditor"));

  const ticketStatLabels = document.querySelectorAll("#ticketsTabPanel .stats-grid .stat-card span");
  if (ticketStatLabels[0]) ticketStatLabels[0].textContent = t("openCountLabel");
  if (ticketStatLabels[1]) ticketStatLabels[1].textContent = t("progressCountLabel");
  if (ticketStatLabels[2]) ticketStatLabels[2].textContent = t("closedCountLabel");
  totalCount.parentElement.lastChild.textContent = ` ${t("registeredTickets")}`;

  setText("#dashboardTabPanel .dashboard-overview-panel .section-title .eyebrow", t("businessOverview"));
  setText("#dashboardTitle", t("dashboardTitle"));
  setText("#dashboardDetailPanel .section-title .eyebrow", t("detail"));
  setText("#dashboardDetailTitle", t("dashboardDetail"));
  setAriaLabel("#closeDashboardDetailButton", t("closeDashboardDetail"));
  setText("#dashboardDetailTableBody .empty-state", t("selectDashboardCard"));
  setText("#hoursByMonthTitle", tNested("dashboardCharts", "HoursByMonth"));
  setText("#hoursByClientTitle", tNested("dashboardCharts", "HoursByClient"));
  setText("#hoursByProjectTitle", tNested("dashboardCharts", "HoursByProject"));
  setText("#hoursByTechnicianTitle", tNested("dashboardCharts", "HoursByTechnician"));
  const chartEyebrows = document.querySelectorAll("#dashboardTabPanel > .dashboard-chart-grid .chart-panel .eyebrow");
  if (chartEyebrows[0]) chartEyebrows[0].textContent = tNested("dashboardSectionLabels", "hours");
  if (chartEyebrows[1]) chartEyebrows[1].textContent = tNested("dashboardSectionLabels", "clients");
  if (chartEyebrows[2]) chartEyebrows[2].textContent = tNested("dashboardSectionLabels", "projects");
  if (chartEyebrows[3]) chartEyebrows[3].textContent = tNested("dashboardSectionLabels", "technicians");
  setText("#recentServiceRecordsTitle", tNested("dashboardActivity", "ServiceRecords"));
  setText("#dashboardTechnicianDescriptionModal .section-title .eyebrow", tNested("technicianDashboard", "title"));
  setText("#dashboard-technician-description-title", currentLanguage === "es" ? "Editar descripcion" : "Edit description");
  setText('label[for="dashboardTechnicianDescriptionText"]', currentLanguage === "es" ? "Descripcion" : "Description");
  setButtonText(dashboardTechnicianDescriptionForm?.querySelector(".btn-primary"), t("saveChanges"));
  setAriaLabel("#closeDashboardTechnicianDescriptionModal", t("closeEditor"));
  setText("#recentClientsTitle", tNested("dashboardActivity", "Clients"));
  setText("#recentProjectsTitle", tNested("dashboardActivity", "Projects"));
  document.querySelectorAll("#dashboardTabPanel .activity-panel .eyebrow").forEach((element) => {
    element.textContent = t("recentActivity");
  });
  setText(".project-dashboard-panel .section-title .eyebrow", tNested("projectDashboard", "eyebrow"));
  setText("#projectDashboardTitle", tNested("projectDashboard", "title"));
  setText('label[for="dashboardProjectSearchInput"]', tNested("projectDashboard", "searchLabel"));
  setPlaceholder("#dashboardProjectSearchInput", tNested("projectDashboard", "searchPlaceholder"));
  setText('label[for="dashboardProjectSelect"]', tNested("projectDashboard", "projectLabel"));
  setText(".project-dashboard-panel .compact-table-header .section-title .eyebrow", tNested("dashboardSectionLabels", "serviceRecords"));
  setText("#dashboardProjectRecordsTitle", tNested("projectDashboard", "latestRecords"));
  setTableHeaders(".project-dashboard-panel table", [
    currentLanguage === "es" ? "Fecha" : "Date",
    currentLanguage === "es" ? "Tecnico" : "Technician",
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Estado" : "Status",
    currentLanguage === "es" ? "Descripcion" : "Description",
    t("actions")
  ]);
  setText(".technician-dashboard-panel .section-title .eyebrow", tNested("technicianDashboard", "eyebrow"));
  setText("#technicianDashboardTitle", tNested("technicianDashboard", "title"));
  setText('label[for="dashboardTechnicianSearchInput"]', tNested("technicianDashboard", "searchLabel"));
  setPlaceholder("#dashboardTechnicianSearchInput", tNested("technicianDashboard", "searchPlaceholder"));
  setText('label[for="dashboardTechnicianSelect"]', tNested("technicianDashboard", "technicianLabel"));
  setText('label[for="dashboardTechnicianProjectSelect"]', tNested("technicianDashboard", "projectLabel"));
  setText('label[for="dashboardTechnicianDateFrom"]', tNested("technicianDashboard", "dateFromLabel"));
  setText('label[for="dashboardTechnicianDateTo"]', tNested("technicianDashboard", "dateToLabel"));
  setText("#dashboardTechnicianProjectsTitle", tNested("technicianDashboard", "hoursByProject"));
  setText("#dashboardTechnicianClientsTitle", tNested("technicianDashboard", "hoursByClient"));
  setText("#dashboardTechnicianMonthsTitle", tNested("technicianDashboard", "hoursByMonth"));
  setText(".technician-dashboard-panel .compact-table-header .section-title .eyebrow", tNested("dashboardSectionLabels", "serviceRecords"));
  setText("#dashboardTechnicianRecordsTitle", tNested("technicianDashboard", "latestRecords"));
  const technicianChartEyebrows = document.querySelectorAll(".technician-dashboard-grid .chart-panel .eyebrow");
  if (technicianChartEyebrows[0]) technicianChartEyebrows[0].textContent = tNested("dashboardSectionLabels", "projects");
  if (technicianChartEyebrows[1]) technicianChartEyebrows[1].textContent = tNested("dashboardSectionLabels", "clients");
  if (technicianChartEyebrows[2]) technicianChartEyebrows[2].textContent = tNested("dashboardSectionLabels", "months");
  setTableHeaders(".technician-dashboard-panel > .table-wrapper table", [
    currentLanguage === "es" ? "Fecha" : "Date",
    currentLanguage === "es" ? "Cliente" : "Client",
    currentLanguage === "es" ? "Proyecto" : "Project",
    currentLanguage === "es" ? "Horas" : "Hours",
    currentLanguage === "es" ? "Estado" : "Status",
    currentLanguage === "es" ? "Descripcion" : "Description"
  ]);

  setText("#clientsTabPanel .section-title .eyebrow", t("clientsEyebrow"));
  setText("#clients-title", t("clients"));
  setText("#clientsTabPanel .foundation-copy", t("clientsFoundation"));
  setText('label[for="clientSearchInput"]', t("search"));
  setText('label[for="clientStatusFilter"]', t("statusFilter"));
  setPlaceholder("#clientSearchInput", t("clientSearchPlaceholder"));
  if (clientStatusFilter) {
    clientStatusFilter.options[0].textContent = t("allEntityStatuses");
    clientStatusFilter.options[1].textContent = t("activeOnly");
    clientStatusFilter.options[2].textContent = t("inactiveOnly");
  }
  setText("#clientModal .section-title .eyebrow", t("clients"));
  setText('label[for="clientName"]', labelText("Cliente", "Client name"));
  setText('label[for="clientContactName"]', labelText("Contacto", "Contact name"));
  setText('label[for="clientEmail"]', "Email");
  setText('label[for="clientPhone"]', labelText("Telefono", "Phone"));
  setText('label[for="clientBillingName"]', labelText("Nombre para facturacion", "Billing name"));
  setText('label[for="clientTaxId"]', labelText("ID contributivo", "Tax ID"));
  document.querySelectorAll(".checkbox-field span").forEach((element) => {
    element.textContent = labelText("Activo", "Active");
  });
  setAriaLabel("#closeClientModal", t("closeEditor"));
  setText("#projectsTabPanel .section-title .eyebrow", t("projectsEyebrow"));
  setText("#projects-title", t("projects"));
  setText("#projectsTabPanel .foundation-copy", t("projectsFoundation"));
  setText('label[for="projectSearchInput"]', t("search"));
  setText('label[for="projectClientFilter"]', t("clients"));
  setText('label[for="projectStatusFilter"]', t("statusFilter"));
  setPlaceholder("#projectSearchInput", t("projectSearchPlaceholder"));
  if (projectStatusFilter) {
    projectStatusFilter.options[0].textContent = t("allEntityStatuses");
    projectStatusFilter.options[1].textContent = t("activeOnly");
    projectStatusFilter.options[2].textContent = t("inactiveOnly");
  }
  setText("#projectModal .section-title .eyebrow", t("projects"));
  setText("#project-basic-eyebrow", t("projects"));
  setText("#project-contract-eyebrow", labelText("Contrato", "Contract"));
  setText("#project-contract-summary-eyebrow", labelText("Contrato", "Contract"));
  setText("#project-basic-title", labelText("Informacion basica del proyecto", "Project information"));
  setText('label[for="projectClientId"]', labelText("Cliente", "Client"));
  setText('label[for="projectName"]', labelText("Proyecto", "Project name"));
  setText('label[for="projectDescription"]', labelText("Descripcion", "Description"));
  setText("#project-contract-title", labelText("Informacion del contrato", "Contract Information"));
  setText("#project-contract-summary-title", labelText("Resumen del contrato", "Contract summary"));
  setText('label[for="projectContractNumber"]', labelText("Numero de contrato", "Contract number"));
  setText('label[for="projectContractType"]', labelText("Tipo de contrato", "Contract type"));
  setText('label[for="projectSignedBy"]', labelText("Firmado por", "Signed by"));
  setText('label[for="projectContractStartDate"]', labelText("Fecha de comienzo", "Start date"));
  setText('label[for="projectContractEndDate"]', labelText("Fecha de vencimiento", "End date"));
  setText('label[for="projectContractedHours"]', labelText("Horas contratadas", "Contracted hours"));
  setText('label[for="projectLowHoursThreshold"]', labelText("Alerta de horas bajas", "Low hours threshold"));
  setText('label[for="projectExpirationAlertDays"]', labelText("Dias de alerta de vencimiento", "Expiration alert days"));
  const contractStatusLabels = document.querySelectorAll(".contract-status-grid span");
  if (contractStatusLabels[0]) contractStatusLabels[0].textContent = labelText("Horas usadas", "Used hours");
  if (contractStatusLabels[1]) contractStatusLabels[1].textContent = labelText("Horas restantes", "Remaining hours");
  if (contractStatusLabels[2]) contractStatusLabels[2].textContent = labelText("Alerta de horas", "Hours alert");
  if (contractStatusLabels[3]) contractStatusLabels[3].textContent = labelText("Estado del contrato", "Contract status");
  if (contractStatusLabels[4]) contractStatusLabels[4].textContent = labelText("Fecha de vencimiento", "End date");
  setText("#invoicesTabPanel .section-title .eyebrow", t("invoicesEyebrow"));
  setText("#invoices-title", t("invoices"));
  setText('label[for="invoiceSearchInput"]', t("search"));
  setText('label[for="invoiceClientFilter"]', labelText("Cliente", "Client"));
  setText('label[for="invoiceFromFilter"]', labelText("Periodo desde", "Period from"));
  setText('label[for="invoiceToFilter"]', labelText("Periodo hasta", "Period to"));
  setText('label[for="invoiceStatusFilter"]', t("status"));
  setPlaceholder("#invoiceSearchInput", t("invoiceSearchPlaceholder"));
  if (invoiceStatusFilter.options[0]) invoiceStatusFilter.options[0].textContent = t("allStatuses");
  setText("#invoiceGenerateModal .section-title .eyebrow", t("invoices"));
  setText("#invoice-generate-title", t("generateInvoice"));
  setText('label[for="invoiceGenerateClientId"]', labelText("Cliente", "Client"));
  setText('label[for="invoiceGeneratePeriodFrom"]', labelText("Periodo desde", "Period from"));
  setText('label[for="invoiceGeneratePeriodTo"]', labelText("Periodo hasta", "Period to"));
  setText('label[for="invoiceGenerateNotes"]', labelText("Notas", "Notes"));
  setAriaLabel("#closeInvoiceGenerateModal", t("closeEditor"));
  setText("#invoiceStatusModal .section-title .eyebrow", t("invoices"));
  setText("#invoice-status-title", t("editInvoiceStatus"));
  setText('label[for="invoiceStatusValue"]', t("status"));
  setText('label[for="invoiceStatusNotes"]', labelText("Notas", "Notes"));
  setAriaLabel("#closeInvoiceStatusModal", t("closeEditor"));
  setText("#invoiceDetailModal .section-title .eyebrow", labelText("Lineas", "Lines"));
  setText("#invoice-detail-title", labelText("Detalle de factura", "Invoice Detail"));
  setAriaLabel("#closeInvoiceDetailModal", t("closeEditor"));
  setText("#settingsTabPanel .section-title .eyebrow", t("settingsEyebrow"));
  setText("#settings-title", t("settings"));
  setText("#settingsTabPanel .foundation-copy", t("settingsFoundation"));
  setText("#settingsTabPanel .foundation-card:nth-of-type(1) h3", labelText("Cuenta", "Account"));
  setText("#settingsTabPanel .foundation-card:nth-of-type(1) p", labelText("Revisa la sesion actual y opciones de flujo de contrasenas.", "Review session details and password workflow options."));
  setText("#settingsTabPanel .foundation-card:nth-of-type(2) h3", t("notifications"));
  setText("#settingsTabPanel .foundation-card:nth-of-type(2) p", labelText("Mantiene alertas administrativas disponibles mientras evolucionan los modulos.", "Keep administrative alerts available while the modules evolve."));
  setText("#settingsTabPanel .foundation-card:nth-of-type(3) h3", labelText("Valores por defecto", "Workflow defaults"));
  setText("#settingsTabPanel .foundation-card:nth-of-type(3) p", labelText("Prepara preferencias de registros de servicio y controles internos futuros.", "Prepare service record preferences and future internal controls."));

  setText("#notificationsTabPanel .section-title .eyebrow", t("activity"));
  setText("#notificationsTitle", t("notifications"));
  notificationsTotalCount.parentElement.lastChild.textContent = ` ${t("notificationsCount")}`;

  setText("#usersTabPanel .form-panel .section-title .eyebrow", t("administration"));
  setText("#users-form-title", t("addUser"));
  setText('label[for="userFullName"]', t("fullName"));
  setText('label[for="userEmail"]', "Email");
  setText('label[for="userPassword"]', t("password"));
  setText('label[for="userRole"]', t("role"));
  setText("#user-project-assignments-eyebrow", "Project Manager");
  setText("#user-project-assignments-title", t("assignedProjects"));
  setText("#userProjectAssignmentsHelp", t("assignedProjectsHelp"));
  setPlaceholder("#userFullName", t("fullNamePlaceholder"));
  setPlaceholder("#userPassword", t("tempPasswordPlaceholder"));
  renderUserProjectAssignmentOptions(userProjectAssignments);

  setText("#usersTabPanel .table-panel .section-title .eyebrow", t("security"));
  setText("#users-table-title", t("users"));
  setText('label[for="userSearchInput"]', t("search"));
  setText('label[for="userStatusFilter"]', t("statusFilter"));
  setText('label[for="userRoleFilter"]', t("roleFilter"));
  setText("#project-manager-assignments-eyebrow", t("admin"));
  setText("#project-manager-assignments-title", t("assignedProjectManagers"));
  setText("#projectManagerAssignmentsHelp", t("assignedProjectManagersHelp"));
  setText("#project-managers-detail-title", t("assignedProjectManagers"));
  setButtonText(manageProjectManagersButton, t("manageAssignments"));
  renderProjectManagerAssignmentOptions(projectManagerAssignments);
  setText("#user-projects-detail-title", t("assignedProjectsDetail"));
  setText("#user-projects-client-header", t("clients"));
  setText("#user-projects-project-header", t("projects"));
  setText("#user-projects-status-header", t("status"));
  setText("#user-projects-date-header", t("assignedAt"));
  setButtonText(manageUserProjectAssignmentsButton, t("manageAssignments"));
  setPlaceholder("#userSearchInput", t("userSearchPlaceholder"));
  if (userStatusFilter) {
    userStatusFilter.options[0].textContent = t("allEntityStatuses");
    userStatusFilter.options[1].textContent = t("activeOnly");
    userStatusFilter.options[2].textContent = t("inactiveOnly");
  }
  if (userRoleFilter) {
    userRoleFilter.options[0].textContent = t("allRoles");
  }
  setText(".password-resets-panel .section-title .eyebrow", t("security"));
  setText("#password-resets-title", t("passwordResets"));
  passwordResetsTotalCount.parentElement.lastChild.textContent = ` ${t("passwordResetRequests")}`;

  setText("#reportsTabPanel .section-title .eyebrow", t("analytics"));
  setText("#reportsTitle", t("reports"));
  setText('label[for="reportFrom"]', t("dateFrom"));
  setText('label[for="reportTo"]', t("dateTo"));
  setText('label[for="reportTechnician"]', currentLanguage === "es" ? "Tecnico" : "Technician");
  setText('label[for="reportClient"]', currentLanguage === "es" ? "Cliente" : "Client");
  setText('label[for="reportProject"]', currentLanguage === "es" ? "Proyecto" : "Project");
  setText('label[for="reportStatus"]', t("status"));
  setText('label[for="reportInvoiceNumber"]', "Invoice #");
  setPlaceholder("#reportInvoiceNumber", "Example: 8878");
  reportsTotalCount.parentElement.lastChild.textContent = currentLanguage === "es" ? " registros" : " records";
  generateReportButton.textContent = t("generateReport");
  setText("#exportPdfButton span", t("exportPdf"));
  setText("#exportExcelButton span", t("exportExcel"));

  setText("#manualInvoicesTabPanel .section-title .eyebrow", t("manualInvoicesEyebrow"));
  setText("#manualInvoicesTitle", t("manualInvoices"));
  setText('label[for="manualInvoiceNumber"]', "Invoice #");
  setText('label[for="manualInvoiceDate"]', currentLanguage === "es" ? "Fecha" : "Date");
  setText('label[for="manualInvoiceBillTo"]', "Bill To");
  setText('label[for="manualInvoicePoNumber"]', "P.O. No.");
  setText('label[for="manualInvoiceTerms"]', "Terms");
  setText('label[for="manualInvoiceDueDate"]', currentLanguage === "es" ? "Fecha de vencimiento" : "Due Date");
  setText('label[for="manualInvoiceProject"]', currentLanguage === "es" ? "Proyecto" : "Project");
  setText("#manualInvoiceLinesTitle", currentLanguage === "es" ? "Lineas de factura" : "Invoice lines");
  setText(".manual-invoice-lines .section-title .eyebrow", currentLanguage === "es" ? "Lineas" : "Lines");
  addManualInvoiceLineButton.textContent = currentLanguage === "es" ? "+ Agregar linea" : "+ Add line";
  setText("#manualInvoiceSignaturesTitle", currentLanguage === "es" ? "Firmas de factura" : "Invoice signatures");
  setText(".manual-invoice-signatures .section-title .eyebrow", currentLanguage === "es" ? "Firmas" : "Signatures");
  setText('label[for="manualInvoiceSignature1Name"]', currentLanguage === "es" ? "Firma 1 - Nombre" : "Signature 1 - Name");
  setText('label[for="manualInvoiceSignature1Title"]', currentLanguage === "es" ? "Firma 1 - Cargo" : "Signature 1 - Title");
  setText('label[for="manualInvoiceSignature2Name"]', currentLanguage === "es" ? "Firma 2 - Nombre" : "Signature 2 - Name");
  setText('label[for="manualInvoiceSignature2Title"]', currentLanguage === "es" ? "Firma 2 - Cargo" : "Signature 2 - Title");
  const manualInvoiceLineHeaders = document.querySelectorAll(".manual-invoice-line-header span");
  if (manualInvoiceLineHeaders.length >= 4) {
    manualInvoiceLineHeaders[0].textContent = currentLanguage === "es" ? "Cantidad" : "Quantity";
    manualInvoiceLineHeaders[1].textContent = currentLanguage === "es" ? "Descripcion" : "Description";
    manualInvoiceLineHeaders[2].textContent = "Rate";
    manualInvoiceLineHeaders[3].textContent = "Amount";
  }
  generateManualInvoicePdfButton.textContent = t("manualInvoicePdfButton");
  renderManualInvoiceLines();

  setText("#editModal .section-title .eyebrow", t("admin"));
  setText("#edit-title", t("editTicket"));
  setText('label[for="editDescription"]', t("issueDescription"));
  setText('label[for="editPriority"]', t("priority"));
  setText('label[for="editStatus"]', t("status"));
  setAriaLabel("#closeEditModal", t("closeEditor"));
  updatePasswordToggleLabels();

  setText("#editUserModal .section-title .eyebrow", t("admin"));
  setText("#edit-user-title", t("editUser"));
  setText("#edit-user-info-eyebrow", t("security"));
  setText("#edit-user-info-title", t("userInformation"));
  setText('label[for="editFullName"]', t("fullName"));
  setText('label[for="editEmail"]', "Email");
  setText('label[for="editPassword"]', t("newPassword"));
  setText('label[for="editRole"]', t("role"));
  setText("#editUserIsActiveLabel", t("activeUser"));
  setText("#edit-user-project-assignments-eyebrow", "Project Manager");
  setText("#edit-user-project-assignments-title", t("assignedProjects"));
  setText("#editUserProjectAssignmentsHelp", t("assignedProjectsHelp"));
  setPlaceholder("#editPassword", t("keepPasswordPlaceholder"));
  temporaryPasswordButton.textContent = t("temporaryPassword");
  setAriaLabel("#closeEditUserModal", t("closeUserEditor"));
  renderUserProjectAssignmentOptions(editUserProjectAssignments);

  setTableHeaders(".service-records-panel table", [
    labelText("Tecnico", "Technician"),
    labelText("Cliente", "Client"),
    labelText("Proyecto", "Project"),
    t("date"),
    labelText("Entrada AM", "AM start"),
    labelText("Salida AM", "AM end"),
    labelText("Entrada PM", "PM start"),
    labelText("Salida PM", "PM end"),
    labelText("Horas", "Hours"),
    labelText("Descripcion", "Description"),
    t("status"),
    t("actions")
  ]);
  setTableHeaders("#legacyTicketsWorkspace table", ["ID", t("issue"), t("priority"), t("status"), t("date"), t("reportedBy"), t("actions")]);
  setTableHeaders("#clientsTabPanel table", [labelText("Cliente", "Client"), labelText("Contacto", "Contact"), "Email", labelText("Telefono", "Phone"), labelText("Facturacion", "Billing"), labelText("ID contributivo", "Tax ID"), t("status"), t("actions")]);
  setTableHeaders("#projectsTabPanel table", [labelText("Proyecto", "Project"), labelText("Cliente", "Client"), labelText("Descripcion", "Description"), labelText("Contrato", "Contract"), labelText("Horas contratadas", "Contracted hours"), labelText("Horas usadas", "Used hours"), labelText("Horas restantes", "Remaining hours"), labelText("Vence", "End date"), labelText("Estado del contrato", "Contract status"), "Project Manager", t("status"), t("actions")]);
  setTableHeaders("#invoicesTabPanel table", [labelText("Factura", "Invoice"), labelText("Cliente", "Client"), labelText("Fecha", "Date"), labelText("Desde", "From"), labelText("Hasta", "To"), t("status"), t("actions")]);
  setTableHeaders("#invoiceDetailModal table", [t("date"), labelText("Proyecto", "Project"), labelText("Descripcion", "Description"), labelText("Horas", "Hours")]);
  setTableHeaders("#notificationsTabPanel table", [t("message"), t("type"), t("date"), t("status"), t("actions")]);
  setTableHeaders('[aria-labelledby="users-table-title"] table', ["ID", t("fullName"), "Email", t("role"), t("assignedProjects"), t("status"), t("date"), t("createdBy"), t("actions")]);
  setTableHeaders("#usersTabPanel .password-resets-panel table", ["ID", t("name"), "Email", t("date"), t("status"), t("actions")]);
  setTableHeaders("#reportsTabPanel table", ["ID", currentLanguage === "es" ? "Tecnico" : "Technician", currentLanguage === "es" ? "Cliente" : "Client", currentLanguage === "es" ? "Proyecto" : "Project", t("date"), currentLanguage === "es" ? "Horas" : "Hours", t("status"), currentLanguage === "es" ? "Descripcion del servicio" : "Service description"]);
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
  setButtonText(manualInvoicesTabButton, t("manualInvoices"));
  setButtonText(document.querySelector('[data-tab="notifications"]'), t("notifications"));
  setButtonText(usersTabButton, t("users"));
  setButtonText(reportsTabButton, t("reports"));
  setButtonText(document.querySelector('[data-tab="settings"]'), t("settings"));
  setButtonText(addClientButton, t("addClient"));
  setButtonText(saveClientButton, t("saveClient"));
  setButtonText(addProjectButton, t("addProject"));
  setButtonText(saveProjectButton, t("saveProject"));
  setButtonText(addServiceRecordButton, t("addServiceRecord"));
  setButtonText(saveServiceRecordButton, t("saveServiceRecord"));
  setButtonText(generateInvoiceButton, t("generateInvoice"));
  setButtonText(saveGeneratedInvoiceButton, t("generateInvoice"));
  setButtonText(saveInvoiceStatusButton, t("saveInvoiceStatus"));
  setButtonText(logoutButton, t("logout"));
  setButtonText(loginForm.querySelector(".btn-primary"), t("enter"));
  setButtonText(ticketForm.querySelector(".btn-primary"), t("createTicket"));
  setButtonText(userForm.querySelector(".btn-primary"), t("createUser"));
  setButtonText(editTicketForm.querySelector(".btn-primary"), t("saveChanges"));
  setButtonText(editUserForm.querySelector(".btn-primary"), t("saveUser"));

  renderTickets();
  renderClients();
  renderProjectClientOptions();
  renderProjects();
  renderServiceRecordOptions();
  renderServiceRecords();
  renderInvoiceClientOptions();
  renderInvoices();
  renderUsers();
  renderPasswordResets();
  renderNotifications();
  renderDashboard();
  renderReportLookupOptions();
  renderServiceHoursReport();
  renderCreatingTicketAs();
}

function setRoleControls() {
  const canAdminister = isAdmin();
  const canReviewAssignedProjects = canAdminister || isProjectManager();
  statusInput.disabled = !canAdminister;
  statusHelp.classList.toggle("hidden", canAdminister);
  addClientButton.classList.toggle("hidden", !canAdminister);
  addProjectButton.classList.toggle("hidden", !canAdminister);
  addServiceRecordButton.classList.toggle("hidden", !canCreateServiceRecords());
  generateInvoiceButton.classList.toggle("hidden", !canAdminister);
  serviceRecordStatus.disabled = !canAdminister;
  serviceRecordTechnicianId.disabled = !canAdminister;
  document.querySelectorAll(".client-admin-actions, .project-admin-actions, .dashboard-technician-admin-actions, .notifications-admin-actions").forEach((element) => {
    element.classList.toggle("hidden", !canAdminister);
  });
  document.querySelector(".report-invoice-field")?.classList.toggle("hidden", !canAdminister);
  reportTechnician?.closest(".filter-field")?.classList.toggle("hidden", !canReviewAssignedProjects);
  serviceRecordTechnicianFilter?.closest(".filter-field")?.classList.toggle("hidden", !canReviewAssignedProjects);
  serviceRecordTechnicianId?.closest(".form-group")?.classList.toggle("hidden", !canAdminister);
  serviceRecordStatus?.closest(".form-group")?.classList.toggle("hidden", !canAdminister);
  dashboardTechnicianSearchInput?.closest(".search-field")?.classList.toggle("hidden", !canReviewAssignedProjects);
  dashboardTechnicianSelect?.closest(".filter-field")?.classList.toggle("hidden", !canReviewAssignedProjects);
  hoursByTechnicianChart?.closest(".chart-panel")?.classList.toggle("hidden", !canReviewAssignedProjects);

  if (!canAdminister) {
    statusInput.value = "Abierto";
    serviceRecordStatus.value = "Recorded";
    reportInvoiceNumber.value = "";
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
  if (!isAdmin()) {
    showUsersMessage(t("usersAdminOnly"));
    return;
  }

  if (users.length === 0) {
    showUsersMessage(t("noUsers"));
    return;
  }

  const search = normalizeSearchKey(userSearchInput?.value);
  const selectedStatus = userStatusFilter?.value || "all";
  const selectedRole = userRoleFilter?.value || "all";
  const visibleUsers = users.filter((user) => {
    const isActive = isUserActive(user);
    const matchesStatus = selectedStatus === "all"
      || (selectedStatus === "active" && isActive)
      || (selectedStatus === "inactive" && !isActive);
    const matchesSearch = !search || [user.FullName, user.Email, user.Role]
      .some((value) => normalizeSearchKey(value).includes(search));
    const matchesRole = selectedRole === "all" || user.Role === selectedRole;

    return matchesStatus && matchesSearch && matchesRole;
  });

  updateUsersCount(visibleUsers.length, selectedStatus);

  if (visibleUsers.length === 0) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">${t("noUserMatches")}</td>
      </tr>
    `;
    return;
  }

  usersTableBody.innerHTML = visibleUsers.map((user) => {
    const isActive = isUserActive(user);
    const isCurrentUser = Number(currentUser?.UserID) === Number(user.UserID);

    return `
      <tr>
        <td>#${user.UserID}</td>
        <td>${escapeHTML(user.FullName)}</td>
        <td>${escapeHTML(user.Email)}</td>
        <td><span class="badge ${getUserRoleClass(user.Role)}">${escapeHTML(getRoleDisplayLabel(user.Role))}</span></td>
        <td>${normalizeClientRole(user.Role) === "ProjectManager" ? `
          <button type="button" class="assignment-count-button" data-user-action="view-projects" data-id="${user.UserID}">
            ${formatNumber(user.AssignedProjectCount || 0, 0)} ${t(Number(user.AssignedProjectCount || 0) === 1 ? "assignedProjectCountSingular" : "assignedProjectCount")}
          </button>
        ` : "-"}</td>
        <td><span class="badge ${isActive ? "user-status-active" : "user-status-inactive"}">${isActive ? t("active") : t("inactive")}</span></td>
        <td>${formatDate(user.CreatedAt)}</td>
        <td>${formatPerson(user.CreatedByFullName, user.CreatedByUserID)}</td>
        <td>
          <div class="actions">
            <button class="action-btn edit-btn" data-user-action="edit" data-id="${user.UserID}">
              ${getActionIcon("edit")}
              ${t("edit")}
            </button>
            <button class="action-btn ${isActive ? "delete-btn" : "close-btn"}" data-user-action="toggle-active" data-id="${user.UserID}" data-next-active="${isActive ? "false" : "true"}" ${isCurrentUser && isActive ? "disabled" : ""}>
              ${getActionIcon(isActive ? "close" : "edit")}
              ${isActive ? t("deactivateUser") : t("activateUser")}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function isUserActive(user) {
  return user?.IsActive === true || user?.IsActive === 1 || user?.IsActive === "1";
}

function updateUsersCount(count, selectedStatus = userStatusFilter?.value || "all") {
  const countLabel = selectedStatus === "active"
    ? t("activeCount")
    : selectedStatus === "inactive"
      ? t("inactiveCount")
      : t("usersCount");

  usersTotalCount.textContent = formatNumber(count, 0);
  usersTotalCount.parentElement.lastChild.textContent = ` ${countLabel}`;
}

function showUsersMessage(message) {
  updateUsersCount(users.length, "all");
  usersTableBody.innerHTML = `
    <tr>
      <td colspan="9" class="empty-state">${message}</td>
    </tr>
  `;
}

function renderPasswordResets() {
  passwordResetsTotalCount.textContent = formatNumber(passwordResets.length, 0);

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
  passwordResetsTotalCount.textContent = formatNumber(passwordResets.length, 0);
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
  if (reportTechnician.value) params.set("technicianUserId", reportTechnician.value);
  if (reportClient.value) params.set("clientId", reportClient.value);
  if (reportProject.value) params.set("projectId", reportProject.value);

  return params.toString();
}

async function loadReportLookups() {
  await loadServiceRecordLookups();
  await loadReportTechnicianOptions();
  renderReportLookupOptions();
}

function getReportTechnicianLookupQueryString() {
  const params = new URLSearchParams();

  if (reportFrom.value) params.set("from", reportFrom.value);
  if (reportTo.value) params.set("to", reportTo.value);
  if (reportStatus.value) params.set("status", reportStatus.value);
  if (reportClient.value) params.set("clientId", reportClient.value);
  if (reportProject.value) params.set("projectId", reportProject.value);

  return params.toString();
}

async function loadReportTechnicianOptions() {
  const query = getReportTechnicianLookupQueryString();
  const response = await fetch(`/api/reports/service-hours/technicians${query ? `?${query}` : ""}`, {
    cache: "no-store"
  });
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(translateServerMessage(data.message) || t("reportError"));
  }

  reportTechnicians = Array.isArray(data) ? data : [];
}

function renderReportLookupOptions() {
  if (!reportTechnician || !reportClient || !reportProject) return;

  const selectedTechnician = reportTechnician.value;
  const selectedClient = reportClient.value;
  const selectedProject = reportProject.value;
  const technicianOptions = reportTechnicians.map((user) => `
    <option value="${user.UserID}">${escapeHTML(user.FullName || user.Email || `#${user.UserID}`)}</option>
  `).join("");
  const clientOptions = serviceRecordClients.map((client) => `
    <option value="${client.ClientID}">${escapeHTML(client.ClientName || `#${client.ClientID}`)}</option>
  `).join("");
  const visibleProjects = reportClient.value
    ? serviceRecordProjects.filter((project) => Number(project.ClientID) === Number(reportClient.value))
    : serviceRecordProjects;
  const projectOptions = visibleProjects.map((project) => `
    <option value="${project.ProjectID}">${escapeHTML(project.ProjectName || `#${project.ProjectID}`)}</option>
  `).join("");

  reportTechnician.innerHTML = `<option value="">${escapeHTML(t("allTechnicians"))}</option>${technicianOptions}`;
  reportClient.innerHTML = `<option value="">${escapeHTML(t("allClients"))}</option>${clientOptions}`;
  reportProject.innerHTML = `<option value="">${escapeHTML(t("allProjects"))}</option>${projectOptions}`;
  reportTechnician.value = reportTechnicians.some((user) => String(user.UserID) === selectedTechnician) ? selectedTechnician : "";
  reportClient.value = selectedClient;
  reportProject.value = visibleProjects.some((project) => String(project.ProjectID) === selectedProject) ? selectedProject : "";
}

async function refreshReportTechnicianOptions() {
  try {
    await loadReportTechnicianOptions();
    renderReportLookupOptions();
  } catch (error) {
    console.error(error);
    reportTechnicians = [];
    renderReportLookupOptions();
    reportsMessage.textContent = error.message || t("reportError");
  }
}

async function generateReport(event) {
  event.preventDefault();
  reportsMessage.textContent = "";

  try {
    const query = getReportQueryString();
    const [recordsResponse, summaryResponse] = await Promise.all([
      fetch(`/api/reports/service-hours${query ? `?${query}` : ""}`, { cache: "no-store" }),
      fetch(`/api/reports/service-hours/summary${query ? `?${query}` : ""}`, { cache: "no-store" })
    ]);
    const recordsData = await parseJsonResponse(recordsResponse);
    const summaryData = await parseJsonResponse(summaryResponse);

    if (!recordsResponse.ok) {
      throw new Error(translateServerMessage(recordsData.message) || t("reportError"));
    }

    if (!summaryResponse.ok) {
      throw new Error(translateServerMessage(summaryData.message) || t("reportError"));
    }

    if (!Array.isArray(recordsData)) {
      throw new Error(recordsData.message || t("reportError"));
    }

    reportServiceRecords = recordsData;
    reportSummary = summaryData;
    hasGeneratedReport = true;
    renderServiceHoursReport();
    updateReportExportActions();
    reportsMessage.textContent = t("reportReady");
  } catch (error) {
    console.error(error);
    updateReportExportActions();
    reportsMessage.textContent = error.message || t("reportError");
  }
}

async function exportServiceHoursPdf() {
  reportsMessage.textContent = "";

  if (!hasGeneratedReport || reportServiceRecords.length === 0) {
    reportsMessage.textContent = t("pdfNoData");
    return;
  }

  const query = getReportQueryString();
  const pdfParams = new URLSearchParams(query);
  const invoiceNumber = reportInvoiceNumber?.value.trim();

  if (invoiceNumber) {
    pdfParams.set("invoiceNumber", invoiceNumber);
  }

  try {
    exportPdfButton.disabled = true;
    const pdfQuery = pdfParams.toString();
    const response = await fetch(`/api/reports/service-hours/pdf${pdfQuery ? `?${pdfQuery}` : ""}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      const errorData = contentType.includes("application/json") ? await response.json() : {};
      throw new Error(translateServerMessage(errorData.message) || t("exportError"));
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `solutions-by-design-service-hours-${today}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    reportsMessage.textContent = t("pdfReady");
  } catch (error) {
    console.error(error);
    reportsMessage.textContent = error.message || t("exportError");
  } finally {
    updateReportExportActions();
  }
}

async function exportServiceHoursExcel() {
  reportsMessage.textContent = "";

  if (!hasGeneratedReport || reportServiceRecords.length === 0) {
    reportsMessage.textContent = t("excelNoData");
    return;
  }

  try {
    exportExcelButton.disabled = true;
    const query = getReportQueryString();
    const response = await fetch(`/api/reports/service-hours/excel${query ? `?${query}` : ""}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      const errorData = contentType.includes("application/json") ? await response.json() : {};
      throw new Error(translateServerMessage(errorData.message) || t("excelError"));
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `solutions-by-design-service-hours-${today}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    reportsMessage.textContent = t("excelReady");
  } catch (error) {
    console.error(error);
    reportsMessage.textContent = error.message || t("excelError");
  } finally {
    updateReportExportActions();
  }
}

function formatManualInvoiceCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function calculateManualInvoiceLineAmount(line) {
  const quantity = Number(line.quantity) || 0;
  const rate = Number(line.rate) || 0;

  return quantity * rate;
}

function getManualInvoiceTotal() {
  return manualInvoiceLines.reduce((sum, line) => sum + calculateManualInvoiceLineAmount(line), 0);
}

function getManualInvoiceTotals() {
  const subtotal = getManualInvoiceTotal();
  const taxRate = Math.max(0, Number(manualInvoiceTaxRate?.value) || 0);
  const applyTax = Boolean(manualInvoiceApplyTax?.checked);
  const taxAmount = applyTax ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + taxAmount;

  return { subtotal, taxRate, applyTax, taxAmount, total };
}

function updateManualInvoiceSummary() {
  const totals = getManualInvoiceTotals();

  manualInvoiceSubtotalDisplay.textContent = formatManualInvoiceCurrency(totals.subtotal);
  manualInvoiceTaxLabel.textContent = `IVU (${formatNumber(totals.applyTax ? totals.taxRate : 0, 2)}%)`;
  manualInvoiceTaxDisplay.textContent = formatManualInvoiceCurrency(totals.taxAmount);
  manualInvoiceTotalDisplay.textContent = formatManualInvoiceCurrency(totals.total);
  manualInvoiceTaxRate.disabled = !totals.applyTax;
}

function renderManualInvoiceLines() {
  if (!manualInvoiceLinesBody) return;

  if (manualInvoiceLines.length === 0) {
    manualInvoiceLines = [{ id: nextManualInvoiceLineId++, quantity: "", description: "", rate: "" }];
  }

  manualInvoiceLinesBody.innerHTML = manualInvoiceLines.map((line) => `
    <div class="manual-invoice-line" data-line-id="${line.id}">
      <input type="number" class="manual-invoice-line-quantity" min="0" step="0.01" value="${escapeHTML(String(line.quantity || ""))}" aria-label="${currentLanguage === "es" ? "Cantidad" : "Quantity"}">
      <textarea class="manual-invoice-line-description" rows="2" aria-label="${currentLanguage === "es" ? "Descripcion" : "Description"}">${escapeHTML(line.description || "")}</textarea>
      <input type="number" class="manual-invoice-line-rate" min="0" step="0.01" value="${escapeHTML(String(line.rate || ""))}" aria-label="Rate">
      <output class="manual-invoice-line-amount">${formatManualInvoiceCurrency(calculateManualInvoiceLineAmount(line))}</output>
      <button type="button" class="icon-button manual-invoice-line-remove" aria-label="${currentLanguage === "es" ? "Eliminar linea" : "Remove line"}" ${manualInvoiceLines.length === 1 ? "disabled" : ""}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>
    </div>
  `).join("");

  updateManualInvoiceSummary();
}

function updateManualInvoiceLine(lineId, field, value) {
  manualInvoiceLines = manualInvoiceLines.map((line) => (
    line.id === lineId ? { ...line, [field]: value } : line
  ));
  updateManualInvoiceSummary();
}

function addManualInvoiceLine() {
  manualInvoiceLines.push({ id: nextManualInvoiceLineId++, quantity: "", description: "", rate: "" });
  renderManualInvoiceLines();
}

function removeManualInvoiceLine(lineId) {
  if (manualInvoiceLines.length <= 1) return;

  manualInvoiceLines = manualInvoiceLines.filter((line) => line.id !== lineId);
  renderManualInvoiceLines();
}

function getManualInvoicePayloadLines() {
  return manualInvoiceLines
    .map((line) => ({
      quantity: Number(line.quantity) || 0,
      description: String(line.description || "").trim(),
      rate: Number(line.rate) || 0,
      amount: calculateManualInvoiceLineAmount(line)
    }))
    .filter((line) => line.quantity > 0 || line.description || line.rate > 0 || line.amount > 0);
}

function getManualInvoiceLinesValidationMessage(lines) {
  if (!lines.length) return t("manualInvoiceLineRequired");

  const hasInvalidLine = lines.some((line) => (
    !Number.isFinite(line.quantity)
    || line.quantity <= 0
    || !line.description
    || !Number.isFinite(line.rate)
    || line.rate < 0
  ));

  return hasInvalidLine ? t("manualInvoiceLineInvalid") : "";
}

async function generateManualInvoicePdf(event) {
  event.preventDefault();
  manualInvoiceMessage.textContent = "";

  const lines = getManualInvoicePayloadLines();
  const totals = getManualInvoiceTotals();
  const validationMessage = getManualInvoiceLinesValidationMessage(lines);

  if (validationMessage) {
    manualInvoiceMessage.textContent = validationMessage;
    return;
  }

  const payload = {
    invoiceNumber: manualInvoiceNumber.value.trim(),
    invoiceDate: manualInvoiceDate.value,
    billTo: manualInvoiceBillTo.value.trim(),
    poNumber: manualInvoicePoNumber.value.trim(),
    terms: manualInvoiceTerms.value.trim(),
    dueDate: manualInvoiceDueDate.value,
    project: manualInvoiceProject.value.trim(),
    lines,
    applyTax: totals.applyTax,
    taxRate: totals.taxRate,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    total: totals.total,
    signatures: [
      {
        name: manualInvoiceSignature1Name.value.trim(),
        title: manualInvoiceSignature1Title.value.trim()
      },
      {
        name: manualInvoiceSignature2Name.value.trim(),
        title: manualInvoiceSignature2Title.value.trim()
      }
    ]
  };
  const originalButtonText = generateManualInvoicePdfButton.textContent;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 60000);

  try {
    generateManualInvoicePdfButton.disabled = true;
    generateManualInvoicePdfButton.textContent = t("manualInvoiceGenerating");

    const response = await fetch("/api/manual-invoices/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      const errorData = contentType.includes("application/json") ? await response.json() : {};
      throw new Error(translateServerMessage(errorData.message) || t("manualInvoiceError"));
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const invoiceSlug = payload.invoiceNumber || new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `solutions-by-design-invoice-${invoiceSlug}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    manualInvoiceMessage.textContent = t("manualInvoiceReady");
  } catch (error) {
    console.error(error);
    manualInvoiceMessage.textContent = error.name === "AbortError"
      ? t("manualInvoiceError")
      : error.message || t("manualInvoiceError");
  } finally {
    window.clearTimeout(timeoutId);
    generateManualInvoicePdfButton.disabled = false;
    generateManualInvoicePdfButton.textContent = originalButtonText || t("manualInvoicePdfButton");
  }
}

function updateReportExportActions() {
  if (exportPdfButton) {
    exportPdfButton.disabled = !hasGeneratedReport || reportServiceRecords.length === 0;
  }

  if (exportExcelButton) {
    exportExcelButton.disabled = !hasGeneratedReport || reportServiceRecords.length === 0;
  }
}

function renderServiceHoursReport() {
  reportsTotalCount.textContent = formatNumber(reportServiceRecords.length, 0);
  renderReportsSummary();

  if (reportServiceRecords.length === 0) {
    const message = hasGeneratedReport ? t("noReportTickets") : t("reportInitial");
    updateReportExportActions();
    showReportsMessage(message);
    return;
  }

  reportsTableBody.innerHTML = reportServiceRecords.map((record) => `
    <tr>
      <td>#${record.ServiceRecordID}</td>
      <td>${escapeHTML(record.TechnicianName || "")}</td>
      <td>${escapeHTML(record.ClientName || "")}</td>
      <td>${escapeHTML(record.ProjectName || "")}</td>
      <td>${escapeHTML(formatDateOnly(record.ServiceDate))}</td>
      <td>${formatNumber(record.TotalHours)}</td>
      <td><span class="badge ${getServiceRecordStatusClass(record.Status)}">${escapeHTML(translateServiceRecordStatus(record.Status))}</span></td>
      <td class="ticket-description">${escapeHTML(cleanDisplayText(record.ServiceDescription))}</td>
    </tr>
  `).join("");
  updateReportExportActions();
}

function showReportsMessage(message) {
  reportsTotalCount.textContent = formatNumber(reportServiceRecords.length, 0);
  updateReportExportActions();
  reportsTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="empty-state">${message}</td>
    </tr>
  `;
}

function renderReportsSummary() {
  if (!reportsSummaryGrid) return;

  if (!reportSummary) {
    reportsSummaryGrid.innerHTML = "";
    return;
  }

  const metrics = [
    { key: "TotalRecords", label: currentLanguage === "es" ? "Total registros" : "Total records", type: "count" },
    { key: "TotalHours", label: currentLanguage === "es" ? "Total horas" : "Total hours", type: "hours" },
    { key: "BilledHours", label: currentLanguage === "es" ? "Horas procesadas" : "Processed hours", type: "hours" },
    { key: "UnbilledHours", label: currentLanguage === "es" ? "Horas pendientes" : "Pending hours", type: "hours" },
    { key: "CanceledHours", label: currentLanguage === "es" ? "Horas canceladas" : "Canceled hours", type: "hours" }
  ];

  reportsSummaryGrid.innerHTML = metrics.map((metric, index) => `
    <article class="stat-card dashboard-summary-card">
      <div class="stat-icon ${index % 3 === 0 ? "stat-open" : index % 3 === 1 ? "stat-progress" : "stat-closed"}" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-3"/></svg>
      </div>
      <div>
        <span>${escapeHTML(metric.label)}</span>
        <strong>${formatDashboardMetric(reportSummary?.[metric.key], metric.type)}</strong>
      </div>
    </article>
  `).join("");
}

function getUserRoleClass(role) {
  if (role === "Technician") return "role-technician";
  if (normalizeClientRole(role) === "ProjectManager") return "role-project-manager";
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
  openCount.textContent = formatNumber(countTicketsByStatus("Abierto"), 0);
  progressCount.textContent = formatNumber(countTicketsByStatus("En Progreso"), 0);
  closedCount.textContent = formatNumber(countTicketsByStatus("Cerrado"), 0);
  totalCount.textContent = formatNumber(tickets.length, 0);
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
  const role = normalizeClientRole(userRole.value);
  const selectedProjectIds = role === "ProjectManager" ? getSelectedProjectIds(userProjectAssignments) : [];

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
        role,
        projectIds: selectedProjectIds
      })
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(data.message) || t("createUserError"));
    }

    userForm.reset();
    hidePasswordFields();
    userRole.value = "User";
    updateUserProjectAssignmentVisibility();
    renderUserProjectAssignmentOptions(userProjectAssignments, []);
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

  if (action === "toggle-active") {
    toggleUserStatus(userId, button.dataset.nextActive === "true");
  }

  if (action === "view-projects") {
    openUserProjectsDetail(userId);
  }
}

function updateUserProjectAssignmentVisibility() {
  const isCreateProjectManager = normalizeClientRole(userRole?.value) === "ProjectManager";
  const isEditProjectManager = normalizeClientRole(editRole?.value) === "ProjectManager";
  userProjectAssignmentsSection?.classList.toggle("hidden", !isCreateProjectManager);
  editUserProjectAssignmentsSection?.classList.toggle("hidden", !isEditProjectManager);

  if (isCreateProjectManager || isEditProjectManager) {
    loadAssignableProjects();
  }
}

async function openUserProjectsDetail(userId) {
  const user = users.find((item) => Number(item.UserID) === Number(userId));
  if (!user || normalizeClientRole(user.Role) !== "ProjectManager") return;

  userProjectsDetailTitle.textContent = `${t("assignedProjectsDetail")} - ${user.FullName}`;
  activeUserProjectDetailUserId = Number(userId);
  manageUserProjectAssignmentsButton?.classList.toggle("hidden", !isAdmin());
  userProjectsDetailSummary.textContent = t("projectAssignmentsLoading");
  userProjectsDetailBody.innerHTML = "";
  userProjectsDetailModal.classList.remove("hidden");

  try {
    const response = await fetch(`/api/users/${userId}/project-assignments`, { cache: "no-store" });
    const assignments = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(translateServerMessage(assignments.message) || t("projectAssignmentsError"));
    }

    userProjectsDetailSummary.textContent = `${formatNumber(assignments.length, 0)} ${t(assignments.length === 1 ? "assignedProjectCountSingular" : "assignedProjectCount")}`;
    userProjectsDetailBody.innerHTML = assignments.length ? assignments.map((assignment) => {
      const active = assignment.ProjectIsActive === true || Number(assignment.ProjectIsActive) === 1;
      return `
        <tr>
          <td>${escapeHTML(assignment.ClientName || "-")}</td>
          <td>${escapeHTML(assignment.ProjectName || "-")}</td>
          <td><span class="badge ${active ? "user-status-active" : "user-status-inactive"}">${active ? t("active") : t("inactive")}</span></td>
          <td>${formatDate(assignment.AssignedAt)}</td>
        </tr>
      `;
    }).join("") : `<tr><td colspan="4" class="empty-state">${escapeHTML(t("unassigned"))}</td></tr>`;
  } catch (error) {
    console.error(error);
    userProjectsDetailSummary.textContent = error.message || t("projectAssignmentsError");
    userProjectsDetailBody.innerHTML = `<tr><td colspan="4" class="empty-state">${escapeHTML(t("projectAssignmentsError"))}</td></tr>`;
  }
}

function closeUserProjectsDetail() {
  userProjectsDetailModal.classList.add("hidden");
  userProjectsDetailBody.innerHTML = "";
  activeUserProjectDetailUserId = null;
}

function manageUserProjectAssignmentsFromDetail() {
  const userId = activeUserProjectDetailUserId;
  if (!userId || !isAdmin()) return;

  closeUserProjectsDetail();
  openUserEditor(userId).then(() => {
    editUserProjectAssignmentsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }).catch((error) => {
    console.error(error);
  });
}

async function openUserEditor(userId) {
  const user = users.find((item) => Number(item.UserID) === userId);

  if (!user) {
    alert(t("userNotFound"));
    return;
  }

  editUserId.value = user.UserID;
  editFullName.value = user.FullName;
  editEmail.value = user.Email;
  editPassword.value = "";
  editRole.value = normalizeClientRole(user.Role);
  editUserIsActive.checked = isUserActive(user);
  editUserMessage.textContent = "";
  renderUserProjectAssignmentOptions(editUserProjectAssignments, []);
  updateUserProjectAssignmentVisibility();
  if (normalizeClientRole(user.Role) === "ProjectManager") {
    await loadAssignableProjects();
    try {
      const response = await fetch(`/api/users/${userId}/project-assignments`, { cache: "no-store" });
      const assignments = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(translateServerMessage(assignments.message) || t("projectAssignmentsError"));
      }
      renderUserProjectAssignmentOptions(
        editUserProjectAssignments,
        assignments.map((assignment) => Number(assignment.ProjectID))
      );
    } catch (error) {
      console.error(error);
      editUserMessage.textContent = error.message || t("projectAssignmentsError");
    }
  }
  editUserModal.classList.remove("hidden");
}

function closeUserEditor() {
  editUserModal.classList.add("hidden");
  editUserForm.reset();
  editUserMessage.textContent = "";
  hidePasswordFields();
  renderUserProjectAssignmentOptions(editUserProjectAssignments, []);
  editUserProjectAssignmentsSection?.classList.add("hidden");
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
  const existingUser = users.find((item) => Number(item.UserID) === userId);
  const role = normalizeClientRole(editRole.value);
  const selectedProjectIds = role === "ProjectManager" ? getSelectedProjectIds(editUserProjectAssignments) : [];

  if (
    existingUser
    && normalizeClientRole(existingUser.Role) === "ProjectManager"
    && role !== "ProjectManager"
    && Number(existingUser.AssignedProjectCount || 0) > 0
    && !confirm(t("changeProjectManagerRoleConfirm"))
  ) {
    return;
  }

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
        role,
        isActive: editUserIsActive.checked,
        projectIds: selectedProjectIds
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

async function toggleUserStatus(userId, nextIsActive) {
  const confirmed = confirm(t("deleteUserConfirm"));

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`/api/users/${userId}/status`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ IsActive: nextIsActive })
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

function formatDateOnly(value) {
  if (!value) return "";

  return String(value).slice(0, 10);
}

function normalizeTimeInput(value) {
  if (!value) return "";

  return String(value).slice(0, 5);
}

function formatServiceRecordTime(value) {
  return normalizeTimeInput(value) || "-";
}

function getTimeMinutes(value) {
  if (!value) return null;

  const [hours, minutes] = String(value).split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;

  return (hours * 60) + minutes;
}

function calculateServiceRecordHours(payload = null) {
  const intervals = [
    {
      start: payload?.MorningStart ?? morningStart.value,
      end: payload?.MorningEnd ?? morningEnd.value
    },
    {
      start: payload?.AfternoonStart ?? afternoonStart.value,
      end: payload?.AfternoonEnd ?? afternoonEnd.value
    }
  ];
  let minutes = 0;

  for (const interval of intervals) {
    const startMinutes = getTimeMinutes(interval.start);
    const endMinutes = getTimeMinutes(interval.end);

    if ((startMinutes === null) !== (endMinutes === null)) {
      return { hours: 0, error: t("serviceRecordTimeError") };
    }

    if (startMinutes === null) continue;

    if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) {
      return { hours: 0, error: t("serviceRecordTimeError") };
    }

    minutes += endMinutes - startMinutes;
  }

  if (minutes <= 0) {
    return { hours: 0, error: t("serviceRecordTimeError") };
  }

  return {
    hours: Math.round((minutes / 60) * 100) / 100,
    error: ""
  };
}

function updateServiceRecordTotalPreview() {
  if (!serviceRecordTotalPreview) return;

  const result = calculateServiceRecordHours();
  serviceRecordTotalPreview.textContent = result.error ? formatNumber(0) : formatNumber(result.hours);
}

function getServiceRecordStatusClass(status) {
  if (status === "Recorded") return "service-status-pending";
  if (status === "Billed") return "service-status-processed";
  return "service-status-canceled";
}

function getInvoiceStatusClass(status) {
  if (status === "Draft") return "status-progreso";
  if (status === "Issued") return "status-abierto";
  if (status === "Paid") return "status-cerrado";
  return "status-cerrado";
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  });
}

function formatNumber(value, fractionDigits = 2) {
  const amount = Number(value || 0);
  const digits = Number.isInteger(fractionDigits) && fractionDigits >= 0 ? fractionDigits : 2;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(amount);
}

function formatDashboardMetric(value, type) {
  if (type === "currency") {
    return "";
  }

  if (type === "hours") {
    return `${formatNumber(value)} h`;
  }

  return formatNumber(value, 0);
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

function cleanDisplayText(value) {
  const raw = String(value || "");
  const withReadableBreaks = raw
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*(div|p|li|tr|section|article)\s*>/gi, "\n")
    .replace(/<\s*(div|p|li|tr|section|article)(\s[^>]*)?>/gi, "");
  const withoutTags = withReadableBreaks.replace(/<[^>]*>/g, "");
  const decoder = document.createElement("textarea");
  decoder.innerHTML = withoutTags;

  return decoder.value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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
clientStatusFilter.addEventListener("change", loadClients);
clientsTableBody.addEventListener("click", handleClientsTableClick);
clientForm.addEventListener("submit", saveClient);
closeClientModal.addEventListener("click", closeClientEditor);
clientModal.addEventListener("click", (event) => {
  if (event.target === clientModal) {
    closeClientEditor();
  }
});
addProjectButton.addEventListener("click", () => openProjectEditor("create"));
projectSearchInput.addEventListener("input", loadProjects);
projectClientFilter.addEventListener("change", loadProjects);
projectStatusFilter.addEventListener("change", loadProjects);
projectsTableBody.addEventListener("click", handleProjectsTableClick);
projectForm.addEventListener("submit", saveProject);
closeProjectModal.addEventListener("click", closeProjectEditor);
projectModal.addEventListener("click", (event) => {
  if (event.target === projectModal) {
    closeProjectEditor();
  }
});
addServiceRecordButton.addEventListener("click", () => openServiceRecordEditor("create"));
serviceRecordSearchInput.addEventListener("input", loadServiceRecords);
serviceRecordTechnicianFilter.addEventListener("change", loadServiceRecords);
serviceRecordClientFilter.addEventListener("change", () => {
  renderServiceRecordOptions();
  loadServiceRecords();
});
serviceRecordProjectFilter.addEventListener("change", loadServiceRecords);
serviceRecordDateFilter.addEventListener("change", loadServiceRecords);
serviceRecordStatusFilter.addEventListener("change", loadServiceRecords);
serviceRecordsTableBody.addEventListener("click", handleServiceRecordsTableClick);
serviceRecordForm.addEventListener("submit", saveServiceRecord);
closeServiceRecordModal.addEventListener("click", closeServiceRecordEditor);
serviceRecordModal.addEventListener("click", (event) => {
  if (event.target === serviceRecordModal) {
    closeServiceRecordEditor();
  }
});
serviceRecordClientId.addEventListener("change", () => {
  serviceRecordProjectId.value = "";
  renderServiceRecordOptions();
});
[morningStart, morningEnd, afternoonStart, afternoonEnd].forEach((input) => {
  input.addEventListener("input", updateServiceRecordTotalPreview);
});
generateInvoiceButton.addEventListener("click", openInvoiceGenerateModal);
invoiceSearchInput.addEventListener("input", loadInvoices);
invoiceClientFilter.addEventListener("change", loadInvoices);
invoiceFromFilter.addEventListener("change", loadInvoices);
invoiceToFilter.addEventListener("change", loadInvoices);
invoiceStatusFilter.addEventListener("change", loadInvoices);
invoicesTableBody.addEventListener("click", handleInvoicesTableClick);
invoiceGenerateForm.addEventListener("submit", generateInvoice);
closeInvoiceGenerateModal.addEventListener("click", closeInvoiceGenerateEditor);
invoiceGenerateModal.addEventListener("click", (event) => {
  if (event.target === invoiceGenerateModal) {
    closeInvoiceGenerateEditor();
  }
});
invoiceStatusForm.addEventListener("submit", saveInvoiceStatus);
closeInvoiceStatusModal.addEventListener("click", closeInvoiceStatusEditor);
invoiceStatusModal.addEventListener("click", (event) => {
  if (event.target === invoiceStatusModal) {
    closeInvoiceStatusEditor();
  }
});
closeInvoiceDetailModal.addEventListener("click", closeInvoiceDetail);
invoiceDetailModal.addEventListener("click", (event) => {
  if (event.target === invoiceDetailModal) {
    closeInvoiceDetail();
  }
});
dashboardSummaryGrid.addEventListener("click", handleDashboardCardAction);
dashboardSummaryGrid.addEventListener("keydown", handleDashboardCardKeydown);
dashboardTabPanel.addEventListener("click", handleDashboardBarClick);
closeDashboardDetailButton.addEventListener("click", closeDashboardDetail);
dashboardProjectSearchInput.addEventListener("input", handleDashboardProjectSearch);
dashboardProjectSelect.addEventListener("change", handleDashboardProjectSelect);
dashboardTechnicianSearchInput.addEventListener("input", handleDashboardTechnicianSearch);
dashboardTechnicianSelect.addEventListener("change", handleDashboardTechnicianSelect);
dashboardTechnicianProjectSelect.addEventListener("change", handleDashboardTechnicianProjectSelect);
dashboardTechnicianDateFrom.addEventListener("change", handleDashboardTechnicianDateChange);
dashboardTechnicianDateTo.addEventListener("change", handleDashboardTechnicianDateChange);
dashboardTechnicianRecordsBody.addEventListener("click", handleDashboardTechnicianRecordsClick);
dashboardTechnicianDescriptionForm.addEventListener("submit", saveDashboardTechnicianDescription);
closeDashboardTechnicianDescriptionModal.addEventListener("click", closeDashboardTechnicianDescriptionEditor);
dashboardTechnicianDescriptionModal.addEventListener("click", (event) => {
  if (event.target === dashboardTechnicianDescriptionModal) {
    closeDashboardTechnicianDescriptionEditor();
  }
});
ticketForm.addEventListener("submit", createTicket);
ticketTableBody.addEventListener("click", handleTableClick);
notificationsTableBody.addEventListener("click", handleNotificationsClick);
userForm.addEventListener("submit", createUser);
userRole.addEventListener("change", updateUserProjectAssignmentVisibility);
userProjectAssignments.dataset.assignmentKind = "projects";
userProjectAssignments.addEventListener("input", handleProjectAssignmentPickerInput);
userProjectAssignments.addEventListener("change", handleProjectAssignmentPickerChange);
userProjectAssignments.addEventListener("click", handleProjectAssignmentPickerClick);
userSearchInput.addEventListener("input", renderUsers);
userStatusFilter.addEventListener("change", renderUsers);
userRoleFilter.addEventListener("change", renderUsers);
usersTableBody.addEventListener("click", handleUsersTableClick);
passwordResetsTableBody.addEventListener("click", handlePasswordResetsClick);
reportsForm.addEventListener("submit", generateReport);
exportPdfButton.addEventListener("click", exportServiceHoursPdf);
exportExcelButton.addEventListener("click", exportServiceHoursExcel);
manualInvoiceForm.addEventListener("submit", generateManualInvoicePdf);
addManualInvoiceLineButton.addEventListener("click", addManualInvoiceLine);
manualInvoiceApplyTax.addEventListener("change", updateManualInvoiceSummary);
manualInvoiceTaxRate.addEventListener("input", updateManualInvoiceSummary);
manualInvoiceLinesBody.addEventListener("input", (event) => {
  const row = event.target.closest(".manual-invoice-line");
  if (!row) return;

  const lineId = Number(row.dataset.lineId);

  if (event.target.classList.contains("manual-invoice-line-quantity")) {
    updateManualInvoiceLine(lineId, "quantity", event.target.value);
  }

  if (event.target.classList.contains("manual-invoice-line-description")) {
    updateManualInvoiceLine(lineId, "description", event.target.value);
  }

  if (event.target.classList.contains("manual-invoice-line-rate")) {
    updateManualInvoiceLine(lineId, "rate", event.target.value);
  }

  const line = manualInvoiceLines.find((item) => item.id === lineId);
  const amountOutput = row.querySelector(".manual-invoice-line-amount");
  if (line && amountOutput) {
    amountOutput.textContent = formatManualInvoiceCurrency(calculateManualInvoiceLineAmount(line));
  }
});
manualInvoiceLinesBody.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".manual-invoice-line-remove");
  if (!removeButton) return;

  const row = removeButton.closest(".manual-invoice-line");
  removeManualInvoiceLine(Number(row.dataset.lineId));
});
reportClient.addEventListener("change", async () => {
  reportProject.value = "";
  renderReportLookupOptions();
  await refreshReportTechnicianOptions();
});
reportProject.addEventListener("change", refreshReportTechnicianOptions);
reportFrom.addEventListener("change", refreshReportTechnicianOptions);
reportTo.addEventListener("change", refreshReportTechnicianOptions);
reportStatus.addEventListener("change", refreshReportTechnicianOptions);
editTicketForm.addEventListener("submit", updateTicket);
closeEditModal.addEventListener("click", closeEditor);
editUserForm.addEventListener("submit", updateUser);
editRole.addEventListener("change", updateUserProjectAssignmentVisibility);
projectManagerAssignments.dataset.assignmentKind = "managers";
projectManagerAssignments.addEventListener("input", handleProjectAssignmentPickerInput);
projectManagerAssignments.addEventListener("change", handleProjectAssignmentPickerChange);
projectManagerAssignments.addEventListener("click", handleProjectAssignmentPickerClick);
closeProjectManagersDetailModal.addEventListener("click", closeProjectManagersDetail);
manageProjectManagersButton.addEventListener("click", manageProjectManagersFromDetail);
editUserProjectAssignments.dataset.assignmentKind = "projects";
editUserProjectAssignments.addEventListener("input", handleProjectAssignmentPickerInput);
editUserProjectAssignments.addEventListener("change", handleProjectAssignmentPickerChange);
editUserProjectAssignments.addEventListener("click", handleProjectAssignmentPickerClick);
temporaryPasswordButton.addEventListener("click", assignTemporaryPassword);
closeEditUserModal.addEventListener("click", closeUserEditor);
closeUserProjectsDetailModal.addEventListener("click", closeUserProjectsDetail);
manageUserProjectAssignmentsButton.addEventListener("click", manageUserProjectAssignmentsFromDetail);
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
userProjectsDetailModal.addEventListener("click", (event) => {
  if (event.target === userProjectsDetailModal) {
    closeUserProjectsDetail();
  }
});
projectManagersDetailModal.addEventListener("click", (event) => {
  if (event.target === projectManagersDetailModal) {
    closeProjectManagersDetail();
  }
});
searchInput.addEventListener("input", renderTickets);
statusFilter.addEventListener("change", renderTickets);
priorityFilter.addEventListener("change", renderTickets);

applyLanguage();
checkSession();
