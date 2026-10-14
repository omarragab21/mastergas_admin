import tijaraAdminApi from '../infrastructure/api/tijaraAdminApi';
import { dataFromResponse, listFromResponse } from '../domain/catalog/adminCatalog';
import {
  toAdminSlider,
  toAdminSliderPayload,
  toAdminUser,
  toAdminUserPayload,
  toAdminUserUpdatePayload,
} from '../domain/adminManagement';

const MAX_PAGES = 50;

const mapResponse = (response, mapper) => {
  const data = dataFromResponse(response?.data);
  return data && typeof data === 'object' && !Array.isArray(data) ? mapper(data) : null;
};

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

export const adminManagementService = {
  listUsers: (params = {}) => mapList(tijaraAdminApi.listUsers, toAdminUser, params),
  createUser: (form, image) => tijaraAdminApi.createUser(toAdminUserPayload(form), image).then((response) => mapResponse(response, toAdminUser)),
  updateUser: (id, form, image) => tijaraAdminApi.updateUser(id, toAdminUserUpdatePayload(form), image).then((response) => mapResponse(response, toAdminUser)),
  getUser: (id) => tijaraAdminApi.getUser(id).then((response) => mapResponse(response, toAdminUser)),
  deleteUser: tijaraAdminApi.deleteUser,

  listSliders: (params = {}) => mapList(tijaraAdminApi.listSliders, toAdminSlider, params),
  createSlider: (form, image) => tijaraAdminApi.createSlider(toAdminSliderPayload(form), image).then((response) => mapResponse(response, toAdminSlider)),
  updateSlider: (id, form, image) => tijaraAdminApi.updateSlider(id, toAdminSliderPayload(form), image).then((response) => mapResponse(response, toAdminSlider)),
  getSlider: (id) => tijaraAdminApi.getSlider(id).then((response) => mapResponse(response, toAdminSlider)),
  deleteSlider: tijaraAdminApi.deleteSlider,
};

export default adminManagementService;
