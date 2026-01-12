// src/components/JugadViewerButton.tsx
import React from "react";

interface JugadViewerButtonProps {
  analysis: any; // the full analysis object (backend response) OR reconstructed object
  label?: string;
}

export const JugadViewerButton: React.FC<JugadViewerButtonProps> = ({ analysis, label = "Open full reviews & AI analysis" }) => {
  const openViewer = () => {
    try {
      const win = window.open("", "_blank");
      if (!win) {
        alert("Popup blocked — allow popups for this site.");
        return;
      }

      const prettyJson = JSON.stringify(analysis, null, 2);

      // Compute some summary from analysis in case it wasn't precomputed
      const total_reviews = analysis?.total_reviews ?? (analysis?.reviews?.length ?? 0);
      const fake_count = analysis?.fake_count ?? (analysis?.reviews?.filter((r: any) => r.is_fake || r.isFake).length ?? 0);
      const fake_percentage = analysis?.fake_percentage ?? (total_reviews ? +((fake_count / total_reviews) * 100).toFixed(2) : 0);
      const average_confidence = analysis?.average_confidence ?? (() => {
        const arr = (analysis?.reviews ?? []).map((r: any) => r.confidence_score ?? r.confidence ?? r.confidenceScore ?? 0);
        return arr.length ? +(arr.reduce((a: number, b: number) => a + b, 0) / arr.length).toFixed(2) : 0;
      })();

      const productTitle = analysis?.product?.title ?? analysis?.productTitle ?? "Unknown product";
      const headerHtml = `
        <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding:20px;">
          <h2 style="margin:0 0 8px 0;">AI Analysis — ${escapeHtml(productTitle)}</h2>
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;">
            <div style="padding:10px;border-radius:8px;background:#f3f4f6;border:1px solid #e5e7eb;">
              <div style="font-size:12px;color:#6b7280;">Total reviews</div>
              <div style="font-weight:600;font-size:18px;">${total_reviews}</div>
            </div>
            <div style="padding:10px;border-radius:8px;background:#fff7ed;border:1px solid #ffedd5;">
              <div style="font-size:12px;color:#6b7280;">Fake reviews</div>
              <div style="font-weight:600;font-size:18px;color:#b45309;">${fake_count} (${fake_percentage}%)</div>
            </div>
            <div style="padding:10px;border-radius:8px;background:#ecfeff;border:1px solid #cffafe;">
              <div style="font-size:12px;color:#6b7280;">Avg confidence</div>
              <div style="font-weight:600;font-size:18px;color:#065f46;">${average_confidence}%</div>
            </div>
          </div>

          <div style="margin-bottom:8px;">
            <strong>Raw JSON (AI analysis)</strong> — below is the full JSON returned by the backend (pretty printed).
          </div>
        </div>
      `;

      // Create a simple CSS for pre block
      const css = `
        body { margin: 0; background: #0b1220; color: #e6eef8; }
        pre { 
          white-space: pre-wrap; 
          word-break: break-word; 
          background: #071126; 
          padding: 18px; 
          border-radius: 10px; 
          margin: 16px; 
          overflow:auto; 
          max-height: 70vh;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace;
          font-size: 13px;
          color: #cbe7ff;
        }
        .container { padding: 10px 14px 34px 14px; font-family: Inter, Arial, sans-serif; }
        a { color: #9be7ff; }
      `;

      const html = `<!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>AI — Full reviews</title>
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <style>${css}</style>
          </head>
          <body>
            <div class="container">
              ${headerHtml}
              <pre id="rawjson">${escapeHtml(prettyJson)}</pre>
            </div>
          </body>
        </html>`;

      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (err) {
      // fallback: copy JSON to clipboard or alert
      console.error("openViewer error:", err);
      alert("Could not open analysis viewer: " + (err && err.message ? err.message : err));
    }
  };

  return (
    <button
      onClick={openViewer}
      className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50 text-sm font-medium"
      style={{ cursor: "pointer", background: "#0f172a", color: "#fff", border: "1px solid #334155" }}
    >
      {label}
    </button>
  );
};

// small helper to escape HTML inside the viewer
function escapeHtml(s: string) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
