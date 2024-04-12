export default function hashPasswordWithSalt(salt) {
  var s =
    stringToUint8(salt) || window.crypto.getRandomValues(new Uint8Array(64));
  return (formMap, [key, value]) => {
    if (key === "password" || key === "confirm_password") {
      return hash(value, s, 6e5).then((h) => {
        formMap.set(key, `${bitsToHex(new Uint8Array(h))}`);
        formMap.set("salt", s);

        return formMap;
      });
    }

    return formMap;
  };
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

function stringToUint8(s = "") {
  var a = s.split(",");
  var b = a.map((v) => parseInt(v));
  return Uint8Array.from(b);
}
