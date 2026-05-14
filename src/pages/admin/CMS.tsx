import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Settings as SettingsIcon, 
  Save, 
  Plus, 
  Trash2, 
  ChevronDown,
  Globe,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

const CMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pages' | 'faqs' | 'settings'>('pages');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Content Management</h1>
          <p className="text-gray-500">Manage your site's marketing copy, FAQ database, and system-wide variables.</p>
        </div>
        <div className="flex bg-[#111827] p-1 rounded-2xl border border-gray-800 shadow-xl">
          <TabButton active={activeTab === 'pages'} onClick={() => setActiveTab('pages')} icon={<FileText size={16}/>} label="Pages" />
          <TabButton active={activeTab === 'faqs'} onClick={() => setActiveTab('faqs')} icon={<HelpCircle size={16}/>} label="FAQs" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={16}/>} label="Settings" />
        </div>
      </div>

      {/* Main Content Area (Unified Card Style) */}
      <div className="bg-[#111827] rounded-[2rem] border border-gray-800 shadow-2xl min-h-[600px] overflow-hidden">
        {activeTab === 'pages' && <PagesTab />}
        {activeTab === 'faqs' && <FaqsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-xs ${
      active ? 'bg-[#2E7D32] text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon} {label}
  </button>
);

/* --- PAGES TAB --- */
const PagesTab = () => {
  const slugs = ['home', 'about', 'contact', 'faq', 'features', 'fees', 'how-it-works', 'privacy-policy', 'security', 'terms-of-service'];
  const [selectedSlug, setSelectedSlug] = useState(slugs[0]);
  const [pageData, setPageData] = useState<any>({ pageTitle: '', metaDescription: '', htmlBody: '', structuredData: {}, isPublished: true });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/public/content/${selectedSlug}`);
        setPageData(data || { pageTitle: '', metaDescription: '', htmlBody: '', structuredData: {}, isPublished: true });
      } catch (err) {
        setPageData({ pageTitle: '', metaDescription: '', htmlBody: '', structuredData: {}, isPublished: true });
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [selectedSlug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalData = pageData.structuredData;
      if (typeof finalData === 'string') {
        try { finalData = JSON.parse(finalData); } catch(e) { alert("Invalid JSON in structured data"); return; }
      }
      
      await apiFetch(`/api/admin/content/${selectedSlug}`, {
        method: 'PUT',
        body: JSON.stringify({ ...pageData, structuredData: finalData })
      });
      alert("Page updated successfully");
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0B121F]/50 p-6 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Page Context:</label>
          <div className="relative flex-1 sm:flex-initial">
            <select 
              value={selectedSlug} 
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-2.5 pr-10 appearance-none focus:outline-none focus:border-[#7CB342] text-sm font-bold capitalize text-white"
            >
              {slugs.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-[#7CB342] text-[#0F1014] font-bold rounded-xl hover:bg-white transition-all shadow-lg disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />} {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-[#7CB342] font-mono animate-pulse">TERMINAL: SYNCING CONTENT_SOURCE...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FormInput label="SEO Title" value={pageData.pageTitle} onChange={v => setPageData({...pageData, pageTitle: v})} />
            <FormTextarea label="Meta Description" rows={3} value={pageData.metaDescription || ''} onChange={v => setPageData({...pageData, metaDescription: v})} />
            <FormTextarea label="HTML Body (Rich Content)" rows={12} value={pageData.htmlBody || ''} onChange={v => setPageData({...pageData, htmlBody: v})} fontMono />
          </div>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 text-[#FFC107]">Structured Data (JSON)</label>
              <textarea 
                rows={20}
                value={typeof pageData.structuredData === 'string' ? pageData.structuredData : JSON.stringify(pageData.structuredData, null, 2)} 
                onChange={e => setPageData({...pageData, structuredData: e.target.value})}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl p-4 focus:outline-none focus:border-[#FFC107] font-mono text-[11px] h-[480px] text-gray-300 custom-scroll shadow-inner"
                placeholder='{ "hero": { "title": "...", "subtitle": "..." } }'
              />
              <p className="mt-2 text-[10px] text-gray-500 flex items-center gap-1"><AlertCircle size={10}/> Data here drives the dynamic components on the frontend.</p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-800/20 rounded-xl border border-gray-800">
              <input 
                type="checkbox" 
                id="isPublished"
                checked={pageData.isPublished} 
                onChange={e => setPageData({...pageData, isPublished: e.target.checked})}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-[#7CB342] focus:ring-[#7CB342]"
              />
              <label htmlFor="isPublished" className="text-sm font-bold text-gray-400 cursor-pointer">Published to Live Site</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- FAQS TAB --- */
const FaqsTab = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', displayOrder: 0, isActive: true });

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/faqs');
      setFaqs(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFaqs(); }, []);

  const handleAdd = async () => {
    try {
      await apiFetch('/api/admin/faqs', { method: 'POST', body: JSON.stringify(newFaq) });
      setNewFaq({ question: '', answer: '', displayOrder: faqs.length + 1, isActive: true });
      fetchFaqs();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await apiFetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      fetchFaqs();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="p-8 space-y-10">
      <div className="p-8 bg-[#0B121F]/50 rounded-[2rem] border border-gray-800 relative overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#7CB342] mb-6 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Knowledge Base Entry
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input 
            placeholder="Question"
            value={newFaq.question}
            onChange={e => setNewFaq({...newFaq, question: e.target.value})}
            className="md:col-span-3 bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#7CB342] text-white text-sm"
          />
          <input 
            type="number"
            placeholder="Order"
            value={newFaq.displayOrder}
            onChange={e => setNewFaq({...newFaq, displayOrder: parseInt(e.target.value)})}
            className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#7CB342] text-white text-sm"
          />
        </div>
        <textarea 
          placeholder="Answer"
          rows={3}
          value={newFaq.answer}
          onChange={e => setNewFaq({...newFaq, answer: e.target.value})}
          className="w-full bg-gray-900/50 border border-gray-800 rounded-xl p-4 focus:outline-none focus:border-[#7CB342] mb-6 resize-none text-white text-sm"
        />
        <button onClick={handleAdd} className="flex items-center gap-2 px-8 py-3 bg-[#2E7D32] text-white font-bold rounded-xl hover:bg-[#7CB342] hover:text-[#0F1014] transition-all shadow-lg">
          Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? <div className="text-center py-20 text-gray-500 font-mono">RETRIEVING_DATA_STREAM...</div> : (
          faqs.map(faq => (
            <div key={faq.id} className="p-6 bg-gray-900/30 rounded-[1.5rem] border border-gray-800 group hover:border-[#7CB342]/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-700">{faq.displayOrder}</span>
                  <h4 className="font-bold text-lg text-white">{faq.question}</h4>
                </div>
                <button onClick={() => handleDelete(faq.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                  <Trash2 size={18}/>
                </button>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 pl-14">{faq.answer}</p>
              <div className="flex items-center gap-2 pl-14">
                <div className={`w-2 h-2 rounded-full ${faq.isActive ? 'bg-[#7CB342]' : 'bg-gray-700'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{faq.isActive ? 'Active' : 'Hidden'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* --- SETTINGS TAB --- */
const SettingsTab = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await apiFetch('/api/public/settings');
        setSettings(data || {});
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      alert("Settings updated");
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><Globe className="text-[#FFC107]"/> Global System Variables</h3>
          <p className="text-gray-500 text-sm">Update site-wide information, social links, and contact details.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-[#FFC107] text-[#0F1014] font-bold rounded-xl hover:bg-white transition-all shadow-xl disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={20} />} {saving ? 'UPDATING...' : 'UPDATE SETTINGS'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <SettingField label="Contact Email" k="contact_email" v={settings.contact_email} onChange={(k, v) => setSettings({...settings, [k]: v})} />
          <SettingField label="Support Phone" k="support_phone" v={settings.support_phone} onChange={(k, v) => setSettings({...settings, [k]: v})} />
          <SettingField label="Office Address" k="office_address" v={settings.office_address} onChange={(k, v) => setSettings({...settings, [k]: v})} />
        </div>
        <div className="space-y-6">
          <SettingField label="Facebook URL" k="facebook_url" v={settings.facebook_url} onChange={(k, v) => setSettings({...settings, [k]: v})} />
          <SettingField label="Twitter URL" k="twitter_url" v={settings.twitter_url} onChange={(k, v) => setSettings({...settings, [k]: v})} />
          <SettingField label="Telegram Group" k="telegram_url" v={settings.telegram_url} onChange={(k, v) => setSettings({...settings, [k]: v})} />
        </div>
      </div>
    </div>
  );
};

/* --- SHARED COMPONENTS --- */
const FormInput = ({ label, value, onChange }: any) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</label>
    <input 
      value={value || ''} 
      onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-900/50 border border-gray-800 rounded-xl p-3 focus:outline-none focus:border-[#7CB342] text-white text-sm transition-all"
    />
  </div>
);

const FormTextarea = ({ label, value, onChange, rows, fontMono }: any) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</label>
    <textarea 
      rows={rows}
      value={value || ''} 
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-gray-900/50 border border-gray-800 rounded-xl p-4 focus:outline-none focus:border-[#7CB342] text-white text-sm transition-all resize-none ${fontMono ? 'font-mono text-[11px]' : ''}`}
    />
  </div>
);

const SettingField = ({ label, k, v, onChange }: any) => (
  <div className="group">
    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 group-hover:text-[#FFC107] transition-colors">{label}</label>
    <div className="relative">
      <input 
        value={v || ''} 
        onChange={e => onChange(k, e.target.value)}
        className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl p-4 focus:outline-none focus:border-[#FFC107] text-white text-sm transition-all pr-24"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-600 uppercase">{k}</div>
    </div>
  </div>
);

export default CMS;
