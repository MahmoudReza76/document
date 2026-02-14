"use client";
import React, {useState, useEffect, useRef} from "react";
import {
  Search,
  Moon,
  Sun,
  Github,
  Menu,
  BookOpen,
  Globe,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {useProjects} from "@/hooks/useProjects";
import {useAppStore} from "@/stores/appStore";
import {useRouter, usePathname} from "next/navigation";
import {useTheme} from "next-themes";
import {API_DOMAIN} from "@/config";
import {useSidebarStore} from "@/stores/sidebarStore";

function Header() {
  const {theme, setTheme} = useTheme();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const {data, isLoading, isError} = useProjects(API_DOMAIN);
  const {projectKey, setProjectKey, lang, setLang} = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const {toggleSidebar} = useSidebarStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [maxVisibleItems, setMaxVisibleItems] = useState(3);
  const projectsContainerRef = useRef(null);

  const decodedPath = decodeURIComponent(pathname);
  const matchedProject = data?.Projects.find((p) =>
    decodedPath.startsWith(p.BasePath)
  );

  useEffect(() => {
    if (!data?.Projects) return;
    if (matchedProject && matchedProject.Key !== projectKey) {
      setProjectKey(matchedProject.Key);
    }
  }, [pathname, data, projectKey, setProjectKey]);

  useEffect(() => {
    const updateMaxVisibleItems = () => {
      if (window.innerWidth >= 1024) {
        setMaxVisibleItems(3);
      } else {
        setMaxVisibleItems(2);
      }
    };

    updateMaxVisibleItems();
    window.addEventListener("resize", updateMaxVisibleItems);

    return () => window.removeEventListener("resize", updateMaxVisibleItems);
  }, []);

  const syncedRef = useRef(false);

  useEffect(() => {
    if (!data?.Projects || !matchedProject) return;

    const activeProjectIndex = data.Projects.findIndex(
      (p) => p.Key === matchedProject.Key
    );

    if (activeProjectIndex === -1) return;

    const targetSlide = Math.floor(activeProjectIndex / maxVisibleItems);

    // فقط اگر syncedRef false بود (اولین بار)
    if (!syncedRef.current) {
      setCurrentSlide(targetSlide);
      syncedRef.current = true;
    }
  }, [matchedProject?.Key, maxVisibleItems]);

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

  const projects = data?.Projects || [];
  const totalProjects = projects.length;
  const totalSlides = Math.ceil(totalProjects / maxVisibleItems);
  const canScrollLeft = currentSlide > 0;
  const canScrollRight = currentSlide < totalSlides - 1;

  const handlePrevSlide = () => {
    if (canScrollLeft) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleNextSlide = () => {
    if (canScrollRight) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleProjectClick = (project) => {
    const fullPath = `${project.BasePath}/${project.DefaultCategorySlug}/${project.DefaultDocSlug}`;
    router.push(fullPath);

    const projectIndex = projects.findIndex((p) => p.Id === project.Id);
    if (projectIndex !== -1) {
      const targetSlide = Math.floor(projectIndex / maxVisibleItems);
      setCurrentSlide(targetSlide);
    }
  };

  const visibleProjects = projects.slice(
    currentSlide * maxVisibleItems,
    (currentSlide + 1) * maxVisibleItems
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-primary-foreground backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            onClick={toggleSidebar}
          >
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

          {/* Dynamic Project Links with Slider */}
          {!isLoading && !isError && totalProjects > 0 && (
            <div className="flex items-center gap-1">
              {/* Left Arrow Button */}
              {totalProjects > maxVisibleItems && canScrollLeft && (
                <button
                  onClick={handlePrevSlide}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95"
                  aria-label="Previous projects"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
              )}

              {/* Projects Container */}
              <div
                ref={projectsContainerRef}
                className="flex items-center gap-1 overflow-hidden"
              >
                {visibleProjects.map((project) => {
                  const isActive = project.Key === projectKey;
                  console.log(
                    "Project:",
                    project.Name,
                    "Key:",
                    project.Key,
                    "isActive:",
                    isActive
                  );

                  return (
                    <button
                      key={project.Id}
                      onClick={() => handleProjectClick(project)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        isActive
                          ? "bg-primary text-secondary shadow-md scale-[1.02]"
                          : "text-primary hover:text-secondary hover:bg-primary hover:shadow-sm"
                      }`}
                    >
                      {project.Name}
                    </button>
                  );
                })}
              </div>

              {/* Right Arrow Button */}
              {totalProjects > maxVisibleItems && canScrollRight && (
                <button
                  onClick={handleNextSlide}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95"
                  aria-label="Next projects"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              )}

              {totalProjects > maxVisibleItems && (
                <div className="flex items-center gap-1 ml-2">
                  {Array.from({length: totalSlides}).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "bg-primary scale-125"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              <div className="w-px h-6 bg-gray-300 mx-1" />
            </div>
          )}

          {/* Alternative: Simple buttons when less than maxVisibleItems */}
          {!isLoading &&
            !isError &&
            totalProjects > 0 &&
            totalProjects <= maxVisibleItems && (
              <div className="hidden lg:flex items-center gap-1">
                {projects.map((project) => (
                  <button
                    key={project.Id}
                    onClick={() => {
                      const fullPath = `${project.BasePath}/${project.DefaultCategorySlug}/${project.DefaultDocSlug}`;
                      router.push(fullPath);
                    }}
                    className={`px-3 py-1.5 text-sm font-medium text-primary hover:text-secondary rounded-lg hover:bg-primary transition-all duration-300 ${
                      pathname.startsWith(project.BasePath)
                        ? "bg-primary text-secondary hover:bg-primary/90 shadow-md transform scale-[1.02]"
                        : "hover:shadow-sm"
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
                  className="flex items-center gap-1 p-2 rounded-lg hover:bg-secondary transition-all duration-200"
                  aria-label="Change language"
                >
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary hidden sm:block">
                    {getCurrentLanguage()}
                  </span>
                </button>

                {languageMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-secondary rounded-lg shadow-lg border border-primary/20 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {data.Languages.map((language) => (
                      <button
                        key={language.LanguageCode}
                        onClick={() =>
                          handleLanguageChange(language.LanguageCode)
                        }
                        className={`w-full text-start px-4 py-2 text-sm hover:bg-primary/5 transition-colors duration-150 ${
                          language.LanguageCode === lang
                            ? "font-bold bg-secondary"
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
            className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 hover:scale-105"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5 text-primary" />
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 hover:scale-105"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-primary" />
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 mx-2 hidden sm:block" />

          {/* API Key Button */}
          <button className="px-3 py-1.5 text-sm font-medium text-primary border border-border rounded-lg hover:shadow-md hover:border-primary/80 transition-all duration-200 hidden sm:block">
            API Keys
          </button>

          {/* Sign In Button */}
          <button className="px-3 py-1.5 text-sm font-medium text-secondary bg-primary rounded-lg hover:bg-primary/80 transition-all duration-200 hover:shadow-md">
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
