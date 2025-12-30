"use client";

import {useQuery} from "@tanstack/react-query";
import {getMenu} from "@/app/api/api";

export const useMenu = (domain, projectKey, lang) =>
  useQuery({
    queryKey: ["menu", domain, projectKey, lang],
    queryFn: () => getMenu(domain, projectKey, lang),
    enabled: !!domain && !!projectKey
  });
