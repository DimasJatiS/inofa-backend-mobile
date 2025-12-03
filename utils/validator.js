exports.isValidURL = (url) => {
    const pattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
    return pattern.test(url);
};

exports.limitString = (value, max) => {
    if (!value) return value;
    return value.length > max ? value.substring(0, max) : value;
};

exports.isValidWhatsapp = (number) => {
  return /^62[0-9]{8,13}$/.test(number);
};

exports.normalizeWhatsapp = (number) => {
  if (!number) return null;

  // Buang semua spasi, tanda +, tanda hubung
  number = number.replace(/\D/g, "");

  // 08xxxxxx → 628xxxxxx
  if (number.startsWith("08")) {
    number = "62" + number.substring(1);
  }

  // Jika +62xxxx (tanpa minus) → hapus +
  if (number.startsWith("+62")) {
    number = number.substring(1);
  }

  if (number.startsWith("620")) {
    number = number.substring(1);
  }

  return number;
};
