import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  ChevronDown,
  Layout,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';

const ContentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pages' | 'faqs' | 'settings'>('pages');

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-snow-white mb-2 font-display tracking-tight">Headless CMS</h1>
          <p className="text-gray-400">Manage marketing content, FAQs, and global system variables.</p>
        </div>
        <div className="flex bg-charcoal/50 p-1 rounded-2xl border border-white/5 backdrop-blur-sm">
          <TabButton active={activeTab === 'pages'} onClick={() => setActiveTab('pages')} icon={<FileText size={18}/>} label="Pages" />
          <TabButton active={activeTab === 'faqs'} onClick={() => setActiveTab('faqs')} icon={<HelpCircle size={18}/>} label="FAQs" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Settings" />
        </div>
      </div>

      <div className="glass-panel min-h-[600px] rounded-3xl border border-white/10 bg-charcoal/30 overflow-hidden">
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
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm ${
      active ? 'bg-hive-green text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
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
      // Ensure structuredData is valid JSON if edited as string
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Selected Page:</label>
          <div className="relative">
            <select 
              value={selectedSlug} 
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 pr-10 appearance-none focus:outline-none focus:border-neon-green text-sm font-bold capitalize"
            >
              {slugs.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-neon-green text-deep-forest font-bold rounded-xl hover:bg-white transition-all shadow-lg"
        >
          <Save size={18} /> {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-neon-green font-mono">LOADING SOURCE...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">SEO Title</label>
              <input 
                value={pageData.pageTitle} 
                onChange={e => setPageData({...pageData, pageTitle: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-neon-green"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Meta Description</label>
              <textarea 
                rows={3}
                value={pageData.metaDescription || ''} 
                onChange={e => setPageData({...pageData, metaDescription: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-neon-green resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">HTML Body (Rich Content)</label>
              <textarea 
                rows={12}
                value={pageData.htmlBody || ''} 
                onChange={e => setPageData({...pageData, htmlBody: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-neon-green font-mono text-xs"
                placeholder="<p>Standard HTML allowed here...</p>"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 text-honey-gold">Structured Data (JSON)</label>
              <textarea 
                rows={20}
                value={typeof pageData.structuredData === 'string' ? pageData.structuredData : JSON.stringify(pageData.structuredData, null, 2)} 
                onChange={e => setPageData({...pageData, structuredData: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-honey-gold font-mono text-xs h-[480px]"
                placeholder='{ "hero": { "title": "...", "subtitle": "..." } }'
              />
              <p className="mt-2 text-[10px] text-gray-500 flex items-center gap-1"><AlertCircle size={10}/> Use this for hero text, feature lists, and pricing tiers.</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={pageData.isPublished} 
                onChange={e => setPageData({...pageData, isPublished: e.target.checked})}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-neon-green focus:ring-neon-green"
              />
              <label className="text-sm font-bold text-gray-400">Published to Live Site</label>
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
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const handleUpdate = async (id: string, data: any) => {
    try {
      await apiFetch(`/api/admin/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      setEditingId(null);
      fetchFaqs();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="p-8">
      <div className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neon-green mb-4">Add New FAQ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input 
            placeholder="Question"
            value={newFaq.question}
            onChange={e => setNewFaq({...newFaq, question: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-neon-green"
          />
          <input 
            type="number"
            placeholder="Order"
            value={newFaq.displayOrder}
            onChange={e => setNewFaq({...newFaq, displayOrder: parseInt(e.target.value)})}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-neon-green w-24"
          />
        </div>
        <textarea 
          placeholder="Answer"
          rows={3}
          value={newFaq.answer}
          onChange={e => setNewFaq({...newFaq, answer: e.target.value})}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-neon-green mb-4 resize-none"
        />
        <button onClick={handleAdd} className="flex items-center gap-2 px-6 py-2 bg-hive-green text-white font-bold rounded-xl hover:bg-neon-green transition-all">
          <Plus size={18} /> ADD FAQ
        </button>
      </div>

      <div className="space-y-4">
        {loading ? <div className="text-center py-10 text-gray-500">Syncing...</div> : (
          faqs.map(faq => (
            <div key={faq.id} className="p-6 bg-charcoal rounded-2xl border border-white/5 group hover:border-white/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-500">{faq.displayOrder}</span>
                  <h4 className="font-bold text-lg">{faq.question}</h4>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(faq.id)} className="p-2 text-gray-500 hover:text-honey-gold transition-colors"><ChevronDown size={18}/></button>
                  <button onClick={() => handleDelete(faq.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{faq.answer}</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${faq.isActive ? 'bg-neon-green' : 'bg-gray-700'}`}></div>
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

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-lg font-bold flex items-center gap-2"><Globe className="text-honey-gold"/> Global System Variables</h3>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-honey-gold text-deep-forest font-bold rounded-2xl hover:bg-white transition-all shadow-xl"
        >
          <Save size={20} /> {saving ? 'SAVING...' : 'UPDATE SETTINGS'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <SettingField label="Contact Email" k="contact_email" v={settings.contact_email} onChange={updateSetting} />
          <SettingField label="Support Phone" k="support_phone" v={settings.support_phone} onChange={updateSetting} />
          <SettingField label="Office Address" k="office_address" v={settings.office_address} onChange={updateSetting} />
        </div>
        <div className="space-y-8">
          <SettingField label="Facebook URL" k="facebook_url" v={settings.facebook_url} onChange={updateSetting} />
          <SettingField label="Twitter URL" k="twitter_url" v={settings.twitter_url} onChange={updateSetting} />
          <SettingField label="Telegram Group" k="telegram_url" v={settings.telegram_url} onChange={updateSetting} />
        </div>
      </div>
    </div>
  );
};

const SettingField = ({ label, k, v, onChange }: any) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">{label}</label>
    <div className="relative group">
      <input 
        value={v || ''} 
        onChange={e => onChange(k, e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-honey-gold transition-all group-hover:bg-white/10"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-mono text-[8px] tracking-tight">{k}</div>
    </div>
  </div>
);

export default ContentManager;
