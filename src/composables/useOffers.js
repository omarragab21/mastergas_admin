import { ref } from 'vue';
import { productService } from '../services/productService';
import { offers as fallbackOffers } from '../data/catalogData';

const offers = ref([]);
const loading = ref(false);
let fetchPromise = null;
let lastOffersSource = 'empty';

export const isOfferDateValid = (offer) => {
  if (!offer) return false;
  const now = new Date();
  const startRaw = offer.start_date || offer.starts_at || offer.valid_from || offer.from_date;
  const endRaw = offer.end_date || offer.ends_at || offer.expires_at || offer.valid_to || offer.to_date;

  if (startRaw) {
    const startDate = new Date(startRaw);
    if (!Number.isNaN(startDate.getTime())) {
      if (!String(startRaw).includes('T') && !String(startRaw).includes(' ')) startDate.setHours(0, 0, 0, 0);
      if (now < startDate) return false;
    }
  }
  if (endRaw) {
    const endDate = new Date(endRaw);
    if (!Number.isNaN(endDate.getTime())) {
      if (!String(endRaw).includes('T') && !String(endRaw).includes(' ')) endDate.setHours(23, 59, 59, 999);
      else if (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) endDate.setHours(23, 59, 59, 999);
      if (now > endDate) return false;
    }
  }
  return true;
};

export const isOfferActive = (offer) => Boolean(
  offer &&
  (!offer.status || offer.status === 'active') &&
  offer.is_active !== 0 && offer.is_active !== false && offer.is_active !== '0' &&
  isOfferDateValid(offer)
);

export function useOffers() {
  const fetchOffers = async (options = {}) => {
    if (fetchPromise) return fetchPromise;
    loading.value = true;
    fetchPromise = productService.getOffers({ is_active: 1 }, options)
      .then((list) => {
        const active = (Array.isArray(list) ? list : []).filter(isOfferActive);
        // An empty successful API response is a valid business state. Only the
        // service's error path supplies fallbackOffers, so we never invent a
        // discount when the backend says there are no active offers.
        offers.value = active;
        lastOffersSource = Array.isArray(list) && list.length ? 'api' : 'empty';
        return offers.value;
      })
      .catch((error) => {
        offers.value = fallbackOffers.filter(isOfferActive);
        lastOffersSource = 'fallback';
        throw error;
      })
      .finally(() => {
        loading.value = false;
        fetchPromise = null;
      });
    return fetchPromise;
  };

  const getActiveOfferForProduct = (product) => {
    if (!product || !offers.value.length) return null;
    return offers.value.find((offer) => {
      if (!isOfferActive(offer)) return false;
      if (offer.applies_to === 'all' || !offer.applies_to) return true;
      if (offer.applies_to === 'products') {
        const ids = offer.selected_products || offer.applied_ids || [];
        return Array.isArray(ids) && ids.some((id) => Number(id) === Number(product.id));
      }
      if (offer.applies_to === 'categories') {
        const ids = offer.selected_categories || offer.applied_ids || [];
        const categoryId = Number(product.category_id || product.category?.id);
        return Array.isArray(ids) && ids.some((id) => Number(id) === categoryId);
      }
      return false;
    }) || null;
  };

  const calculateDiscountFromOffer = (product, offer) => {
    if (!offer) return 0;
    if (offer.type === 'percentage' || offer.discount_type === 'percentage') {
      return Number(offer.value ?? offer.discount_value ?? offer.discount ?? 0) || 0;
    }
    const price = Number(product?.price) || 0;
    const fixed = Number(offer.value ?? offer.discount_value ?? offer.discount ?? 0) || 0;
    return price > 0 ? (fixed / price) * 100 : 0;
  };

  const calculatePriceWithOffer = (product, offer) => {
    const price = Number(product?.price) || 0;
    return price * (1 - calculateDiscountFromOffer(product, offer) / 100);
  };

  return {
    offers,
    loading,
    fetchOffers,
    getActiveOfferForProduct,
    calculateDiscountFromOffer,
    calculatePriceWithOffer,
    get offersSource() { return lastOffersSource; },
  };
}
