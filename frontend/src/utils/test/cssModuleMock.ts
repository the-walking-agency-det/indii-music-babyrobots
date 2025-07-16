// This proxy returns the class name as-is if not found in the styles object
export default new Proxy(
  {},
  {
    get: function getter(target: Record<string, string>, prop: string) {
      // Handle array access for styles['class-name']
      if (prop === '__esModule') {
        return { default: target };
      }
      return prop;
    },
  }
);
