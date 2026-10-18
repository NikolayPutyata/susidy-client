import { ProductCard } from './ProductCard.jsx'

// Shared loading/error/empty/grid presentation — used by the homepage's
// inline search results and CategoryPage, so both stay visually identical.
export const ProductGrid = ({ products, loading, error, emptyMessage }) => (
  <>
    {error && (
      <p className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
        {error}
      </p>
    )}

    {!loading && products.length === 0 && !error && (
      <p className="py-12 text-center text-text-muted">{emptyMessage}</p>
    )}

    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  </>
)
