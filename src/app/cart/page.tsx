'use client';

import Image from 'next/image';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const {
    cartItems,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
  } = useCart();

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-center tracking-tight">
        Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-zinc-400 text-lg">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-8">
            {cartItems.map(({ id, name, price, image, quantity }) => (
              <div
                key={id}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-zinc-900 p-6 rounded-xl shadow-lg"
              >
                <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-zinc-700">
                  <Image src={image} alt={name} fill className="object-cover" />
                </div>

                <div className="flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold">{name}</h2>
                  <p className="text-zinc-400 mt-1">₹{price.toLocaleString()}</p>

                  <div className="flex items-center mt-4 space-x-4">
                    <div className="flex items-center border border-zinc-700 rounded-md overflow-hidden">
                      <button
                        onClick={() => decrementQuantity(id)}
                        className="px-3 py-1 text-xl font-bold hover:bg-zinc-800 transition"
                        aria-label={`Decrease quantity of ${name}`}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 bg-zinc-800">{quantity}</span>
                      <button
                        onClick={() => incrementQuantity(id)}
                        className="px-3 py-1 text-xl font-bold hover:bg-zinc-800 transition"
                        aria-label={`Increase quantity of ${name}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(id)}
                      className="text-red-500 hover:text-red-400 font-semibold transition"
                      aria-label={`Remove ${name} from cart`}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 sm:w-28 text-right text-lg font-semibold">
                  ₹{(price * quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-zinc-700 pt-8 flex flex-col sm:flex-row items-center justify-between">
            <div className="text-2xl font-bold tracking-tight">
              Total: ₹{totalPrice.toLocaleString()}
            </div>
            <button
              className="mt-4 sm:mt-0 px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition"
              onClick={() => alert('Proceeding to checkout...')}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </main>
  );
}
