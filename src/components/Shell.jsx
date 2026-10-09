import React from 'react';
import { Activity, BarChart3, Database, FileText, Image as ImageIcon, Menu, Moon, Sun, X, Info } from 'lucide-react';

const navigation = [
  { id: 'text', label: 'Text Analysis', icon: FileText },
  { id: 'image', label: 'Image Analysis', icon: ImageIcon },
  { id: 'dataset', label: 'Dataset Analysis', icon: Database },
  { id: 'evaluation', label: 'Model Evaluation', icon: BarChart3 },
];

export default function Shell({ page, setPage, theme, toggleTheme, children, apiMode }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const changePage = id => { setPage(id); setMenuOpen(false); };
  return (
    <div className="app-layout">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><span className="brand-icon"><Activity size={22}/></span><div><strong>Sentiment<span>Lab</span></strong><small>Understand the tone</small></div>
          <button className="icon-btn sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={18}/></button>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'is-active' : ''}`} onClick={() => changePage(item.id)} aria-current={page === item.id ? 'page' : undefined}><item.icon size={18}/><span>{item.label}</span></button>)}
        </nav>
        <div className="sidebar-spacer"/>
        <div className="sidebar-card"><span className="sidebar-card-title"><Info size={16}/> Education model</span><p>Text, image and dataset tools in one focused workspace.</p></div>
        <div className="sidebar-footer"><span className={`api-dot ${apiMode === 'UI demo' || apiMode.includes('offline') ? 'demo' : ''}`}/><div><strong>{apiMode}</strong><small>SentimentLab v2 · JSX</small></div></div>
      </aside>
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)}/>}
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-btn menu-button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={21}/></button><span className="breadcrumb">Workspace <span>/</span> {navigation.find(x => x.id === page)?.label}</span></div>
          <div className="topbar-actions"><span className="api-status"><span className={`api-dot ${apiMode === 'UI demo' || apiMode.includes('offline') ? 'demo' : ''}`}/>{apiMode}</span><button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title="Toggle appearance">{theme === 'dark' ? <Moon size={17}/> : <Sun size={17}/>}<span>{theme === 'dark' ? 'Dark' : 'Light'}</span></button></div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
