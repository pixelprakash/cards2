// Prints a report through the browser's own print dialog (choose "Save as PDF"). Works for every script and font,
// because the browser draws the page, and needs no popup because it prints from a hidden frame.
export function printHtml(html) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  Object.assign(frame.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
  frame.srcdoc = html;
  frame.onload = () => {
    const w = frame.contentWindow;
    w.focus();
    setTimeout(() => w.print(), 250);   // let fonts settle
    w.onafterprint = () => frame.remove();
    setTimeout(() => frame.remove(), 120000);
  };
  document.body.append(frame);
}
