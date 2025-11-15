"use client";

import { createClient } from "@/lib/supabase/client";
import { initializeUserData } from "@/lib/init-user-data";
import { useStudyStore } from "@/store/use-study-store";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUserId, initializeFromSupabase } = useStudyStore();

  useEffect(() => {
    const supabase = createClient();

    // Mevcut kullanıcıyı kontrol et
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        // İlk kullanıcı verileri oluştur (sadece ilk kez)
        initializeUserData(user.id).then(() => {
          initializeFromSupabase();
        });
      }
    });

    // Auth değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        // Yeni kayıt olduğunda ilk verileri oluştur
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          initializeUserData(session.user.id).then(() => {
            initializeFromSupabase();
          });
        } else {
          initializeFromSupabase();
        }
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUserId, initializeFromSupabase]);

  return <>{children}</>;
}

