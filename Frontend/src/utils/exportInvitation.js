// Client-side Printable PDF and High-Res Image Exporter for Wedding Invitations

export function downloadPrintablePdfCard(config = {}, invitationId = null) {
  try {
    sessionStorage.setItem("invitation_print_config", JSON.stringify(config));
  } catch (err) {
    console.warn("Could not save config to sessionStorage:", err);
  }

  const printUrl = invitationId ? `/print/${invitationId}` : `/print`;
  const printWindow = window.open(printUrl, "_blank");
  if (!printWindow) {
    window.location.href = printUrl;
  }
}

export function downloadInvitationImage(config = {}) {
  // Generate HTML5 canvas snapshot download
  const brideName = config.brideName || "Suman";
  const groomName = config.groomName || "Vishal";

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext("2d");

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, 1600);
  gradient.addColorStop(0, "#0b1329");
  gradient.addColorStop(1, "#1e293b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 1600);

  // Decorative Golden Border
  ctx.strokeStyle = config.accentGold || "#e5b858";
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, 1120, 1520);
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, 1080, 1480);

  // Typography
  ctx.textAlign = "center";
  
  // Sacred Symbol
  ctx.fillStyle = config.accentGold || "#e5b858";
  ctx.font = "bold 60px serif";
  ctx.fillText(config.customSacredSymbol || "✦", 600, 250);

  // Subtitle
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("TOGETHER WITH THEIR FAMILIES", 600, 340);

  // Bride Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px serif";
  ctx.fillText(brideName, 600, 480);

  // Ampersand
  ctx.fillStyle = config.accentGold || "#e5b858";
  ctx.font = "italic 70px serif";
  ctx.fillText("&", 600, 580);

  // Groom Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px serif";
  ctx.fillText(groomName, 600, 680);

  // Date
  const imgParsedDate = config.weddingDate ? new Date(config.weddingDate) : null;
  const dateStr = (imgParsedDate && !isNaN(imgParsedDate.getTime())) ? imgParsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "November 20, 2026";
  ctx.fillStyle = config.accentGold || "#e5b858";
  ctx.font = "bold 36px sans-serif";
  ctx.fillText(dateStr.toUpperCase(), 600, 850);

  // Venue
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "bold 32px serif";
  ctx.fillText(config.weddingVenue || "The Starlight Cathedral", 600, 950);

  // Watermark footer
  ctx.fillStyle = "#64748b";
  ctx.font = "20px sans-serif";
  ctx.fillText("DS ENVITES PLATFORM", 600, 1500);

  // Trigger Download
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `Wedding_Invitation_${brideName}_and_${groomName}.png`;
  link.href = dataUrl;
  link.click();
}
