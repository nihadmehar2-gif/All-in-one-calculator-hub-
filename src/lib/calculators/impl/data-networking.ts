/**
 * Data, Storage and Networking — implemented calculators.
 *
 * Two conventions for data sizes are documented clearly:
 *   - Binary (IEC): 1 KiB = 1024 bytes, 1 MiB = 1024 KiB
 *   - Decimal (SI): 1 KB = 1000 bytes, 1 MB = 1000 KB
 * Storage manufacturers typically use SI; RAM and many OS tools use binary.
 */
import type { CalculatorDefinition } from "../types";
import { fmt, toNum } from "../_format";

/* --------------------- Data size converter ------------------------ */
const BINARY_UNITS: Record<string, number> = {
  bit: 1 / 8, Bit: 1 / 8,
  B: 1, byte: 1, Byte: 1,
  KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3, TiB: 1024 ** 4, PiB: 1024 ** 5,
};
const DECIMAL_UNITS: Record<string, number> = {
  bit: 1 / 8, Bit: 1 / 8,
  B: 1, byte: 1, Byte: 1,
  KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, PB: 1e15,
};

export const dataSizeConverter: CalculatorDefinition = {
  slug: "data-size-converter",
  name: "Data Size Converter",
  description: "Convert between bits, bytes, KB, MB, GB, TB using binary (1024) or decimal (1000) standards.",
  category: "data-networking",
  keywords: ["data size", "bytes", "kilobyte", "megabyte", "gigabyte", "kib", "mib", "binary", "decimal"],
  status: "live",
  part: 2,
  inputs: [
    { name: "value", label: "Value", type: "number", default: 1, step: "any", unit: "GB" },
    { name: "from", label: "From unit", type: "select", default: "GB",
      options: ["bit", "B", "KB", "MB", "GB", "TB", "KiB", "MiB", "GiB", "TiB"].map((u) => ({ label: u, value: u })) },
    { name: "standard", label: "Standard for KB/MB/GB/TB", type: "select", default: "decimal",
      options: [
        { label: "Decimal (SI): 1 KB = 1000 B", value: "decimal" },
        { label: "Binary (IEC): 1 KB = 1024 B (legacy)", value: "binary" },
      ] },
  ],
  related: ["download-time", "bandwidth-calculator", "number-base-converter"],
  calculate: (raw) => {
    const v = toNum(raw.value);
    const from = String(raw.from ?? "GB");
    const standard = String(raw.standard ?? "decimal");
    const table = standard === "binary" ? BINARY_UNITS : DECIMAL_UNITS;
    // Merge so we accept both KiB and KB regardless of standard
    const merged = { ...BINARY_UNITS, ...table };
    const factor = merged[from] ?? 1;
    const inBytes = v * factor;
    const all: [string, number][] = [
      ["bits", inBytes * 8],
      ["bytes (B)", inBytes],
      ["KB (decimal)", inBytes / 1e3],
      ["MB (decimal)", inBytes / 1e6],
      ["GB (decimal)", inBytes / 1e9],
      ["TB (decimal)", inBytes / 1e12],
      ["KiB (binary)", inBytes / 1024],
      ["MiB (binary)", inBytes / 1024 ** 2],
      ["GiB (binary)", inBytes / 1024 ** 3],
      ["TiB (binary)", inBytes / 1024 ** 4],
    ];
    return {
      rows: [
        { key: "bytes", label: "Bytes", value: fmt(inBytes, 4), emphasis: "primary" },
        { key: "bits", label: "Bits", value: fmt(inBytes * 8, 4), emphasis: "primary" },
      ],
      sections: [{
        title: "All conversions",
        rows: all.map(([k, val]) => ({ key: k, label: k, value: fmt(val, 4) })),
      }],
      summary: "Storage vendors use decimal SI (1 KB = 1000 B); RAM and many OS file managers use binary IEC (1 KiB = 1024 B). 1 byte = 8 bits.",
    };
  },
  tests: [
    { name: "1 GB decimal → 1000 MB", inputs: { value: 1, from: "GB", standard: "decimal" }, expected: { bytes: "1,000,000,000" } },
    { name: "1 GiB binary → 1024 MiB", inputs: { value: 1, from: "GiB", standard: "binary" }, expected: { bytes: "1,073,741,824" } },
    { name: "1 byte = 8 bits", inputs: { value: 1, from: "B", standard: "decimal" }, expected: { bits: "8" } },
  ],
};

/* ------------------- Download time estimator ---------------------- */
export const downloadTime: CalculatorDefinition = {
  slug: "download-time",
  name: "Download / Upload Time Estimator",
  description: "Estimate file transfer time from file size and connection speed.",
  category: "data-networking",
  keywords: ["download", "upload", "transfer time", "file", "speed", "bandwidth"],
  status: "live",
  part: 2,
  inputs: [
    { name: "size", label: "File size", type: "number", default: 4.7, min: 0, step: "any", unit: "GB" },
    { name: "size_unit", label: "Size unit", type: "select", default: "GB",
      options: ["MB", "GB", "TB", "MiB", "GiB"].map((u) => ({ label: u, value: u })) },
    { name: "speed", label: "Connection speed", type: "number", default: 100, min: 0, step: "any", unit: "Mbps" },
    { name: "speed_unit", label: "Speed unit", type: "select", default: "Mbps",
      options: ["Kbps", "Mbps", "Gbps", "MB/s", "KB/s"].map((u) => ({ label: u, value: u })) },
  ],
  related: ["data-size-converter", "bandwidth-calculator"],
  calculate: (raw) => {
    const size = toNum(raw.size);
    const sizeUnit = String(raw.size_unit ?? "GB");
    const speed = toNum(raw.speed);
    const speedUnit = String(raw.speed_unit ?? "Mbps");
    // Convert size to bits
    const sizeBytesPerUnit: Record<string, number> = {
      MB: 1e6, GB: 1e9, TB: 1e12, MiB: 1024 ** 2, GiB: 1024 ** 3,
    };
    const sizeInBits = size * (sizeBytesPerUnit[sizeUnit] ?? 1e9) * 8;
    // Convert speed to bits per second
    const speedBitsPerSec: Record<string, number> = {
      Kbps: 1e3, Mbps: 1e6, Gbps: 1e9,
      "KB/s": 8e3, "MB/s": 8e6,
    };
    const speedInBps = speed * (speedBitsPerSec[speedUnit] ?? 1e6);
    if (speedInBps === 0) {
      return { rows: [{ key: "time", label: "Transfer time", value: "—", hint: "Speed must be positive." }] };
    }
    const totalSec = sizeInBits / speedInBps;
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = Math.round(totalSec % 60);
    const series: { label: string; value: number }[] = [];
    for (let i = 0; i <= 100; i += 10) {
      series.push({ label: `${i}%`, value: i });
    }
    return {
      rows: [
        { key: "time", label: "Estimated transfer time", value: `${hours}h ${mins}m ${secs}s`, emphasis: "primary" },
        { key: "seconds", label: "Total seconds", value: fmt(totalSec, 2) },
        { key: "rate", label: "Effective MB/s", value: fmt(sizeInBits / 8 / 1e6 / Math.max(totalSec, 1), 2) },
      ],
      sections: [{
        title: "Real-world reference",
        rows: [
          { key: "ref1", label: "10 Mbps ADSL", value: "~1.25 MB/s" },
          { key: "ref2", label: "100 Mbps fiber", value: "~12.5 MB/s" },
          { key: "ref3", label: "1 Gbps fiber", value: "~125 MB/s" },
        ],
      }],
      summary: "Time = file size (bits) ÷ speed (bits per second). 1 byte = 8 bits, so a 100 Mbps link can transfer at most 12.5 MB/s.",
    };
  },
  tests: [
    { name: "1 GB at 100 Mbps ≈ 80 sec", inputs: { size: 1, size_unit: "GB", speed: 100, speed_unit: "Mbps" }, expected: { seconds: "80" }, tolerance: 0.1 },
    { name: "1 GiB at 1 Gbps ≈ 8.59 sec", inputs: { size: 1, size_unit: "GiB", speed: 1, speed_unit: "Gbps" }, expected: { seconds: "8.59" }, tolerance: 0.1 },
  ],
};

/* ------------------- Bandwidth calculator ------------------------- */
export const bandwidthCalculator: CalculatorDefinition = {
  slug: "bandwidth-calculator",
  name: "Bandwidth & Throughput Calculator",
  description: "Compute required bandwidth for a target transfer, or throughput from a measured transfer.",
  category: "data-networking",
  keywords: ["bandwidth", "throughput", "data rate", "mbps", "gbps", "network"],
  status: "live",
  part: 2,
  inputs: [
    { name: "mode", label: "Mode", type: "select", default: "rate",
      options: [
        { label: "From size + time → required bandwidth", value: "rate" },
        { label: "From bandwidth + time → transferable size", value: "size" },
      ] },
    { name: "size", label: "Data size (MB)", type: "number", default: 500, step: "any" },
    { name: "time", label: "Time (seconds)", type: "number", default: 40, step: "any" },
    { name: "bandwidth", label: "Bandwidth (Mbps)", type: "number", default: 100, step: "any" },
  ],
  related: ["download-time", "data-size-converter"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "rate");
    if (mode === "rate") {
      const sizeMB = toNum(raw.size);
      const timeSec = toNum(raw.time);
      if (timeSec <= 0) {
        return { rows: [{ key: "bandwidth", label: "Required bandwidth", value: "—", hint: "Time must be positive." }] };
      }
      // sizeMB × 8 / timeSec = Mbps
      const mbps = (sizeMB * 8) / timeSec;
      return {
        rows: [
          { key: "bandwidth", label: "Required bandwidth", value: `${fmt(mbps, 2)} Mbps`, emphasis: "primary" },
          { key: "gbps", label: "In Gbps", value: `${fmt(mbps / 1000, 4)} Gbps` },
          { key: "mbs", label: "Equivalent transfer rate", value: `${fmt(sizeMB / timeSec, 2)} MB/s` },
        ],
        summary: "Bandwidth (Mbps) = size (MB) × 8 / time (s). The × 8 converts bytes to bits.",
      };
    }
    const bwMbps = toNum(raw.bandwidth);
    const timeSec = toNum(raw.time);
    if (timeSec <= 0) {
      return { rows: [{ key: "size", label: "Transferable size", value: "—", hint: "Time must be positive." }] };
    }
    const sizeMB = (bwMbps * timeSec) / 8;
    return {
      rows: [
        { key: "size", label: "Transferable size", value: `${fmt(sizeMB, 2)} MB`, emphasis: "primary" },
        { key: "gb", label: "In GB", value: `${fmt(sizeMB / 1000, 4)} GB` },
        { key: "mbs", label: "Effective rate", value: `${fmt(bwMbps / 8, 2)} MB/s` },
      ],
      summary: "Size (MB) = bandwidth (Mbps) × time (s) ÷ 8. The ÷ 8 converts bits to bytes.",
    };
  },
  tests: [
    { name: "500 MB in 40 s = 100 Mbps", inputs: { mode: "rate", size: 500, time: 40, bandwidth: 100 }, expected: { bandwidth: "100 Mbps" } },
    { name: "100 Mbps for 40 s = 500 MB", inputs: { mode: "size", size: 0, time: 40, bandwidth: 100 }, expected: { size: "500 MB" } },
  ],
};

/* --------------------- Subnet calculator -------------------------- */
export const subnetCalculator: CalculatorDefinition = {
  slug: "subnet-calculator",
  name: "IPv4 Subnet Calculator (CIDR)",
  description: "Compute network address, broadcast, host range and host count from an IPv4 CIDR block.",
  category: "data-networking",
  keywords: ["subnet", "cidr", "ipv4", "network", "broadcast", "host range", "mask"],
  status: "live",
  part: 2,
  inputs: [
    { name: "cidr", label: "CIDR block (e.g. 192.168.1.0/24)", type: "text", default: "192.168.1.0/24",
      placeholder: "192.168.1.0/24" },
  ],
  related: ["number-base-converter", "bitwise-calculator"],
  calculate: (raw) => {
    const input = String(raw.cidr ?? "").trim();
    const m = input.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
    if (!m) {
      return { rows: [{ key: "network", label: "Network", value: "—", hint: "Format must be a.b.c.d/n (e.g. 192.168.1.0/24).", emphasis: "warning" }] };
    }
    const octets = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
    const prefix = Number(m[5]);
    if (octets.some((o) => o > 255) || prefix > 32) {
      return { rows: [{ key: "network", label: "Network", value: "—", hint: "Octets must be 0-255 and prefix 0-32.", emphasis: "warning" }] };
    }
    // Pack IPv4 into 32-bit integer (use unsigned)
    const ipInt = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
    const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const wildcard = (~mask) >>> 0;
    const network = (ipInt & mask) >>> 0;
    const broadcast = (network | wildcard) >>> 0;
    const hostCount = prefix >= 31 ? (prefix === 31 ? 2 : 1) : (wildcard - 1);
    const usableHosts = prefix >= 31 ? hostCount : Math.max(0, hostCount);
    const firstHost = prefix >= 31 ? network + 1 >>> 0 : network + 1 >>> 0;
    const lastHost = broadcast - 1 >>> 0;
    const intToIp = (n: number): string => [(n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF].join(".");
    const toBinary = (n: number): string => n.toString(2).padStart(32, "0").match(/.{8}/g)!.join(".");
    return {
      rows: [
        { key: "network", label: "Network address", value: intToIp(network) + `/${prefix}`, emphasis: "primary" },
        { key: "broadcast", label: "Broadcast address", value: intToIp(broadcast), emphasis: "primary" },
        { key: "first_host", label: "First usable host", value: intToIp(firstHost) },
        { key: "last_host", label: "Last usable host", value: intToIp(lastHost) },
        { key: "hosts", label: "Usable hosts", value: fmt(usableHosts, 0) },
      ],
      sections: [
        { title: "Subnet mask", rows: [
          { key: "mask", label: "Netmask (dotted)", value: intToIp(mask) },
          { key: "wildcard", label: "Wildcard (inverse)", value: intToIp(wildcard) },
          { key: "mask_binary", label: "Mask (binary)", value: toBinary(mask) },
        ] },
        { title: "CIDR class", rows: [
          { key: "class", label: "Classful equivalent", value: classFor(prefix) },
          { key: "type", label: "Type", value: prefix === 32 ? "Single host" : prefix === 31 ? "Point-to-point (RFC 3021)" : prefix >= 30 ? "Small subnet" : "Standard subnet" },
        ] },
      ],
      summary: "Mask = first `prefix` bits set. Network = IP AND mask. Broadcast = network OR wildcard. Usable hosts = 2^(32−prefix) − 2 (for /30 or smaller).",
    };
  },
  tests: [
    { name: "192.168.1.0/24", inputs: { cidr: "192.168.1.0/24" }, expected: { network: "192.168.1.0/24" } },
    { name: "/24 broadcast", inputs: { cidr: "192.168.1.0/24" }, expected: { broadcast: "192.168.1.255" } },
    { name: "/24 has 254 usable hosts", inputs: { cidr: "192.168.1.0/24" }, expected: { hosts: "254" } },
    { name: "/30 has 2 usable hosts", inputs: { cidr: "10.0.0.0/30" }, expected: { hosts: "2" } },
  ],
};

function classFor(prefix: number): string {
  if (prefix >= 24) return "Class C (/24)";
  if (prefix >= 16) return "Class B (/16)";
  if (prefix >= 8) return "Class A (/8)";
  return "Supernet";
}

/* ------------------- Screen resolution ---------------------------- */
export const screenResolution: CalculatorDefinition = {
  slug: "screen-resolution",
  name: "Screen Resolution & Pixel Density",
  description: "Compute total pixels, aspect ratio, pixel density (PPI) and physical dimensions of a display.",
  category: "data-networking",
  keywords: ["resolution", "ppi", "pixel density", "aspect ratio", "display", "monitor", "screen"],
  status: "live",
  part: 2,
  inputs: [
    { name: "width", label: "Horizontal pixels", type: "number", default: 1920, min: 1, step: 1 },
    { name: "height", label: "Vertical pixels", type: "number", default: 1080, min: 1, step: 1 },
    { name: "diagonal", label: "Diagonal size (inches)", type: "number", default: 24, min: 0.0001, step: "any" },
  ],
  related: ["image-file-size", "color-converter", "aspect-ratio"],
  calculate: (raw) => {
    const w = Math.max(1, Math.round(toNum(raw.width)));
    const h = Math.max(1, Math.round(toNum(raw.height)));
    const diag = toNum(raw.diagonal);
    if (diag <= 0) {
      return { rows: [{ key: "ppi", label: "Pixel density", value: "—", hint: "Diagonal must be positive." }] };
    }
    const totalPixels = w * h;
    const aspectRatio = simplifyRatio(w, h);
    const diagPixels = Math.sqrt(w * w + h * h);
    const ppi = diagPixels / diag;
    const physicalW = w / ppi;
    const physicalH = h / ppi;
    const area = physicalW * physicalH;
    return {
      rows: [
        { key: "ppi", label: "Pixel density (PPI)", value: fmt(ppi, 2), emphasis: "primary" },
        { key: "aspect", label: "Aspect ratio", value: aspectRatio, emphasis: "primary" },
        { key: "total_px", label: "Total pixels", value: fmt(totalPixels, 0) },
        { key: "megapixels", label: "Megapixels", value: fmt(totalPixels / 1e6, 2) + " MP" },
      ],
      sections: [{
        title: "Physical dimensions",
        rows: [
          { key: "phys_w", label: "Width", value: `${fmt(physicalW, 2)} in (${fmt(physicalW * 2.54, 2)} cm)` },
          { key: "phys_h", label: "Height", value: `${fmt(physicalH, 2)} in (${fmt(physicalH * 2.54, 2)} cm)` },
          { key: "area", label: "Viewable area", value: `${fmt(area, 2)} in²` },
        ],
      }],
      summary: "PPI = √(w² + h²) ÷ diagonal_inches. Aspect ratio is the simplified width:height.",
    };
  },
  tests: [
    { name: "1920×1080 at 24in", inputs: { width: 1920, height: 1080, diagonal: 24 }, expected: { ppi: "91.79" } },
    { name: "1920×1080 aspect = 16:9", inputs: { width: 1920, height: 1080, diagonal: 24 }, expected: { aspect: "16 : 9" } },
    { name: "2560×1440 at 27in", inputs: { width: 2560, height: 1440, diagonal: 27 }, expected: { ppi: "108.79" } },
  ],
};

function simplifyRatio(w: number, h: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(w, h);
  return `${w / g} : ${h / g}`;
}

/* --------------------- Aspect ratio ------------------------------- */
export const aspectRatio: CalculatorDefinition = {
  slug: "aspect-ratio",
  name: "Aspect Ratio Calculator",
  description: "Resize dimensions preserving an aspect ratio, or compute the aspect ratio of given dimensions.",
  category: "data-networking",
  keywords: ["aspect ratio", "resize", "image", "dimensions", "16:9", "4:3"],
  status: "live",
  part: 2,
  inputs: [
    { name: "mode", label: "Mode", type: "select", default: "resize_w",
      options: [
        { label: "Resize: given new width, find height", value: "resize_w" },
        { label: "Resize: given new height, find width", value: "resize_h" },
        { label: "Find aspect ratio of WxH", value: "find" },
      ] },
    { name: "orig_w", label: "Original width", type: "number", default: 1920, min: 1, step: 1 },
    { name: "orig_h", label: "Original height", type: "number", default: 1080, min: 1, step: 1 },
    { name: "target", label: "Target dimension", type: "number", default: 1280, min: 1, step: 1 },
  ],
  related: ["screen-resolution", "image-file-size"],
  calculate: (raw) => {
    const mode = String(raw.mode ?? "resize_w");
    const ow = toNum(raw.orig_w);
    const oh = toNum(raw.orig_h);
    const target = toNum(raw.target);
    if (ow <= 0 || oh <= 0) {
      return { rows: [{ key: "result", label: "Result", value: "—" }] };
    }
    const ratio = ow / oh;
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const g = gcd(ow, oh);
    const simplified = `${ow / g} : ${oh / g}`;
    if (mode === "find") {
      return {
        rows: [
          { key: "ratio_str", label: "Aspect ratio", value: simplified, emphasis: "primary" },
          { key: "decimal", label: "Decimal ratio (W/H)", value: fmt(ratio, 4) },
        ],
        summary: "Aspect ratio is the simplified W:H. The decimal form is width divided by height.",
      };
    }
    if (mode === "resize_w") {
      const newH = Math.round(target / ratio);
      return {
        rows: [
          { key: "new_w", label: "New width", value: fmt(target, 0), emphasis: "primary" },
          { key: "new_h", label: "New height (preserves aspect)", value: fmt(newH, 0), emphasis: "primary" },
          { key: "ratio", label: "Source aspect", value: simplified },
        ],
        summary: `To preserve ${simplified}: new_height = target_width ÷ (${ow}/${oh}).`,
      };
    }
    const newW = Math.round(target * ratio);
    return {
      rows: [
        { key: "new_h", label: "New height", value: fmt(target, 0), emphasis: "primary" },
        { key: "new_w", label: "New width (preserves aspect)", value: fmt(newW, 0), emphasis: "primary" },
        { key: "ratio", label: "Source aspect", value: simplified },
      ],
      summary: `To preserve ${simplified}: new_width = target_height × (${ow}/${oh}).`,
    };
  },
  tests: [
    { name: "1920x1080 → ratio 16:9", inputs: { mode: "find", orig_w: 1920, orig_h: 1080, target: 0 }, expected: { ratio_str: "16 : 9" } },
    { name: "1920x1080 resized to 1280 wide → 720 tall", inputs: { mode: "resize_w", orig_w: 1920, orig_h: 1080, target: 1280 }, expected: { new_h: "720" } },
  ],
};

/* --------------------- Image file size ---------------------------- */
export const imageFileSize: CalculatorDefinition = {
  slug: "image-file-size",
  name: "Image File Size Estimator",
  description: "Estimate the uncompressed size of an image from its dimensions and color depth.",
  category: "data-networking",
  keywords: ["image", "file size", "bitmap", "pixel", "color depth", "resolution", "memory"],
  status: "live",
  part: 2,
  inputs: [
    { name: "width", label: "Width (px)", type: "number", default: 1920, min: 1, step: 1 },
    { name: "height", label: "Height (px)", type: "number", default: 1080, min: 1, step: 1 },
    { name: "bpp", label: "Color depth (bits per pixel)", type: "select", default: "24",
      options: [
        { label: "8-bit (grayscale / indexed)", value: "8" },
        { label: "16-bit (RGB565 / high color)", value: "16" },
        { label: "24-bit (RGB true color)", value: "24" },
        { label: "32-bit (RGBA with alpha)", value: "32" },
      ] },
    { name: "compression", label: "Compression ratio (1 = none, 10 = high)", type: "number", default: 1, min: 1, max: 100, step: "any" },
  ],
  related: ["screen-resolution", "aspect-ratio", "data-size-converter"],
  calculate: (raw) => {
    const w = Math.max(1, Math.round(toNum(raw.width)));
    const h = Math.max(1, Math.round(toNum(raw.height)));
    const bpp = Number(raw.bpp ?? 24);
    const compression = Math.max(1, toNum(raw.compression));
    const totalPixels = w * h;
    const uncompressedBits = totalPixels * bpp;
    const uncompressedBytes = uncompressedBits / 8;
    const compressedBytes = uncompressedBytes / compression;
    return {
      rows: [
        { key: "pixels", label: "Total pixels", value: fmt(totalPixels, 0) },
        { key: "uncompressed", label: "Uncompressed size", value: formatBytes(uncompressedBytes), emphasis: "primary" },
        { key: "compressed", label: `After ${compression}× compression`, value: formatBytes(compressedBytes), emphasis: "primary" },
      ],
      sections: [{
        title: "Breakdown",
        rows: [
          { key: "bits", label: "Total bits", value: fmt(uncompressedBits, 0) },
          { key: "bytes", label: "Total bytes", value: fmt(uncompressedBytes, 0) },
          { key: "kb", label: "In KB", value: fmt(uncompressedBytes / 1024, 2) + " KiB" },
          { key: "mb", label: "In MB", value: fmt(uncompressedBytes / (1024 * 1024), 4) + " MiB" },
        ],
      }],
      summary: "Uncompressed size = width × height × bits_per_pixel ÷ 8. Real formats (JPEG, PNG) use lossy or lossless compression that varies by content.",
    };
  },
  tests: [
    { name: "1920×1080×24bpp = 5.93 MiB", inputs: { width: 1920, height: 1080, bpp: "24", compression: 1 }, expected: { uncompressed: "5.93 MiB" } },
    { name: "1000×1000×32bpp = 3.81 MiB", inputs: { width: 1000, height: 1000, bpp: "32", compression: 1 }, expected: { uncompressed: "3.81 MiB" } },
  ],
};

function formatBytes(b: number): string {
  if (b < 1024) return `${fmt(b, 0)} B`;
  if (b < 1024 ** 2) return `${fmt(b / 1024, 2)} KiB`;
  if (b < 1024 ** 3) return `${fmt(b / 1024 ** 2, 2)} MiB`;
  return `${fmt(b / 1024 ** 3, 2)} GiB`;
}
