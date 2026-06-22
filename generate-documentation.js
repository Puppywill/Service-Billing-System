const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const JSZip = require("jszip");

const outputDocx = "HelpDesk_Ticket_System_Documentation.docx";
const outputPdf = "HelpDesk_Ticket_System_Documentation.pdf";
const dateText = "18 de junio de 2026";

const screenshots = [
  { title: "Login", file: "login.png", caption: "Pantalla de inicio de sesión con autenticación de usuarios y roles." },
  { title: "Admin Dashboard", file: "admin-dashboard.png", caption: "Panel principal del administrador con métricas, navegación y resumen de actividad." },
  { title: "Tickets", file: "tickets-admin.png", caption: "Módulo de tickets con creación, filtros, estados, prioridades y acciones administrativas." },
  { title: "Administración de Usuarios", file: "users-admin.png", caption: "Panel de usuarios para crear cuentas, asignar roles y administrar solicitudes." },
  { title: "Notificaciones", file: "notifications.png", caption: "Centro de notificaciones para eventos importantes del sistema." },
  { title: "Reportes", file: "reports.png", caption: "Módulo de reportes con filtros por fecha, estado y prioridad, además de exportación PDF/Excel." },
  { title: "Forgot Password", file: "forgot-password.png", caption: "Flujo de recuperación de contraseña integrado al sistema." },
];

const sections = [
  {
    title: "Introducción",
    paragraphs: [
      "Help Desk Ticket System es una aplicación web profesional diseñada para simular un entorno real de IT Support y Help Desk. El sistema permite registrar, consultar, administrar y dar seguimiento a solicitudes de soporte técnico desde una interfaz moderna, organizada y responsiva.",
      "El proyecto está orientado a demostrar habilidades prácticas en desarrollo web, soporte técnico, administración de usuarios, autenticación, manejo de bases de datos y generación de reportes empresariales."
    ],
  },
  {
    title: "Objetivo del Sistema",
    bullets: [
      "Gestionar tickets de soporte técnico de forma centralizada.",
      "Administrar usuarios reales del sistema.",
      "Controlar permisos mediante roles Admin y User.",
      "Generar reportes profesionales en PDF y Excel usando datos reales.",
      "Mantener trazabilidad básica mediante fechas, usuarios y notificaciones."
    ],
  },
  {
    title: "Tecnologías Utilizadas",
    bullets: ["HTML", "CSS", "JavaScript", "Node.js", "Express", "SQL Server", "PDFKit", "ExcelJS"],
  },
  {
    title: "Funcionalidades Principales",
    bullets: [
      "Login con roles Admin y User.",
      "Creación de tickets asociados al usuario autenticado.",
      "Edición de tickets por usuarios administradores.",
      "Cierre de tickets.",
      "Administración de usuarios.",
      "Flujo de Forgot Password.",
      "Notificaciones internas.",
      "Dashboard con métricas del sistema.",
      "Reportes PDF con branding profesional.",
      "Reportes Excel con datos organizados."
    ],
  },
  {
    title: "Flujo del Sistema",
    bullets: [
      "El usuario inicia sesión con sus credenciales.",
      "El usuario crea un ticket de soporte desde su cuenta.",
      "El administrador revisa los tickets reportados.",
      "El administrador puede editar, cerrar o eliminar tickets según el caso.",
      "El administrador genera reportes PDF o Excel para análisis y documentación."
    ],
  },
  {
    title: "Conclusión",
    paragraphs: [
      "Este proyecto demuestra competencias aplicadas en desarrollo web full stack, soporte técnico, bases de datos, autenticación, control de roles, generación de reportes y documentación profesional.",
      "Help Desk Ticket System funciona como una pieza sólida de portafolio para roles de IT Support, Help Desk, Database Support, Junior Developer y Full Stack Developer."
    ],
  },
];

function screenshotPath(file) {
  return path.join(__dirname, "screenshots", file);
}

function pngDimensions(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) {
    return { width: 1200, height: 800 };
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function ensureScreenshots() {
  const missing = screenshots.filter((shot) => !fs.existsSync(screenshotPath(shot.file)));
  if (missing.length) {
    throw new Error(`Missing screenshots: ${missing.map((shot) => shot.file).join(", ")}`);
  }
}

function addPdfHeader(doc, title) {
  const width = doc.page.width;
  doc.rect(0, 0, width, 90).fill("#08213d");
  doc.fillColor("#24c6b7").rect(0, 87, width, 3).fill();
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(22).text(title, 48, 28);
  doc.font("Helvetica").fontSize(10).fillColor("#d8eef7").text("William Rosado Pérez | Portfolio Project", 48, 58);
}

function addPdfFooter(doc, pageNumber) {
  const y = doc.page.height - 42;
  doc.moveTo(48, y - 10).lineTo(doc.page.width - 48, y - 10).strokeColor("#d6e4ef").lineWidth(0.5).stroke();
  doc.fillColor("#506070").font("Helvetica").fontSize(9).text("Help Desk Ticket System", 48, y);
  doc.text(`Página ${pageNumber}`, doc.page.width - 120, y, { width: 72, align: "right" });
}

function addPdfSectionTitle(doc, title) {
  doc.moveDown(1);
  doc.fillColor("#08213d").font("Helvetica-Bold").fontSize(16).text(title);
  doc.moveDown(0.4);
}

function addPdfBullet(doc, text) {
  doc.fillColor("#1d2935").font("Helvetica").fontSize(11).text(`• ${text}`, { indent: 14, lineGap: 2 });
}

function ensurePdfSpace(doc, needed, pageNumberRef) {
  const bottom = doc.page.height - 70;
  if (doc.y + needed > bottom) {
    addPdfFooter(doc, pageNumberRef.value);
    doc.addPage();
    pageNumberRef.value += 1;
    addPdfHeader(doc, "Help Desk Ticket System");
    doc.y = 120;
  }
}

function createPdf() {
  const doc = new PDFDocument({ size: "LETTER", margin: 48, autoFirstPage: true });
  const stream = fs.createWriteStream(path.join(__dirname, outputPdf));
  doc.pipe(stream);

  const pageNumber = { value: 1 };

  addPdfHeader(doc, "Help Desk Ticket System");
  doc.y = 145;
  doc.fillColor("#08213d").font("Helvetica-Bold").fontSize(28).text("Help Desk Ticket System", { align: "center" });
  doc.moveDown(0.6);
  doc.fillColor("#1d2935").font("Helvetica").fontSize(15).text("William Rosado Pérez", { align: "center" });
  doc.text("Portfolio Project", { align: "center" });
  doc.text(dateText, { align: "center" });
  doc.moveDown(2);
  doc.fillColor("#506070").fontSize(11).text(
    "Documentación profesional del sistema, incluyendo objetivo, tecnologías, funcionalidades, flujo de trabajo, capturas de pantalla y conclusión.",
    { align: "center", lineGap: 3 }
  );

  addPdfFooter(doc, pageNumber.value);
  doc.addPage();
  pageNumber.value += 1;
  addPdfHeader(doc, "Documentación del Sistema");
  doc.y = 120;

  for (const section of sections.slice(0, -1)) {
    ensurePdfSpace(doc, 110, pageNumber);
    addPdfSectionTitle(doc, section.title);
    if (section.paragraphs) {
      section.paragraphs.forEach((paragraph) => {
        doc.fillColor("#1d2935").font("Helvetica").fontSize(11).text(paragraph, { lineGap: 3 });
        doc.moveDown(0.5);
      });
    }
    if (section.bullets) {
      section.bullets.forEach((bullet) => addPdfBullet(doc, bullet));
      doc.moveDown(0.4);
    }
  }

  ensurePdfSpace(doc, 130, pageNumber);
  addPdfSectionTitle(doc, "Screenshots");
  doc.fillColor("#1d2935").font("Helvetica").fontSize(11).text(
    "Las siguientes capturas muestran las pantallas principales del sistema y su flujo operativo.",
    { lineGap: 3 }
  );

  for (const shot of screenshots) {
    const buffer = fs.readFileSync(screenshotPath(shot.file));
    const dimensions = pngDimensions(buffer);
    const maxWidth = doc.page.width - 96;
    const imageHeight = Math.min(240, maxWidth * (dimensions.height / dimensions.width));
    ensurePdfSpace(doc, imageHeight + 80, pageNumber);
    doc.moveDown(0.8);
    doc.fillColor("#08213d").font("Helvetica-Bold").fontSize(13).text(shot.title);
    doc.fillColor("#506070").font("Helvetica").fontSize(9).text(shot.caption);
    doc.moveDown(0.4);
    doc.image(screenshotPath(shot.file), { fit: [maxWidth, imageHeight], align: "center" });
    doc.moveDown(0.8);
  }

  ensurePdfSpace(doc, 130, pageNumber);
  const conclusion = sections[sections.length - 1];
  addPdfSectionTitle(doc, conclusion.title);
  conclusion.paragraphs.forEach((paragraph) => {
    doc.fillColor("#1d2935").font("Helvetica").fontSize(11).text(paragraph, { lineGap: 3 });
    doc.moveDown(0.5);
  });

  addPdfFooter(doc, pageNumber.value);
  doc.end();

  return new Promise((resolve) => stream.on("finish", resolve));
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraph(text, style = "BodyText", align = null) {
  const alignment = align ? `<w:jc w:val="${align}"/>` : "";
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/>${alignment}</w:pPr><w:r><w:t>${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function bullet(text) {
  return `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t>${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function heading(text, level = 1) {
  return paragraph(text, `Heading${level}`);
}

function pageBreak() {
  return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
}

function imageXml({ relId, widthPx, heightPx, caption }) {
  const maxWidthEmu = 4389120;
  const ratio = heightPx / widthPx;
  const widthEmu = maxWidthEmu;
  const heightEmu = Math.min(2057400, Math.round(widthEmu * ratio));
  return `
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="40" w:after="80"/></w:pPr>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wp:extent cx="${widthEmu}" cy="${heightEmu}"/>
            <wp:docPr id="${relId.replace("rId", "")}" name="${xmlEscape(caption)}"/>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr><pic:cNvPr id="0" name="${xmlEscape(caption)}"/><pic:cNvPicPr/></pic:nvPicPr>
                  <pic:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
                  <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>`;
}

function footerXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:tabs><w:tab w:val="right" w:pos="10800"/></w:tabs>
      <w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="D6E4EF"/></w:pBdr>
    </w:pPr>
    <w:r><w:rPr><w:color w:val="506070"/><w:sz w:val="18"/></w:rPr><w:t>Help Desk Ticket System</w:t></w:r>
    <w:r><w:tab/></w:r>
    <w:r><w:rPr><w:color w:val="506070"/><w:sz w:val="18"/></w:rPr><w:t>Página </w:t></w:r>
    <w:r><w:rPr><w:color w:val="506070"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>
    <w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
    <w:r><w:fldChar w:fldCharType="separate"/></w:r>
    <w:r><w:t>1</w:t></w:r>
    <w:r><w:fldChar w:fldCharType="end"/></w:r>
  </w:p>
</w:ftr>`;
}

async function createDocx() {
  const zip = new JSZip();
  const imageRels = [];
  const body = [];

  body.push(paragraph("Help Desk Ticket System", "Title"));
  body.push(paragraph("William Rosado Pérez", "Subtitle"));
  body.push(paragraph("Portfolio Project", "Subtitle"));
  body.push(paragraph(dateText, "Subtitle"));
  body.push(paragraph("Documentación profesional del sistema de tickets para IT Support y Help Desk.", "BodyText"));
  body.push(pageBreak());

  for (const section of sections.slice(0, -1)) {
    body.push(heading(section.title));
    section.paragraphs?.forEach((text) => body.push(paragraph(text)));
    section.bullets?.forEach((text) => body.push(bullet(text)));
  }

  body.push(heading("Screenshots"));
  body.push(paragraph("Capturas principales del sistema usando las imágenes reales de la carpeta screenshots."));

  screenshots.forEach((shot, index) => {
    const buffer = fs.readFileSync(screenshotPath(shot.file));
    const relId = `rId${index + 1}`;
    const mediaName = `image${index + 1}.png`;
    const dimensions = pngDimensions(buffer);
    zip.file(`word/media/${mediaName}`, buffer);
    imageRels.push({ relId, mediaName });
    body.push(heading(shot.title, 2));
    body.push(paragraph(shot.caption, "Caption"));
    body.push(imageXml({ relId, widthPx: dimensions.width, heightPx: dimensions.height, caption: shot.title }));
  });

  const conclusion = sections[sections.length - 1];
  body.push(heading(conclusion.title));
  conclusion.paragraphs.forEach((text) => body.push(paragraph(text)));

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${body.join("\n")}
    <w:sectPr>
      <w:footerReference w:type="default" r:id="rIdFooter"/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="20"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="160"/></w:pPr><w:rPr><w:b/><w:color w:val="08213D"/><w:sz w:val="48"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="80"/></w:pPr><w:rPr><w:color w:val="506070"/><w:sz w:val="24"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="180" w:after="80"/><w:keepNext/></w:pPr><w:rPr><w:b/><w:color w:val="08213D"/><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="100" w:after="40"/><w:keepNext/></w:pPr><w:rPr><w:b/><w:color w:val="0F766E"/><w:sz w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="BodyText"><w:name w:val="Body Text"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="80" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:color w:val="1D2935"/><w:sz w:val="20"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Caption"><w:name w:val="Caption"/><w:basedOn w:val="BodyText"/><w:pPr><w:spacing w:after="40" w:line="220" w:lineRule="auto"/></w:pPr><w:rPr><w:i/><w:color w:val="506070"/><w:sz w:val="18"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="BodyText"/><w:pPr><w:spacing w:after="40" w:line="220" w:lineRule="auto"/><w:ind w:left="540" w:hanging="260"/></w:pPr></w:style>
</w:styles>`;

  const numberingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>`;

  const relationshipsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const documentRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
  ${imageRels.map((rel) => `<Relationship Id="${rel.relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${rel.mediaName}"/>`).join("\n")}
</Relationships>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`;

  zip.file("[Content_Types].xml", contentTypesXml);
  zip.folder("_rels").file(".rels", relationshipsXml);
  zip.folder("word").file("document.xml", documentXml);
  zip.folder("word").file("styles.xml", stylesXml);
  zip.folder("word").file("numbering.xml", numberingXml);
  zip.folder("word").file("footer1.xml", footerXml());
  zip.folder("word").folder("_rels").file("document.xml.rels", documentRelsXml);

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(path.join(__dirname, outputDocx), buffer);
}

(async () => {
  ensureScreenshots();
  await createPdf();
  await createDocx();
  console.log(`Created ${outputPdf}`);
  console.log(`Created ${outputDocx}`);
})();
