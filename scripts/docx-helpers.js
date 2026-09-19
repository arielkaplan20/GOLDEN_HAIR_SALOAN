// ============================================================
// עוזרים ליצירת XML של Word (WordprocessingML)
//
// הפורמט כאן מועתק אחד לאחד מהמוסכמות שכבר קיימות בספר הפרויקט:
// גופן David, גודל 28 לטקסט רגיל ו-32 לכותרות, כיוון ימין לשמאל.
// ככה התוכן החדש נראה זהה לתוכן הקיים.
// ============================================================

const FONT = '<w:rFonts w:ascii="David" w:cs="David" w:hAnsi="David"/>';

// מברח תווים שיש להם משמעות מיוחדת ב-XML
function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- פסקאות ----------

// פסקת טקסט רגילה
function p(text, options) {
  const opt = options || {};

  const size = opt.size || 28;
  const bold = opt.bold ? "<w:b/><w:bCs/>" : "";
  const italic = opt.italic ? "<w:i/><w:iCs/>" : "";
  const color = opt.color ? '<w:color w:val="' + opt.color + '"/>' : "";
  const indent = opt.indent ? '<w:ind w:start="' + opt.indent + '"/>' : "";
  const after = opt.after === undefined ? 80 : opt.after;
  const before = opt.before ? ' w:before="' + opt.before + '"' : "";
  const align = opt.align ? '<w:jc w:val="' + opt.align + '"/>' : "";

  return (
    "<w:p><w:pPr><w:bidi/>" +
    align +
    '<w:spacing w:after="' + after + '"' + before + ' w:line="360"/>' +
    indent +
    "</w:pPr>" +
    '<w:r><w:rPr>' + FONT + bold + italic + color +
    '<w:sz w:val="' + size + '"/><w:szCs w:val="' + size + '"/><w:rtl/></w:rPr>' +
    '<w:t xml:space="preserve">' + esc(text) + "</w:t></w:r></w:p>"
  );
}

// כותרת ראשית - כמו "10. תיאור המרכיב האלגוריתמי"
function h1(text) {
  return (
    '<w:p><w:pPr><w:keepNext/><w:bidi/><w:spacing w:after="200" w:before="400"/></w:pPr>' +
    "<w:r><w:rPr>" + FONT +
    '<w:b/><w:bCs/><w:sz w:val="32"/><w:szCs w:val="32"/><w:rtl/></w:rPr>' +
    '<w:t xml:space="preserve">' + esc(text) + "</w:t></w:r></w:p>"
  );
}

// כותרת משנה - כמו "10.1 איזו בעיה בא לפתור"
function h2(text) {
  return (
    '<w:p><w:pPr><w:keepNext/><w:keepLines/><w:bidi/>' +
    '<w:spacing w:after="100" w:before="240" w:line="360"/></w:pPr>' +
    "<w:r><w:rPr>" + FONT +
    '<w:b/><w:bCs/><w:sz w:val="28"/><w:szCs w:val="28"/><w:rtl/></w:rPr>' +
    '<w:t xml:space="preserve">' + esc(text) + "</w:t></w:r></w:p>"
  );
}

// כותרת רמה שלישית
function h3(text) {
  return (
    '<w:p><w:pPr><w:keepNext/><w:bidi/>' +
    '<w:spacing w:after="80" w:before="180" w:line="360"/></w:pPr>' +
    "<w:r><w:rPr>" + FONT +
    '<w:b/><w:bCs/><w:sz w:val="26"/><w:szCs w:val="26"/><w:rtl/></w:rPr>' +
    '<w:t xml:space="preserve">' + esc(text) + "</w:t></w:r></w:p>"
  );
}

// שורת רשימה עם תבליט
function bullet(text) {
  return (
    '<w:p><w:pPr><w:bidi/><w:spacing w:after="60" w:line="360"/>' +
    '<w:ind w:start="720" w:hanging="260"/></w:pPr>' +
    "<w:r><w:rPr>" + FONT +
    '<w:sz w:val="28"/><w:szCs w:val="28"/><w:rtl/></w:rPr>' +
    '<w:t xml:space="preserve">• ' + esc(text) + "</w:t></w:r></w:p>"
  );
}

// שורת רשימה ממוספרת ידנית
function numbered(number, text) {
  return (
    '<w:p><w:pPr><w:bidi/><w:spacing w:after="60" w:line="360"/>' +
    '<w:ind w:start="720" w:hanging="360"/></w:pPr>' +
    "<w:r><w:rPr>" + FONT +
    '<w:b/><w:bCs/><w:sz w:val="28"/><w:szCs w:val="28"/><w:rtl/></w:rPr>' +
    '<w:t xml:space="preserve">' + esc(number) + ". </w:t></w:r>" +
    "<w:r><w:rPr>" + FONT +
    '<w:sz w:val="28"/><w:szCs w:val="28"/><w:rtl/></w:rPr>' +
    '<w:t xml:space="preserve">' + esc(text) + "</w:t></w:r></w:p>"
  );
}

// שורת קוד או פסאודו-קוד - משמאל לימין, גופן ברוחב קבוע
function codeLine(text) {
  return (
    '<w:p><w:pPr><w:spacing w:after="0" w:line="240"/>' +
    '<w:ind w:left="284" w:right="284"/>' +
    '<w:shd w:val="clear" w:fill="F2F2F2"/></w:pPr>' +
    '<w:r><w:rPr><w:rFonts w:ascii="Consolas" w:cs="Consolas" w:hAnsi="Consolas"/>' +
    '<w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>' +
    '<w:t xml:space="preserve">' + esc(text === "" ? " " : text) + "</w:t></w:r></w:p>"
  );
}

function codeBlock(lines) {
  return lines.map(codeLine).join("");
}

// פסקה ריקה, לריווח
function blank() {
  return '<w:p><w:pPr><w:bidi/><w:spacing w:after="0"/></w:pPr></w:p>';
}

// מעבר עמוד
function pageBreak() {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}

// ---------- טבלאות ----------

// תא בודד
function cell(content, options) {
  const opt = options || {};

  const width = opt.width ? Math.round(opt.width * 94) : 1500;
  const shading = opt.fill
    ? '<w:shd w:val="clear" w:fill="' + opt.fill + '"/>'
    : "";

  // התוכן יכול להיות מחרוזת אחת או מערך של שורות
  const lines = Array.isArray(content) ? content : [content];

  const paragraphs = lines
    .map(function (line) {
      const bold = opt.bold ? "<w:b/><w:bCs/>" : "";
      const color = opt.color ? '<w:color w:val="' + opt.color + '"/>' : "";
      const size = opt.size || 22;

      return (
        '<w:p><w:pPr><w:bidi/><w:spacing w:after="0" w:line="260"/></w:pPr>' +
        "<w:r><w:rPr>" + FONT + bold + color +
        '<w:sz w:val="' + size + '"/><w:szCs w:val="' + size + '"/><w:rtl/></w:rPr>' +
        '<w:t xml:space="preserve">' + esc(line) + "</w:t></w:r></w:p>"
      );
    })
    .join("");

  return (
    "<w:tc><w:tcPr>" +
    '<w:tcW w:w="' + width + '" w:type="dxa"/>' +
    shading +
    '<w:vAlign w:val="center"/>' +
    "</w:tcPr>" +
    paragraphs +
    "</w:tc>"
  );
}

// טבלה שלמה
// headers - מערך כותרות (אפשר null לטבלה בלי שורת כותרת)
// rows - מערך של מערכי תאים
// widths - אחוזי רוחב לכל עמודה
function table(headers, rows, widths) {
  const border =
    '<w:top w:val="single" w:sz="4" w:color="999999"/>' +
    '<w:start w:val="single" w:sz="4" w:color="999999"/>' +
    '<w:bottom w:val="single" w:sz="4" w:color="999999"/>' +
    '<w:end w:val="single" w:sz="4" w:color="999999"/>' +
    '<w:insideH w:val="single" w:sz="4" w:color="999999"/>' +
    '<w:insideV w:val="single" w:sz="4" w:color="999999"/>';

  let xml =
    "<w:tbl><w:tblPr>" +
    '<w:tblW w:w="9400" w:type="dxa"/>' +
    "<w:bidiVisual/>" +
    "<w:tblBorders>" + border + "</w:tblBorders>" +
    '<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:start w:w="80" w:type="dxa"/>' +
    '<w:bottom w:w="60" w:type="dxa"/><w:end w:w="80" w:type="dxa"/></w:tblCellMar>' +
    "</w:tblPr>";

  if (headers) {
    xml +=
      "<w:tr><w:trPr><w:tblHeader/></w:trPr>" +
      headers
        .map(function (head, i) {
          return cell(head, {
            width: widths ? widths[i] : null,
            bold: true,
            fill: "1F3864",
            color: "FFFFFF",
          });
        })
        .join("") +
      "</w:tr>";
  }

  rows.forEach(function (row, rowIndex) {
    xml +=
      "<w:tr>" +
      row
        .map(function (value, i) {
          return cell(value, {
            width: widths ? widths[i] : null,
            fill: rowIndex % 2 ? "F2F2F2" : null,
          });
        })
        .join("") +
      "</w:tr>";
  });

  xml += "</w:tbl>" + blank();

  return xml;
}

// טבלת מפרט SUC - שתי עמודות, כמו שאר ה-SUC בספר
function sucTable(rows) {
  const border =
    '<w:top w:val="single" w:sz="4" w:color="999999"/>' +
    '<w:start w:val="single" w:sz="4" w:color="999999"/>' +
    '<w:bottom w:val="single" w:sz="4" w:color="999999"/>' +
    '<w:end w:val="single" w:sz="4" w:color="999999"/>' +
    '<w:insideH w:val="single" w:sz="4" w:color="999999"/>' +
    '<w:insideV w:val="single" w:sz="4" w:color="999999"/>';

  let xml =
    "<w:tbl><w:tblPr>" +
    '<w:tblW w:w="9400" w:type="dxa"/>' +
    "<w:bidiVisual/>" +
    "<w:tblBorders>" + border + "</w:tblBorders>" +
    '<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:start w:w="80" w:type="dxa"/>' +
    '<w:bottom w:w="60" w:type="dxa"/><w:end w:w="80" w:type="dxa"/></w:tblCellMar>' +
    "</w:tblPr>";

  rows.forEach(function (row) {
    xml +=
      "<w:tr>" +
      cell(row[0], { width: 22, bold: true, fill: "F2F2F2" }) +
      cell(row[1], { width: 78 }) +
      "</w:tr>";
  });

  xml += "</w:tbl>" + blank();

  return xml;
}

// תיבת הערה מודגשת - לציון דברים שצריך להשלים ידנית
function note(title, text) {
  const border =
    '<w:top w:val="single" w:sz="8" w:color="C9A227"/>' +
    '<w:start w:val="single" w:sz="8" w:color="C9A227"/>' +
    '<w:bottom w:val="single" w:sz="8" w:color="C9A227"/>' +
    '<w:end w:val="single" w:sz="8" w:color="C9A227"/>';

  return (
    "<w:tbl><w:tblPr>" +
    '<w:tblW w:w="9400" w:type="dxa"/><w:bidiVisual/>' +
    "<w:tblBorders>" + border + "</w:tblBorders>" +
    '<w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:start w:w="140" w:type="dxa"/>' +
    '<w:bottom w:w="120" w:type="dxa"/><w:end w:w="140" w:type="dxa"/></w:tblCellMar>' +
    "</w:tblPr><w:tr>" +
    '<w:tc><w:tcPr><w:tcW w:w="9400" w:type="dxa"/>' +
    '<w:shd w:val="clear" w:fill="FFF8E7"/></w:tcPr>' +
    '<w:p><w:pPr><w:bidi/><w:spacing w:after="60"/></w:pPr>' +
    "<w:r><w:rPr>" + FONT +
    '<w:b/><w:bCs/><w:color w:val="8B6508"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:rtl/></w:rPr>' +
    '<w:t xml:space="preserve">' + esc(title) + "</w:t></w:r></w:p>" +
    '<w:p><w:pPr><w:bidi/><w:spacing w:after="0" w:line="300"/></w:pPr>' +
    "<w:r><w:rPr>" + FONT +
    '<w:sz w:val="22"/><w:szCs w:val="22"/><w:rtl/></w:rPr>' +
    '<w:t xml:space="preserve">' + esc(text) + "</w:t></w:r></w:p>" +
    "</w:tc></w:tr></w:tbl>" + blank()
  );
}

// שורת חתימה
function signatureLine(label) {
  return (
    '<w:p><w:pPr><w:bidi/><w:spacing w:after="120" w:before="360"/></w:pPr>' +
    "<w:r><w:rPr>" + FONT +
    '<w:b/><w:bCs/><w:sz w:val="28"/><w:szCs w:val="28"/><w:rtl/></w:rPr>' +
    '<w:t xml:space="preserve">' + esc(label) + ": </w:t></w:r>" +
    "<w:r><w:rPr>" + FONT +
    '<w:sz w:val="28"/><w:szCs w:val="28"/><w:rtl/></w:rPr>' +
    '<w:t xml:space="preserve">________________________</w:t></w:r></w:p>'
  );
}

// שורה ריקה עם קו תחתון, למילוי הערות בכתב יד
function writeLine() {
  return (
    '<w:p><w:pPr><w:bidi/><w:spacing w:after="240"/>' +
    '<w:pBdr><w:bottom w:val="single" w:sz="4" w:color="999999" w:space="4"/></w:pBdr>' +
    "</w:pPr></w:p>"
  );
}

// בלוק תרשים - כותרת, תיאור וקוד PlantUML
function diagram(title, description, umlLines) {
  return (
    h3(title) +
    p(description) +
    p("קוד המקור לתרשים (PlantUML) - להדבקה באתר plantuml.com:", { bold: true, size: 24, after: 60 }) +
    codeBlock(umlLines) +
    blank()
  );
}

module.exports = {
  esc, p, h1, h2, h3, bullet, numbered, codeLine, codeBlock,
  blank, pageBreak, cell, table, sucTable, note, signatureLine,
  writeLine, diagram,
};
