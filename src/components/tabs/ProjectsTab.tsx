import React, { useState, useEffect } from 'react';
import { ProjectItem } from '../../types';
import { getProjectsApi, deleteProjectApi, saveProjectApi } from '../../services/api';
import { getFavoriteProjectIds, toggleFavoriteProject } from '../../services/storage';
import { Folder, Search, Download, Upload, Trash2, ExternalLink, Calendar, Loader2, RefreshCw, Star, Clock } from 'lucide-react';
import { ProjectModal } from '../ProjectModal';
import { HistorySection } from '../HistorySection';

export const ProjectsTab: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'projects' | 'history'>('projects');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjectsApi();
      setProjects(data);
      setFavoriteIds(getFavoriteProjectIds());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const categories = ['All', 'Favorites', 'Script', 'Thumbnail', 'Shorts', 'Ideas', 'Editing', 'TitleSEO', 'CompleteVideo'];

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete project "${title}"?`)) {
      try {
        await deleteProjectApi(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleFavoriteProject(id);
    if (updated) {
      setFavoriteIds((prev) => [...prev, id]);
    } else {
      setFavoriteIds((prev) => prev.filter((f) => f !== id));
    }
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `ranjay_ai_projects_backup_${Date.now()}.json`);
    dlAnchor.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported: ProjectItem[] = JSON.parse(evt.target?.result as string);
        if (Array.isArray(imported)) {
          for (const item of imported) {
            await saveProjectApi({
              title: item.title,
              type: item.type,
              topic: item.topic,
              platform: item.platform,
              language: item.language,
              content: item.content,
            });
          }
          await loadProjects();
          alert('Projects imported successfully!');
        }
      } catch (err) {
        alert('Invalid JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  const filteredProjects = projects.filter((p) => {
    const contentStr = typeof p.content === 'string' ? p.content : JSON.stringify(p.content);
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase()) ||
      (p.topic && p.topic.toLowerCase().includes(search.toLowerCase())) ||
      contentStr.toLowerCase().includes(search.toLowerCase());

    const isFav = favoriteIds.includes(p.id);
    if (selectedCategory === 'Favorites') return matchesSearch && isFav;
    const matchesCategory = selectedCategory === 'All' || p.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Tab Selector: Saved Projects vs Generation History */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'projects'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Saved Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Generation History</span>
          </button>
        </div>

        {activeTab === 'projects' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              disabled={projects.length === 0}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              title="Export JSON Backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>

            <button
              onClick={loadProjects}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {activeTab === 'history' ? (
        <HistorySection onSavedProject={loadProjects} />
      ) : (
        <>
          {/* Search & Category Filter Pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by title, topic, or content keywords..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const isFavCat = cat === 'Favorites';
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-1 px-3 text-xs rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                      isActive
                        ? isFavCat
                          ? 'bg-amber-500 text-slate-950 font-bold shadow'
                          : 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isFavCat && <Star className={`w-3 h-3 ${isActive ? 'fill-current' : ''}`} />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Loading project library...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800/80 p-8 space-y-2">
              <p className="text-sm font-bold text-slate-300">No saved projects found</p>
              <p className="text-xs text-slate-500">
                {search || selectedCategory !== 'All'
                  ? 'Try adjusting your search or category filter'
                  : 'Generate scripts, thumbnails or shorts to save them here!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProjects.map((item) => {
                const isFav = favoriteIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveProject(item)}
                    className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3 cursor-pointer group shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleToggleFavorite(item.id, e)}
                            className={`p-1 transition-transform hover:scale-110 ${
                              isFav ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                          </button>

                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {item.type}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 mt-2 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.topic && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">Topic: {item.topic}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => handleDelete(item.id, item.title, e)}
                        className="text-slate-500 hover:text-rose-400 p-1 text-xs"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                        <span>Open Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeProject && (
            <ProjectModal
              project={activeProject}
              onClose={() => setActiveProject(null)}
              onDeleted={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
              onUpdated={loadProjects}
            />
          )}
        </>
      )}
    </div>
  );
};
