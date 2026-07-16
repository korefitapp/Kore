"use client";

import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SidebarUserCardProps {
  name: string;
  subtitle: string;
  avatar: string;
}

export function SidebarUserCard({
  name: fallbackName,
  subtitle: fallbackSubtitle,
  avatar: fallbackAvatar,
}: SidebarUserCardProps) {
  const [name, setName] = useState(fallbackName);
  const [subtitle, setSubtitle] = useState(fallbackSubtitle);
  const [avatar, setAvatar] = useState(fallbackAvatar);

  useEffect(() => {
    async function loadUser() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, display_name, role, metadata, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setName(profile.display_name || profile.full_name || user.email?.split("@")[0] || fallbackName);
        
        let sub = fallbackSubtitle;
        if (profile.role === "nutritionist") {
          sub = (profile.metadata as any)?.crn ? `CRN ${profile.metadata.crn}` : "Nutricionista";
        } else if (profile.role === "trainer") {
          sub = (profile.metadata as any)?.cref ? `CREF ${profile.metadata.cref}` : "Personal Trainer";
        } else if (profile.role === "merchant") {
          sub = "Lojista parceiro";
        } else if (profile.role === "admin") {
          sub = "Administrador";
        }
        setSubtitle(sub);
        
        let av = fallbackAvatar;
        if (profile.avatar_url) {
          // If avatar_url is an emoji or a real URL, handle it? 
          // Wait, the UI expects an emoji or a short string, or an img if we render it as img.
          // Since the current UI just renders {avatar} in a text container, we'll assume it's an emoji if length <= 4, else we might need an img.
          if (profile.avatar_url.length <= 4) {
             av = profile.avatar_url;
          } else {
             // For now we'll just keep the fallback emoji if it's a URL, or render an img tag. Let's just use emojis based on role for simplicity.
          }
        }
        
        if (!profile.avatar_url || profile.avatar_url.length > 4) {
          av = profile.role === "nutritionist" ? "👩🏼‍⚕️" :
               profile.role === "trainer" ? "🏋🏻‍♂️" :
               profile.role === "merchant" ? "🏪" :
               profile.role === "admin" ? "👑" : fallbackAvatar;
        }
        
        setAvatar(av);
      }
    }
    loadUser();
  }, [fallbackName, fallbackSubtitle, fallbackAvatar]);

  return (
    <form action="/auth/sign-out" method="post" className="w-full">
      <button
        type="submit"
        title="Sair da conta"
        aria-label={`Sair da conta de ${name}`}
        className="group w-full rounded-2xl border border-kore-border bg-kore-bg/60 p-3 flex items-center gap-3 text-left hover:border-kore-emerald/40 hover:bg-kore-bg active:scale-[0.98] transition"
      >
        <div className="w-10 h-10 rounded-xl bg-kore-emerald-soft text-2xl grid place-items-center flex-shrink-0">
          {avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-kore-ink truncate">{name}</p>
          <p className="text-[11px] text-kore-muted truncate">{subtitle}</p>
        </div>
        <LogOut
          size={16}
          className="text-kore-muted group-hover:text-kore-emerald-deep transition flex-shrink-0"
          aria-hidden="true"
        />
      </button>
    </form>
  );
}
