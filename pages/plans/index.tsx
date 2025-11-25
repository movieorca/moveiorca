import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { Plan } from '@/types';

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchPlans();
  }, [filter]);

  const fetchPlans = async () => {
    try {
      const url = filter === 'all' ? '/api/plans' : `/api/plans?category=${filter}`;
      const response = await axios.get(url);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (planId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    try {
      await axios.post('/api/cart', { planId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Plan added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  return (
    <>
      <Head>
        <title>Our Plans - RDP Hosting</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                RDP Hosting
              </Link>
              <div className="space-x-4">
                <Link href="/" className="text-gray-700 hover:text-primary-600">
                  Home
                </Link>
                <Link href="/auth/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-center mb-8">Choose Your Perfect Plan</h1>

          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              All Plans
            </button>
            <button
              onClick={() => setFilter('RDP')}
              className={`px-6 py-2 rounded-lg font-semibold ${filter === 'RDP' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              RDP
            </button>
            <button
              onClick={() => setFilter('VPS')}
              className={`px-6 py-2 rounded-lg font-semibold ${filter === 'VPS' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              VPS
            </button>
            <button
              onClick={() => setFilter('Shared')}
              className={`px-6 py-2 rounded-lg font-semibold ${filter === 'Shared' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Shared
            </button>
          </div>

          {loading ? (
            <div className="text-center">Loading plans...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-primary-600 font-semibold mb-2">
                        {plan.category}
                      </div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                    </div>
                  </div>

                  <div className="text-4xl font-bold text-primary-600 mb-4">
                    PKR {plan.monthly_price}
                    <span className="text-sm text-gray-500 font-normal">/month</span>
                  </div>

                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <div className="text-gray-500">RAM</div>
                      <div className="font-semibold">{plan.ram}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">CPU</div>
                      <div className="font-semibold">{plan.cpu}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Storage</div>
                      <div className="font-semibold">{plan.storage}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Bandwidth</div>
                      <div className="font-semibold">{plan.bandwidth}</div>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => addToCart(plan.id)}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
