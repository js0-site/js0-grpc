export default (pkg, root_nested) =>
  ({ resolvedValue }) => {
    if (!resolvedValue.startsWith(pkg)) {
      console.warn("MISS TYPE " + resolvedValue);
      return;
    }

    resolvedValue = resolvedValue.slice(pkg.length).split(".");

    const resolvedValue_len = resolvedValue.length;

    if (!resolvedValue_len) {
      return;
    }

    let n = 0,
      type = root_nested;

    while (n < resolvedValue_len) {
      type = type.nested[resolvedValue[n]];
      if (!type) return;
      ++n;
    }
    return [resolvedValue, type];
  };
