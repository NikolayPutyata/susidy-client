import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchAllProducts } from '../api/products.js'
import { ADDON_TYPES } from '../lib/addons.js'
import { CITIES } from '../lib/constants.js'

const priceFieldFor = (city) =>
  CITIES.find((c) => c.value === city)?.priceField || 'priceKiev'

// The 3 real sauce/ginger/wasabi catalog products, keyed by addonType —
// needed so the free-addon system (cartSlice.js) can create a brand-new
// addon line with a real name/price/image instead of inventing one.
// Loaded once at app bootstrap (see App.jsx) and refreshed on city switch
// alongside the cart's own reprice, so prices stay in sync.
export const loadAddonCatalog = createAsyncThunk(
  'addons/loadCatalog',
  async (_, { getState }) => {
    const products = await fetchAllProducts()
    const city = getState().city.city
    const priceField = priceFieldFor(city)

    const catalog = {}
    for (const product of products) {
      if (!ADDON_TYPES.includes(product.addonType)) continue
      catalog[product.addonType] = {
        product_id: product._id,
        productName: product.name,
        price: product[priceField],
        image: product.images?.[0] || '',
        weight: product.weight,
        addonType: product.addonType,
        category: product.category,
      }
    }
    return catalog
  },
)

const addonsSlice = createSlice({
  name: 'addons',
  initialState: { catalog: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadAddonCatalog.fulfilled, (state, action) => {
      state.catalog = action.payload
    })
  },
})

export default addonsSlice.reducer

export const selectAddonCatalog = (state) => state.addons.catalog
