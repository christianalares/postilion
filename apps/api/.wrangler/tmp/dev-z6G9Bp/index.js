var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../node_modules/.pnpm/postal-mime@2.4.3/node_modules/postal-mime/src/decode-strings.js
var textEncoder = new TextEncoder();
var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64Lookup = new Uint8Array(256);
for (i = 0; i < base64Chars.length; i++) {
  base64Lookup[base64Chars.charCodeAt(i)] = i;
}
var i;
function decodeBase64(base64) {
  let bufferLength = Math.ceil(base64.length / 4) * 3;
  const len = base64.length;
  let p = 0;
  if (base64.length % 4 === 3) {
    bufferLength--;
  } else if (base64.length % 4 === 2) {
    bufferLength -= 2;
  } else if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < len; i += 4) {
    let encoded1 = base64Lookup[base64.charCodeAt(i)];
    let encoded2 = base64Lookup[base64.charCodeAt(i + 1)];
    let encoded3 = base64Lookup[base64.charCodeAt(i + 2)];
    let encoded4 = base64Lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arrayBuffer;
}
__name(decodeBase64, "decodeBase64");
function getDecoder(charset) {
  charset = charset || "utf8";
  return new TextDecoder(charset);
}
__name(getDecoder, "getDecoder");
async function blobToArrayBuffer(blob) {
  if ("arrayBuffer" in blob) {
    return await blob.arrayBuffer();
  }
  const fr = new FileReader();
  return new Promise((resolve, reject) => {
    fr.onload = function(e) {
      resolve(e.target.result);
    };
    fr.onerror = function(e) {
      reject(fr.error);
    };
    fr.readAsArrayBuffer(blob);
  });
}
__name(blobToArrayBuffer, "blobToArrayBuffer");
function getHex(c) {
  if (c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70) {
    return String.fromCharCode(c);
  }
  return false;
}
__name(getHex, "getHex");
function decodeWord(charset, encoding, str) {
  let splitPos = charset.indexOf("*");
  if (splitPos >= 0) {
    charset = charset.substr(0, splitPos);
  }
  encoding = encoding.toUpperCase();
  let byteStr;
  if (encoding === "Q") {
    str = str.replace(/=\s+([0-9a-fA-F])/g, "=$1").replace(/[_\s]/g, " ");
    let buf = textEncoder.encode(str);
    let encodedBytes = [];
    for (let i = 0, len = buf.length; i < len; i++) {
      let c = buf[i];
      if (i <= len - 2 && c === 61) {
        let c1 = getHex(buf[i + 1]);
        let c2 = getHex(buf[i + 2]);
        if (c1 && c2) {
          let c3 = parseInt(c1 + c2, 16);
          encodedBytes.push(c3);
          i += 2;
          continue;
        }
      }
      encodedBytes.push(c);
    }
    byteStr = new ArrayBuffer(encodedBytes.length);
    let dataView = new DataView(byteStr);
    for (let i = 0, len = encodedBytes.length; i < len; i++) {
      dataView.setUint8(i, encodedBytes[i]);
    }
  } else if (encoding === "B") {
    byteStr = decodeBase64(str.replace(/[^a-zA-Z0-9\+\/=]+/g, ""));
  } else {
    byteStr = textEncoder.encode(str);
  }
  return getDecoder(charset).decode(byteStr);
}
__name(decodeWord, "decodeWord");
function decodeWords(str) {
  let joinString = true;
  let done = false;
  while (!done) {
    let result = (str || "").toString().replace(/(=\?([^?]+)\?[Bb]\?([^?]*)\?=)\s*(?==\?([^?]+)\?[Bb]\?[^?]*\?=)/g, (match, left, chLeft, encodedLeftStr, chRight) => {
      if (!joinString) {
        return match;
      }
      if (chLeft === chRight && encodedLeftStr.length % 4 === 0 && !/=$/.test(encodedLeftStr)) {
        return left + "__\0JOIN\0__";
      }
      return match;
    }).replace(/(=\?([^?]+)\?[Qq]\?[^?]*\?=)\s*(?==\?([^?]+)\?[Qq]\?[^?]*\?=)/g, (match, left, chLeft, chRight) => {
      if (!joinString) {
        return match;
      }
      if (chLeft === chRight) {
        return left + "__\0JOIN\0__";
      }
      return match;
    }).replace(/(\?=)?__\x00JOIN\x00__(=\?([^?]+)\?[QqBb]\?)?/g, "").replace(/(=\?[^?]+\?[QqBb]\?[^?]*\?=)\s+(?==\?[^?]+\?[QqBb]\?[^?]*\?=)/g, "$1").replace(/=\?([\w_\-*]+)\?([QqBb])\?([^?]*)\?=/g, (m, charset, encoding, text) => decodeWord(charset, encoding, text));
    if (joinString && result.indexOf("\uFFFD") >= 0) {
      joinString = false;
    } else {
      return result;
    }
  }
}
__name(decodeWords, "decodeWords");
function decodeURIComponentWithCharset(encodedStr, charset) {
  charset = charset || "utf-8";
  let encodedBytes = [];
  for (let i = 0; i < encodedStr.length; i++) {
    let c = encodedStr.charAt(i);
    if (c === "%" && /^[a-f0-9]{2}/i.test(encodedStr.substr(i + 1, 2))) {
      let byte = encodedStr.substr(i + 1, 2);
      i += 2;
      encodedBytes.push(parseInt(byte, 16));
    } else if (c.charCodeAt(0) > 126) {
      c = textEncoder.encode(c);
      for (let j = 0; j < c.length; j++) {
        encodedBytes.push(c[j]);
      }
    } else {
      encodedBytes.push(c.charCodeAt(0));
    }
  }
  const byteStr = new ArrayBuffer(encodedBytes.length);
  const dataView = new DataView(byteStr);
  for (let i = 0, len = encodedBytes.length; i < len; i++) {
    dataView.setUint8(i, encodedBytes[i]);
  }
  return getDecoder(charset).decode(byteStr);
}
__name(decodeURIComponentWithCharset, "decodeURIComponentWithCharset");
function decodeParameterValueContinuations(header) {
  let paramKeys = /* @__PURE__ */ new Map();
  Object.keys(header.params).forEach((key) => {
    let match = key.match(/\*((\d+)\*?)?$/);
    if (!match) {
      return;
    }
    let actualKey = key.substr(0, match.index).toLowerCase();
    let nr = Number(match[2]) || 0;
    let paramVal;
    if (!paramKeys.has(actualKey)) {
      paramVal = {
        charset: false,
        values: []
      };
      paramKeys.set(actualKey, paramVal);
    } else {
      paramVal = paramKeys.get(actualKey);
    }
    let value = header.params[key];
    if (nr === 0 && match[0].charAt(match[0].length - 1) === "*" && (match = value.match(/^([^']*)'[^']*'(.*)$/))) {
      paramVal.charset = match[1] || "utf-8";
      value = match[2];
    }
    paramVal.values.push({ nr, value });
    delete header.params[key];
  });
  paramKeys.forEach((paramVal, key) => {
    header.params[key] = decodeURIComponentWithCharset(
      paramVal.values.sort((a, b) => a.nr - b.nr).map((a) => a.value).join(""),
      paramVal.charset
    );
  });
}
__name(decodeParameterValueContinuations, "decodeParameterValueContinuations");

// ../../node_modules/.pnpm/postal-mime@2.4.3/node_modules/postal-mime/src/pass-through-decoder.js
var PassThroughDecoder = class {
  constructor() {
    this.chunks = [];
  }
  update(line) {
    this.chunks.push(line);
    this.chunks.push("\n");
  }
  finalize() {
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
};
__name(PassThroughDecoder, "PassThroughDecoder");

// ../../node_modules/.pnpm/postal-mime@2.4.3/node_modules/postal-mime/src/base64-decoder.js
var Base64Decoder = class {
  constructor(opts) {
    opts = opts || {};
    this.decoder = opts.decoder || new TextDecoder();
    this.maxChunkSize = 100 * 1024;
    this.chunks = [];
    this.remainder = "";
  }
  update(buffer) {
    let str = this.decoder.decode(buffer);
    if (/[^a-zA-Z0-9+\/]/.test(str)) {
      str = str.replace(/[^a-zA-Z0-9+\/]+/g, "");
    }
    this.remainder += str;
    if (this.remainder.length >= this.maxChunkSize) {
      let allowedBytes = Math.floor(this.remainder.length / 4) * 4;
      let base64Str;
      if (allowedBytes === this.remainder.length) {
        base64Str = this.remainder;
        this.remainder = "";
      } else {
        base64Str = this.remainder.substr(0, allowedBytes);
        this.remainder = this.remainder.substr(allowedBytes);
      }
      if (base64Str.length) {
        this.chunks.push(decodeBase64(base64Str));
      }
    }
  }
  finalize() {
    if (this.remainder && !/^=+$/.test(this.remainder)) {
      this.chunks.push(decodeBase64(this.remainder));
    }
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
};
__name(Base64Decoder, "Base64Decoder");

// ../../node_modules/.pnpm/postal-mime@2.4.3/node_modules/postal-mime/src/qp-decoder.js
var QPDecoder = class {
  constructor(opts) {
    opts = opts || {};
    this.decoder = opts.decoder || new TextDecoder();
    this.maxChunkSize = 100 * 1024;
    this.remainder = "";
    this.chunks = [];
  }
  decodeQPBytes(encodedBytes) {
    let buf = new ArrayBuffer(encodedBytes.length);
    let dataView = new DataView(buf);
    for (let i = 0, len = encodedBytes.length; i < len; i++) {
      dataView.setUint8(i, parseInt(encodedBytes[i], 16));
    }
    return buf;
  }
  decodeChunks(str) {
    str = str.replace(/=\r?\n/g, "");
    let list = str.split(/(?==)/);
    let encodedBytes = [];
    for (let part of list) {
      if (part.charAt(0) !== "=") {
        if (encodedBytes.length) {
          this.chunks.push(this.decodeQPBytes(encodedBytes));
          encodedBytes = [];
        }
        this.chunks.push(part);
        continue;
      }
      if (part.length === 3) {
        encodedBytes.push(part.substr(1));
        continue;
      }
      if (part.length > 3) {
        encodedBytes.push(part.substr(1, 2));
        this.chunks.push(this.decodeQPBytes(encodedBytes));
        encodedBytes = [];
        part = part.substr(3);
        this.chunks.push(part);
      }
    }
    if (encodedBytes.length) {
      this.chunks.push(this.decodeQPBytes(encodedBytes));
      encodedBytes = [];
    }
  }
  update(buffer) {
    let str = this.decoder.decode(buffer) + "\n";
    str = this.remainder + str;
    if (str.length < this.maxChunkSize) {
      this.remainder = str;
      return;
    }
    this.remainder = "";
    let partialEnding = str.match(/=[a-fA-F0-9]?$/);
    if (partialEnding) {
      if (partialEnding.index === 0) {
        this.remainder = str;
        return;
      }
      this.remainder = str.substr(partialEnding.index);
      str = str.substr(0, partialEnding.index);
    }
    this.decodeChunks(str);
  }
  finalize() {
    if (this.remainder.length) {
      this.decodeChunks(this.remainder);
      this.remainder = "";
    }
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
};
__name(QPDecoder, "QPDecoder");

// ../../node_modules/.pnpm/postal-mime@2.4.3/node_modules/postal-mime/src/mime-node.js
var MimeNode = class {
  constructor(opts) {
    opts = opts || {};
    this.postalMime = opts.postalMime;
    this.root = !!opts.parentNode;
    this.childNodes = [];
    if (opts.parentNode) {
      opts.parentNode.childNodes.push(this);
    }
    this.state = "header";
    this.headerLines = [];
    this.contentType = {
      value: "text/plain",
      default: true
    };
    this.contentTransferEncoding = {
      value: "8bit"
    };
    this.contentDisposition = {
      value: ""
    };
    this.headers = [];
    this.contentDecoder = false;
  }
  setupContentDecoder(transferEncoding) {
    if (/base64/i.test(transferEncoding)) {
      this.contentDecoder = new Base64Decoder();
    } else if (/quoted-printable/i.test(transferEncoding)) {
      this.contentDecoder = new QPDecoder({ decoder: getDecoder(this.contentType.parsed.params.charset) });
    } else {
      this.contentDecoder = new PassThroughDecoder();
    }
  }
  async finalize() {
    if (this.state === "finished") {
      return;
    }
    if (this.state === "header") {
      this.processHeaders();
    }
    let boundaries = this.postalMime.boundaries;
    for (let i = boundaries.length - 1; i >= 0; i--) {
      let boundary = boundaries[i];
      if (boundary.node === this) {
        boundaries.splice(i, 1);
        break;
      }
    }
    await this.finalizeChildNodes();
    this.content = this.contentDecoder ? await this.contentDecoder.finalize() : null;
    this.state = "finished";
  }
  async finalizeChildNodes() {
    for (let childNode of this.childNodes) {
      await childNode.finalize();
    }
  }
  parseStructuredHeader(str) {
    let response = {
      value: false,
      params: {}
    };
    let key = false;
    let value = "";
    let stage = "value";
    let quote = false;
    let escaped = false;
    let chr;
    for (let i = 0, len = str.length; i < len; i++) {
      chr = str.charAt(i);
      switch (stage) {
        case "key":
          if (chr === "=") {
            key = value.trim().toLowerCase();
            stage = "value";
            value = "";
            break;
          }
          value += chr;
          break;
        case "value":
          if (escaped) {
            value += chr;
          } else if (chr === "\\") {
            escaped = true;
            continue;
          } else if (quote && chr === quote) {
            quote = false;
          } else if (!quote && chr === '"') {
            quote = chr;
          } else if (!quote && chr === ";") {
            if (key === false) {
              response.value = value.trim();
            } else {
              response.params[key] = value.trim();
            }
            stage = "key";
            value = "";
          } else {
            value += chr;
          }
          escaped = false;
          break;
      }
    }
    value = value.trim();
    if (stage === "value") {
      if (key === false) {
        response.value = value;
      } else {
        response.params[key] = value;
      }
    } else if (value) {
      response.params[value.toLowerCase()] = "";
    }
    if (response.value) {
      response.value = response.value.toLowerCase();
    }
    decodeParameterValueContinuations(response);
    return response;
  }
  decodeFlowedText(str, delSp) {
    return str.split(/\r?\n/).reduce((previousValue, currentValue) => {
      if (/ $/.test(previousValue) && !/(^|\n)-- $/.test(previousValue)) {
        if (delSp) {
          return previousValue.slice(0, -1) + currentValue;
        } else {
          return previousValue + currentValue;
        }
      } else {
        return previousValue + "\n" + currentValue;
      }
    }).replace(/^ /gm, "");
  }
  getTextContent() {
    if (!this.content) {
      return "";
    }
    let str = getDecoder(this.contentType.parsed.params.charset).decode(this.content);
    if (/^flowed$/i.test(this.contentType.parsed.params.format)) {
      str = this.decodeFlowedText(str, /^yes$/i.test(this.contentType.parsed.params.delsp));
    }
    return str;
  }
  processHeaders() {
    for (let i = this.headerLines.length - 1; i >= 0; i--) {
      let line = this.headerLines[i];
      if (i && /^\s/.test(line)) {
        this.headerLines[i - 1] += "\n" + line;
        this.headerLines.splice(i, 1);
      } else {
        line = line.replace(/\s+/g, " ");
        let sep = line.indexOf(":");
        let key = sep < 0 ? line.trim() : line.substr(0, sep).trim();
        let value = sep < 0 ? "" : line.substr(sep + 1).trim();
        this.headers.push({ key: key.toLowerCase(), originalKey: key, value });
        switch (key.toLowerCase()) {
          case "content-type":
            if (this.contentType.default) {
              this.contentType = { value, parsed: {} };
            }
            break;
          case "content-transfer-encoding":
            this.contentTransferEncoding = { value, parsed: {} };
            break;
          case "content-disposition":
            this.contentDisposition = { value, parsed: {} };
            break;
          case "content-id":
            this.contentId = value;
            break;
          case "content-description":
            this.contentDescription = value;
            break;
        }
      }
    }
    this.contentType.parsed = this.parseStructuredHeader(this.contentType.value);
    this.contentType.multipart = /^multipart\//i.test(this.contentType.parsed.value) ? this.contentType.parsed.value.substr(this.contentType.parsed.value.indexOf("/") + 1) : false;
    if (this.contentType.multipart && this.contentType.parsed.params.boundary) {
      this.postalMime.boundaries.push({
        value: textEncoder.encode(this.contentType.parsed.params.boundary),
        node: this
      });
    }
    this.contentDisposition.parsed = this.parseStructuredHeader(this.contentDisposition.value);
    this.contentTransferEncoding.encoding = this.contentTransferEncoding.value.toLowerCase().split(/[^\w-]/).shift();
    this.setupContentDecoder(this.contentTransferEncoding.encoding);
  }
  feed(line) {
    switch (this.state) {
      case "header":
        if (!line.length) {
          this.state = "body";
          return this.processHeaders();
        }
        this.headerLines.push(getDecoder().decode(line));
        break;
      case "body": {
        this.contentDecoder.update(line);
      }
    }
  }
};
__name(MimeNode, "MimeNode");

// ../../node_modules/.pnpm/postal-mime@2.4.3/node_modules/postal-mime/src/html-entities.js
var htmlEntities = {
  "&AElig": "\xC6",
  "&AElig;": "\xC6",
  "&AMP": "&",
  "&AMP;": "&",
  "&Aacute": "\xC1",
  "&Aacute;": "\xC1",
  "&Abreve;": "\u0102",
  "&Acirc": "\xC2",
  "&Acirc;": "\xC2",
  "&Acy;": "\u0410",
  "&Afr;": "\u{1D504}",
  "&Agrave": "\xC0",
  "&Agrave;": "\xC0",
  "&Alpha;": "\u0391",
  "&Amacr;": "\u0100",
  "&And;": "\u2A53",
  "&Aogon;": "\u0104",
  "&Aopf;": "\u{1D538}",
  "&ApplyFunction;": "\u2061",
  "&Aring": "\xC5",
  "&Aring;": "\xC5",
  "&Ascr;": "\u{1D49C}",
  "&Assign;": "\u2254",
  "&Atilde": "\xC3",
  "&Atilde;": "\xC3",
  "&Auml": "\xC4",
  "&Auml;": "\xC4",
  "&Backslash;": "\u2216",
  "&Barv;": "\u2AE7",
  "&Barwed;": "\u2306",
  "&Bcy;": "\u0411",
  "&Because;": "\u2235",
  "&Bernoullis;": "\u212C",
  "&Beta;": "\u0392",
  "&Bfr;": "\u{1D505}",
  "&Bopf;": "\u{1D539}",
  "&Breve;": "\u02D8",
  "&Bscr;": "\u212C",
  "&Bumpeq;": "\u224E",
  "&CHcy;": "\u0427",
  "&COPY": "\xA9",
  "&COPY;": "\xA9",
  "&Cacute;": "\u0106",
  "&Cap;": "\u22D2",
  "&CapitalDifferentialD;": "\u2145",
  "&Cayleys;": "\u212D",
  "&Ccaron;": "\u010C",
  "&Ccedil": "\xC7",
  "&Ccedil;": "\xC7",
  "&Ccirc;": "\u0108",
  "&Cconint;": "\u2230",
  "&Cdot;": "\u010A",
  "&Cedilla;": "\xB8",
  "&CenterDot;": "\xB7",
  "&Cfr;": "\u212D",
  "&Chi;": "\u03A7",
  "&CircleDot;": "\u2299",
  "&CircleMinus;": "\u2296",
  "&CirclePlus;": "\u2295",
  "&CircleTimes;": "\u2297",
  "&ClockwiseContourIntegral;": "\u2232",
  "&CloseCurlyDoubleQuote;": "\u201D",
  "&CloseCurlyQuote;": "\u2019",
  "&Colon;": "\u2237",
  "&Colone;": "\u2A74",
  "&Congruent;": "\u2261",
  "&Conint;": "\u222F",
  "&ContourIntegral;": "\u222E",
  "&Copf;": "\u2102",
  "&Coproduct;": "\u2210",
  "&CounterClockwiseContourIntegral;": "\u2233",
  "&Cross;": "\u2A2F",
  "&Cscr;": "\u{1D49E}",
  "&Cup;": "\u22D3",
  "&CupCap;": "\u224D",
  "&DD;": "\u2145",
  "&DDotrahd;": "\u2911",
  "&DJcy;": "\u0402",
  "&DScy;": "\u0405",
  "&DZcy;": "\u040F",
  "&Dagger;": "\u2021",
  "&Darr;": "\u21A1",
  "&Dashv;": "\u2AE4",
  "&Dcaron;": "\u010E",
  "&Dcy;": "\u0414",
  "&Del;": "\u2207",
  "&Delta;": "\u0394",
  "&Dfr;": "\u{1D507}",
  "&DiacriticalAcute;": "\xB4",
  "&DiacriticalDot;": "\u02D9",
  "&DiacriticalDoubleAcute;": "\u02DD",
  "&DiacriticalGrave;": "`",
  "&DiacriticalTilde;": "\u02DC",
  "&Diamond;": "\u22C4",
  "&DifferentialD;": "\u2146",
  "&Dopf;": "\u{1D53B}",
  "&Dot;": "\xA8",
  "&DotDot;": "\u20DC",
  "&DotEqual;": "\u2250",
  "&DoubleContourIntegral;": "\u222F",
  "&DoubleDot;": "\xA8",
  "&DoubleDownArrow;": "\u21D3",
  "&DoubleLeftArrow;": "\u21D0",
  "&DoubleLeftRightArrow;": "\u21D4",
  "&DoubleLeftTee;": "\u2AE4",
  "&DoubleLongLeftArrow;": "\u27F8",
  "&DoubleLongLeftRightArrow;": "\u27FA",
  "&DoubleLongRightArrow;": "\u27F9",
  "&DoubleRightArrow;": "\u21D2",
  "&DoubleRightTee;": "\u22A8",
  "&DoubleUpArrow;": "\u21D1",
  "&DoubleUpDownArrow;": "\u21D5",
  "&DoubleVerticalBar;": "\u2225",
  "&DownArrow;": "\u2193",
  "&DownArrowBar;": "\u2913",
  "&DownArrowUpArrow;": "\u21F5",
  "&DownBreve;": "\u0311",
  "&DownLeftRightVector;": "\u2950",
  "&DownLeftTeeVector;": "\u295E",
  "&DownLeftVector;": "\u21BD",
  "&DownLeftVectorBar;": "\u2956",
  "&DownRightTeeVector;": "\u295F",
  "&DownRightVector;": "\u21C1",
  "&DownRightVectorBar;": "\u2957",
  "&DownTee;": "\u22A4",
  "&DownTeeArrow;": "\u21A7",
  "&Downarrow;": "\u21D3",
  "&Dscr;": "\u{1D49F}",
  "&Dstrok;": "\u0110",
  "&ENG;": "\u014A",
  "&ETH": "\xD0",
  "&ETH;": "\xD0",
  "&Eacute": "\xC9",
  "&Eacute;": "\xC9",
  "&Ecaron;": "\u011A",
  "&Ecirc": "\xCA",
  "&Ecirc;": "\xCA",
  "&Ecy;": "\u042D",
  "&Edot;": "\u0116",
  "&Efr;": "\u{1D508}",
  "&Egrave": "\xC8",
  "&Egrave;": "\xC8",
  "&Element;": "\u2208",
  "&Emacr;": "\u0112",
  "&EmptySmallSquare;": "\u25FB",
  "&EmptyVerySmallSquare;": "\u25AB",
  "&Eogon;": "\u0118",
  "&Eopf;": "\u{1D53C}",
  "&Epsilon;": "\u0395",
  "&Equal;": "\u2A75",
  "&EqualTilde;": "\u2242",
  "&Equilibrium;": "\u21CC",
  "&Escr;": "\u2130",
  "&Esim;": "\u2A73",
  "&Eta;": "\u0397",
  "&Euml": "\xCB",
  "&Euml;": "\xCB",
  "&Exists;": "\u2203",
  "&ExponentialE;": "\u2147",
  "&Fcy;": "\u0424",
  "&Ffr;": "\u{1D509}",
  "&FilledSmallSquare;": "\u25FC",
  "&FilledVerySmallSquare;": "\u25AA",
  "&Fopf;": "\u{1D53D}",
  "&ForAll;": "\u2200",
  "&Fouriertrf;": "\u2131",
  "&Fscr;": "\u2131",
  "&GJcy;": "\u0403",
  "&GT": ">",
  "&GT;": ">",
  "&Gamma;": "\u0393",
  "&Gammad;": "\u03DC",
  "&Gbreve;": "\u011E",
  "&Gcedil;": "\u0122",
  "&Gcirc;": "\u011C",
  "&Gcy;": "\u0413",
  "&Gdot;": "\u0120",
  "&Gfr;": "\u{1D50A}",
  "&Gg;": "\u22D9",
  "&Gopf;": "\u{1D53E}",
  "&GreaterEqual;": "\u2265",
  "&GreaterEqualLess;": "\u22DB",
  "&GreaterFullEqual;": "\u2267",
  "&GreaterGreater;": "\u2AA2",
  "&GreaterLess;": "\u2277",
  "&GreaterSlantEqual;": "\u2A7E",
  "&GreaterTilde;": "\u2273",
  "&Gscr;": "\u{1D4A2}",
  "&Gt;": "\u226B",
  "&HARDcy;": "\u042A",
  "&Hacek;": "\u02C7",
  "&Hat;": "^",
  "&Hcirc;": "\u0124",
  "&Hfr;": "\u210C",
  "&HilbertSpace;": "\u210B",
  "&Hopf;": "\u210D",
  "&HorizontalLine;": "\u2500",
  "&Hscr;": "\u210B",
  "&Hstrok;": "\u0126",
  "&HumpDownHump;": "\u224E",
  "&HumpEqual;": "\u224F",
  "&IEcy;": "\u0415",
  "&IJlig;": "\u0132",
  "&IOcy;": "\u0401",
  "&Iacute": "\xCD",
  "&Iacute;": "\xCD",
  "&Icirc": "\xCE",
  "&Icirc;": "\xCE",
  "&Icy;": "\u0418",
  "&Idot;": "\u0130",
  "&Ifr;": "\u2111",
  "&Igrave": "\xCC",
  "&Igrave;": "\xCC",
  "&Im;": "\u2111",
  "&Imacr;": "\u012A",
  "&ImaginaryI;": "\u2148",
  "&Implies;": "\u21D2",
  "&Int;": "\u222C",
  "&Integral;": "\u222B",
  "&Intersection;": "\u22C2",
  "&InvisibleComma;": "\u2063",
  "&InvisibleTimes;": "\u2062",
  "&Iogon;": "\u012E",
  "&Iopf;": "\u{1D540}",
  "&Iota;": "\u0399",
  "&Iscr;": "\u2110",
  "&Itilde;": "\u0128",
  "&Iukcy;": "\u0406",
  "&Iuml": "\xCF",
  "&Iuml;": "\xCF",
  "&Jcirc;": "\u0134",
  "&Jcy;": "\u0419",
  "&Jfr;": "\u{1D50D}",
  "&Jopf;": "\u{1D541}",
  "&Jscr;": "\u{1D4A5}",
  "&Jsercy;": "\u0408",
  "&Jukcy;": "\u0404",
  "&KHcy;": "\u0425",
  "&KJcy;": "\u040C",
  "&Kappa;": "\u039A",
  "&Kcedil;": "\u0136",
  "&Kcy;": "\u041A",
  "&Kfr;": "\u{1D50E}",
  "&Kopf;": "\u{1D542}",
  "&Kscr;": "\u{1D4A6}",
  "&LJcy;": "\u0409",
  "&LT": "<",
  "&LT;": "<",
  "&Lacute;": "\u0139",
  "&Lambda;": "\u039B",
  "&Lang;": "\u27EA",
  "&Laplacetrf;": "\u2112",
  "&Larr;": "\u219E",
  "&Lcaron;": "\u013D",
  "&Lcedil;": "\u013B",
  "&Lcy;": "\u041B",
  "&LeftAngleBracket;": "\u27E8",
  "&LeftArrow;": "\u2190",
  "&LeftArrowBar;": "\u21E4",
  "&LeftArrowRightArrow;": "\u21C6",
  "&LeftCeiling;": "\u2308",
  "&LeftDoubleBracket;": "\u27E6",
  "&LeftDownTeeVector;": "\u2961",
  "&LeftDownVector;": "\u21C3",
  "&LeftDownVectorBar;": "\u2959",
  "&LeftFloor;": "\u230A",
  "&LeftRightArrow;": "\u2194",
  "&LeftRightVector;": "\u294E",
  "&LeftTee;": "\u22A3",
  "&LeftTeeArrow;": "\u21A4",
  "&LeftTeeVector;": "\u295A",
  "&LeftTriangle;": "\u22B2",
  "&LeftTriangleBar;": "\u29CF",
  "&LeftTriangleEqual;": "\u22B4",
  "&LeftUpDownVector;": "\u2951",
  "&LeftUpTeeVector;": "\u2960",
  "&LeftUpVector;": "\u21BF",
  "&LeftUpVectorBar;": "\u2958",
  "&LeftVector;": "\u21BC",
  "&LeftVectorBar;": "\u2952",
  "&Leftarrow;": "\u21D0",
  "&Leftrightarrow;": "\u21D4",
  "&LessEqualGreater;": "\u22DA",
  "&LessFullEqual;": "\u2266",
  "&LessGreater;": "\u2276",
  "&LessLess;": "\u2AA1",
  "&LessSlantEqual;": "\u2A7D",
  "&LessTilde;": "\u2272",
  "&Lfr;": "\u{1D50F}",
  "&Ll;": "\u22D8",
  "&Lleftarrow;": "\u21DA",
  "&Lmidot;": "\u013F",
  "&LongLeftArrow;": "\u27F5",
  "&LongLeftRightArrow;": "\u27F7",
  "&LongRightArrow;": "\u27F6",
  "&Longleftarrow;": "\u27F8",
  "&Longleftrightarrow;": "\u27FA",
  "&Longrightarrow;": "\u27F9",
  "&Lopf;": "\u{1D543}",
  "&LowerLeftArrow;": "\u2199",
  "&LowerRightArrow;": "\u2198",
  "&Lscr;": "\u2112",
  "&Lsh;": "\u21B0",
  "&Lstrok;": "\u0141",
  "&Lt;": "\u226A",
  "&Map;": "\u2905",
  "&Mcy;": "\u041C",
  "&MediumSpace;": "\u205F",
  "&Mellintrf;": "\u2133",
  "&Mfr;": "\u{1D510}",
  "&MinusPlus;": "\u2213",
  "&Mopf;": "\u{1D544}",
  "&Mscr;": "\u2133",
  "&Mu;": "\u039C",
  "&NJcy;": "\u040A",
  "&Nacute;": "\u0143",
  "&Ncaron;": "\u0147",
  "&Ncedil;": "\u0145",
  "&Ncy;": "\u041D",
  "&NegativeMediumSpace;": "\u200B",
  "&NegativeThickSpace;": "\u200B",
  "&NegativeThinSpace;": "\u200B",
  "&NegativeVeryThinSpace;": "\u200B",
  "&NestedGreaterGreater;": "\u226B",
  "&NestedLessLess;": "\u226A",
  "&NewLine;": "\n",
  "&Nfr;": "\u{1D511}",
  "&NoBreak;": "\u2060",
  "&NonBreakingSpace;": "\xA0",
  "&Nopf;": "\u2115",
  "&Not;": "\u2AEC",
  "&NotCongruent;": "\u2262",
  "&NotCupCap;": "\u226D",
  "&NotDoubleVerticalBar;": "\u2226",
  "&NotElement;": "\u2209",
  "&NotEqual;": "\u2260",
  "&NotEqualTilde;": "\u2242\u0338",
  "&NotExists;": "\u2204",
  "&NotGreater;": "\u226F",
  "&NotGreaterEqual;": "\u2271",
  "&NotGreaterFullEqual;": "\u2267\u0338",
  "&NotGreaterGreater;": "\u226B\u0338",
  "&NotGreaterLess;": "\u2279",
  "&NotGreaterSlantEqual;": "\u2A7E\u0338",
  "&NotGreaterTilde;": "\u2275",
  "&NotHumpDownHump;": "\u224E\u0338",
  "&NotHumpEqual;": "\u224F\u0338",
  "&NotLeftTriangle;": "\u22EA",
  "&NotLeftTriangleBar;": "\u29CF\u0338",
  "&NotLeftTriangleEqual;": "\u22EC",
  "&NotLess;": "\u226E",
  "&NotLessEqual;": "\u2270",
  "&NotLessGreater;": "\u2278",
  "&NotLessLess;": "\u226A\u0338",
  "&NotLessSlantEqual;": "\u2A7D\u0338",
  "&NotLessTilde;": "\u2274",
  "&NotNestedGreaterGreater;": "\u2AA2\u0338",
  "&NotNestedLessLess;": "\u2AA1\u0338",
  "&NotPrecedes;": "\u2280",
  "&NotPrecedesEqual;": "\u2AAF\u0338",
  "&NotPrecedesSlantEqual;": "\u22E0",
  "&NotReverseElement;": "\u220C",
  "&NotRightTriangle;": "\u22EB",
  "&NotRightTriangleBar;": "\u29D0\u0338",
  "&NotRightTriangleEqual;": "\u22ED",
  "&NotSquareSubset;": "\u228F\u0338",
  "&NotSquareSubsetEqual;": "\u22E2",
  "&NotSquareSuperset;": "\u2290\u0338",
  "&NotSquareSupersetEqual;": "\u22E3",
  "&NotSubset;": "\u2282\u20D2",
  "&NotSubsetEqual;": "\u2288",
  "&NotSucceeds;": "\u2281",
  "&NotSucceedsEqual;": "\u2AB0\u0338",
  "&NotSucceedsSlantEqual;": "\u22E1",
  "&NotSucceedsTilde;": "\u227F\u0338",
  "&NotSuperset;": "\u2283\u20D2",
  "&NotSupersetEqual;": "\u2289",
  "&NotTilde;": "\u2241",
  "&NotTildeEqual;": "\u2244",
  "&NotTildeFullEqual;": "\u2247",
  "&NotTildeTilde;": "\u2249",
  "&NotVerticalBar;": "\u2224",
  "&Nscr;": "\u{1D4A9}",
  "&Ntilde": "\xD1",
  "&Ntilde;": "\xD1",
  "&Nu;": "\u039D",
  "&OElig;": "\u0152",
  "&Oacute": "\xD3",
  "&Oacute;": "\xD3",
  "&Ocirc": "\xD4",
  "&Ocirc;": "\xD4",
  "&Ocy;": "\u041E",
  "&Odblac;": "\u0150",
  "&Ofr;": "\u{1D512}",
  "&Ograve": "\xD2",
  "&Ograve;": "\xD2",
  "&Omacr;": "\u014C",
  "&Omega;": "\u03A9",
  "&Omicron;": "\u039F",
  "&Oopf;": "\u{1D546}",
  "&OpenCurlyDoubleQuote;": "\u201C",
  "&OpenCurlyQuote;": "\u2018",
  "&Or;": "\u2A54",
  "&Oscr;": "\u{1D4AA}",
  "&Oslash": "\xD8",
  "&Oslash;": "\xD8",
  "&Otilde": "\xD5",
  "&Otilde;": "\xD5",
  "&Otimes;": "\u2A37",
  "&Ouml": "\xD6",
  "&Ouml;": "\xD6",
  "&OverBar;": "\u203E",
  "&OverBrace;": "\u23DE",
  "&OverBracket;": "\u23B4",
  "&OverParenthesis;": "\u23DC",
  "&PartialD;": "\u2202",
  "&Pcy;": "\u041F",
  "&Pfr;": "\u{1D513}",
  "&Phi;": "\u03A6",
  "&Pi;": "\u03A0",
  "&PlusMinus;": "\xB1",
  "&Poincareplane;": "\u210C",
  "&Popf;": "\u2119",
  "&Pr;": "\u2ABB",
  "&Precedes;": "\u227A",
  "&PrecedesEqual;": "\u2AAF",
  "&PrecedesSlantEqual;": "\u227C",
  "&PrecedesTilde;": "\u227E",
  "&Prime;": "\u2033",
  "&Product;": "\u220F",
  "&Proportion;": "\u2237",
  "&Proportional;": "\u221D",
  "&Pscr;": "\u{1D4AB}",
  "&Psi;": "\u03A8",
  "&QUOT": '"',
  "&QUOT;": '"',
  "&Qfr;": "\u{1D514}",
  "&Qopf;": "\u211A",
  "&Qscr;": "\u{1D4AC}",
  "&RBarr;": "\u2910",
  "&REG": "\xAE",
  "&REG;": "\xAE",
  "&Racute;": "\u0154",
  "&Rang;": "\u27EB",
  "&Rarr;": "\u21A0",
  "&Rarrtl;": "\u2916",
  "&Rcaron;": "\u0158",
  "&Rcedil;": "\u0156",
  "&Rcy;": "\u0420",
  "&Re;": "\u211C",
  "&ReverseElement;": "\u220B",
  "&ReverseEquilibrium;": "\u21CB",
  "&ReverseUpEquilibrium;": "\u296F",
  "&Rfr;": "\u211C",
  "&Rho;": "\u03A1",
  "&RightAngleBracket;": "\u27E9",
  "&RightArrow;": "\u2192",
  "&RightArrowBar;": "\u21E5",
  "&RightArrowLeftArrow;": "\u21C4",
  "&RightCeiling;": "\u2309",
  "&RightDoubleBracket;": "\u27E7",
  "&RightDownTeeVector;": "\u295D",
  "&RightDownVector;": "\u21C2",
  "&RightDownVectorBar;": "\u2955",
  "&RightFloor;": "\u230B",
  "&RightTee;": "\u22A2",
  "&RightTeeArrow;": "\u21A6",
  "&RightTeeVector;": "\u295B",
  "&RightTriangle;": "\u22B3",
  "&RightTriangleBar;": "\u29D0",
  "&RightTriangleEqual;": "\u22B5",
  "&RightUpDownVector;": "\u294F",
  "&RightUpTeeVector;": "\u295C",
  "&RightUpVector;": "\u21BE",
  "&RightUpVectorBar;": "\u2954",
  "&RightVector;": "\u21C0",
  "&RightVectorBar;": "\u2953",
  "&Rightarrow;": "\u21D2",
  "&Ropf;": "\u211D",
  "&RoundImplies;": "\u2970",
  "&Rrightarrow;": "\u21DB",
  "&Rscr;": "\u211B",
  "&Rsh;": "\u21B1",
  "&RuleDelayed;": "\u29F4",
  "&SHCHcy;": "\u0429",
  "&SHcy;": "\u0428",
  "&SOFTcy;": "\u042C",
  "&Sacute;": "\u015A",
  "&Sc;": "\u2ABC",
  "&Scaron;": "\u0160",
  "&Scedil;": "\u015E",
  "&Scirc;": "\u015C",
  "&Scy;": "\u0421",
  "&Sfr;": "\u{1D516}",
  "&ShortDownArrow;": "\u2193",
  "&ShortLeftArrow;": "\u2190",
  "&ShortRightArrow;": "\u2192",
  "&ShortUpArrow;": "\u2191",
  "&Sigma;": "\u03A3",
  "&SmallCircle;": "\u2218",
  "&Sopf;": "\u{1D54A}",
  "&Sqrt;": "\u221A",
  "&Square;": "\u25A1",
  "&SquareIntersection;": "\u2293",
  "&SquareSubset;": "\u228F",
  "&SquareSubsetEqual;": "\u2291",
  "&SquareSuperset;": "\u2290",
  "&SquareSupersetEqual;": "\u2292",
  "&SquareUnion;": "\u2294",
  "&Sscr;": "\u{1D4AE}",
  "&Star;": "\u22C6",
  "&Sub;": "\u22D0",
  "&Subset;": "\u22D0",
  "&SubsetEqual;": "\u2286",
  "&Succeeds;": "\u227B",
  "&SucceedsEqual;": "\u2AB0",
  "&SucceedsSlantEqual;": "\u227D",
  "&SucceedsTilde;": "\u227F",
  "&SuchThat;": "\u220B",
  "&Sum;": "\u2211",
  "&Sup;": "\u22D1",
  "&Superset;": "\u2283",
  "&SupersetEqual;": "\u2287",
  "&Supset;": "\u22D1",
  "&THORN": "\xDE",
  "&THORN;": "\xDE",
  "&TRADE;": "\u2122",
  "&TSHcy;": "\u040B",
  "&TScy;": "\u0426",
  "&Tab;": "	",
  "&Tau;": "\u03A4",
  "&Tcaron;": "\u0164",
  "&Tcedil;": "\u0162",
  "&Tcy;": "\u0422",
  "&Tfr;": "\u{1D517}",
  "&Therefore;": "\u2234",
  "&Theta;": "\u0398",
  "&ThickSpace;": "\u205F\u200A",
  "&ThinSpace;": "\u2009",
  "&Tilde;": "\u223C",
  "&TildeEqual;": "\u2243",
  "&TildeFullEqual;": "\u2245",
  "&TildeTilde;": "\u2248",
  "&Topf;": "\u{1D54B}",
  "&TripleDot;": "\u20DB",
  "&Tscr;": "\u{1D4AF}",
  "&Tstrok;": "\u0166",
  "&Uacute": "\xDA",
  "&Uacute;": "\xDA",
  "&Uarr;": "\u219F",
  "&Uarrocir;": "\u2949",
  "&Ubrcy;": "\u040E",
  "&Ubreve;": "\u016C",
  "&Ucirc": "\xDB",
  "&Ucirc;": "\xDB",
  "&Ucy;": "\u0423",
  "&Udblac;": "\u0170",
  "&Ufr;": "\u{1D518}",
  "&Ugrave": "\xD9",
  "&Ugrave;": "\xD9",
  "&Umacr;": "\u016A",
  "&UnderBar;": "_",
  "&UnderBrace;": "\u23DF",
  "&UnderBracket;": "\u23B5",
  "&UnderParenthesis;": "\u23DD",
  "&Union;": "\u22C3",
  "&UnionPlus;": "\u228E",
  "&Uogon;": "\u0172",
  "&Uopf;": "\u{1D54C}",
  "&UpArrow;": "\u2191",
  "&UpArrowBar;": "\u2912",
  "&UpArrowDownArrow;": "\u21C5",
  "&UpDownArrow;": "\u2195",
  "&UpEquilibrium;": "\u296E",
  "&UpTee;": "\u22A5",
  "&UpTeeArrow;": "\u21A5",
  "&Uparrow;": "\u21D1",
  "&Updownarrow;": "\u21D5",
  "&UpperLeftArrow;": "\u2196",
  "&UpperRightArrow;": "\u2197",
  "&Upsi;": "\u03D2",
  "&Upsilon;": "\u03A5",
  "&Uring;": "\u016E",
  "&Uscr;": "\u{1D4B0}",
  "&Utilde;": "\u0168",
  "&Uuml": "\xDC",
  "&Uuml;": "\xDC",
  "&VDash;": "\u22AB",
  "&Vbar;": "\u2AEB",
  "&Vcy;": "\u0412",
  "&Vdash;": "\u22A9",
  "&Vdashl;": "\u2AE6",
  "&Vee;": "\u22C1",
  "&Verbar;": "\u2016",
  "&Vert;": "\u2016",
  "&VerticalBar;": "\u2223",
  "&VerticalLine;": "|",
  "&VerticalSeparator;": "\u2758",
  "&VerticalTilde;": "\u2240",
  "&VeryThinSpace;": "\u200A",
  "&Vfr;": "\u{1D519}",
  "&Vopf;": "\u{1D54D}",
  "&Vscr;": "\u{1D4B1}",
  "&Vvdash;": "\u22AA",
  "&Wcirc;": "\u0174",
  "&Wedge;": "\u22C0",
  "&Wfr;": "\u{1D51A}",
  "&Wopf;": "\u{1D54E}",
  "&Wscr;": "\u{1D4B2}",
  "&Xfr;": "\u{1D51B}",
  "&Xi;": "\u039E",
  "&Xopf;": "\u{1D54F}",
  "&Xscr;": "\u{1D4B3}",
  "&YAcy;": "\u042F",
  "&YIcy;": "\u0407",
  "&YUcy;": "\u042E",
  "&Yacute": "\xDD",
  "&Yacute;": "\xDD",
  "&Ycirc;": "\u0176",
  "&Ycy;": "\u042B",
  "&Yfr;": "\u{1D51C}",
  "&Yopf;": "\u{1D550}",
  "&Yscr;": "\u{1D4B4}",
  "&Yuml;": "\u0178",
  "&ZHcy;": "\u0416",
  "&Zacute;": "\u0179",
  "&Zcaron;": "\u017D",
  "&Zcy;": "\u0417",
  "&Zdot;": "\u017B",
  "&ZeroWidthSpace;": "\u200B",
  "&Zeta;": "\u0396",
  "&Zfr;": "\u2128",
  "&Zopf;": "\u2124",
  "&Zscr;": "\u{1D4B5}",
  "&aacute": "\xE1",
  "&aacute;": "\xE1",
  "&abreve;": "\u0103",
  "&ac;": "\u223E",
  "&acE;": "\u223E\u0333",
  "&acd;": "\u223F",
  "&acirc": "\xE2",
  "&acirc;": "\xE2",
  "&acute": "\xB4",
  "&acute;": "\xB4",
  "&acy;": "\u0430",
  "&aelig": "\xE6",
  "&aelig;": "\xE6",
  "&af;": "\u2061",
  "&afr;": "\u{1D51E}",
  "&agrave": "\xE0",
  "&agrave;": "\xE0",
  "&alefsym;": "\u2135",
  "&aleph;": "\u2135",
  "&alpha;": "\u03B1",
  "&amacr;": "\u0101",
  "&amalg;": "\u2A3F",
  "&amp": "&",
  "&amp;": "&",
  "&and;": "\u2227",
  "&andand;": "\u2A55",
  "&andd;": "\u2A5C",
  "&andslope;": "\u2A58",
  "&andv;": "\u2A5A",
  "&ang;": "\u2220",
  "&ange;": "\u29A4",
  "&angle;": "\u2220",
  "&angmsd;": "\u2221",
  "&angmsdaa;": "\u29A8",
  "&angmsdab;": "\u29A9",
  "&angmsdac;": "\u29AA",
  "&angmsdad;": "\u29AB",
  "&angmsdae;": "\u29AC",
  "&angmsdaf;": "\u29AD",
  "&angmsdag;": "\u29AE",
  "&angmsdah;": "\u29AF",
  "&angrt;": "\u221F",
  "&angrtvb;": "\u22BE",
  "&angrtvbd;": "\u299D",
  "&angsph;": "\u2222",
  "&angst;": "\xC5",
  "&angzarr;": "\u237C",
  "&aogon;": "\u0105",
  "&aopf;": "\u{1D552}",
  "&ap;": "\u2248",
  "&apE;": "\u2A70",
  "&apacir;": "\u2A6F",
  "&ape;": "\u224A",
  "&apid;": "\u224B",
  "&apos;": "'",
  "&approx;": "\u2248",
  "&approxeq;": "\u224A",
  "&aring": "\xE5",
  "&aring;": "\xE5",
  "&ascr;": "\u{1D4B6}",
  "&ast;": "*",
  "&asymp;": "\u2248",
  "&asympeq;": "\u224D",
  "&atilde": "\xE3",
  "&atilde;": "\xE3",
  "&auml": "\xE4",
  "&auml;": "\xE4",
  "&awconint;": "\u2233",
  "&awint;": "\u2A11",
  "&bNot;": "\u2AED",
  "&backcong;": "\u224C",
  "&backepsilon;": "\u03F6",
  "&backprime;": "\u2035",
  "&backsim;": "\u223D",
  "&backsimeq;": "\u22CD",
  "&barvee;": "\u22BD",
  "&barwed;": "\u2305",
  "&barwedge;": "\u2305",
  "&bbrk;": "\u23B5",
  "&bbrktbrk;": "\u23B6",
  "&bcong;": "\u224C",
  "&bcy;": "\u0431",
  "&bdquo;": "\u201E",
  "&becaus;": "\u2235",
  "&because;": "\u2235",
  "&bemptyv;": "\u29B0",
  "&bepsi;": "\u03F6",
  "&bernou;": "\u212C",
  "&beta;": "\u03B2",
  "&beth;": "\u2136",
  "&between;": "\u226C",
  "&bfr;": "\u{1D51F}",
  "&bigcap;": "\u22C2",
  "&bigcirc;": "\u25EF",
  "&bigcup;": "\u22C3",
  "&bigodot;": "\u2A00",
  "&bigoplus;": "\u2A01",
  "&bigotimes;": "\u2A02",
  "&bigsqcup;": "\u2A06",
  "&bigstar;": "\u2605",
  "&bigtriangledown;": "\u25BD",
  "&bigtriangleup;": "\u25B3",
  "&biguplus;": "\u2A04",
  "&bigvee;": "\u22C1",
  "&bigwedge;": "\u22C0",
  "&bkarow;": "\u290D",
  "&blacklozenge;": "\u29EB",
  "&blacksquare;": "\u25AA",
  "&blacktriangle;": "\u25B4",
  "&blacktriangledown;": "\u25BE",
  "&blacktriangleleft;": "\u25C2",
  "&blacktriangleright;": "\u25B8",
  "&blank;": "\u2423",
  "&blk12;": "\u2592",
  "&blk14;": "\u2591",
  "&blk34;": "\u2593",
  "&block;": "\u2588",
  "&bne;": "=\u20E5",
  "&bnequiv;": "\u2261\u20E5",
  "&bnot;": "\u2310",
  "&bopf;": "\u{1D553}",
  "&bot;": "\u22A5",
  "&bottom;": "\u22A5",
  "&bowtie;": "\u22C8",
  "&boxDL;": "\u2557",
  "&boxDR;": "\u2554",
  "&boxDl;": "\u2556",
  "&boxDr;": "\u2553",
  "&boxH;": "\u2550",
  "&boxHD;": "\u2566",
  "&boxHU;": "\u2569",
  "&boxHd;": "\u2564",
  "&boxHu;": "\u2567",
  "&boxUL;": "\u255D",
  "&boxUR;": "\u255A",
  "&boxUl;": "\u255C",
  "&boxUr;": "\u2559",
  "&boxV;": "\u2551",
  "&boxVH;": "\u256C",
  "&boxVL;": "\u2563",
  "&boxVR;": "\u2560",
  "&boxVh;": "\u256B",
  "&boxVl;": "\u2562",
  "&boxVr;": "\u255F",
  "&boxbox;": "\u29C9",
  "&boxdL;": "\u2555",
  "&boxdR;": "\u2552",
  "&boxdl;": "\u2510",
  "&boxdr;": "\u250C",
  "&boxh;": "\u2500",
  "&boxhD;": "\u2565",
  "&boxhU;": "\u2568",
  "&boxhd;": "\u252C",
  "&boxhu;": "\u2534",
  "&boxminus;": "\u229F",
  "&boxplus;": "\u229E",
  "&boxtimes;": "\u22A0",
  "&boxuL;": "\u255B",
  "&boxuR;": "\u2558",
  "&boxul;": "\u2518",
  "&boxur;": "\u2514",
  "&boxv;": "\u2502",
  "&boxvH;": "\u256A",
  "&boxvL;": "\u2561",
  "&boxvR;": "\u255E",
  "&boxvh;": "\u253C",
  "&boxvl;": "\u2524",
  "&boxvr;": "\u251C",
  "&bprime;": "\u2035",
  "&breve;": "\u02D8",
  "&brvbar": "\xA6",
  "&brvbar;": "\xA6",
  "&bscr;": "\u{1D4B7}",
  "&bsemi;": "\u204F",
  "&bsim;": "\u223D",
  "&bsime;": "\u22CD",
  "&bsol;": "\\",
  "&bsolb;": "\u29C5",
  "&bsolhsub;": "\u27C8",
  "&bull;": "\u2022",
  "&bullet;": "\u2022",
  "&bump;": "\u224E",
  "&bumpE;": "\u2AAE",
  "&bumpe;": "\u224F",
  "&bumpeq;": "\u224F",
  "&cacute;": "\u0107",
  "&cap;": "\u2229",
  "&capand;": "\u2A44",
  "&capbrcup;": "\u2A49",
  "&capcap;": "\u2A4B",
  "&capcup;": "\u2A47",
  "&capdot;": "\u2A40",
  "&caps;": "\u2229\uFE00",
  "&caret;": "\u2041",
  "&caron;": "\u02C7",
  "&ccaps;": "\u2A4D",
  "&ccaron;": "\u010D",
  "&ccedil": "\xE7",
  "&ccedil;": "\xE7",
  "&ccirc;": "\u0109",
  "&ccups;": "\u2A4C",
  "&ccupssm;": "\u2A50",
  "&cdot;": "\u010B",
  "&cedil": "\xB8",
  "&cedil;": "\xB8",
  "&cemptyv;": "\u29B2",
  "&cent": "\xA2",
  "&cent;": "\xA2",
  "&centerdot;": "\xB7",
  "&cfr;": "\u{1D520}",
  "&chcy;": "\u0447",
  "&check;": "\u2713",
  "&checkmark;": "\u2713",
  "&chi;": "\u03C7",
  "&cir;": "\u25CB",
  "&cirE;": "\u29C3",
  "&circ;": "\u02C6",
  "&circeq;": "\u2257",
  "&circlearrowleft;": "\u21BA",
  "&circlearrowright;": "\u21BB",
  "&circledR;": "\xAE",
  "&circledS;": "\u24C8",
  "&circledast;": "\u229B",
  "&circledcirc;": "\u229A",
  "&circleddash;": "\u229D",
  "&cire;": "\u2257",
  "&cirfnint;": "\u2A10",
  "&cirmid;": "\u2AEF",
  "&cirscir;": "\u29C2",
  "&clubs;": "\u2663",
  "&clubsuit;": "\u2663",
  "&colon;": ":",
  "&colone;": "\u2254",
  "&coloneq;": "\u2254",
  "&comma;": ",",
  "&commat;": "@",
  "&comp;": "\u2201",
  "&compfn;": "\u2218",
  "&complement;": "\u2201",
  "&complexes;": "\u2102",
  "&cong;": "\u2245",
  "&congdot;": "\u2A6D",
  "&conint;": "\u222E",
  "&copf;": "\u{1D554}",
  "&coprod;": "\u2210",
  "&copy": "\xA9",
  "&copy;": "\xA9",
  "&copysr;": "\u2117",
  "&crarr;": "\u21B5",
  "&cross;": "\u2717",
  "&cscr;": "\u{1D4B8}",
  "&csub;": "\u2ACF",
  "&csube;": "\u2AD1",
  "&csup;": "\u2AD0",
  "&csupe;": "\u2AD2",
  "&ctdot;": "\u22EF",
  "&cudarrl;": "\u2938",
  "&cudarrr;": "\u2935",
  "&cuepr;": "\u22DE",
  "&cuesc;": "\u22DF",
  "&cularr;": "\u21B6",
  "&cularrp;": "\u293D",
  "&cup;": "\u222A",
  "&cupbrcap;": "\u2A48",
  "&cupcap;": "\u2A46",
  "&cupcup;": "\u2A4A",
  "&cupdot;": "\u228D",
  "&cupor;": "\u2A45",
  "&cups;": "\u222A\uFE00",
  "&curarr;": "\u21B7",
  "&curarrm;": "\u293C",
  "&curlyeqprec;": "\u22DE",
  "&curlyeqsucc;": "\u22DF",
  "&curlyvee;": "\u22CE",
  "&curlywedge;": "\u22CF",
  "&curren": "\xA4",
  "&curren;": "\xA4",
  "&curvearrowleft;": "\u21B6",
  "&curvearrowright;": "\u21B7",
  "&cuvee;": "\u22CE",
  "&cuwed;": "\u22CF",
  "&cwconint;": "\u2232",
  "&cwint;": "\u2231",
  "&cylcty;": "\u232D",
  "&dArr;": "\u21D3",
  "&dHar;": "\u2965",
  "&dagger;": "\u2020",
  "&daleth;": "\u2138",
  "&darr;": "\u2193",
  "&dash;": "\u2010",
  "&dashv;": "\u22A3",
  "&dbkarow;": "\u290F",
  "&dblac;": "\u02DD",
  "&dcaron;": "\u010F",
  "&dcy;": "\u0434",
  "&dd;": "\u2146",
  "&ddagger;": "\u2021",
  "&ddarr;": "\u21CA",
  "&ddotseq;": "\u2A77",
  "&deg": "\xB0",
  "&deg;": "\xB0",
  "&delta;": "\u03B4",
  "&demptyv;": "\u29B1",
  "&dfisht;": "\u297F",
  "&dfr;": "\u{1D521}",
  "&dharl;": "\u21C3",
  "&dharr;": "\u21C2",
  "&diam;": "\u22C4",
  "&diamond;": "\u22C4",
  "&diamondsuit;": "\u2666",
  "&diams;": "\u2666",
  "&die;": "\xA8",
  "&digamma;": "\u03DD",
  "&disin;": "\u22F2",
  "&div;": "\xF7",
  "&divide": "\xF7",
  "&divide;": "\xF7",
  "&divideontimes;": "\u22C7",
  "&divonx;": "\u22C7",
  "&djcy;": "\u0452",
  "&dlcorn;": "\u231E",
  "&dlcrop;": "\u230D",
  "&dollar;": "$",
  "&dopf;": "\u{1D555}",
  "&dot;": "\u02D9",
  "&doteq;": "\u2250",
  "&doteqdot;": "\u2251",
  "&dotminus;": "\u2238",
  "&dotplus;": "\u2214",
  "&dotsquare;": "\u22A1",
  "&doublebarwedge;": "\u2306",
  "&downarrow;": "\u2193",
  "&downdownarrows;": "\u21CA",
  "&downharpoonleft;": "\u21C3",
  "&downharpoonright;": "\u21C2",
  "&drbkarow;": "\u2910",
  "&drcorn;": "\u231F",
  "&drcrop;": "\u230C",
  "&dscr;": "\u{1D4B9}",
  "&dscy;": "\u0455",
  "&dsol;": "\u29F6",
  "&dstrok;": "\u0111",
  "&dtdot;": "\u22F1",
  "&dtri;": "\u25BF",
  "&dtrif;": "\u25BE",
  "&duarr;": "\u21F5",
  "&duhar;": "\u296F",
  "&dwangle;": "\u29A6",
  "&dzcy;": "\u045F",
  "&dzigrarr;": "\u27FF",
  "&eDDot;": "\u2A77",
  "&eDot;": "\u2251",
  "&eacute": "\xE9",
  "&eacute;": "\xE9",
  "&easter;": "\u2A6E",
  "&ecaron;": "\u011B",
  "&ecir;": "\u2256",
  "&ecirc": "\xEA",
  "&ecirc;": "\xEA",
  "&ecolon;": "\u2255",
  "&ecy;": "\u044D",
  "&edot;": "\u0117",
  "&ee;": "\u2147",
  "&efDot;": "\u2252",
  "&efr;": "\u{1D522}",
  "&eg;": "\u2A9A",
  "&egrave": "\xE8",
  "&egrave;": "\xE8",
  "&egs;": "\u2A96",
  "&egsdot;": "\u2A98",
  "&el;": "\u2A99",
  "&elinters;": "\u23E7",
  "&ell;": "\u2113",
  "&els;": "\u2A95",
  "&elsdot;": "\u2A97",
  "&emacr;": "\u0113",
  "&empty;": "\u2205",
  "&emptyset;": "\u2205",
  "&emptyv;": "\u2205",
  "&emsp13;": "\u2004",
  "&emsp14;": "\u2005",
  "&emsp;": "\u2003",
  "&eng;": "\u014B",
  "&ensp;": "\u2002",
  "&eogon;": "\u0119",
  "&eopf;": "\u{1D556}",
  "&epar;": "\u22D5",
  "&eparsl;": "\u29E3",
  "&eplus;": "\u2A71",
  "&epsi;": "\u03B5",
  "&epsilon;": "\u03B5",
  "&epsiv;": "\u03F5",
  "&eqcirc;": "\u2256",
  "&eqcolon;": "\u2255",
  "&eqsim;": "\u2242",
  "&eqslantgtr;": "\u2A96",
  "&eqslantless;": "\u2A95",
  "&equals;": "=",
  "&equest;": "\u225F",
  "&equiv;": "\u2261",
  "&equivDD;": "\u2A78",
  "&eqvparsl;": "\u29E5",
  "&erDot;": "\u2253",
  "&erarr;": "\u2971",
  "&escr;": "\u212F",
  "&esdot;": "\u2250",
  "&esim;": "\u2242",
  "&eta;": "\u03B7",
  "&eth": "\xF0",
  "&eth;": "\xF0",
  "&euml": "\xEB",
  "&euml;": "\xEB",
  "&euro;": "\u20AC",
  "&excl;": "!",
  "&exist;": "\u2203",
  "&expectation;": "\u2130",
  "&exponentiale;": "\u2147",
  "&fallingdotseq;": "\u2252",
  "&fcy;": "\u0444",
  "&female;": "\u2640",
  "&ffilig;": "\uFB03",
  "&fflig;": "\uFB00",
  "&ffllig;": "\uFB04",
  "&ffr;": "\u{1D523}",
  "&filig;": "\uFB01",
  "&fjlig;": "fj",
  "&flat;": "\u266D",
  "&fllig;": "\uFB02",
  "&fltns;": "\u25B1",
  "&fnof;": "\u0192",
  "&fopf;": "\u{1D557}",
  "&forall;": "\u2200",
  "&fork;": "\u22D4",
  "&forkv;": "\u2AD9",
  "&fpartint;": "\u2A0D",
  "&frac12": "\xBD",
  "&frac12;": "\xBD",
  "&frac13;": "\u2153",
  "&frac14": "\xBC",
  "&frac14;": "\xBC",
  "&frac15;": "\u2155",
  "&frac16;": "\u2159",
  "&frac18;": "\u215B",
  "&frac23;": "\u2154",
  "&frac25;": "\u2156",
  "&frac34": "\xBE",
  "&frac34;": "\xBE",
  "&frac35;": "\u2157",
  "&frac38;": "\u215C",
  "&frac45;": "\u2158",
  "&frac56;": "\u215A",
  "&frac58;": "\u215D",
  "&frac78;": "\u215E",
  "&frasl;": "\u2044",
  "&frown;": "\u2322",
  "&fscr;": "\u{1D4BB}",
  "&gE;": "\u2267",
  "&gEl;": "\u2A8C",
  "&gacute;": "\u01F5",
  "&gamma;": "\u03B3",
  "&gammad;": "\u03DD",
  "&gap;": "\u2A86",
  "&gbreve;": "\u011F",
  "&gcirc;": "\u011D",
  "&gcy;": "\u0433",
  "&gdot;": "\u0121",
  "&ge;": "\u2265",
  "&gel;": "\u22DB",
  "&geq;": "\u2265",
  "&geqq;": "\u2267",
  "&geqslant;": "\u2A7E",
  "&ges;": "\u2A7E",
  "&gescc;": "\u2AA9",
  "&gesdot;": "\u2A80",
  "&gesdoto;": "\u2A82",
  "&gesdotol;": "\u2A84",
  "&gesl;": "\u22DB\uFE00",
  "&gesles;": "\u2A94",
  "&gfr;": "\u{1D524}",
  "&gg;": "\u226B",
  "&ggg;": "\u22D9",
  "&gimel;": "\u2137",
  "&gjcy;": "\u0453",
  "&gl;": "\u2277",
  "&glE;": "\u2A92",
  "&gla;": "\u2AA5",
  "&glj;": "\u2AA4",
  "&gnE;": "\u2269",
  "&gnap;": "\u2A8A",
  "&gnapprox;": "\u2A8A",
  "&gne;": "\u2A88",
  "&gneq;": "\u2A88",
  "&gneqq;": "\u2269",
  "&gnsim;": "\u22E7",
  "&gopf;": "\u{1D558}",
  "&grave;": "`",
  "&gscr;": "\u210A",
  "&gsim;": "\u2273",
  "&gsime;": "\u2A8E",
  "&gsiml;": "\u2A90",
  "&gt": ">",
  "&gt;": ">",
  "&gtcc;": "\u2AA7",
  "&gtcir;": "\u2A7A",
  "&gtdot;": "\u22D7",
  "&gtlPar;": "\u2995",
  "&gtquest;": "\u2A7C",
  "&gtrapprox;": "\u2A86",
  "&gtrarr;": "\u2978",
  "&gtrdot;": "\u22D7",
  "&gtreqless;": "\u22DB",
  "&gtreqqless;": "\u2A8C",
  "&gtrless;": "\u2277",
  "&gtrsim;": "\u2273",
  "&gvertneqq;": "\u2269\uFE00",
  "&gvnE;": "\u2269\uFE00",
  "&hArr;": "\u21D4",
  "&hairsp;": "\u200A",
  "&half;": "\xBD",
  "&hamilt;": "\u210B",
  "&hardcy;": "\u044A",
  "&harr;": "\u2194",
  "&harrcir;": "\u2948",
  "&harrw;": "\u21AD",
  "&hbar;": "\u210F",
  "&hcirc;": "\u0125",
  "&hearts;": "\u2665",
  "&heartsuit;": "\u2665",
  "&hellip;": "\u2026",
  "&hercon;": "\u22B9",
  "&hfr;": "\u{1D525}",
  "&hksearow;": "\u2925",
  "&hkswarow;": "\u2926",
  "&hoarr;": "\u21FF",
  "&homtht;": "\u223B",
  "&hookleftarrow;": "\u21A9",
  "&hookrightarrow;": "\u21AA",
  "&hopf;": "\u{1D559}",
  "&horbar;": "\u2015",
  "&hscr;": "\u{1D4BD}",
  "&hslash;": "\u210F",
  "&hstrok;": "\u0127",
  "&hybull;": "\u2043",
  "&hyphen;": "\u2010",
  "&iacute": "\xED",
  "&iacute;": "\xED",
  "&ic;": "\u2063",
  "&icirc": "\xEE",
  "&icirc;": "\xEE",
  "&icy;": "\u0438",
  "&iecy;": "\u0435",
  "&iexcl": "\xA1",
  "&iexcl;": "\xA1",
  "&iff;": "\u21D4",
  "&ifr;": "\u{1D526}",
  "&igrave": "\xEC",
  "&igrave;": "\xEC",
  "&ii;": "\u2148",
  "&iiiint;": "\u2A0C",
  "&iiint;": "\u222D",
  "&iinfin;": "\u29DC",
  "&iiota;": "\u2129",
  "&ijlig;": "\u0133",
  "&imacr;": "\u012B",
  "&image;": "\u2111",
  "&imagline;": "\u2110",
  "&imagpart;": "\u2111",
  "&imath;": "\u0131",
  "&imof;": "\u22B7",
  "&imped;": "\u01B5",
  "&in;": "\u2208",
  "&incare;": "\u2105",
  "&infin;": "\u221E",
  "&infintie;": "\u29DD",
  "&inodot;": "\u0131",
  "&int;": "\u222B",
  "&intcal;": "\u22BA",
  "&integers;": "\u2124",
  "&intercal;": "\u22BA",
  "&intlarhk;": "\u2A17",
  "&intprod;": "\u2A3C",
  "&iocy;": "\u0451",
  "&iogon;": "\u012F",
  "&iopf;": "\u{1D55A}",
  "&iota;": "\u03B9",
  "&iprod;": "\u2A3C",
  "&iquest": "\xBF",
  "&iquest;": "\xBF",
  "&iscr;": "\u{1D4BE}",
  "&isin;": "\u2208",
  "&isinE;": "\u22F9",
  "&isindot;": "\u22F5",
  "&isins;": "\u22F4",
  "&isinsv;": "\u22F3",
  "&isinv;": "\u2208",
  "&it;": "\u2062",
  "&itilde;": "\u0129",
  "&iukcy;": "\u0456",
  "&iuml": "\xEF",
  "&iuml;": "\xEF",
  "&jcirc;": "\u0135",
  "&jcy;": "\u0439",
  "&jfr;": "\u{1D527}",
  "&jmath;": "\u0237",
  "&jopf;": "\u{1D55B}",
  "&jscr;": "\u{1D4BF}",
  "&jsercy;": "\u0458",
  "&jukcy;": "\u0454",
  "&kappa;": "\u03BA",
  "&kappav;": "\u03F0",
  "&kcedil;": "\u0137",
  "&kcy;": "\u043A",
  "&kfr;": "\u{1D528}",
  "&kgreen;": "\u0138",
  "&khcy;": "\u0445",
  "&kjcy;": "\u045C",
  "&kopf;": "\u{1D55C}",
  "&kscr;": "\u{1D4C0}",
  "&lAarr;": "\u21DA",
  "&lArr;": "\u21D0",
  "&lAtail;": "\u291B",
  "&lBarr;": "\u290E",
  "&lE;": "\u2266",
  "&lEg;": "\u2A8B",
  "&lHar;": "\u2962",
  "&lacute;": "\u013A",
  "&laemptyv;": "\u29B4",
  "&lagran;": "\u2112",
  "&lambda;": "\u03BB",
  "&lang;": "\u27E8",
  "&langd;": "\u2991",
  "&langle;": "\u27E8",
  "&lap;": "\u2A85",
  "&laquo": "\xAB",
  "&laquo;": "\xAB",
  "&larr;": "\u2190",
  "&larrb;": "\u21E4",
  "&larrbfs;": "\u291F",
  "&larrfs;": "\u291D",
  "&larrhk;": "\u21A9",
  "&larrlp;": "\u21AB",
  "&larrpl;": "\u2939",
  "&larrsim;": "\u2973",
  "&larrtl;": "\u21A2",
  "&lat;": "\u2AAB",
  "&latail;": "\u2919",
  "&late;": "\u2AAD",
  "&lates;": "\u2AAD\uFE00",
  "&lbarr;": "\u290C",
  "&lbbrk;": "\u2772",
  "&lbrace;": "{",
  "&lbrack;": "[",
  "&lbrke;": "\u298B",
  "&lbrksld;": "\u298F",
  "&lbrkslu;": "\u298D",
  "&lcaron;": "\u013E",
  "&lcedil;": "\u013C",
  "&lceil;": "\u2308",
  "&lcub;": "{",
  "&lcy;": "\u043B",
  "&ldca;": "\u2936",
  "&ldquo;": "\u201C",
  "&ldquor;": "\u201E",
  "&ldrdhar;": "\u2967",
  "&ldrushar;": "\u294B",
  "&ldsh;": "\u21B2",
  "&le;": "\u2264",
  "&leftarrow;": "\u2190",
  "&leftarrowtail;": "\u21A2",
  "&leftharpoondown;": "\u21BD",
  "&leftharpoonup;": "\u21BC",
  "&leftleftarrows;": "\u21C7",
  "&leftrightarrow;": "\u2194",
  "&leftrightarrows;": "\u21C6",
  "&leftrightharpoons;": "\u21CB",
  "&leftrightsquigarrow;": "\u21AD",
  "&leftthreetimes;": "\u22CB",
  "&leg;": "\u22DA",
  "&leq;": "\u2264",
  "&leqq;": "\u2266",
  "&leqslant;": "\u2A7D",
  "&les;": "\u2A7D",
  "&lescc;": "\u2AA8",
  "&lesdot;": "\u2A7F",
  "&lesdoto;": "\u2A81",
  "&lesdotor;": "\u2A83",
  "&lesg;": "\u22DA\uFE00",
  "&lesges;": "\u2A93",
  "&lessapprox;": "\u2A85",
  "&lessdot;": "\u22D6",
  "&lesseqgtr;": "\u22DA",
  "&lesseqqgtr;": "\u2A8B",
  "&lessgtr;": "\u2276",
  "&lesssim;": "\u2272",
  "&lfisht;": "\u297C",
  "&lfloor;": "\u230A",
  "&lfr;": "\u{1D529}",
  "&lg;": "\u2276",
  "&lgE;": "\u2A91",
  "&lhard;": "\u21BD",
  "&lharu;": "\u21BC",
  "&lharul;": "\u296A",
  "&lhblk;": "\u2584",
  "&ljcy;": "\u0459",
  "&ll;": "\u226A",
  "&llarr;": "\u21C7",
  "&llcorner;": "\u231E",
  "&llhard;": "\u296B",
  "&lltri;": "\u25FA",
  "&lmidot;": "\u0140",
  "&lmoust;": "\u23B0",
  "&lmoustache;": "\u23B0",
  "&lnE;": "\u2268",
  "&lnap;": "\u2A89",
  "&lnapprox;": "\u2A89",
  "&lne;": "\u2A87",
  "&lneq;": "\u2A87",
  "&lneqq;": "\u2268",
  "&lnsim;": "\u22E6",
  "&loang;": "\u27EC",
  "&loarr;": "\u21FD",
  "&lobrk;": "\u27E6",
  "&longleftarrow;": "\u27F5",
  "&longleftrightarrow;": "\u27F7",
  "&longmapsto;": "\u27FC",
  "&longrightarrow;": "\u27F6",
  "&looparrowleft;": "\u21AB",
  "&looparrowright;": "\u21AC",
  "&lopar;": "\u2985",
  "&lopf;": "\u{1D55D}",
  "&loplus;": "\u2A2D",
  "&lotimes;": "\u2A34",
  "&lowast;": "\u2217",
  "&lowbar;": "_",
  "&loz;": "\u25CA",
  "&lozenge;": "\u25CA",
  "&lozf;": "\u29EB",
  "&lpar;": "(",
  "&lparlt;": "\u2993",
  "&lrarr;": "\u21C6",
  "&lrcorner;": "\u231F",
  "&lrhar;": "\u21CB",
  "&lrhard;": "\u296D",
  "&lrm;": "\u200E",
  "&lrtri;": "\u22BF",
  "&lsaquo;": "\u2039",
  "&lscr;": "\u{1D4C1}",
  "&lsh;": "\u21B0",
  "&lsim;": "\u2272",
  "&lsime;": "\u2A8D",
  "&lsimg;": "\u2A8F",
  "&lsqb;": "[",
  "&lsquo;": "\u2018",
  "&lsquor;": "\u201A",
  "&lstrok;": "\u0142",
  "&lt": "<",
  "&lt;": "<",
  "&ltcc;": "\u2AA6",
  "&ltcir;": "\u2A79",
  "&ltdot;": "\u22D6",
  "&lthree;": "\u22CB",
  "&ltimes;": "\u22C9",
  "&ltlarr;": "\u2976",
  "&ltquest;": "\u2A7B",
  "&ltrPar;": "\u2996",
  "&ltri;": "\u25C3",
  "&ltrie;": "\u22B4",
  "&ltrif;": "\u25C2",
  "&lurdshar;": "\u294A",
  "&luruhar;": "\u2966",
  "&lvertneqq;": "\u2268\uFE00",
  "&lvnE;": "\u2268\uFE00",
  "&mDDot;": "\u223A",
  "&macr": "\xAF",
  "&macr;": "\xAF",
  "&male;": "\u2642",
  "&malt;": "\u2720",
  "&maltese;": "\u2720",
  "&map;": "\u21A6",
  "&mapsto;": "\u21A6",
  "&mapstodown;": "\u21A7",
  "&mapstoleft;": "\u21A4",
  "&mapstoup;": "\u21A5",
  "&marker;": "\u25AE",
  "&mcomma;": "\u2A29",
  "&mcy;": "\u043C",
  "&mdash;": "\u2014",
  "&measuredangle;": "\u2221",
  "&mfr;": "\u{1D52A}",
  "&mho;": "\u2127",
  "&micro": "\xB5",
  "&micro;": "\xB5",
  "&mid;": "\u2223",
  "&midast;": "*",
  "&midcir;": "\u2AF0",
  "&middot": "\xB7",
  "&middot;": "\xB7",
  "&minus;": "\u2212",
  "&minusb;": "\u229F",
  "&minusd;": "\u2238",
  "&minusdu;": "\u2A2A",
  "&mlcp;": "\u2ADB",
  "&mldr;": "\u2026",
  "&mnplus;": "\u2213",
  "&models;": "\u22A7",
  "&mopf;": "\u{1D55E}",
  "&mp;": "\u2213",
  "&mscr;": "\u{1D4C2}",
  "&mstpos;": "\u223E",
  "&mu;": "\u03BC",
  "&multimap;": "\u22B8",
  "&mumap;": "\u22B8",
  "&nGg;": "\u22D9\u0338",
  "&nGt;": "\u226B\u20D2",
  "&nGtv;": "\u226B\u0338",
  "&nLeftarrow;": "\u21CD",
  "&nLeftrightarrow;": "\u21CE",
  "&nLl;": "\u22D8\u0338",
  "&nLt;": "\u226A\u20D2",
  "&nLtv;": "\u226A\u0338",
  "&nRightarrow;": "\u21CF",
  "&nVDash;": "\u22AF",
  "&nVdash;": "\u22AE",
  "&nabla;": "\u2207",
  "&nacute;": "\u0144",
  "&nang;": "\u2220\u20D2",
  "&nap;": "\u2249",
  "&napE;": "\u2A70\u0338",
  "&napid;": "\u224B\u0338",
  "&napos;": "\u0149",
  "&napprox;": "\u2249",
  "&natur;": "\u266E",
  "&natural;": "\u266E",
  "&naturals;": "\u2115",
  "&nbsp": "\xA0",
  "&nbsp;": "\xA0",
  "&nbump;": "\u224E\u0338",
  "&nbumpe;": "\u224F\u0338",
  "&ncap;": "\u2A43",
  "&ncaron;": "\u0148",
  "&ncedil;": "\u0146",
  "&ncong;": "\u2247",
  "&ncongdot;": "\u2A6D\u0338",
  "&ncup;": "\u2A42",
  "&ncy;": "\u043D",
  "&ndash;": "\u2013",
  "&ne;": "\u2260",
  "&neArr;": "\u21D7",
  "&nearhk;": "\u2924",
  "&nearr;": "\u2197",
  "&nearrow;": "\u2197",
  "&nedot;": "\u2250\u0338",
  "&nequiv;": "\u2262",
  "&nesear;": "\u2928",
  "&nesim;": "\u2242\u0338",
  "&nexist;": "\u2204",
  "&nexists;": "\u2204",
  "&nfr;": "\u{1D52B}",
  "&ngE;": "\u2267\u0338",
  "&nge;": "\u2271",
  "&ngeq;": "\u2271",
  "&ngeqq;": "\u2267\u0338",
  "&ngeqslant;": "\u2A7E\u0338",
  "&nges;": "\u2A7E\u0338",
  "&ngsim;": "\u2275",
  "&ngt;": "\u226F",
  "&ngtr;": "\u226F",
  "&nhArr;": "\u21CE",
  "&nharr;": "\u21AE",
  "&nhpar;": "\u2AF2",
  "&ni;": "\u220B",
  "&nis;": "\u22FC",
  "&nisd;": "\u22FA",
  "&niv;": "\u220B",
  "&njcy;": "\u045A",
  "&nlArr;": "\u21CD",
  "&nlE;": "\u2266\u0338",
  "&nlarr;": "\u219A",
  "&nldr;": "\u2025",
  "&nle;": "\u2270",
  "&nleftarrow;": "\u219A",
  "&nleftrightarrow;": "\u21AE",
  "&nleq;": "\u2270",
  "&nleqq;": "\u2266\u0338",
  "&nleqslant;": "\u2A7D\u0338",
  "&nles;": "\u2A7D\u0338",
  "&nless;": "\u226E",
  "&nlsim;": "\u2274",
  "&nlt;": "\u226E",
  "&nltri;": "\u22EA",
  "&nltrie;": "\u22EC",
  "&nmid;": "\u2224",
  "&nopf;": "\u{1D55F}",
  "&not": "\xAC",
  "&not;": "\xAC",
  "&notin;": "\u2209",
  "&notinE;": "\u22F9\u0338",
  "&notindot;": "\u22F5\u0338",
  "&notinva;": "\u2209",
  "&notinvb;": "\u22F7",
  "&notinvc;": "\u22F6",
  "&notni;": "\u220C",
  "&notniva;": "\u220C",
  "&notnivb;": "\u22FE",
  "&notnivc;": "\u22FD",
  "&npar;": "\u2226",
  "&nparallel;": "\u2226",
  "&nparsl;": "\u2AFD\u20E5",
  "&npart;": "\u2202\u0338",
  "&npolint;": "\u2A14",
  "&npr;": "\u2280",
  "&nprcue;": "\u22E0",
  "&npre;": "\u2AAF\u0338",
  "&nprec;": "\u2280",
  "&npreceq;": "\u2AAF\u0338",
  "&nrArr;": "\u21CF",
  "&nrarr;": "\u219B",
  "&nrarrc;": "\u2933\u0338",
  "&nrarrw;": "\u219D\u0338",
  "&nrightarrow;": "\u219B",
  "&nrtri;": "\u22EB",
  "&nrtrie;": "\u22ED",
  "&nsc;": "\u2281",
  "&nsccue;": "\u22E1",
  "&nsce;": "\u2AB0\u0338",
  "&nscr;": "\u{1D4C3}",
  "&nshortmid;": "\u2224",
  "&nshortparallel;": "\u2226",
  "&nsim;": "\u2241",
  "&nsime;": "\u2244",
  "&nsimeq;": "\u2244",
  "&nsmid;": "\u2224",
  "&nspar;": "\u2226",
  "&nsqsube;": "\u22E2",
  "&nsqsupe;": "\u22E3",
  "&nsub;": "\u2284",
  "&nsubE;": "\u2AC5\u0338",
  "&nsube;": "\u2288",
  "&nsubset;": "\u2282\u20D2",
  "&nsubseteq;": "\u2288",
  "&nsubseteqq;": "\u2AC5\u0338",
  "&nsucc;": "\u2281",
  "&nsucceq;": "\u2AB0\u0338",
  "&nsup;": "\u2285",
  "&nsupE;": "\u2AC6\u0338",
  "&nsupe;": "\u2289",
  "&nsupset;": "\u2283\u20D2",
  "&nsupseteq;": "\u2289",
  "&nsupseteqq;": "\u2AC6\u0338",
  "&ntgl;": "\u2279",
  "&ntilde": "\xF1",
  "&ntilde;": "\xF1",
  "&ntlg;": "\u2278",
  "&ntriangleleft;": "\u22EA",
  "&ntrianglelefteq;": "\u22EC",
  "&ntriangleright;": "\u22EB",
  "&ntrianglerighteq;": "\u22ED",
  "&nu;": "\u03BD",
  "&num;": "#",
  "&numero;": "\u2116",
  "&numsp;": "\u2007",
  "&nvDash;": "\u22AD",
  "&nvHarr;": "\u2904",
  "&nvap;": "\u224D\u20D2",
  "&nvdash;": "\u22AC",
  "&nvge;": "\u2265\u20D2",
  "&nvgt;": ">\u20D2",
  "&nvinfin;": "\u29DE",
  "&nvlArr;": "\u2902",
  "&nvle;": "\u2264\u20D2",
  "&nvlt;": "<\u20D2",
  "&nvltrie;": "\u22B4\u20D2",
  "&nvrArr;": "\u2903",
  "&nvrtrie;": "\u22B5\u20D2",
  "&nvsim;": "\u223C\u20D2",
  "&nwArr;": "\u21D6",
  "&nwarhk;": "\u2923",
  "&nwarr;": "\u2196",
  "&nwarrow;": "\u2196",
  "&nwnear;": "\u2927",
  "&oS;": "\u24C8",
  "&oacute": "\xF3",
  "&oacute;": "\xF3",
  "&oast;": "\u229B",
  "&ocir;": "\u229A",
  "&ocirc": "\xF4",
  "&ocirc;": "\xF4",
  "&ocy;": "\u043E",
  "&odash;": "\u229D",
  "&odblac;": "\u0151",
  "&odiv;": "\u2A38",
  "&odot;": "\u2299",
  "&odsold;": "\u29BC",
  "&oelig;": "\u0153",
  "&ofcir;": "\u29BF",
  "&ofr;": "\u{1D52C}",
  "&ogon;": "\u02DB",
  "&ograve": "\xF2",
  "&ograve;": "\xF2",
  "&ogt;": "\u29C1",
  "&ohbar;": "\u29B5",
  "&ohm;": "\u03A9",
  "&oint;": "\u222E",
  "&olarr;": "\u21BA",
  "&olcir;": "\u29BE",
  "&olcross;": "\u29BB",
  "&oline;": "\u203E",
  "&olt;": "\u29C0",
  "&omacr;": "\u014D",
  "&omega;": "\u03C9",
  "&omicron;": "\u03BF",
  "&omid;": "\u29B6",
  "&ominus;": "\u2296",
  "&oopf;": "\u{1D560}",
  "&opar;": "\u29B7",
  "&operp;": "\u29B9",
  "&oplus;": "\u2295",
  "&or;": "\u2228",
  "&orarr;": "\u21BB",
  "&ord;": "\u2A5D",
  "&order;": "\u2134",
  "&orderof;": "\u2134",
  "&ordf": "\xAA",
  "&ordf;": "\xAA",
  "&ordm": "\xBA",
  "&ordm;": "\xBA",
  "&origof;": "\u22B6",
  "&oror;": "\u2A56",
  "&orslope;": "\u2A57",
  "&orv;": "\u2A5B",
  "&oscr;": "\u2134",
  "&oslash": "\xF8",
  "&oslash;": "\xF8",
  "&osol;": "\u2298",
  "&otilde": "\xF5",
  "&otilde;": "\xF5",
  "&otimes;": "\u2297",
  "&otimesas;": "\u2A36",
  "&ouml": "\xF6",
  "&ouml;": "\xF6",
  "&ovbar;": "\u233D",
  "&par;": "\u2225",
  "&para": "\xB6",
  "&para;": "\xB6",
  "&parallel;": "\u2225",
  "&parsim;": "\u2AF3",
  "&parsl;": "\u2AFD",
  "&part;": "\u2202",
  "&pcy;": "\u043F",
  "&percnt;": "%",
  "&period;": ".",
  "&permil;": "\u2030",
  "&perp;": "\u22A5",
  "&pertenk;": "\u2031",
  "&pfr;": "\u{1D52D}",
  "&phi;": "\u03C6",
  "&phiv;": "\u03D5",
  "&phmmat;": "\u2133",
  "&phone;": "\u260E",
  "&pi;": "\u03C0",
  "&pitchfork;": "\u22D4",
  "&piv;": "\u03D6",
  "&planck;": "\u210F",
  "&planckh;": "\u210E",
  "&plankv;": "\u210F",
  "&plus;": "+",
  "&plusacir;": "\u2A23",
  "&plusb;": "\u229E",
  "&pluscir;": "\u2A22",
  "&plusdo;": "\u2214",
  "&plusdu;": "\u2A25",
  "&pluse;": "\u2A72",
  "&plusmn": "\xB1",
  "&plusmn;": "\xB1",
  "&plussim;": "\u2A26",
  "&plustwo;": "\u2A27",
  "&pm;": "\xB1",
  "&pointint;": "\u2A15",
  "&popf;": "\u{1D561}",
  "&pound": "\xA3",
  "&pound;": "\xA3",
  "&pr;": "\u227A",
  "&prE;": "\u2AB3",
  "&prap;": "\u2AB7",
  "&prcue;": "\u227C",
  "&pre;": "\u2AAF",
  "&prec;": "\u227A",
  "&precapprox;": "\u2AB7",
  "&preccurlyeq;": "\u227C",
  "&preceq;": "\u2AAF",
  "&precnapprox;": "\u2AB9",
  "&precneqq;": "\u2AB5",
  "&precnsim;": "\u22E8",
  "&precsim;": "\u227E",
  "&prime;": "\u2032",
  "&primes;": "\u2119",
  "&prnE;": "\u2AB5",
  "&prnap;": "\u2AB9",
  "&prnsim;": "\u22E8",
  "&prod;": "\u220F",
  "&profalar;": "\u232E",
  "&profline;": "\u2312",
  "&profsurf;": "\u2313",
  "&prop;": "\u221D",
  "&propto;": "\u221D",
  "&prsim;": "\u227E",
  "&prurel;": "\u22B0",
  "&pscr;": "\u{1D4C5}",
  "&psi;": "\u03C8",
  "&puncsp;": "\u2008",
  "&qfr;": "\u{1D52E}",
  "&qint;": "\u2A0C",
  "&qopf;": "\u{1D562}",
  "&qprime;": "\u2057",
  "&qscr;": "\u{1D4C6}",
  "&quaternions;": "\u210D",
  "&quatint;": "\u2A16",
  "&quest;": "?",
  "&questeq;": "\u225F",
  "&quot": '"',
  "&quot;": '"',
  "&rAarr;": "\u21DB",
  "&rArr;": "\u21D2",
  "&rAtail;": "\u291C",
  "&rBarr;": "\u290F",
  "&rHar;": "\u2964",
  "&race;": "\u223D\u0331",
  "&racute;": "\u0155",
  "&radic;": "\u221A",
  "&raemptyv;": "\u29B3",
  "&rang;": "\u27E9",
  "&rangd;": "\u2992",
  "&range;": "\u29A5",
  "&rangle;": "\u27E9",
  "&raquo": "\xBB",
  "&raquo;": "\xBB",
  "&rarr;": "\u2192",
  "&rarrap;": "\u2975",
  "&rarrb;": "\u21E5",
  "&rarrbfs;": "\u2920",
  "&rarrc;": "\u2933",
  "&rarrfs;": "\u291E",
  "&rarrhk;": "\u21AA",
  "&rarrlp;": "\u21AC",
  "&rarrpl;": "\u2945",
  "&rarrsim;": "\u2974",
  "&rarrtl;": "\u21A3",
  "&rarrw;": "\u219D",
  "&ratail;": "\u291A",
  "&ratio;": "\u2236",
  "&rationals;": "\u211A",
  "&rbarr;": "\u290D",
  "&rbbrk;": "\u2773",
  "&rbrace;": "}",
  "&rbrack;": "]",
  "&rbrke;": "\u298C",
  "&rbrksld;": "\u298E",
  "&rbrkslu;": "\u2990",
  "&rcaron;": "\u0159",
  "&rcedil;": "\u0157",
  "&rceil;": "\u2309",
  "&rcub;": "}",
  "&rcy;": "\u0440",
  "&rdca;": "\u2937",
  "&rdldhar;": "\u2969",
  "&rdquo;": "\u201D",
  "&rdquor;": "\u201D",
  "&rdsh;": "\u21B3",
  "&real;": "\u211C",
  "&realine;": "\u211B",
  "&realpart;": "\u211C",
  "&reals;": "\u211D",
  "&rect;": "\u25AD",
  "&reg": "\xAE",
  "&reg;": "\xAE",
  "&rfisht;": "\u297D",
  "&rfloor;": "\u230B",
  "&rfr;": "\u{1D52F}",
  "&rhard;": "\u21C1",
  "&rharu;": "\u21C0",
  "&rharul;": "\u296C",
  "&rho;": "\u03C1",
  "&rhov;": "\u03F1",
  "&rightarrow;": "\u2192",
  "&rightarrowtail;": "\u21A3",
  "&rightharpoondown;": "\u21C1",
  "&rightharpoonup;": "\u21C0",
  "&rightleftarrows;": "\u21C4",
  "&rightleftharpoons;": "\u21CC",
  "&rightrightarrows;": "\u21C9",
  "&rightsquigarrow;": "\u219D",
  "&rightthreetimes;": "\u22CC",
  "&ring;": "\u02DA",
  "&risingdotseq;": "\u2253",
  "&rlarr;": "\u21C4",
  "&rlhar;": "\u21CC",
  "&rlm;": "\u200F",
  "&rmoust;": "\u23B1",
  "&rmoustache;": "\u23B1",
  "&rnmid;": "\u2AEE",
  "&roang;": "\u27ED",
  "&roarr;": "\u21FE",
  "&robrk;": "\u27E7",
  "&ropar;": "\u2986",
  "&ropf;": "\u{1D563}",
  "&roplus;": "\u2A2E",
  "&rotimes;": "\u2A35",
  "&rpar;": ")",
  "&rpargt;": "\u2994",
  "&rppolint;": "\u2A12",
  "&rrarr;": "\u21C9",
  "&rsaquo;": "\u203A",
  "&rscr;": "\u{1D4C7}",
  "&rsh;": "\u21B1",
  "&rsqb;": "]",
  "&rsquo;": "\u2019",
  "&rsquor;": "\u2019",
  "&rthree;": "\u22CC",
  "&rtimes;": "\u22CA",
  "&rtri;": "\u25B9",
  "&rtrie;": "\u22B5",
  "&rtrif;": "\u25B8",
  "&rtriltri;": "\u29CE",
  "&ruluhar;": "\u2968",
  "&rx;": "\u211E",
  "&sacute;": "\u015B",
  "&sbquo;": "\u201A",
  "&sc;": "\u227B",
  "&scE;": "\u2AB4",
  "&scap;": "\u2AB8",
  "&scaron;": "\u0161",
  "&sccue;": "\u227D",
  "&sce;": "\u2AB0",
  "&scedil;": "\u015F",
  "&scirc;": "\u015D",
  "&scnE;": "\u2AB6",
  "&scnap;": "\u2ABA",
  "&scnsim;": "\u22E9",
  "&scpolint;": "\u2A13",
  "&scsim;": "\u227F",
  "&scy;": "\u0441",
  "&sdot;": "\u22C5",
  "&sdotb;": "\u22A1",
  "&sdote;": "\u2A66",
  "&seArr;": "\u21D8",
  "&searhk;": "\u2925",
  "&searr;": "\u2198",
  "&searrow;": "\u2198",
  "&sect": "\xA7",
  "&sect;": "\xA7",
  "&semi;": ";",
  "&seswar;": "\u2929",
  "&setminus;": "\u2216",
  "&setmn;": "\u2216",
  "&sext;": "\u2736",
  "&sfr;": "\u{1D530}",
  "&sfrown;": "\u2322",
  "&sharp;": "\u266F",
  "&shchcy;": "\u0449",
  "&shcy;": "\u0448",
  "&shortmid;": "\u2223",
  "&shortparallel;": "\u2225",
  "&shy": "\xAD",
  "&shy;": "\xAD",
  "&sigma;": "\u03C3",
  "&sigmaf;": "\u03C2",
  "&sigmav;": "\u03C2",
  "&sim;": "\u223C",
  "&simdot;": "\u2A6A",
  "&sime;": "\u2243",
  "&simeq;": "\u2243",
  "&simg;": "\u2A9E",
  "&simgE;": "\u2AA0",
  "&siml;": "\u2A9D",
  "&simlE;": "\u2A9F",
  "&simne;": "\u2246",
  "&simplus;": "\u2A24",
  "&simrarr;": "\u2972",
  "&slarr;": "\u2190",
  "&smallsetminus;": "\u2216",
  "&smashp;": "\u2A33",
  "&smeparsl;": "\u29E4",
  "&smid;": "\u2223",
  "&smile;": "\u2323",
  "&smt;": "\u2AAA",
  "&smte;": "\u2AAC",
  "&smtes;": "\u2AAC\uFE00",
  "&softcy;": "\u044C",
  "&sol;": "/",
  "&solb;": "\u29C4",
  "&solbar;": "\u233F",
  "&sopf;": "\u{1D564}",
  "&spades;": "\u2660",
  "&spadesuit;": "\u2660",
  "&spar;": "\u2225",
  "&sqcap;": "\u2293",
  "&sqcaps;": "\u2293\uFE00",
  "&sqcup;": "\u2294",
  "&sqcups;": "\u2294\uFE00",
  "&sqsub;": "\u228F",
  "&sqsube;": "\u2291",
  "&sqsubset;": "\u228F",
  "&sqsubseteq;": "\u2291",
  "&sqsup;": "\u2290",
  "&sqsupe;": "\u2292",
  "&sqsupset;": "\u2290",
  "&sqsupseteq;": "\u2292",
  "&squ;": "\u25A1",
  "&square;": "\u25A1",
  "&squarf;": "\u25AA",
  "&squf;": "\u25AA",
  "&srarr;": "\u2192",
  "&sscr;": "\u{1D4C8}",
  "&ssetmn;": "\u2216",
  "&ssmile;": "\u2323",
  "&sstarf;": "\u22C6",
  "&star;": "\u2606",
  "&starf;": "\u2605",
  "&straightepsilon;": "\u03F5",
  "&straightphi;": "\u03D5",
  "&strns;": "\xAF",
  "&sub;": "\u2282",
  "&subE;": "\u2AC5",
  "&subdot;": "\u2ABD",
  "&sube;": "\u2286",
  "&subedot;": "\u2AC3",
  "&submult;": "\u2AC1",
  "&subnE;": "\u2ACB",
  "&subne;": "\u228A",
  "&subplus;": "\u2ABF",
  "&subrarr;": "\u2979",
  "&subset;": "\u2282",
  "&subseteq;": "\u2286",
  "&subseteqq;": "\u2AC5",
  "&subsetneq;": "\u228A",
  "&subsetneqq;": "\u2ACB",
  "&subsim;": "\u2AC7",
  "&subsub;": "\u2AD5",
  "&subsup;": "\u2AD3",
  "&succ;": "\u227B",
  "&succapprox;": "\u2AB8",
  "&succcurlyeq;": "\u227D",
  "&succeq;": "\u2AB0",
  "&succnapprox;": "\u2ABA",
  "&succneqq;": "\u2AB6",
  "&succnsim;": "\u22E9",
  "&succsim;": "\u227F",
  "&sum;": "\u2211",
  "&sung;": "\u266A",
  "&sup1": "\xB9",
  "&sup1;": "\xB9",
  "&sup2": "\xB2",
  "&sup2;": "\xB2",
  "&sup3": "\xB3",
  "&sup3;": "\xB3",
  "&sup;": "\u2283",
  "&supE;": "\u2AC6",
  "&supdot;": "\u2ABE",
  "&supdsub;": "\u2AD8",
  "&supe;": "\u2287",
  "&supedot;": "\u2AC4",
  "&suphsol;": "\u27C9",
  "&suphsub;": "\u2AD7",
  "&suplarr;": "\u297B",
  "&supmult;": "\u2AC2",
  "&supnE;": "\u2ACC",
  "&supne;": "\u228B",
  "&supplus;": "\u2AC0",
  "&supset;": "\u2283",
  "&supseteq;": "\u2287",
  "&supseteqq;": "\u2AC6",
  "&supsetneq;": "\u228B",
  "&supsetneqq;": "\u2ACC",
  "&supsim;": "\u2AC8",
  "&supsub;": "\u2AD4",
  "&supsup;": "\u2AD6",
  "&swArr;": "\u21D9",
  "&swarhk;": "\u2926",
  "&swarr;": "\u2199",
  "&swarrow;": "\u2199",
  "&swnwar;": "\u292A",
  "&szlig": "\xDF",
  "&szlig;": "\xDF",
  "&target;": "\u2316",
  "&tau;": "\u03C4",
  "&tbrk;": "\u23B4",
  "&tcaron;": "\u0165",
  "&tcedil;": "\u0163",
  "&tcy;": "\u0442",
  "&tdot;": "\u20DB",
  "&telrec;": "\u2315",
  "&tfr;": "\u{1D531}",
  "&there4;": "\u2234",
  "&therefore;": "\u2234",
  "&theta;": "\u03B8",
  "&thetasym;": "\u03D1",
  "&thetav;": "\u03D1",
  "&thickapprox;": "\u2248",
  "&thicksim;": "\u223C",
  "&thinsp;": "\u2009",
  "&thkap;": "\u2248",
  "&thksim;": "\u223C",
  "&thorn": "\xFE",
  "&thorn;": "\xFE",
  "&tilde;": "\u02DC",
  "&times": "\xD7",
  "&times;": "\xD7",
  "&timesb;": "\u22A0",
  "&timesbar;": "\u2A31",
  "&timesd;": "\u2A30",
  "&tint;": "\u222D",
  "&toea;": "\u2928",
  "&top;": "\u22A4",
  "&topbot;": "\u2336",
  "&topcir;": "\u2AF1",
  "&topf;": "\u{1D565}",
  "&topfork;": "\u2ADA",
  "&tosa;": "\u2929",
  "&tprime;": "\u2034",
  "&trade;": "\u2122",
  "&triangle;": "\u25B5",
  "&triangledown;": "\u25BF",
  "&triangleleft;": "\u25C3",
  "&trianglelefteq;": "\u22B4",
  "&triangleq;": "\u225C",
  "&triangleright;": "\u25B9",
  "&trianglerighteq;": "\u22B5",
  "&tridot;": "\u25EC",
  "&trie;": "\u225C",
  "&triminus;": "\u2A3A",
  "&triplus;": "\u2A39",
  "&trisb;": "\u29CD",
  "&tritime;": "\u2A3B",
  "&trpezium;": "\u23E2",
  "&tscr;": "\u{1D4C9}",
  "&tscy;": "\u0446",
  "&tshcy;": "\u045B",
  "&tstrok;": "\u0167",
  "&twixt;": "\u226C",
  "&twoheadleftarrow;": "\u219E",
  "&twoheadrightarrow;": "\u21A0",
  "&uArr;": "\u21D1",
  "&uHar;": "\u2963",
  "&uacute": "\xFA",
  "&uacute;": "\xFA",
  "&uarr;": "\u2191",
  "&ubrcy;": "\u045E",
  "&ubreve;": "\u016D",
  "&ucirc": "\xFB",
  "&ucirc;": "\xFB",
  "&ucy;": "\u0443",
  "&udarr;": "\u21C5",
  "&udblac;": "\u0171",
  "&udhar;": "\u296E",
  "&ufisht;": "\u297E",
  "&ufr;": "\u{1D532}",
  "&ugrave": "\xF9",
  "&ugrave;": "\xF9",
  "&uharl;": "\u21BF",
  "&uharr;": "\u21BE",
  "&uhblk;": "\u2580",
  "&ulcorn;": "\u231C",
  "&ulcorner;": "\u231C",
  "&ulcrop;": "\u230F",
  "&ultri;": "\u25F8",
  "&umacr;": "\u016B",
  "&uml": "\xA8",
  "&uml;": "\xA8",
  "&uogon;": "\u0173",
  "&uopf;": "\u{1D566}",
  "&uparrow;": "\u2191",
  "&updownarrow;": "\u2195",
  "&upharpoonleft;": "\u21BF",
  "&upharpoonright;": "\u21BE",
  "&uplus;": "\u228E",
  "&upsi;": "\u03C5",
  "&upsih;": "\u03D2",
  "&upsilon;": "\u03C5",
  "&upuparrows;": "\u21C8",
  "&urcorn;": "\u231D",
  "&urcorner;": "\u231D",
  "&urcrop;": "\u230E",
  "&uring;": "\u016F",
  "&urtri;": "\u25F9",
  "&uscr;": "\u{1D4CA}",
  "&utdot;": "\u22F0",
  "&utilde;": "\u0169",
  "&utri;": "\u25B5",
  "&utrif;": "\u25B4",
  "&uuarr;": "\u21C8",
  "&uuml": "\xFC",
  "&uuml;": "\xFC",
  "&uwangle;": "\u29A7",
  "&vArr;": "\u21D5",
  "&vBar;": "\u2AE8",
  "&vBarv;": "\u2AE9",
  "&vDash;": "\u22A8",
  "&vangrt;": "\u299C",
  "&varepsilon;": "\u03F5",
  "&varkappa;": "\u03F0",
  "&varnothing;": "\u2205",
  "&varphi;": "\u03D5",
  "&varpi;": "\u03D6",
  "&varpropto;": "\u221D",
  "&varr;": "\u2195",
  "&varrho;": "\u03F1",
  "&varsigma;": "\u03C2",
  "&varsubsetneq;": "\u228A\uFE00",
  "&varsubsetneqq;": "\u2ACB\uFE00",
  "&varsupsetneq;": "\u228B\uFE00",
  "&varsupsetneqq;": "\u2ACC\uFE00",
  "&vartheta;": "\u03D1",
  "&vartriangleleft;": "\u22B2",
  "&vartriangleright;": "\u22B3",
  "&vcy;": "\u0432",
  "&vdash;": "\u22A2",
  "&vee;": "\u2228",
  "&veebar;": "\u22BB",
  "&veeeq;": "\u225A",
  "&vellip;": "\u22EE",
  "&verbar;": "|",
  "&vert;": "|",
  "&vfr;": "\u{1D533}",
  "&vltri;": "\u22B2",
  "&vnsub;": "\u2282\u20D2",
  "&vnsup;": "\u2283\u20D2",
  "&vopf;": "\u{1D567}",
  "&vprop;": "\u221D",
  "&vrtri;": "\u22B3",
  "&vscr;": "\u{1D4CB}",
  "&vsubnE;": "\u2ACB\uFE00",
  "&vsubne;": "\u228A\uFE00",
  "&vsupnE;": "\u2ACC\uFE00",
  "&vsupne;": "\u228B\uFE00",
  "&vzigzag;": "\u299A",
  "&wcirc;": "\u0175",
  "&wedbar;": "\u2A5F",
  "&wedge;": "\u2227",
  "&wedgeq;": "\u2259",
  "&weierp;": "\u2118",
  "&wfr;": "\u{1D534}",
  "&wopf;": "\u{1D568}",
  "&wp;": "\u2118",
  "&wr;": "\u2240",
  "&wreath;": "\u2240",
  "&wscr;": "\u{1D4CC}",
  "&xcap;": "\u22C2",
  "&xcirc;": "\u25EF",
  "&xcup;": "\u22C3",
  "&xdtri;": "\u25BD",
  "&xfr;": "\u{1D535}",
  "&xhArr;": "\u27FA",
  "&xharr;": "\u27F7",
  "&xi;": "\u03BE",
  "&xlArr;": "\u27F8",
  "&xlarr;": "\u27F5",
  "&xmap;": "\u27FC",
  "&xnis;": "\u22FB",
  "&xodot;": "\u2A00",
  "&xopf;": "\u{1D569}",
  "&xoplus;": "\u2A01",
  "&xotime;": "\u2A02",
  "&xrArr;": "\u27F9",
  "&xrarr;": "\u27F6",
  "&xscr;": "\u{1D4CD}",
  "&xsqcup;": "\u2A06",
  "&xuplus;": "\u2A04",
  "&xutri;": "\u25B3",
  "&xvee;": "\u22C1",
  "&xwedge;": "\u22C0",
  "&yacute": "\xFD",
  "&yacute;": "\xFD",
  "&yacy;": "\u044F",
  "&ycirc;": "\u0177",
  "&ycy;": "\u044B",
  "&yen": "\xA5",
  "&yen;": "\xA5",
  "&yfr;": "\u{1D536}",
  "&yicy;": "\u0457",
  "&yopf;": "\u{1D56A}",
  "&yscr;": "\u{1D4CE}",
  "&yucy;": "\u044E",
  "&yuml": "\xFF",
  "&yuml;": "\xFF",
  "&zacute;": "\u017A",
  "&zcaron;": "\u017E",
  "&zcy;": "\u0437",
  "&zdot;": "\u017C",
  "&zeetrf;": "\u2128",
  "&zeta;": "\u03B6",
  "&zfr;": "\u{1D537}",
  "&zhcy;": "\u0436",
  "&zigrarr;": "\u21DD",
  "&zopf;": "\u{1D56B}",
  "&zscr;": "\u{1D4CF}",
  "&zwj;": "\u200D",
  "&zwnj;": "\u200C"
};
var html_entities_default = htmlEntities;

// ../../node_modules/.pnpm/postal-mime@2.4.3/node_modules/postal-mime/src/text-format.js
function decodeHTMLEntities(str) {
  return str.replace(/&(#\d+|#x[a-f0-9]+|[a-z]+\d*);?/gi, (match, entity) => {
    if (typeof html_entities_default[match] === "string") {
      return html_entities_default[match];
    }
    if (entity.charAt(0) !== "#" || match.charAt(match.length - 1) !== ";") {
      return match;
    }
    let codePoint;
    if (entity.charAt(1) === "x") {
      codePoint = parseInt(entity.substr(2), 16);
    } else {
      codePoint = parseInt(entity.substr(1), 10);
    }
    var output = "";
    if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
      return "\uFFFD";
    }
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  });
}
__name(decodeHTMLEntities, "decodeHTMLEntities");
function escapeHtml(str) {
  return str.trim().replace(/[<>"'?&]/g, (c) => {
    let hex = c.charCodeAt(0).toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    return "&#x" + hex.toUpperCase() + ";";
  });
}
__name(escapeHtml, "escapeHtml");
function textToHtml(str) {
  let html = escapeHtml(str).replace(/\n/g, "<br />");
  return "<div>" + html + "</div>";
}
__name(textToHtml, "textToHtml");
function htmlToText(str) {
  str = str.replace(/\r?\n/g, "").replace(/<\!\-\-.*?\-\->/gi, " ").replace(/<br\b[^>]*>/gi, "\n").replace(/<\/?(p|div|table|tr|td|th)\b[^>]*>/gi, "\n\n").replace(/<script\b[^>]*>.*?<\/script\b[^>]*>/gi, " ").replace(/^.*<body\b[^>]*>/i, "").replace(/^.*<\/head\b[^>]*>/i, "").replace(/^.*<\!doctype\b[^>]*>/i, "").replace(/<\/body\b[^>]*>.*$/i, "").replace(/<\/html\b[^>]*>.*$/i, "").replace(/<a\b[^>]*href\s*=\s*["']?([^\s"']+)[^>]*>/gi, " ($1) ").replace(/<\/?(span|em|i|strong|b|u|a)\b[^>]*>/gi, "").replace(/<li\b[^>]*>[\n\u0001\s]*/gi, "* ").replace(/<hr\b[^>]*>/g, "\n-------------\n").replace(/<[^>]*>/g, " ").replace(/\u0001/g, "\n").replace(/[ \t]+/g, " ").replace(/^\s+$/gm, "").replace(/\n\n+/g, "\n\n").replace(/^\n+/, "\n").replace(/\n+$/, "\n");
  str = decodeHTMLEntities(str);
  return str;
}
__name(htmlToText, "htmlToText");
function formatTextAddress(address) {
  return [].concat(address.name || []).concat(address.name ? `<${address.address}>` : address.address).join(" ");
}
__name(formatTextAddress, "formatTextAddress");
function formatTextAddresses(addresses) {
  let parts = [];
  let processAddress = /* @__PURE__ */ __name((address, partCounter) => {
    if (partCounter) {
      parts.push(", ");
    }
    if (address.group) {
      let groupStart = `${address.name}:`;
      let groupEnd = `;`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatTextAddress(address));
    }
  }, "processAddress");
  addresses.forEach(processAddress);
  return parts.join("");
}
__name(formatTextAddresses, "formatTextAddresses");
function formatHtmlAddress(address) {
  return `<a href="mailto:${escapeHtml(address.address)}" class="postal-email-address">${escapeHtml(address.name || `<${address.address}>`)}</a>`;
}
__name(formatHtmlAddress, "formatHtmlAddress");
function formatHtmlAddresses(addresses) {
  let parts = [];
  let processAddress = /* @__PURE__ */ __name((address, partCounter) => {
    if (partCounter) {
      parts.push('<span class="postal-email-address-separator">, </span>');
    }
    if (address.group) {
      let groupStart = `<span class="postal-email-address-group">${escapeHtml(address.name)}:</span>`;
      let groupEnd = `<span class="postal-email-address-group">;</span>`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatHtmlAddress(address));
    }
  }, "processAddress");
  addresses.forEach(processAddress);
  return parts.join(" ");
}
__name(formatHtmlAddresses, "formatHtmlAddresses");
function foldLines(str, lineLength, afterSpace) {
  str = (str || "").toString();
  lineLength = lineLength || 76;
  let pos = 0, len = str.length, result = "", line, match;
  while (pos < len) {
    line = str.substr(pos, lineLength);
    if (line.length < lineLength) {
      result += line;
      break;
    }
    if (match = line.match(/^[^\n\r]*(\r?\n|\r)/)) {
      line = match[0];
      result += line;
      pos += line.length;
      continue;
    } else if ((match = line.match(/(\s+)[^\s]*$/)) && match[0].length - (afterSpace ? (match[1] || "").length : 0) < line.length) {
      line = line.substr(0, line.length - (match[0].length - (afterSpace ? (match[1] || "").length : 0)));
    } else if (match = str.substr(pos + line.length).match(/^[^\s]+(\s*)/)) {
      line = line + match[0].substr(0, match[0].length - (!afterSpace ? (match[1] || "").length : 0));
    }
    result += line;
    pos += line.length;
    if (pos < len) {
      result += "\r\n";
    }
  }
  return result;
}
__name(foldLines, "foldLines");
function formatTextHeader(message) {
  let rows = [];
  if (message.from) {
    rows.push({ key: "From", val: formatTextAddress(message.from) });
  }
  if (message.subject) {
    rows.push({ key: "Subject", val: message.subject });
  }
  if (message.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message.date));
    rows.push({ key: "Date", val: dateStr });
  }
  if (message.to && message.to.length) {
    rows.push({ key: "To", val: formatTextAddresses(message.to) });
  }
  if (message.cc && message.cc.length) {
    rows.push({ key: "Cc", val: formatTextAddresses(message.cc) });
  }
  if (message.bcc && message.bcc.length) {
    rows.push({ key: "Bcc", val: formatTextAddresses(message.bcc) });
  }
  let maxKeyLength = rows.map((r) => r.key.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  rows = rows.flatMap((row) => {
    let sepLen = maxKeyLength - row.key.length;
    let prefix = `${row.key}: ${" ".repeat(sepLen)}`;
    let emptyPrefix = `${" ".repeat(row.key.length + 1)} ${" ".repeat(sepLen)}`;
    let foldedLines = foldLines(row.val, 80, true).split(/\r?\n/).map((line) => line.trim());
    return foldedLines.map((line, i) => `${i ? emptyPrefix : prefix}${line}`);
  });
  let maxLineLength = rows.map((r) => r.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  let lineMarker = "-".repeat(maxLineLength);
  let template = `
${lineMarker}
${rows.join("\n")}
${lineMarker}
`;
  return template;
}
__name(formatTextHeader, "formatTextHeader");
function formatHtmlHeader(message) {
  let rows = [];
  if (message.from) {
    rows.push(`<div class="postal-email-header-key">From</div><div class="postal-email-header-value">${formatHtmlAddress(message.from)}</div>`);
  }
  if (message.subject) {
    rows.push(
      `<div class="postal-email-header-key">Subject</div><div class="postal-email-header-value postal-email-header-subject">${escapeHtml(
        message.subject
      )}</div>`
    );
  }
  if (message.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message.date));
    rows.push(
      `<div class="postal-email-header-key">Date</div><div class="postal-email-header-value postal-email-header-date" data-date="${escapeHtml(
        message.date
      )}">${escapeHtml(dateStr)}</div>`
    );
  }
  if (message.to && message.to.length) {
    rows.push(`<div class="postal-email-header-key">To</div><div class="postal-email-header-value">${formatHtmlAddresses(message.to)}</div>`);
  }
  if (message.cc && message.cc.length) {
    rows.push(`<div class="postal-email-header-key">Cc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.cc)}</div>`);
  }
  if (message.bcc && message.bcc.length) {
    rows.push(`<div class="postal-email-header-key">Bcc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.bcc)}</div>`);
  }
  let template = `<div class="postal-email-header">${rows.length ? '<div class="postal-email-header-row">' : ""}${rows.join(
    '</div>\n<div class="postal-email-header-row">'
  )}${rows.length ? "</div>" : ""}</div>`;
  return template;
}
__name(formatHtmlHeader, "formatHtmlHeader");

// ../../node_modules/.pnpm/postal-mime@2.4.3/node_modules/postal-mime/src/address-parser.js
function _handleAddress(tokens) {
  let token;
  let isGroup = false;
  let state = "text";
  let address;
  let addresses = [];
  let data = {
    address: [],
    comment: [],
    group: [],
    text: []
  };
  let i;
  let len;
  for (i = 0, len = tokens.length; i < len; i++) {
    token = tokens[i];
    if (token.type === "operator") {
      switch (token.value) {
        case "<":
          state = "address";
          break;
        case "(":
          state = "comment";
          break;
        case ":":
          state = "group";
          isGroup = true;
          break;
        default:
          state = "text";
      }
    } else if (token.value) {
      if (state === "address") {
        token.value = token.value.replace(/^[^<]*<\s*/, "");
      }
      data[state].push(token.value);
    }
  }
  if (!data.text.length && data.comment.length) {
    data.text = data.comment;
    data.comment = [];
  }
  if (isGroup) {
    data.text = data.text.join(" ");
    addresses.push({
      name: decodeWords(data.text || address && address.name),
      group: data.group.length ? addressParser(data.group.join(",")) : []
    });
  } else {
    if (!data.address.length && data.text.length) {
      for (i = data.text.length - 1; i >= 0; i--) {
        if (data.text[i].match(/^[^@\s]+@[^@\s]+$/)) {
          data.address = data.text.splice(i, 1);
          break;
        }
      }
      let _regexHandler = /* @__PURE__ */ __name(function(address2) {
        if (!data.address.length) {
          data.address = [address2.trim()];
          return " ";
        } else {
          return address2;
        }
      }, "_regexHandler");
      if (!data.address.length) {
        for (i = data.text.length - 1; i >= 0; i--) {
          data.text[i] = data.text[i].replace(/\s*\b[^@\s]+@[^\s]+\b\s*/, _regexHandler).trim();
          if (data.address.length) {
            break;
          }
        }
      }
    }
    if (!data.text.length && data.comment.length) {
      data.text = data.comment;
      data.comment = [];
    }
    if (data.address.length > 1) {
      data.text = data.text.concat(data.address.splice(1));
    }
    data.text = data.text.join(" ");
    data.address = data.address.join(" ");
    if (!data.address && /^=\?[^=]+?=$/.test(data.text.trim())) {
      const parsedSubAddresses = addressParser(decodeWords(data.text));
      if (parsedSubAddresses && parsedSubAddresses.length) {
        return parsedSubAddresses;
      }
    }
    if (!data.address && isGroup) {
      return [];
    } else {
      address = {
        address: data.address || data.text || "",
        name: decodeWords(data.text || data.address || "")
      };
      if (address.address === address.name) {
        if ((address.address || "").match(/@/)) {
          address.name = "";
        } else {
          address.address = "";
        }
      }
      addresses.push(address);
    }
  }
  return addresses;
}
__name(_handleAddress, "_handleAddress");
var Tokenizer = class {
  constructor(str) {
    this.str = (str || "").toString();
    this.operatorCurrent = "";
    this.operatorExpecting = "";
    this.node = null;
    this.escaped = false;
    this.list = [];
    this.operators = {
      '"': '"',
      "(": ")",
      "<": ">",
      ",": "",
      ":": ";",
      // Semicolons are not a legal delimiter per the RFC2822 grammar other
      // than for terminating a group, but they are also not valid for any
      // other use in this context.  Given that some mail clients have
      // historically allowed the semicolon as a delimiter equivalent to the
      // comma in their UI, it makes sense to treat them the same as a comma
      // when used outside of a group.
      ";": ""
    };
  }
  /**
   * Tokenizes the original input string
   *
   * @return {Array} An array of operator|text tokens
   */
  tokenize() {
    let chr, list = [];
    for (let i = 0, len = this.str.length; i < len; i++) {
      chr = this.str.charAt(i);
      this.checkChar(chr);
    }
    this.list.forEach((node) => {
      node.value = (node.value || "").toString().trim();
      if (node.value) {
        list.push(node);
      }
    });
    return list;
  }
  /**
   * Checks if a character is an operator or text and acts accordingly
   *
   * @param {String} chr Character from the address field
   */
  checkChar(chr) {
    if (this.escaped) {
    } else if (chr === this.operatorExpecting) {
      this.node = {
        type: "operator",
        value: chr
      };
      this.list.push(this.node);
      this.node = null;
      this.operatorExpecting = "";
      this.escaped = false;
      return;
    } else if (!this.operatorExpecting && chr in this.operators) {
      this.node = {
        type: "operator",
        value: chr
      };
      this.list.push(this.node);
      this.node = null;
      this.operatorExpecting = this.operators[chr];
      this.escaped = false;
      return;
    } else if (['"', "'"].includes(this.operatorExpecting) && chr === "\\") {
      this.escaped = true;
      return;
    }
    if (!this.node) {
      this.node = {
        type: "text",
        value: ""
      };
      this.list.push(this.node);
    }
    if (chr === "\n") {
      chr = " ";
    }
    if (chr.charCodeAt(0) >= 33 || [" ", "	"].includes(chr)) {
      this.node.value += chr;
    }
    this.escaped = false;
  }
};
__name(Tokenizer, "Tokenizer");
function addressParser(str, options) {
  options = options || {};
  let tokenizer = new Tokenizer(str);
  let tokens = tokenizer.tokenize();
  let addresses = [];
  let address = [];
  let parsedAddresses = [];
  tokens.forEach((token) => {
    if (token.type === "operator" && (token.value === "," || token.value === ";")) {
      if (address.length) {
        addresses.push(address);
      }
      address = [];
    } else {
      address.push(token);
    }
  });
  if (address.length) {
    addresses.push(address);
  }
  addresses.forEach((address2) => {
    address2 = _handleAddress(address2);
    if (address2.length) {
      parsedAddresses = parsedAddresses.concat(address2);
    }
  });
  if (options.flatten) {
    let addresses2 = [];
    let walkAddressList = /* @__PURE__ */ __name((list) => {
      list.forEach((address2) => {
        if (address2.group) {
          return walkAddressList(address2.group);
        } else {
          addresses2.push(address2);
        }
      });
    }, "walkAddressList");
    walkAddressList(parsedAddresses);
    return addresses2;
  }
  return parsedAddresses;
}
__name(addressParser, "addressParser");
var address_parser_default = addressParser;

// ../../node_modules/.pnpm/postal-mime@2.4.3/node_modules/postal-mime/src/base64-encoder.js
function base64ArrayBuffer(arrayBuffer) {
  var base64 = "";
  var encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;
  var a, b, c, d;
  var chunk;
  for (var i = 0; i < mainLength; i = i + 3) {
    chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
    a = (chunk & 16515072) >> 18;
    b = (chunk & 258048) >> 12;
    c = (chunk & 4032) >> 6;
    d = chunk & 63;
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;
    b = (chunk & 3) << 4;
    base64 += encodings[a] + encodings[b] + "==";
  } else if (byteRemainder == 2) {
    chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;
    b = (chunk & 1008) >> 4;
    c = (chunk & 15) << 2;
    base64 += encodings[a] + encodings[b] + encodings[c] + "=";
  }
  return base64;
}
__name(base64ArrayBuffer, "base64ArrayBuffer");

// ../../node_modules/.pnpm/postal-mime@2.4.3/node_modules/postal-mime/src/postal-mime.js
var PostalMime = class {
  static parse(buf, options) {
    const parser = new PostalMime(options);
    return parser.parse(buf);
  }
  constructor(options) {
    this.options = options || {};
    this.root = this.currentNode = new MimeNode({
      postalMime: this
    });
    this.boundaries = [];
    this.textContent = {};
    this.attachments = [];
    this.attachmentEncoding = (this.options.attachmentEncoding || "").toString().replace(/[-_\s]/g, "").trim().toLowerCase() || "arraybuffer";
    this.started = false;
  }
  async finalize() {
    await this.root.finalize();
  }
  async processLine(line, isFinal) {
    let boundaries = this.boundaries;
    if (boundaries.length && line.length > 2 && line[0] === 45 && line[1] === 45) {
      for (let i = boundaries.length - 1; i >= 0; i--) {
        let boundary = boundaries[i];
        if (line.length !== boundary.value.length + 2 && line.length !== boundary.value.length + 4) {
          continue;
        }
        let isTerminator = line.length === boundary.value.length + 4;
        if (isTerminator && (line[line.length - 2] !== 45 || line[line.length - 1] !== 45)) {
          continue;
        }
        let boudaryMatches = true;
        for (let i2 = 0; i2 < boundary.value.length; i2++) {
          if (line[i2 + 2] !== boundary.value[i2]) {
            boudaryMatches = false;
            break;
          }
        }
        if (!boudaryMatches) {
          continue;
        }
        if (isTerminator) {
          await boundary.node.finalize();
          this.currentNode = boundary.node.parentNode || this.root;
        } else {
          await boundary.node.finalizeChildNodes();
          this.currentNode = new MimeNode({
            postalMime: this,
            parentNode: boundary.node
          });
        }
        if (isFinal) {
          return this.finalize();
        }
        return;
      }
    }
    this.currentNode.feed(line);
    if (isFinal) {
      return this.finalize();
    }
  }
  readLine() {
    let startPos = this.readPos;
    let endPos = this.readPos;
    let res = /* @__PURE__ */ __name(() => {
      return {
        bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
        done: this.readPos >= this.av.length
      };
    }, "res");
    while (this.readPos < this.av.length) {
      const c = this.av[this.readPos++];
      if (c !== 13 && c !== 10) {
        endPos = this.readPos;
      }
      if (c === 10) {
        return res();
      }
    }
    return res();
  }
  async processNodeTree() {
    let textContent = {};
    let textTypes = /* @__PURE__ */ new Set();
    let textMap = this.textMap = /* @__PURE__ */ new Map();
    let forceRfc822Attachments = this.forceRfc822Attachments();
    let walk = /* @__PURE__ */ __name(async (node, alternative, related) => {
      alternative = alternative || false;
      related = related || false;
      if (!node.contentType.multipart) {
        if (this.isInlineMessageRfc822(node) && !forceRfc822Attachments) {
          const subParser = new PostalMime();
          node.subMessage = await subParser.parse(node.content);
          if (!textMap.has(node)) {
            textMap.set(node, {});
          }
          let textEntry = textMap.get(node);
          if (node.subMessage.text || !node.subMessage.html) {
            textEntry.plain = textEntry.plain || [];
            textEntry.plain.push({ type: "subMessage", value: node.subMessage });
            textTypes.add("plain");
          }
          if (node.subMessage.html) {
            textEntry.html = textEntry.html || [];
            textEntry.html.push({ type: "subMessage", value: node.subMessage });
            textTypes.add("html");
          }
          if (subParser.textMap) {
            subParser.textMap.forEach((subTextEntry, subTextNode) => {
              textMap.set(subTextNode, subTextEntry);
            });
          }
          for (let attachment of node.subMessage.attachments || []) {
            this.attachments.push(attachment);
          }
        } else if (this.isInlineTextNode(node)) {
          let textType = node.contentType.parsed.value.substr(node.contentType.parsed.value.indexOf("/") + 1);
          let selectorNode = alternative || node;
          if (!textMap.has(selectorNode)) {
            textMap.set(selectorNode, {});
          }
          let textEntry = textMap.get(selectorNode);
          textEntry[textType] = textEntry[textType] || [];
          textEntry[textType].push({ type: "text", value: node.getTextContent() });
          textTypes.add(textType);
        } else if (node.content) {
          const filename = node.contentDisposition.parsed.params.filename || node.contentType.parsed.params.name || null;
          const attachment = {
            filename: filename ? decodeWords(filename) : null,
            mimeType: node.contentType.parsed.value,
            disposition: node.contentDisposition.parsed.value || null
          };
          if (related && node.contentId) {
            attachment.related = true;
          }
          if (node.contentDescription) {
            attachment.description = node.contentDescription;
          }
          if (node.contentId) {
            attachment.contentId = node.contentId;
          }
          switch (node.contentType.parsed.value) {
            case "text/calendar":
            case "application/ics": {
              if (node.contentType.parsed.params.method) {
                attachment.method = node.contentType.parsed.params.method.toString().toUpperCase().trim();
              }
              const decodedText = node.getTextContent().replace(/\r?\n/g, "\n").replace(/\n*$/, "\n");
              attachment.content = textEncoder.encode(decodedText);
              break;
            }
            default:
              attachment.content = node.content;
          }
          this.attachments.push(attachment);
        }
      } else if (node.contentType.multipart === "alternative") {
        alternative = node;
      } else if (node.contentType.multipart === "related") {
        related = node;
      }
      for (let childNode of node.childNodes) {
        await walk(childNode, alternative, related);
      }
    }, "walk");
    await walk(this.root, false, []);
    textMap.forEach((mapEntry) => {
      textTypes.forEach((textType) => {
        if (!textContent[textType]) {
          textContent[textType] = [];
        }
        if (mapEntry[textType]) {
          mapEntry[textType].forEach((textEntry) => {
            switch (textEntry.type) {
              case "text":
                textContent[textType].push(textEntry.value);
                break;
              case "subMessage":
                {
                  switch (textType) {
                    case "html":
                      textContent[textType].push(formatHtmlHeader(textEntry.value));
                      break;
                    case "plain":
                      textContent[textType].push(formatTextHeader(textEntry.value));
                      break;
                  }
                }
                break;
            }
          });
        } else {
          let alternativeType;
          switch (textType) {
            case "html":
              alternativeType = "plain";
              break;
            case "plain":
              alternativeType = "html";
              break;
          }
          (mapEntry[alternativeType] || []).forEach((textEntry) => {
            switch (textEntry.type) {
              case "text":
                switch (textType) {
                  case "html":
                    textContent[textType].push(textToHtml(textEntry.value));
                    break;
                  case "plain":
                    textContent[textType].push(htmlToText(textEntry.value));
                    break;
                }
                break;
              case "subMessage":
                {
                  switch (textType) {
                    case "html":
                      textContent[textType].push(formatHtmlHeader(textEntry.value));
                      break;
                    case "plain":
                      textContent[textType].push(formatTextHeader(textEntry.value));
                      break;
                  }
                }
                break;
            }
          });
        }
      });
    });
    Object.keys(textContent).forEach((textType) => {
      textContent[textType] = textContent[textType].join("\n");
    });
    this.textContent = textContent;
  }
  isInlineTextNode(node) {
    if (node.contentDisposition.parsed.value === "attachment") {
      return false;
    }
    switch (node.contentType.parsed.value) {
      case "text/html":
      case "text/plain":
        return true;
      case "text/calendar":
      case "text/csv":
      default:
        return false;
    }
  }
  isInlineMessageRfc822(node) {
    if (node.contentType.parsed.value !== "message/rfc822") {
      return false;
    }
    let disposition = node.contentDisposition.parsed.value || (this.options.rfc822Attachments ? "attachment" : "inline");
    return disposition === "inline";
  }
  // Check if this is a specially crafted report email where message/rfc822 content should not be inlined
  forceRfc822Attachments() {
    if (this.options.forceRfc822Attachments) {
      return true;
    }
    let forceRfc822Attachments = false;
    let walk = /* @__PURE__ */ __name((node) => {
      if (!node.contentType.multipart) {
        if (["message/delivery-status", "message/feedback-report"].includes(node.contentType.parsed.value)) {
          forceRfc822Attachments = true;
        }
      }
      for (let childNode of node.childNodes) {
        walk(childNode);
      }
    }, "walk");
    walk(this.root);
    return forceRfc822Attachments;
  }
  async resolveStream(stream) {
    let chunkLen = 0;
    let chunks = [];
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      chunkLen += value.length;
    }
    const result = new Uint8Array(chunkLen);
    let chunkPointer = 0;
    for (let chunk of chunks) {
      result.set(chunk, chunkPointer);
      chunkPointer += chunk.length;
    }
    return result;
  }
  async parse(buf) {
    if (this.started) {
      throw new Error("Can not reuse parser, create a new PostalMime object");
    }
    this.started = true;
    if (buf && typeof buf.getReader === "function") {
      buf = await this.resolveStream(buf);
    }
    buf = buf || new ArrayBuffer(0);
    if (typeof buf === "string") {
      buf = textEncoder.encode(buf);
    }
    if (buf instanceof Blob || Object.prototype.toString.call(buf) === "[object Blob]") {
      buf = await blobToArrayBuffer(buf);
    }
    if (buf.buffer instanceof ArrayBuffer) {
      buf = new Uint8Array(buf).buffer;
    }
    this.buf = buf;
    this.av = new Uint8Array(buf);
    this.readPos = 0;
    while (this.readPos < this.av.length) {
      const line = this.readLine();
      await this.processLine(line.bytes, line.done);
    }
    await this.processNodeTree();
    const message = {
      headers: this.root.headers.map((entry) => ({ key: entry.key, value: entry.value })).reverse()
    };
    for (const key of ["from", "sender"]) {
      const addressHeader = this.root.headers.find((line) => line.key === key);
      if (addressHeader && addressHeader.value) {
        const addresses = address_parser_default(addressHeader.value);
        if (addresses && addresses.length) {
          message[key] = addresses[0];
        }
      }
    }
    for (const key of ["delivered-to", "return-path"]) {
      const addressHeader = this.root.headers.find((line) => line.key === key);
      if (addressHeader && addressHeader.value) {
        const addresses = address_parser_default(addressHeader.value);
        if (addresses && addresses.length && addresses[0].address) {
          const camelKey = key.replace(/\-(.)/g, (o, c) => c.toUpperCase());
          message[camelKey] = addresses[0].address;
        }
      }
    }
    for (const key of ["to", "cc", "bcc", "reply-to"]) {
      const addressHeaders = this.root.headers.filter((line) => line.key === key);
      let addresses = [];
      addressHeaders.filter((entry) => entry && entry.value).map((entry) => address_parser_default(entry.value)).forEach((parsed) => addresses = addresses.concat(parsed || []));
      if (addresses && addresses.length) {
        const camelKey = key.replace(/\-(.)/g, (o, c) => c.toUpperCase());
        message[camelKey] = addresses;
      }
    }
    for (const key of ["subject", "message-id", "in-reply-to", "references"]) {
      const header = this.root.headers.find((line) => line.key === key);
      if (header && header.value) {
        const camelKey = key.replace(/\-(.)/g, (o, c) => c.toUpperCase());
        message[camelKey] = decodeWords(header.value);
      }
    }
    let dateHeader = this.root.headers.find((line) => line.key === "date");
    if (dateHeader) {
      let date = new Date(dateHeader.value);
      if (!date || date.toString() === "Invalid Date") {
        date = dateHeader.value;
      } else {
        date = date.toISOString();
      }
      message.date = date;
    }
    if (this.textContent?.html) {
      message.html = this.textContent.html;
    }
    if (this.textContent?.plain) {
      message.text = this.textContent.plain;
    }
    message.attachments = this.attachments;
    switch (this.attachmentEncoding) {
      case "arraybuffer":
        break;
      case "base64":
        for (let attachment of message.attachments || []) {
          if (attachment?.content) {
            attachment.content = base64ArrayBuffer(attachment.content);
            attachment.encoding = "base64";
          }
        }
        break;
      case "utf8":
        let attachmentDecoder = new TextDecoder("utf8");
        for (let attachment of message.attachments || []) {
          if (attachment?.content) {
            attachment.content = attachmentDecoder.decode(attachment.content);
            attachment.encoding = "utf8";
          }
        }
        break;
      default:
        throw new Error("Unknwon attachment encoding");
    }
    return message;
  }
};
__name(PostalMime, "PostalMime");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/utils/body.js
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    form[key] = value;
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", 8);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? decodeURIComponent_(value) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.#cachedBody("json");
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setHeaders = /* @__PURE__ */ __name((headers, map = {}) => {
  for (const key of Object.keys(map)) {
    headers.set(key, map[key]);
  }
  return headers;
}, "setHeaders");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status = 200;
  #executionCtx;
  #headers;
  #preparedHeaders;
  #res;
  #isFresh = true;
  #layout;
  #renderer;
  #notFoundHandler;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    this.#isFresh = false;
    return this.#res ||= new Response("404 Not Found", { status: 404 });
  }
  set res(_res) {
    this.#isFresh = false;
    if (this.#res && _res) {
      try {
        for (const [k, v] of this.#res.headers.entries()) {
          if (k === "content-type") {
            continue;
          }
          if (k === "set-cookie") {
            const cookies = this.#res.headers.getSetCookie();
            _res.headers.delete("set-cookie");
            for (const cookie of cookies) {
              _res.headers.append("set-cookie", cookie);
            }
          } else {
            _res.headers.set(k, v);
          }
        }
      } catch (e) {
        if (e instanceof TypeError && e.message.includes("immutable")) {
          this.res = new Response(_res.body, {
            headers: _res.headers,
            status: _res.status
          });
          return;
        } else {
          throw e;
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (value === void 0) {
      if (this.#headers) {
        this.#headers.delete(name);
      } else if (this.#preparedHeaders) {
        delete this.#preparedHeaders[name.toLocaleLowerCase()];
      }
      if (this.finalized) {
        this.res.headers.delete(name);
      }
      return;
    }
    if (options?.append) {
      if (!this.#headers) {
        this.#isFresh = false;
        this.#headers = new Headers(this.#preparedHeaders);
        this.#preparedHeaders = {};
      }
      this.#headers.append(name, value);
    } else {
      if (this.#headers) {
        this.#headers.set(name, value);
      } else {
        this.#preparedHeaders ??= {};
        this.#preparedHeaders[name.toLowerCase()] = value;
      }
    }
    if (this.finalized) {
      if (options?.append) {
        this.res.headers.append(name, value);
      } else {
        this.res.headers.set(name, value);
      }
    }
  };
  status = (status) => {
    this.#isFresh = false;
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    if (this.#isFresh && !headers && !arg && this.#status === 200) {
      return new Response(data, {
        headers: this.#preparedHeaders
      });
    }
    if (arg && typeof arg !== "number") {
      const header = new Headers(arg.headers);
      if (this.#headers) {
        this.#headers.forEach((v, k) => {
          if (k === "set-cookie") {
            header.append(k, v);
          } else {
            header.set(k, v);
          }
        });
      }
      const headers2 = setHeaders(header, this.#preparedHeaders);
      return new Response(data, {
        headers: headers2,
        status: arg.status ?? this.#status
      });
    }
    const status = typeof arg === "number" ? arg : this.#status;
    this.#preparedHeaders ??= {};
    this.#headers ??= new Headers();
    setHeaders(this.#headers, this.#preparedHeaders);
    if (this.#res) {
      this.#res.headers.forEach((v, k) => {
        if (k === "set-cookie") {
          this.#headers?.append(k, v);
        } else {
          this.#headers?.set(k, v);
        }
      });
      setHeaders(this.#headers, this.#preparedHeaders);
    }
    headers ??= {};
    for (const [k, v] of Object.entries(headers)) {
      if (typeof v === "string") {
        this.#headers.set(k, v);
      } else {
        this.#headers.delete(k);
        for (const v2 of v) {
          this.#headers.append(k, v2);
        }
      }
    }
    return new Response(data, {
      status,
      headers: this.#headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => {
    return typeof arg === "number" ? this.#newResponse(data, arg, headers) : this.#newResponse(data, arg);
  };
  text = (text, arg, headers) => {
    if (!this.#preparedHeaders) {
      if (this.#isFresh && !headers && !arg) {
        return new Response(text);
      }
      this.#preparedHeaders = {};
    }
    this.#preparedHeaders["content-type"] = TEXT_PLAIN;
    if (typeof arg === "number") {
      return this.#newResponse(text, arg, headers);
    }
    return this.#newResponse(text, arg);
  };
  json = (object, arg, headers) => {
    const body = JSON.stringify(object);
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "application/json";
    return typeof arg === "number" ? this.#newResponse(body, arg, headers) : this.#newResponse(body, arg);
  };
  html = (html, arg, headers) => {
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "text/html; charset=UTF-8";
    if (typeof html === "object") {
      return resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then((html2) => {
        return typeof arg === "number" ? this.#newResponse(html2, arg, headers) : this.#newResponse(html2, arg);
      });
    }
    return typeof arg === "number" ? this.#newResponse(html, arg, headers) : this.#newResponse(html, arg);
  };
  redirect = (location, status) => {
    this.#headers ??= new Headers();
    this.#headers.set("Location", String(location));
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
}, "Context");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    return err.getResponse();
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        replaceRequest = options.replaceRequest;
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "Hono");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "Node");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/router/reg-exp-router/router.js
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = /* @__PURE__ */ __name(class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (Object.keys(curNode.#children).includes(key)) {
        curNode = curNode.#children[key];
        const pattern2 = getPattern(p, nextP);
        if (pattern2) {
          possibleKeys.push(pattern2[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    const m = /* @__PURE__ */ Object.create(null);
    const handlerSet = {
      handler,
      possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
      score: this.#order
    };
    m[method] = handlerSet;
    curNode.#methods.push(m);
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "") {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "Node");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// ../../node_modules/.pnpm/hono@4.7.4/node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// src/index.ts
var app = new Hono2();
app.get("/", (c) => {
  return c.text("Hello Cloudflare Workers!");
});
var src_default = {
  fetch: app.fetch,
  email: async (message, env, ctx) => {
    const email = await PostalMime.parse(message.raw, {
      attachmentEncoding: "base64"
    });
    console.log("Email", email);
    ctx.waitUntil(message.forward("christian@hiddenvillage.se"));
  }
  // queue: (message, env, ctx) => {
  //   console.log('Received queue message', message)
  // },
};

// ../../node_modules/.pnpm/wrangler@3.109.2_@cloudflare+workers-types@4.20250214.0/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/.pnpm/wrangler@3.109.2_@cloudflare+workers-types@4.20250214.0/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-kgx13X/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../node_modules/.pnpm/wrangler@3.109.2_@cloudflare+workers-types@4.20250214.0/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-kgx13X/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
