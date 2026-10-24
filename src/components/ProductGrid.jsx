import { ProductCard } from './ProductCard.jsx'
import { ContentLoader } from './ContentLoader.jsx'

// Shared loading/error/empty/grid presentation — used by the homepage's
// inline search results, CategoryPage and CollectionPage, so all stay
// visually identical. While loading, the spinner replaces the grid
// entirely — including any previous page's products still in state.
export const ProductGrid = ({ products, loading, error, emptyMessage }) => {
  if (loading) return <ContentLoader />

  return (
    <>
      {error && (
        <p className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
          {error}
        </p>
      )}

      {products.length === 0 && !error && (
        <p className="py-12 text-center text-text-muted">{emptyMessage}</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </>
  )
}
