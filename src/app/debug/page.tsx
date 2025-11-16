"use client";

import { useStudyStore } from "@/store/use-study-store";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const store = useStudyStore();

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    const checkEverything = async () => {
      try {
        addLog("🔍 Debug başlatıldı");
        
        // 1. User kontrolü
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          addLog(`❌ User Error: ${userError.message}`);
        } else if (user) {
          addLog(`✅ User ID: ${user.id}`);
          setUser(user);
        } else {
          addLog("❌ User yok");
        }

        // 2. Store durumu
        addLog(`Store isInitialized: ${store.isInitialized}`);
        addLog(`Store userId: ${store.userId || 'null'}`);
        addLog(`Store profile: ${store.profile ? 'var' : 'yok'}`);
        addLog(`Study Entries: ${store.studyEntries.length}`);
        addLog(`Mock Exams: ${store.mockExams.length}`);

        // 3. LocalStorage kontrolü
        const localData = localStorage.getItem('yks-tracker-store');
        if (localData) {
          addLog(`✅ LocalStorage boyutu: ${(localData.length / 1024).toFixed(2)} KB`);
          try {
            const parsed = JSON.parse(localData);
            addLog(`LocalStorage state keys: ${Object.keys(parsed.state || {}).join(', ')}`);
          } catch (e) {
            addLog(`❌ LocalStorage parse hatası: ${e}`);
          }
        } else {
          addLog("❌ LocalStorage'da veri yok");
        }

        // 4. Supabase bağlantı testi
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
          
          if (error) {
            addLog(`❌ Supabase bağlantı hatası: ${error.message}`);
          } else {
            addLog(`✅ Supabase bağlantısı başarılı`);
          }
        } catch (e: any) {
          addLog(`❌ Supabase test hatası: ${e.message}`);
        }

      } catch (error: any) {
        addLog(`❌ Genel hata: ${error.message}`);
        console.error(error);
      }
    };

    checkEverything();

    // Console logları yakala
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      addLog(`LOG: ${args.join(' ')}`);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog(`ERROR: ${args.join(' ')}`);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog(`WARN: ${args.join(' ')}`);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const clearLocalStorage = () => {
    localStorage.clear();
    addLog("✅ LocalStorage temizlendi");
    addLog("🔄 Sayfayı yenileyin");
  };

  const forceReinitialize = async () => {
    addLog("🔄 Force reinitialize başlatılıyor...");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      store.setUserId(null);
      await new Promise(resolve => setTimeout(resolve, 100));
      store.setUserId(user.id);
      await store.initializeFromSupabase();
      addLog("✅ Reinitialize tamamlandı");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🐛 Debug Panel</h1>
        
        <div className="mb-4 space-x-2">
          <button
            onClick={clearLocalStorage}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            🗑️ LocalStorage Temizle
          </button>
          <button
            onClick={forceReinitialize}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            🔄 Force Reinitialize
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            🏠 Ana Sayfa
          </button>
        </div>

        {user && (
          <div className="bg-slate-800 p-4 rounded mb-4">
            <h2 className="font-bold mb-2">👤 User Info:</h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-slate-800 p-4 rounded mb-4">
          <h2 className="font-bold mb-2">📊 Store State:</h2>
          <div className="text-sm space-y-1">
            <div>isInitialized: <span className={store.isInitialized ? "text-green-400" : "text-red-400"}>{String(store.isInitialized)}</span></div>
            <div>userId: {store.userId || 'null'}</div>
            <div>profile: {store.profile ? '✅' : '❌'}</div>
            <div>studyEntries: {store.studyEntries.length}</div>
            <div>mockExams: {store.mockExams.length}</div>
            <div>goals: {store.goals.length}</div>
            <div>topics: {store.topics.length}</div>
            <div>widgets: {store.widgets.length}</div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded">
          <h2 className="font-bold mb-2">📝 Logs:</h2>
          <div className="space-y-1 text-xs font-mono max-h-96 overflow-auto">
            {logs.map((log, i) => (
              <div key={i} className="border-b border-slate-700 pb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
