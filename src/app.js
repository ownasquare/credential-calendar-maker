import {
  CredentialCsvError,
  parseCredentialCsv,
} from "./credential-records.js";
import { buildCredentialCalendar, calendarFilename } from "./icalendar.js";

/**
 * @template {Element} T
 * @param {string} selector
 * @param {{new (...args: any[]): T}} Type
 * @returns {T}
 */
function requiredElement(selector, Type) {
  const element = document.querySelector(selector);
  if (!(element instanceof Type))
    throw new Error(`Missing app element: ${selector}`);
  return element;
}

const fileInput = requiredElement("#csv-file", HTMLInputElement);
const dropZone = requiredElement("#drop-zone", HTMLLabelElement);
const fileTitle = requiredElement("#file-title", HTMLElement);
const fileDetail = requiredElement("#file-detail", HTMLElement);
const status = requiredElement("#status", HTMLDivElement);
const statusMessage = requiredElement("#status-message", HTMLParagraphElement);
const result = requiredElement("#result", HTMLDivElement);
const summary = requiredElement("#summary", HTMLParagraphElement);
const download = requiredElement("#download", HTMLAnchorElement);

/** @type {File | null} */
let selectedFile = null;
/** @type {string | null} */
let downloadUrl = null;

function resetResult() {
  result.hidden = true;
  status.classList.remove("is-error");
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
  download.removeAttribute("href");
}

/**
 * @param {File | null} file
 */
async function selectFile(file) {
  resetResult();
  if (
    !file ||
    (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv")
  ) {
    selectedFile = null;
    status.classList.add("is-error");
    statusMessage.textContent = "Choose a CSV file and try again.";
    return;
  }
  selectedFile = file;
  fileTitle.textContent = file.name;
  fileDetail.textContent = `${Math.max(1, Math.ceil(file.size / 1024))} KB · processing locally`;
  await makeCalendar();
}

fileInput.addEventListener(
  "change",
  () => void selectFile(fileInput.files?.[0] ?? null),
);

for (const eventName of ["dragenter", "dragover"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragging");
  });
}

for (const eventName of ["dragleave", "drop"]) {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragging");
  });
}

dropZone.addEventListener("drop", (event) => {
  const file = "dataTransfer" in event ? event.dataTransfer?.files[0] : null;
  void selectFile(file ?? null);
});

async function makeCalendar() {
  if (!selectedFile) return;
  resetResult();
  statusMessage.textContent = "Reading dates on this device…";
  try {
    const text = await selectedFile.text();
    const parsed = parseCredentialCsv(text);
    const ics = buildCredentialCalendar(parsed.records);
    downloadUrl = URL.createObjectURL(
      new Blob([ics], { type: "text/calendar;charset=utf-8" }),
    );
    download.href = downloadUrl;
    download.download = calendarFilename;
    summary.textContent = [
      `${parsed.summary.included} included`,
      `${parsed.summary.overdue} overdue`,
      `${parsed.summary.duplicates} duplicate`,
      `${parsed.summary.invalid} invalid`,
    ].join(" · ");
    result.hidden = false;
    statusMessage.textContent = "Your renewal calendar is ready.";
  } catch (error) {
    status.classList.add("is-error");
    statusMessage.textContent =
      error instanceof CredentialCsvError
        ? error.message
        : "This file could not be read. Choose the CSV again.";
  } finally {
    fileDetail.textContent = `${Math.max(1, Math.ceil(selectedFile.size / 1024))} KB · processed locally`;
  }
}
