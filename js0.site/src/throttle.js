export default (func, timeout) => {
  let pending;
  return () => {
    if (pending) return;
    pending = setTimeout(() => {
      func();
      pending = undefined;
    }, timeout);
  };
};
