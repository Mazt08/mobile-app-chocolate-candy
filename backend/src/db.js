module.exports = new Proxy(
  {},
  {
    get() {
      throw new Error("JSON driver disabled. Backend is MySQL-only.");
    },
  }
);
