'use client';

export default function BundlesSection() {
  const bundles = [
    {
      id: 1,
      products: ['Keyboard', 'Gaming Mouse'],
      totalPrice: 3499,
    },
    {
      id: 2,
      products: ['Denim Jacket', 'Sunglasses'],
      totalPrice: 2799,
    },
    {
      id: 3,
      products: ['Hoodie', 'Sneakers'],
      totalPrice: 3999,
    },
  ];

  return (
    <div className="bg-zinc-900 p-8 rounded-xl mt-10">
      <h2 className="text-white text-2xl font-semibold text-center mb-8">
        Frequently Bought Together
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 flex flex-col justify-between shadow-lg hover:shadow-indigo-500/20 transition-shadow"
          >
            <div className="mb-4">
              <h3 className="text-white text-lg font-semibold mb-2">Bundle #{bundle.id}</h3>
              <ul className="text-zinc-300 text-sm list-disc list-inside space-y-1">
                {bundle.products.map((product, idx) => (
                  <li key={idx}>{product}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-white font-medium text-base">
                ₹{bundle.totalPrice}
              </span>
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-md transition-colors">
                View Bundle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
