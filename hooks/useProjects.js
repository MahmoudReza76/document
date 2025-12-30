"use client";

import {getProjectsByDomain} from "@/app/api/api";
import {useQuery} from "@tanstack/react-query";

export const useProjects = (domain) => {
  return useQuery({
    queryKey: ["projects", domain],
    queryFn: () => getProjectsByDomain(domain),
    enabled: !!domain
  });
};
