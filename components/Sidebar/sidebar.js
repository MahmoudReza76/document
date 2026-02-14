"use client";

import React, {useState} from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  BookOpen,
  Menu,
  X
} from "lucide-react";
import {useMenu} from "@/hooks/useMenu";
import Link from "next/link";
import {useAppStore} from "@/stores/appStore";
import {useSidebarStore} from "@/stores/sidebarStore";
import {usePathname} from "next/navigation";
import {API_DOMAIN} from "@/config";

function buildFullPath(items, targetSlug, projectKey, currentPath = []) {
  for (const item of items) {
    if (item.NodeType === "category") {
      const newPath = [...currentPath, item.Slug];

      if (item.Slug === targetSlug) {
        return `/${projectKey}/${newPath.join("/")}`;
      }

      if (item.Children && item.Children.length > 0) {
        const result = buildFullPath(
          item.Children,
          targetSlug,
          projectKey,
          newPath
        );
        if (result) return result;
      }
    }

    if (item.NodeType === "page") {
      const newPath = [...currentPath, item.Slug];

      if (item.Slug === targetSlug) {
        return `/${projectKey}/${newPath.join("/")}`;
      }
    }
  }
  return null;
}

function RenderMenu({items, projectKey, parentSlugs = []}) {
  const {expandedSections, toggleSection} = useSidebarStore();
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      {items.map((item) => {
        if (item.NodeType === "category") {
          const currentPath = [...parentSlugs, item.Slug];
          const fullCategoryPath = `/${projectKey}/${currentPath.join("/")}`;
          const isActiveCategory = pathname.startsWith(fullCategoryPath);
          const isHeaderOnly = item.IsHeaderOnly === true;
          const isExpanded = isHeaderOnly || expandedSections[item.Slug];

          return (
            <div key={item.Id} className="mb-1">
              {isHeaderOnly ? (
                <div
                  className={`flex items-center justify-between w-full px-2 py-2 text-sm rounded-md font-bold ${
                    isActiveCategory
                      ? "text-primary hover:text-primary/90"
                      : "text-primary/90 hover:text-primary"
                  }`}
                >
                  {item.Title}
                </div>
              ) : (
                <button
                  onClick={() => toggleSection(item.Slug)}
                  className={`flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActiveCategory
                      ? "font-bold text-primary bg-primary/5 hover:bg-primary/10"
                      : "text-primary/85 hover:bg-gray-100 hover:text-primary"
                  }`}
                >
                  {item.Title}
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}

              {isExpanded && item.Children?.length > 0 && (
                <div className="ml-3 mt-1">
                  <RenderMenu
                    items={item.Children}
                    projectKey={projectKey}
                    parentSlugs={currentPath}
                  />
                </div>
              )}
            </div>
          );
        }

        if (item.NodeType === "page") {
          const fullPath = `/${projectKey}/${[...parentSlugs, item.Slug].join(
            "/"
          )}`;
          const isActivePage = pathname === fullPath;

          return (
            <Link
              key={item.Id}
              href={fullPath}
              shallow
              className={`block px-3 py-2 text-[13px] rounded-md transition-colors ${
                isActivePage
                  ? "font-bold text-primary bg-primary/5 hover:bg-primary/10"
                  : "text-gray-700 hover:bg-gray-100 font-semibold"
              }`}
            >
              {item.Title}
            </Link>
          );
        }

        return null;
      })}
    </div>
  );
}

export default function Sidebar({domain = API_DOMAIN}) {
  const {projectKey, lang} = useAppStore();
  const {data, isLoading, isError} = useMenu(domain, projectKey, lang);
  const {isOpen, closeSidebar} = useSidebarStore();

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-primary-sidebar-primary border border-primary/10 bg-white dark:bg-neutral-950 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold text-primary">
                Documentation
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {isLoading && <p className="text-gray-500">Loading menu...</p>}
            {isError && <p className="text-red-500">Failed to load menu</p>}
            {!isLoading && data?.Items && (
              <RenderMenu items={data.Items} projectKey={projectKey} />
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/api-reference"
              className="block px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              API Reference
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
