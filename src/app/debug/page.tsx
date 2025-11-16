"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const addLog = (msg: string) => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
      console.log(msg);
    };

    const runDiagnostics = async () => {
      try {
        addLog("🔍 Debug başlatıldı");

        // 1. Window kontrolü
        if (typeof window !== 'undefined') {
          addLog("✅ Window object var");
        } else {
          addLog("❌ Window object yok");
          return;
        }

        // 2. LocalStorage kontrolü
        try {
          const testKey = '__test__';
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
          addLog("✅ LocalStorage çalışıyor");

          const storeData = localStorage.getItem('yks-tracker-store');
          if (storeData) {
            addLog(`✅ Store verisi var: ${(storeData.length / 1024).toFixed(2)} KB`);
          } else {
            addLog("⚠️ Store verisi yok");
          }
        } catch (e: any) {
          addLog(`❌ LocalStorage hatası: ${e.message}`);
        }

        // 3. Dinamik Supabase import
        try {
          addLog("🔄 Supabase import ediliyor...");
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          addLog("✅ Supabase client oluşturuldu");

          // 4. User kontrolü
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            addLog(`❌ User Error: ${userError.message}`);
          } else if (user) {
            addLog(`✅ User ID: ${user.id}`);
            addLog(`✅ User Email: ${user.email}`);
          } else {
            addLog("⚠️ Kullanıcı giriş yapmamış");
          }

          // 5. Database bağlantı testi
          const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
          
          if (error) {
            addLog(`❌ DB Bağlantı hatası: ${error.message}`);
          } else {
            addLog("✅ Database bağlantısı başarılı");
          }

        } catch (e: any) {
          addLog(`❌ Supabase hatası: ${e.message}`);
          if (e.stack) {
            addLog(`Stack: ${e.stack.substring(0, 200)}`);
          }
        }

        // 6. Store kontrolü
        try {
          addLog("🔄 Store import ediliyor...");
          const { useStudyStore } = await import("@/store/use-study-store");
          const store = useStudyStore.getState();
          
          addLog(`Store isInitialized: ${store.isInitialized}`);
          addLog(`Store userId: ${store.userId || 'null'}`);
          addLog(`Store profile: ${store.profile ? 'var' : 'yok'}`);
          addLog(`Study Entries: ${store.studyEntries?.length || 0}`);
          addLog(`Mock Exams: ${store.mockExams?.length || 0}`);
        } catch (e: any) {
          addLog(`❌ Store hatası: ${e.message}`);
          if (e.stack) {
            addLog(`Stack: ${e.stack.substring(0, 200)}`);
          }
        }

      } catch (error: any) {
        addLog(`❌ Genel hata: ${error.message}`);
        if (error.stack) {
          addLog(`Stack: ${error.stack.substring(0, 200)}`);
        }
      }
    };

    runDiagnostics();
  }, []);

  const clearStorage = () => {
    try {
      localStorage.clear();
      setLogs(prev => [...prev, "✅ LocalStorage temizlendi - Sayfayı yenileyin"]);
    } catch (e: any) {
      setLogs(prev => [...prev, `❌ Temizleme hatası: ${e.message}`]);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🐛 Debug Panel</h1>
        
        <div className="mb-4 space-x-2 flex flex-wrap gap-2">
          <button
            onClick={clearStorage}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            🗑️ LocalStorage Temizle
          </button>
          <button
            onClick={reloadPage}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            🔄 Yenile
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            🏠 Ana Sayfa
          </button>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
          >
            🔑 Login
          </button>
        </div>

        <div className="bg-slate-800 p-4 rounded">
          <h2 className="font-bold mb-2">📝 Diagnostic Logs:</h2>
          {logs.length === 0 ? (
            <div className="text-slate-400">Loglar yükleniyor...</div>
          ) : (
            <div className="space-y-1 text-sm font-mono max-h-[70vh] overflow-auto">
              {logs.map((log, i) => (
                <div 
                  key={i} 
                  className={`border-b border-slate-700 pb-1 ${
                    log.includes('❌') ? 'text-red-400' : 
                    log.includes('✅') ? 'text-green-400' : 
                    log.includes('⚠️') ? 'text-yellow-400' : 
                    'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 bg-slate-800 p-4 rounded text-sm">
          <h3 className="font-bold mb-2">📱 Nasıl Kullanılır:</h3>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Yukarıdaki logları ekran görüntüsü ile kaydet</li>
            <li>Kırmızı (❌) olan satırları not et - bunlar hatalar</li>
            <li>"LocalStorage Temizle" butonuna bas</li>
            <li>"Yenile" butonuna bas</li>
            <li>Hala sorun varsa, login sayfasına git</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
