import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Server, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ChevronRight,
  Database,
  Globe,
  Users,
  Layout,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Asset, Risk, AssetType, Criticality } from './types';

const COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'risks' | 'reports'>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showRiskForm, setShowRiskForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, risksRes] = await Promise.all([
        fetch('/api/assets'),
        fetch('/api/risks')
      ]);
      const assetsData = await assetsRes.json();
      const risksData = await risksRes.json();
      setAssets(assetsData);
      setRisks(risksData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAsset = {
      name: formData.get('name') as string,
      type: formData.get('type') as AssetType,
      criticality: formData.get('criticality') as Criticality,
      owner: formData.get('owner') as string,
    };

    try {
      await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset),
      });
      setShowAssetForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleAddRisk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRisk = {
      asset_id: parseInt(formData.get('asset_id') as string),
      threat: formData.get('threat') as string,
      vulnerability: formData.get('vulnerability') as string,
      likelihood: parseInt(formData.get('likelihood') as string),
      impact: parseInt(formData.get('impact') as string),
      mitigation_strategy: formData.get('mitigation_strategy') as string,
    };

    try {
      await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRisk),
      });
      setShowRiskForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding risk:', error);
    }
  };

  const handleDeleteRisk = async (id: number) => {
    try {
      await fetch(`/api/risks/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting risk:', error);
    }
  };

  const getRiskStats = () => {
    const stats: Record<string, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0
    };
    risks.forEach(r => {
      if (stats[r.risk_level] !== undefined) {
        stats[r.risk_level]++;
      }
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'Server': return <Server className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Network': return <Globe className="w-4 h-4" />;
      case 'Employee': return <Users className="w-4 h-4" />;
      case 'Application': return <Layout className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (loading && assets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-bold text-lg leading-tight">RiskGuard <br/><span className="text-xs font-normal text-slate-400 uppercase tracking-widest">Cyber Analyst</span></h1>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'assets' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Server className="w-5 h-5" />
            <span>Asset Inventory</span>
          </button>
          <button 
            onClick={() => setActiveTab('risks')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'risks' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Risk Assessment</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileText className="w-5 h-5" />
            <span>Risk Reports</span>
          </button>
        </nav>

        <div className="mt-auto p-4 bg-slate-800 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 uppercase font-bold mb-2">Intern Profile</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">RA</div>
            <div>
              <p className="text-sm font-medium">Risk Analyst</p>
              <p className="text-[10px] text-slate-500">Junior Intern</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-slate-500 text-sm">Cybersecurity Risk Assessment and Management System</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAssetForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Asset
            </button>
            <button 
              onClick={() => setShowRiskForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Assessment
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Stats Overview */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Assets', value: assets.length, icon: <Server className="text-blue-500" /> },
                  { label: 'Identified Risks', value: risks.length, icon: <AlertTriangle className="text-amber-500" /> },
                  { label: 'Critical Risks', value: risks.filter(r => r.risk_level === 'Critical').length, icon: <Shield className="text-red-500" /> },
                  { label: 'Mitigated', value: risks.filter(r => r.status === 'Closed').length, icon: <CheckCircle2 className="text-emerald-500" /> },
                ].map((stat, i) => (
                  <div key={i} className="card p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">{stat.icon}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="lg:col-span-2 card p-6">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" /> Risk Distribution by Level
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getRiskStats()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {getRiskStats().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-600" /> Asset Criticality
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Critical', value: assets.filter(a => a.criticality === 'Critical').length },
                          { name: 'High', value: assets.filter(a => a.criticality === 'High').length },
                          { name: 'Medium', value: assets.filter(a => a.criticality === 'Medium').length },
                          { name: 'Low', value: assets.filter(a => a.criticality === 'Low').length },
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {['Critical', 'High', 'Medium', 'Low'].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry as keyof typeof COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Risks Table */}
              <div className="lg:col-span-3 card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold">Prioritized Risk Registry</h3>
                  <button onClick={() => setActiveTab('risks')} className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Asset</th>
                        <th className="px-6 py-4">Threat</th>
                        <th className="px-6 py-4">Likelihood</th>
                        <th className="px-6 py-4">Impact</th>
                        <th className="px-6 py-4">Level</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {risks.slice(0, 5).map(risk => (
                        <tr key={risk.id} className="data-row">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-slate-100 rounded text-slate-600">
                                {getAssetIcon(assets.find(a => a.id === risk.asset_id)?.type || 'Server')}
                              </div>
                              <span className="text-sm font-medium">{risk.asset_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{risk.threat}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i <= risk.likelihood ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i <= risk.impact ? 'bg-rose-500' : 'bg-slate-200'}`} />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              risk.risk_level === 'Critical' ? 'bg-red-100 text-red-700' :
                              risk.risk_level === 'High' ? 'bg-orange-100 text-orange-700' :
                              risk.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {risk.risk_level}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleDeleteRisk(risk.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'assets' && (
            <motion.div 
              key="assets"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {assets.map(asset => (
                <div key={asset.id} className="card p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      {getAssetIcon(asset.type)}
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      asset.criticality === 'Critical' ? 'bg-red-100 text-red-700' :
                      asset.criticality === 'High' ? 'bg-orange-100 text-orange-700' :
                      asset.criticality === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {asset.criticality}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{asset.name}</h4>
                    <p className="text-sm text-slate-500">{asset.type}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-600 font-medium">{asset.owner}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'risks' && (
            <motion.div 
              key="risks"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Asset</th>
                      <th className="px-6 py-4">Threat & Vulnerability</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4">Mitigation Strategy</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {risks.map(risk => (
                      <tr key={risk.id} className="data-row">
                        <td className="px-6 py-4 align-top">
                          <p className="text-sm font-bold">{risk.asset_name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">ID: #{risk.id}</p>
                        </td>
                        <td className="px-6 py-4 align-top max-w-xs">
                          <p className="text-sm font-medium text-slate-900">Threat: {risk.threat}</p>
                          <p className="text-xs text-slate-500 mt-1">Vuln: {risk.vulnerability}</p>
                        </td>
                        <td className="px-6 py-4 align-top text-center">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                            risk.risk_level === 'Critical' ? 'bg-red-100 text-red-700' :
                            risk.risk_level === 'High' ? 'bg-orange-100 text-orange-700' :
                            risk.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {risk.risk_score}
                          </div>
                          <p className="text-[10px] font-bold uppercase mt-1 text-slate-400">{risk.risk_level}</p>
                        </td>
                        <td className="px-6 py-4 align-top max-w-sm">
                          <p className="text-xs text-slate-600 leading-relaxed italic">"{risk.mitigation_strategy}"</p>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                            {risk.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <button onClick={() => handleDeleteRisk(risk.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto bg-white p-12 shadow-xl border border-slate-200 rounded-none"
            >
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tighter">Risk Assessment Report</h1>
                  <p className="text-slate-500 font-mono text-sm mt-2">CONFIDENTIAL // INTERNAL USE ONLY</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-slate-500 text-sm">Ref: CYBER-RISK-2026-001</p>
                </div>
              </div>

              <section className="mb-10">
                <h3 className="text-xl font-bold mb-4 border-l-4 border-indigo-600 pl-3">1. Executive Summary</h3>
                <p className="text-slate-700 leading-relaxed">
                  This report outlines the current cybersecurity risk posture of the organization. A total of {assets.length} critical assets were analyzed, identifying {risks.length} active threats. 
                  The current landscape shows {risks.filter(r => r.risk_level === 'Critical').length} critical vulnerabilities requiring immediate remediation.
                </p>
              </section>

              <section className="mb-10">
                <h3 className="text-xl font-bold mb-4 border-l-4 border-indigo-600 pl-3">2. Risk Matrix Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="p-6 bg-slate-50 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-4">Risk Levels</p>
                    <div className="space-y-3">
                      {['Critical', 'High', 'Medium', 'Low'].map(level => (
                        <div key={level} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{level}</span>
                          <span className="font-bold">{risks.filter(r => r.risk_level === level).length}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-4">Asset Coverage</p>
                    <div className="space-y-3">
                      {['Server', 'Database', 'Network', 'Application'].map(type => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{type}</span>
                          <span className="font-bold">{assets.filter(a => a.type === type).length}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h3 className="text-xl font-bold mb-4 border-l-4 border-indigo-600 pl-3">3. High-Priority Remediation Plan</h3>
                <div className="space-y-4">
                  {risks.filter(r => r.risk_score >= 15).map(risk => (
                    <div key={risk.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-slate-900">{risk.asset_name} - {risk.threat}</span>
                        <span className="text-red-600 font-bold text-xs uppercase">Priority: {risk.risk_level}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2"><span className="font-semibold">Vulnerability:</span> {risk.vulnerability}</p>
                      <p className="text-sm text-indigo-700 bg-indigo-50 p-2 rounded"><span className="font-semibold">Mitigation:</span> {risk.mitigation_strategy}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-20 pt-8 border-t border-slate-200 flex justify-between">
                <div className="text-center">
                  <div className="w-32 sm:w-48 border-b border-slate-900 mb-2"></div>
                  <p className="text-[10px] sm:text-xs font-bold">Risk Analyst Intern</p>
                </div>
                <div className="text-center">
                  <div className="w-32 sm:w-48 border-b border-slate-900 mb-2"></div>
                  <p className="text-[10px] sm:text-xs font-bold">CISO / Security Manager</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Asset Form Modal */}
      {showAssetForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-6">Register New Asset</h3>
            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asset Name</label>
                <input name="name" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Production DB" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                  <select name="type" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>Server</option>
                    <option>Database</option>
                    <option>Network</option>
                    <option>Employee</option>
                    <option>Application</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Criticality</label>
                  <select name="criticality" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Owner / Department</label>
                <input name="owner" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. IT Security" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAssetForm(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Save Asset</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Risk Form Modal */}
      {showRiskForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-6">New Risk Assessment</h3>
            <form onSubmit={handleAddRisk} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Asset</label>
                <select name="asset_id" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Threat</label>
                  <input name="threat" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Data Breach" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vulnerability</label>
                  <input name="vulnerability" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Outdated Software" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Likelihood (1-5)</label>
                  <select name="likelihood" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    {[1, 2, 3, 4, 5].map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Impact (1-5)</label>
                  <select name="impact" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    {[1, 2, 3, 4, 5].map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mitigation Strategy</label>
                <textarea name="mitigation_strategy" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]" placeholder="Describe how to reduce this risk..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowRiskForm(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Calculate & Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
