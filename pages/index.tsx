import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { Plan } from '@/types';

export default function Home() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>RDP Hosting - Premium VPS & RDP Services</title>
        <meta name="description" content="Professional RDP and VPS hosting solutions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-primary-600">
                RDP Hosting
              </div>
              <div className="space-x-4">
                <Link href="/plans" className="text-gray-700 hover:text-primary-600">
                  Plans
                </Link>
                <Link href="/auth/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link href="/auth/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                  Sign Up
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <main>
          <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-5xl font-bold mb-6">
                Premium RDP & VPS Hosting Solutions
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                High-performance servers with 24/7 support and guaranteed uptime
              </p>
              <Link href="/plans" className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-50 inline-block">
                View Plans
              </Link>
            </div>
          </section>

          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12">Featured Plans</h2>

              {loading ? (
                <div className="text-center">Loading plans...</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {plans.slice(0, 6).map((plan) => (
                    <div key={plan.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="text-sm text-primary-600 font-semibold mb-2">
                        {plan.category}
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                      <div className="text-3xl font-bold text-primary-600 mb-4">
                        PKR {plan.monthly_price}
                        <span className="text-sm text-gray-500 font-normal">/month</span>
                      </div>
                      <p className="text-gray-600 mb-6">{plan.description}</p>
                      <ul className="space-y-2 mb-6">
                        {plan.features.slice(0, 5).map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href={`/plans/${plan.id}`} className="block text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center mt-12">
                <Link href="/plans" className="text-primary-600 hover:text-primary-700 font-semibold">
                  View All Plans →
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-gray-100 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    ⚡
                  </div>
                  <h3 className="text-xl font-bold mb-2">High Performance</h3>
                  <p className="text-gray-600">Fast SSD storage and powerful processors for optimal performance</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🛡️
                  </div>
                  <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
                  <p className="text-gray-600">99.9% uptime guarantee with enterprise-grade security</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    💬
                  </div>
                  <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
                  <p className="text-gray-600">Expert support team available around the clock</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; {new Date().getFullYear()} RDP Hosting. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
