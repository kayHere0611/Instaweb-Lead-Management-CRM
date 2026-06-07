"use client";
import { useState, useEffect } from 'react';

export default function Page() {
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', status: 'New' });
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null); // Tracks the ID of the lead being edited
  
  const handleEditClick = (lead) => {
    setEditingId(lead._id);
    setFormData({ name: lead.name, email: lead.email, status: lead.status });
    setIsModalOpen(true);
  };

  const fetchLeads = async () => {
    console.log("Fetching leads for:", search);
    try {
      const res = await fetch(`/api/leads?search=${search}`);
      const data = await res.json();
      setLeads(data);
    } catch (e) { 
      console.error("Fetch failed", e); 
    }
  };

  useEffect(() => { fetchLeads(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting data:", formData);
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { ...formData, _id: editingId } : formData;

    try {
      const res = await fetch('/api/api/leads' ? '/api/leads' : '/api/leads', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null); // Reset edit state
        setFormData({ name: '', email: '', status: 'New' });
        fetchLeads();
      }
      else {
        const errorData = await res.json();
        alert(`Failed to save lead: ${errorData.error || res.statusText}`);
      }
    } catch (e) {
      console.error("Operation failed", e);
    }
  };

  return (
    <div className="p-10 bg-white text-black min-h-screen">
      {/* Logo-Nav */}
      <nav className="glass-nav justify-between w-full">
        <div className="logo-box">
          <img src="/logo.jpg" alt="Logo" className="object-cover" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
          CRM Leads Dashboard</h1>
        <button 
          onClick={() => {
            setEditingId(null); 
            setFormData({ name: '', email: '', status: 'New' });            
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >+ Add Lead</button>
      </nav>
        
      
      {/* Search Bar */}
      <div className="mb-4 pt-20">
        <input
          type="text"
          placeholder="Search leads by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Leads</p>
          <p className="text-2xl font-bold text-blue-900">{leads.length}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">In Progress (Contacted)</p>
          <p className="text-2xl font-bold text-yellow-900">
          {Array.isArray(leads) ? leads.filter(l => l.status === 'Contacted').length : 0}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-600">Won (Qualified)</p>
          <p className="text-2xl font-bold text-green-900">
          {Array.isArray(leads) ? leads.filter(l => l.status === 'Qualified').length : 0}</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {Array.isArray(leads) ? (
            leads.map(l => (
              <tr key={l._id} className="hover:bg-gray-50">
                <td className="p-2 border text-black">{l.name}</td>
                <td className="p-2 border text-black">{l.email}</td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    l.status === 'Qualified' ? 'bg-green-100 text-green-700' : 
                    l.status === 'Contacted' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>  {l.status || 'New'}
                  </span>
                </td>
                <td className="p-2 border text-right">
                  <button 
                    onClick={() => handleEditClick(l)}
                    className="text-blue-500 hover:text-blue-700 font-medium text-sm mr-3"
                    > Edit
                  </button>
                  <button 
                    onClick={async () => {
                      await fetch(`/api/leads?id=${l._id}`, { method: 'DELETE' });
                      fetchLeads(); // Refresh list
                    }}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  > Delete </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">
                Connecting to cloud database...
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        /* This backdrop covers the whole screen and darkens the background */
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96 border">  
            <h2 className="text-xl font-bold mb-4 text-black">{editingId ? "Edit Lead Details" : "Add New Lead"}</h2>          
      
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name Input Field */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Lead Name</label>
                <input 
                  placeholder="Name" 
                  value={formData.name} 
                  className="border p-2 rounded text-black bg-white"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              {/* Email Input Field */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Email Address</label>
                <input 
                  placeholder="Email" 
                  type="email"
                  value={formData.email} 
                  className="border p-2 rounded text-black bg-white"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              {/* Status Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="border p-2 rounded text-black bg-white w-full"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded flex-1">
                  {editingId ? "Update Lead" : "Save"}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                  }} 
                  className="bg-gray-200 px-4 py-2 rounded flex-1 text-black"
                >
                  Cancel
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}
    </div>
  );
}