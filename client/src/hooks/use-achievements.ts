import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useAchievements() {
  return useQuery({
    queryKey: [api.achievements.list.path],
    queryFn: async () => {
      const res = await fetch(api.achievements.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch achievements");
      const data = await res.json();
      return api.achievements.list.responses[200].parse(data);
    },
  });
}
