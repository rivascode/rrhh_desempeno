const fs = require("node:fs");
const path = require("node:path");
const XLSX = require("xlsx");

const base = path.resolve(__dirname, "..");
const docs = path.join(base, "documentos_base");
const out = path.join(base, "analysis");
fs.mkdirSync(out, { recursive: true });

const file = "Evaluación de Desempeño - Mandos Medios.xls";
const workbook = XLSX.readFile(path.join(docs, file), { cellFormula: true, cellDates: true });
const result = {
  file,
  type: "xls",
  sheets: workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const sampleRows = [];
    const keywordHits = [];
    let nonEmptyRows = 0;
    let formulaCount = 0;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const compact = rows[rowIndex].map((value) => String(value ?? "").replace(/\s+/g, " ").trim()).filter(Boolean);
      if (compact.length) {
        nonEmptyRows += 1;
        if (sampleRows.length < 30) sampleRows.push({ row: rowIndex + 1, values: compact.slice(0, 18) });
        const joined = compact.join(" | ");
        if (/compet|objetiv|desempeñ|clima|pregunta|respuesta|encuesta|factor|indicador|conducta/i.test(joined)) {
          keywordHits.push({ row: rowIndex + 1, values: compact.slice(0, 18) });
        }
      }
    }

    Object.values(sheet).forEach((cell) => {
      if (cell && typeof cell === "object" && cell.f) formulaCount += 1;
    });

    return {
      name,
      range: sheet["!ref"] || "",
      non_empty_rows: nonEmptyRows,
      formula_count: formulaCount,
      sample_rows: sampleRows,
      keyword_hits: keywordHits.slice(0, 50),
    };
  }),
};

const output = path.join(out, "xls_analysis.json");
fs.writeFileSync(output, JSON.stringify(result, null, 2), "utf8");
console.log(output);
