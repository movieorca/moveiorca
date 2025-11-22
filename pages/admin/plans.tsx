import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Plan {
  id?: number;
  name: string;
  slug: string;
  category: 'RDP' | 'VPS' | 'Shared' | 'GPU-RDP';
  description: string;
  features: string[];
  daily_price: number;
  weekly_price: number;
  monthly_price: number;
  discount_6months: number;
  discount_yearly: number;
  is_popular_daily: boolean;
  is_popular_weekly: boolean;
  is_popular_monthly: boolean;
  ram: string;
  cpu: string;
  vcpu: number;
  storage: string;
  bandwidth: string;
  admin_access: boolean;
  dedicated_ip: boolean;
  max_users: number;
  gpu_type?: string;
  gpu_memory?: string;
  countries: string[];
  windows_os: number[];
  sort_order: number;
  is_active: boolean;
}

export default function AdminPlans() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [windowsOS, setWindowsOS] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [featureInput, setFeatureInput] = useState('');

  const emptyPlan: Plan = {
    name: '',
    slug: '',
    category: 'RDP',
    description: '',
    features: [],
    daily_price: 0,
    weekly_price: 0,
    monthly_price: 0,
    discount_6months: 0,
    discount_yearly: 0,
    is_popular_daily: false,
    is_popular_weekly: false,
    is_popular_monthly: false,
    ram: '',
    cpu: '',
    vcpu: 1,
    storage: '',
    bandwidth: '',
    admin_access: true,
    dedicated_ip: true,
    max_users: 1,
    countries: [],
    windows_os: [],
    sort_order: 0,
    is_active: true,
  };

  const [formData, setFormData] = useState<Plan>(emptyPlan);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/auth/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      router.push('/');
      return;
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [plansRes, countriesRes, windowsRes] = await Promise.all([
        axios.get('/api/admin/plans', { headers }),
        axios.get('/api/countries'),
        axios.get('/api/windows'),
      ]);

      setPlans(plansRes.data);
      setCountries(countriesRes.data);
      setWindowsOS(windowsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingPlan?.id) {
        await axios.put('/api/admin/plans', { ...formData, id: editingPlan.id }, { headers });
        alert('Plan updated successfully!');
      } else {
        await axios.post('/api/admin/plans', formData, { headers });
        alert('Plan created successfully!');
      }

      setShowForm(false);
      setEditingPlan(null);
      setFormData(emptyPlan);
      fetchData();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      alert(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleEdit = (plan: any) => {
    const countryCodes = plan.countries?.map((c: any) => c.code) || [];
    const osIds = plan.windows_versions?.map((w: any) => w.id) || [];

    setEditingPlan(plan);
    setFormData({
      ...plan,
      countries: countryCodes,
      windows_os: osIds,
      features: plan.features || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/admin/plans', {
        headers: { Authorization: `Bearer ${token}` },
        data: { id }
      });
      alert('Plan deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const toggleCountry = (code: string) => {
    setFormData({
      ...formData,
      countries: formData.countries.includes(code)
        ? formData.countries.filter(c => c !== code)
        : [...formData.countries, code]
    });
  };

  const toggleOS = (id: number) => {
    setFormData({
      ...formData,
      windows_os: formData.windows_os.includes(id)
        ? formData.windows_os.filter(w => w !== id)
        : [...formData.windows_os, id]
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Manage Plans - Admin Panel</title>
      </Head>

      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Manage Plans</h1>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingPlan(null);
                  setFormData(emptyPlan);
                }}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                {showForm ? 'Cancel' : 'Add New Plan'}
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Plan Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="RDP Mini"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Slug *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="rdp-mini"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="RDP">RDP</option>
                      <option value="VPS">VPS</option>
                      <option value="Shared">Shared Hosting</option>
                      <option value="GPU-RDP">GPU RDP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Perfect for individual users and light workloads"
                  />
                </div>

                {/* Pricing */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Pricing (PKR)</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Daily Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.daily_price}
                        onChange={(e) => setFormData({ ...formData, daily_price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Weekly Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.weekly_price}
                        onChange={(e) => setFormData({ ...formData, weekly_price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="750"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Monthly Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.monthly_price}
                        onChange={(e) => setFormData({ ...formData, monthly_price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="1999"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">6-Month Discount (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discount_6months}
                        onChange={(e) => setFormData({ ...formData, discount_6months: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Yearly Discount (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discount_yearly}
                        onChange={(e) => setFormData({ ...formData, discount_yearly: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="15"
                      />
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">RAM</label>
                      <input
                        type="text"
                        value={formData.ram}
                        onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="6GB"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">CPU</label>
                      <input
                        type="text"
                        value={formData.cpu}
                        onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="4 vCPU"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">vCPU Cores</label>
                      <input
                        type="number"
                        value={formData.vcpu}
                        onChange={(e) => setFormData({ ...formData, vcpu: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Storage</label>
                      <input
                        type="text"
                        value={formData.storage}
                        onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="120GB SSD"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Bandwidth</label>
                      <input
                        type="text"
                        value={formData.bandwidth}
                        onChange={(e) => setFormData({ ...formData, bandwidth: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="3TB/Month"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Max Users</label>
                      <input
                        type="number"
                        value={formData.max_users}
                        onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {formData.category === 'GPU-RDP' && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">GPU Type</label>
                        <input
                          type="text"
                          value={formData.gpu_type || ''}
                          onChange={(e) => setFormData({ ...formData, gpu_type: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="NVIDIA RTX 4090"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">GPU Memory</label>
                        <input
                          type="text"
                          value={formData.gpu_memory || ''}
                          onChange={(e) => setFormData({ ...formData, gpu_memory: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="24GB GDDR6X"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Features</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="💻 4 vCPU"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded">
                        <span className="flex-1">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Countries */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Available Countries</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {countries.map((country) => (
                      <label key={country.code} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.countries.includes(country.code)}
                          onChange={() => toggleCountry(country.code)}
                          className="w-4 h-4"
                        />
                        <span>{country.flag_emoji} {country.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Windows OS */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Available Windows OS</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {windowsOS.map((os) => (
                      <label key={os.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.windows_os.includes(os.id)}
                          onChange={() => toggleOS(os.id)}
                          className="w-4 h-4"
                        />
                        <span>{os.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Most Popular */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Mark as Most Popular</h3>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_popular_daily}
                        onChange={(e) => setFormData({ ...formData, is_popular_daily: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Daily Plans</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_popular_weekly}
                        onChange={(e) => setFormData({ ...formData, is_popular_weekly: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Weekly Plans</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_popular_monthly}
                        onChange={(e) => setFormData({ ...formData, is_popular_monthly: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Monthly Plans</span>
                    </label>
                  </div>
                </div>

                {/* Options */}
                <div className="border-t pt-6">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.admin_access}
                        onChange={(e) => setFormData({ ...formData, admin_access: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Full Admin Access</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.dedicated_ip}
                        onChange={(e) => setFormData({ ...formData, dedicated_ip: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Dedicated IP</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                  >
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPlan(null);
                      setFormData(emptyPlan);
                    }}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Plans List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">All Plans ({plans.length})</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Pricing</th>
                    <th className="px-4 py-3 text-left">Countries</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="border-t">
                      <td className="px-4 py-3">{plan.sort_order}</td>
                      <td className="px-4 py-3 font-semibold">{plan.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {plan.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {plan.daily_price && <div>Daily: Rs.{plan.daily_price}</div>}
                        {plan.weekly_price && <div>Weekly: Rs.{plan.weekly_price}</div>}
                        <div>Monthly: Rs.{plan.monthly_price}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {plan.countries?.slice(0, 3).map((c: any) => (
                            <span key={c.code} title={c.name}>{c.flag}</span>
                          ))}
                          {plan.countries?.length > 3 && <span>+{plan.countries.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {plan.is_active ? (
                          <span className="text-green-600 font-semibold">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
