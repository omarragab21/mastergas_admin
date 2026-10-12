import tijaraAdminApi from '../infrastructure/api/tijaraAdminApi';
import {
  dataFromResponse,
  listFromResponse,
  toAttribute,
  toCategory,
  toDiscountCode,
  toProduct,
} from '../domain/catalog/adminCatalog';

const MAX_PAGES = 50;

// Laravel paginates these collections (categories: 10/page). Walk every page
// so nothing is hidden from the admin. The admin lists explicitly request all
// statuses; the UI applies the selected status filter after normalization.
const mapList = async (request, mapper, params = {}) => {
  const first = await request({ ...params, page: 1 });
  const items = [...listFromResponse(first.data)];
  const lastPage = Math.min(Number(first.data?.meta?.last_page) || 1, MAX_PAGES);
  for (let page = 2; page <= lastPage; page += 1) {
    const next = await request({ ...params, page });
    items.push(...listFromResponse(next.data));
  }
  return items.map(mapper);
};
const mapData = (request, mapper) => request().then((response) => mapper(dataFromResponse(response.data)));

export const adminCatalogService = {
  listCategories: (params = {}) => mapList(tijaraAdminApi.listCategories, toCategory, params),
  createCategory: (payload, image) => mapData(() => tijaraAdminApi.createCategory(payload, image), toCategory),
  updateCategory: (id, payload, image) => mapData(() => tijaraAdminApi.updateCategory(id, payload, image), toCategory),
  deleteCategory: tijaraAdminApi.deleteCategory,

  listProducts: (params) => tijaraAdminApi.listProducts(params).then((response) => ({
    ...response.data,
    data: listFromResponse(response.data).map(toProduct),
    items: listFromResponse(response.data).map(toProduct),
  })),
  // The categories endpoint does not include products_count. Collect every
  // product page so CategoriesView can calculate authoritative counters.
  listAllProducts: async (params = {}) => {
    const first = await tijaraAdminApi.listProducts({ ...params, page: 1 });
    const items = [...listFromResponse(first.data)];
    const lastPage = Math.min(Number(first.data?.meta?.last_page) || 1, MAX_PAGES);
    for (let page = 2; page <= lastPage; page += 1) {
      const next = await tijaraAdminApi.listProducts({ ...params, page });
      items.push(...listFromResponse(next.data));
    }
    return items.map(toProduct);
  },
  createProduct: (payload, files) => mapData(() => tijaraAdminApi.createProduct(payload, files), toProduct),
  updateProduct: (id, payload, files) => mapData(() => tijaraAdminApi.updateProduct(id, payload, files), toProduct),
  deleteProduct: tijaraAdminApi.deleteProduct,

  listAttributes: () => mapList(tijaraAdminApi.listAttributes, toAttribute),
  createAttribute: (payload) => mapData(() => tijaraAdminApi.createAttribute(payload), toAttribute),
  updateAttribute: (id, payload) => mapData(() => tijaraAdminApi.updateAttribute(id, payload), toAttribute),
  deleteAttribute: tijaraAdminApi.deleteAttribute,
  createAttributeOption: (attributeId, payload) => mapData(() => tijaraAdminApi.createAttributeOption(attributeId, payload), toAttribute),
  updateAttributeOption: (attributeId, optionId, payload) => mapData(() => tijaraAdminApi.updateAttributeOption(attributeId, optionId, payload), toAttribute),
  deleteAttributeOption: tijaraAdminApi.deleteAttributeOption,

  listDiscountCodes: (params = {}) => mapList(tijaraAdminApi.listDiscountCodes, toDiscountCode, params),
  createDiscountCode: (payload) => mapData(() => tijaraAdminApi.createDiscountCode(payload), toDiscountCode),
  updateDiscountCode: (id, payload) => mapData(() => tijaraAdminApi.updateDiscountCode(id, payload), toDiscountCode),
  deleteDiscountCode: tijaraAdminApi.deleteDiscountCode,
};

export default adminCatalogService;
