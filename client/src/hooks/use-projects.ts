import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useProjects() {
  return useQuery({
    queryKey: [api.projects.list.path],
    queryFn: async () => {
      const res = await fetch(api.projects.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      return api.projects.list.responses[200].parse(data);
    },
  });
}
