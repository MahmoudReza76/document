"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useProjects} from "@/hooks/useProjects";
import {API_DOMAIN} from "@/config";
export default function Redirector() {
  const router = useRouter();
  const {data, isLoading} = useProjects(API_DOMAIN);

  useEffect(() => {
    if (isLoading || !data) return;

    const defaultProjectKey = data.DefaultProjectKey;
    const project = data.Projects.find((p) => p.Key === defaultProjectKey);

    if (!project) return;

    let path = `/${project.Key}`;

    if (project.DefaultCategorySlug) {
      path += `/${project.DefaultCategorySlug}`;
    }

    if (project.DefaultDocSlug) {
      path += `/${project.DefaultDocSlug}`;
    }

    router.replace(path);
  }, [data, isLoading, router]);

  return null;
}
