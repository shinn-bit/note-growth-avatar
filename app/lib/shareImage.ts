const BG_TOP = "#F3ECDF";
const BG_BOTTOM = "#EAE3D6";
const DARK = "#1A1A18";
const GREEN = "#3D7A50";
const GOLD = "#C4922A";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateShareImage(opts: {
  imgSrc: string;
  stageName: string;
  stageDesc: string;
  streak: number;
}): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, BG_TOP);
  grad.addColorStop(1, BG_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = DARK;
  ctx.textAlign = "left";
  ctx.font = "italic 700 56px Georgia, serif";
  ctx.fillText("note tree", 64, 110);

  const img = await loadImage(opts.imgSrc);
  const maxW = W - 120;
  const maxH = 760;
  const scale = Math.min(maxW / img.width, maxH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (W - dw) / 2;
  const dy = 170;
  ctx.drawImage(img, dx, dy, dw, dh);

  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.font = "700 38px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillText(`${opts.stageName} · ${opts.stageDesc}`, W / 2, dy + dh + 80);

  ctx.fillStyle = DARK;
  ctx.font = "700 120px Georgia, serif";
  ctx.fillText(`${opts.streak}`, W / 2, dy + dh + 230);
  ctx.fillStyle = "#9A9080";
  ctx.font = "600 32px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillText("DAYS 連続更新", W / 2, dy + dh + 282);

  ctx.fillStyle = GREEN;
  ctx.font = "700 46px 'Hiragino Sans', 'Noto Sans JP', sans-serif";
  ctx.fillText("書くたびに、育つ。", W / 2, H - 80);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("toBlob failed"));
    }, "image/png");
  });
}
