"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface NearbyTrainer {
  id: string;
  name: string;
  specialty: string;
  distance: string; // formatted distance like "1.2 km"
  rating: number;
  avatarInitials: string;
}

// Formula de Haversine para calcular distância entre duas coordenadas em km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; // Distance in km
  return d;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (parts.length === 1) return first.charAt(0).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

export async function getNearbyProfessionals(userLat: number, userLng: number, role: "trainer" | "nutri" | "shop" = "trainer"): Promise<NearbyTrainer[]> {
  const supabase = createSupabaseServerClient();

  // Buscar todos os perfis com a role desejada
  const { data: professionals, error } = await supabase
    .from("profiles")
    .select("id, full_name, metadata")
    .eq("role", role)
    .eq("status", "active");

  if (error || !professionals) {
    console.error(`Erro ao buscar ${role}s:`, error);
    return [];
  }

  // Filtrar e calcular distância
  const nearbyProfessionals: (NearbyTrainer & { distRaw: number })[] = [];

  for (const pro of professionals) {
    const meta = pro.metadata as Record<string, any>;
    if (!meta || typeof meta.lat !== "number" || typeof meta.lng !== "number") {
      continue;
    }

    const dist = getDistanceFromLatLonInKm(userLat, userLng, meta.lat, meta.lng);
    
    // Limitar num raio de 50km
    if (dist <= 50) {
      nearbyProfessionals.push({
        id: pro.id,
        name: pro.full_name || (role === "nutri" ? "Nutricionista" : "Treinador"),
        specialty: meta.specialty || (role === "nutri" ? "Nutrição Clínica & Esportiva" : "Personal Trainer"),
        rating: meta.rating || 5.0,
        avatarInitials: meta.avatarInitials || getInitials(pro.full_name || ""),
        distRaw: dist,
        distance: `${dist.toFixed(1)} km`,
      });
    }
  }

  // Ordenar por distância
  nearbyProfessionals.sort((a, b) => a.distRaw - b.distRaw);

  return nearbyProfessionals.map(({ distRaw, ...rest }) => rest);
}
