import { useTranslation } from 'react-i18next'
import { fetchFeaturedProducts } from '../api/products.js'
import { CollectionPage } from './CollectionPage.jsx'

export const FeaturedPage = () => {
  const { t } = useTranslation()
  return <CollectionPage title={t('catalog.featuredTitle')} fetchProducts={fetchFeaturedProducts} />
}
