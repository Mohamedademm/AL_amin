// Serialize an array of flat records to RFC-4180 CSV text. Values containing a
// comma, quote or newline are wrapped in quotes with inner quotes doubled, so
// the output opens cleanly in Excel / Google Sheets.
export function toCsv(
  rows: Record<string, string | number | null | undefined>[],
  headers?: string[],
): string {
  const cols = headers ?? (rows[0] ? Object.keys(rows[0]) : []);
  const escape = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    cols.join(","),
    ...rows.map((row) => cols.map((c) => escape(row[c])).join(",")),
  ];
  return lines.join("\n");
}
