export function cropAndResizeImage(file, size = 400) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      // recorte centrado cuadrado
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;

      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("No se pudo procesar la imagen")); return; }
          resolve(blob);
        },
        "image/jpeg",
        0.85
      );
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}
