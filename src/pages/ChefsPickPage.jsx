import { useTranslation } from 'react-i18next'
import { fetchChefsPickProducts } from '../api/products.js'
import { CollectionPage } from './CollectionPage.jsx'

export const ChefsPickPage = () => {
  const { t } = useTranslation()
  return <CollectionPage title={t('catalog.chefsPickTitle')} fetchProducts={fetchChefsPickProducts} />
}
