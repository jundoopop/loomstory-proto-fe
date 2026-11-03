import { PhotonImage, resize, SamplingFilter } from "@cf-wasm/photon/workerd";
import { check } from "./core";
export function imageDimensions(b: Uint8Array) {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let w = 0,
    h = 0,
    mime = "";
  if (
    b.length > 24 &&
    b[0] === 137 &&
    b[1] === 80 &&
    b[2] === 78 &&
    b[3] === 71 &&
    b[4] === 13 &&
    b[5] === 10 &&
    b[6] === 26 &&
    b[7] === 10
  ) {
    w = v.getUint32(16);
    h = v.getUint32(20);
    mime = "image/png";
  } else if (b.length > 12 && b[0] === 255 && b[1] === 216) {
    mime = "image/jpeg";
    let p = 2;
    while (p + 9 < b.length) {
      if (b[p] !== 255) {
        p++;
        continue;
      }
      const marker = b[p + 1];
      if (marker === 218 || marker === 217) break;
      if (marker === 216 || marker === 1 || (marker >= 208 && marker <= 215)) {
        p += 2;
        continue;
      }
      const len = v.getUint16(p + 2);
      check(len >= 2, "Invalid JPEG structure.");
      if ([192, 193, 194].includes(marker)) {
        h = v.getUint16(p + 5);
        w = v.getUint16(p + 7);
        break;
      }
      p += 2 + len;
    }
  } else if (
    b.length >= 30 &&
    String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...b.slice(8, 12)) === "WEBP"
  ) {
    mime = "image/webp";
    const kind = String.fromCharCode(...b.slice(12, 16));
    if (kind === "VP8X") {
      check(!(b[20] & 2), "Animated images are not supported.");
      w = 1 + b[24] + b[25] * 256 + b[26] * 65536;
      h = 1 + b[27] + b[28] * 256 + b[29] * 65536;
    } else if (kind === "VP8 ") {
      w = v.getUint16(26, true) & 16383;
      h = v.getUint16(28, true) & 16383;
    } else if (kind === "VP8L" && b[20] === 47) {
      const n = v.getUint32(21, true);
      w = (n & 16383) + 1;
      h = ((n >>> 14) & 16383) + 1;
    }
  }
  check(
    w > 0 && h > 0 && mime,
    "Use a valid JPEG, PNG or WebP image. HEIC is not supported.",
  );
  check(
    w * h <= 6000000 && w <= 10000 && h <= 10000,
    "Images must be at most 6 megapixels. Export a smaller image and try again.",
  );
  return { width: w, height: h, mime };
}
export function validateImage(bytes: Uint8Array) {
  const dimensions = imageDimensions(bytes);
  let input: PhotonImage | undefined, output: PhotonImage | undefined;
  try {
    input = PhotonImage.new_from_byteslice(bytes);
    check(
      input.get_width() === dimensions.width &&
        input.get_height() === dimensions.height,
      "Image dimensions are inconsistent.",
    );
    const scale = Math.min(
      1,
      1200 / Math.max(dimensions.width, dimensions.height),
    );
    output = resize(
      input,
      Math.max(1, Math.round(dimensions.width * scale)),
      Math.max(1, Math.round(dimensions.height * scale)),
      SamplingFilter.Lanczos3,
    );
    return { ...dimensions, derivative: output.get_bytes_webp() };
  } catch {
    check(
      false,
      "The image could not be decoded. Export it as a fresh JPEG, PNG or WebP.",
    );
    throw new Error();
  } finally {
    output?.free();
    input?.free();
  }
}
