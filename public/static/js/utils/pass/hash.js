export default function hashPassword(formMap, [key, value]) {
  if (key === "password" || key === "confirm_password") {
    return hash(
      value,
      window.crypto.getRandomValues(new Uint8Array(64)),
      6e5
    ).then((h) => {
      formMap.set(key, `${bitsToHex(new Uint8Array(h))}`);

      return formMap;
    });
  }

  return formMap;
}

function getPasswordKey(pw) {
  var t = new TextEncoder();
  return window.crypto.subtle.importKey("raw", t.encode(pw), "PBKDF2", false, [
    "deriveBits",
    "deriveKey",
  ]);
}

function hash(pw, salt, iterations) {
  return getPasswordKey(pw)
    .then((k) => {
      return window.crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          hash: "SHA-512",
          salt,
          iterations,
        },
        k,
        512
      );
    })
    .catch((e) => console.error(e));
}

function bitsToHex(uint8Array) {
  var hex = [];
  for (var i = 0; i < uint8Array.length; i++) {
    hex.push((uint8Array[i] >> 4).toString(16));
    hex.push((uint8Array[i] & 0xf).toString(16));
  }
  return hex.join("");
}
