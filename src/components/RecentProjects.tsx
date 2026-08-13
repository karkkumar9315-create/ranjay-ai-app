import React, { useState, useEffect } from 'react';
import { ProjectItem } from '../types';
import { getProjectsApi, deleteProjectApi } from '../services/api';
import { Folder, Search, Trash2, ExternalLink, Calendar, Edit3, Loader2 } from 'lucide-react';
import { ProjectModal } from './ProjectModal';

interface RecentProjectsProps {
  refreshTrigger?: number;
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({ refreshTrigger }) => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const list = await getProjectsApi();
      setProjects(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [refreshTrigger]);

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

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-sm">
            📁
          </div>
          <h3 className="text-base font-bold text-slate-100">RECENT PROJECTS</h3>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Loading saved projects...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 p-6 space-y-1">
          <p className="text-sm font-semibold text-slate-400">No projects found</p>
          <p className="text-xs text-slate-500">
            {searchQuery ? 'Try another search term' : 'Generated scripts, thumbnails & ideas will appear here automatically'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedProject(item)}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 shrink-0">
                    {item.type}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                    {item.title}
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  {item.platform && <span>• {item.platform}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(item);
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-800"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open</span>
                </button>

                <button
                  onClick={(e) => handleDelete(item.id, item.title, e)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onDeleted={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
        />
      )}
    </div>
  );
};
