"use client";
import React, {useState, useEffect} from "react";
import {Search, Moon, Sun, Github, Menu, BookOpen, Globe} from "lucide-react";
import {useProjects} from "@/hooks/useProjects";
import {useAppStore} from "@/stores/appStore";
import {useRouter, usePathname} from "next/navigation";
import {useTheme} from "next-themes";
import {API_DOMAIN} from "@/config";

function Header() {
  const {theme, setTheme} = useTheme();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const {data, isLoading, isError} = useProjects(API_DOMAIN);
  const {projectKey, setProjectKey, lang, setLang} = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const matchedProject = data?.Projects.find((p) =>
    pathname.startsWith(p.BasePath)
  );
  useEffect(() => {
    if (!data?.Projects) return;
    if (matchedProject && matchedProject.Key !== projectKey) {
      setProjectKey(matchedProject.Key);
    }
  }, [pathname, data, projectKey, setProjectKey]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLanguageChange = (languageCode) => {
    setLang(languageCode, data.Languages);
    setLanguageMenuOpen(false);

    if (pathname.includes(`/${projectKey}/`)) {
      const pathParts = pathname.split("/");

      router.refresh();
    }
  };
  const getCurrentLanguage = () => {
    if (!data?.Languages) return "فارسی";
    const currentLang = data.Languages.find((l) => l.LanguageCode === lang);
    return currentLang ? currentLang.LanguageName : "فارسی";
  };
  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-primary-foreground backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 lg:hidden">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-gray-900" />
            <span className="text-lg font-semibold text-gray-900 hidden sm:inline">
              {matchedProject?.Name}
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block"></div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search Button for Mobile */}
          <button className="p-2 rounded-lg hover:bg-gray-100 md:hidden">
            <Search className="w-5 h-5 text-gray-700" />
          </button>

          {/* Dynamic Project Links */}
          {!isLoading && !isError && data?.Projects && (
            <div className="hidden lg:flex items-center gap-1">
              {data.Projects.map((project, index) => (
                <button
                  key={project.Id}
                  onClick={() => {
                    // ساخت مسیر کامل با استفاده از DefaultCategorySlug و DefaultDocSlug
                    const fullPath = `${project.BasePath}/${project.DefaultCategorySlug}/${project.DefaultDocSlug}`;
                    router.push(fullPath);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                    pathname.startsWith(project.BasePath)
                      ? "bg-primary text-white hover:bg-primary/90"
                      : ""
                  }`}
                >
                  {project.Name}
                </button>
              ))}
              <div className="w-px h-6 bg-gray-300 mx-1" />
            </div>
          )}
          {/* Language Selector */}
          {!isLoading &&
            !isError &&
            data?.AllowMultiLanguage &&
            data?.Languages && (
              <div className="relative">
                <button
                  onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                  className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Change language"
                >
                  <Globe className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {getCurrentLanguage()}
                  </span>
                </button>

                {languageMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {data.Languages.map((language) => (
                      <button
                        key={language.LanguageCode}
                        onClick={() =>
                          handleLanguageChange(language.LanguageCode)
                        }
                        className={`w-full text-start px-4 py-2 text-sm hover:bg-gray-100 ${
                          language.LanguageCode === lang
                            ? "font-bold bg-gray-50"
                            : ""
                        }`}
                      >
                        {language.EmojiFlag && (
                          <span className="mr-2">{language.EmojiFlag}</span>
                        )}
                        {language.LanguageName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          {/* GitHub Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5 text-gray-700" />
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-gray-700" />
            ) : (
              <Sun className="w-5 h-5 text-gray-700" />
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 mx-2 hidden sm:block" />

          {/* API Key Button */}
          <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors hidden sm:block">
            API Keys
          </button>

          {/* Sign In Button */}
          <button className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
