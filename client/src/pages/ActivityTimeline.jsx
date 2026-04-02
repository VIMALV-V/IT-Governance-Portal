import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import { FiActivity, FiUser, FiClock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

function ActivityTimeline() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await API.get("/audit");
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch activity logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
               <FiActivity className="text-primary-600 dark:text-primary-400" />
               Activity Timeline
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Chronological record of system events and operations.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 sm:p-8">
          {loading ? (
             <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              <p>No activity has been recorded yet.</p>
            </div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 md:ml-6 space-y-8">
              <AnimatePresence>
                {logs.map((log, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={log._id} 
                    className="relative pl-6 md:pl-8 group"
                  >
                    {/* Timeline Node */}
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-white dark:bg-[#1e293b] border-2 border-primary-500 dark:border-primary-400 rounded-full group-hover:scale-125 transition-transform origin-center z-10"></div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                         <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-base">
                              {log.action}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                              {log.details || "No additional details"}
                            </p>
                         </div>
                         <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0f172a] px-2.5 py-1 rounded shadow-sm border border-slate-200 dark:border-white/10 shrink-0">
                           <FiClock />
                           {new Date(log.createdAt).toLocaleString()}
                         </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                         <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold">
                           {log.user?.name ? log.user.name.charAt(0).toUpperCase() : <FiUser />}
                         </div>
                         <div className="text-xs">
                           <span className="font-medium text-slate-900 dark:text-white">{log.user?.name || "System"}</span>
                           <span className="text-slate-500 mx-1">•</span>
                           <span className="text-slate-500">{log.user?.role || "Auto"}</span>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ActivityTimeline;
