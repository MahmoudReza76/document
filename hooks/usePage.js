"use client";

import {useQuery} from "@tanstack/react-query";
import {getPage} from "@/app/api/api";

export const usePage = (domain, projectKey, category, slug, lang) =>
  useQuery({
    queryKey: ["page", domain, projectKey, category, slug, lang],
    queryFn: () => getPage(domain, projectKey, category, slug, lang),
    enabled: !!slug
  });
