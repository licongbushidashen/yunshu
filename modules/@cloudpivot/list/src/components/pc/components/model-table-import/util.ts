export function getDataItems (node: any) {
  const binding = node.bindings['dataSource.items'];
  if (!binding) {
    return;
  }
  const firstIdx = binding.indexOf('.');
  const lastIdx = binding.lastIndexOf('.');
  const h3ui: any = (window as any).h3ui;

  const key = binding.substring(firstIdx + 1, lastIdx);
  const mate: any = h3ui.models[key].meta;

  const dataItem: any[] = mate.bizSchema.properties;

  return dataItem.map(res => {
    let properties: any[] = [];
    if (res.valueType === 9) {
      properties = (res.subSchema as any).properties.map((item: any) => {
        return {
          code: item.code,
          name: item.name,

          valueType: item.valueType,
        };
      });
    }
    return {
      code: res.code,
      name: res.name,

      valueType: res.valueType,
      properties,
    };
  });
}
