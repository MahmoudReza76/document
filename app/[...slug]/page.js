"use client";

import {useParams} from "next/navigation";
import {usePage} from "@/hooks/usePage";
import Markdown from "react-markdown";
import Link from "next/link";
import {useAppStore} from "@/stores/appStore";
import {useState, useEffect, useRef} from "react";
import {
  Copy,
  CheckCircle,
  ChevronRight,
  Clock,
  Tag,
  FileText,
  ExternalLink,
  AlertCircle
} from "lucide-react";

// Helper function to parse JSON safely
function parseJson(jsonString, defaultValue = {}) {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
}

// Code Block Component with Copy functionality
function CodeBlock({content, language = "json"}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-md overflow-hidden border border-gray-200">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-600 uppercase">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs flex items-center gap-1 text-gray-600 hover: text-primary"
        >
          {copied ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-50 p-4 overflow-x-auto text-sm">
        <code className="text-gray-800 font-mono">{content}</code>
      </pre>
    </div>
  );
}

// Parameter Display Component
function ParameterDisplay({parameter, isNested = false}) {
  const [expanded, setExpanded] = useState(true);
  const allowedValues = parseJson(parameter.AllowedValuesJson, []);

  return (
    <div className={`mb-4 ${isNested ? "pl-4 ml-2" : ""}`}>
      <div className="mb-2">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {parameter.Name}
          </code>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
            {parameter.DataType}
          </span>
          {parameter.IsRequired && (
            <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
              required
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700">{parameter.Description}</p>

        {allowedValues.length > 0 && (
          <div className="mt-2">
            <span className="text-xs text-gray-600">Allowed values:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {allowedValues.map((value, idx) => (
                <code
                  key={idx}
                  className="text-xs px-2 py-0.5 bg-gray-100 rounded"
                >
                  {value}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>

      {parameter.Children && parameter.Children.length > 0 && (
        <div className="mt-3">
          {parameter.Children.map((child) => (
            <ParameterDisplay
              key={child.Id}
              parameter={child}
              isNested={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Main Page Component
export default function Page() {
  const params = useParams();
  const slugArray = params.slug || [];
  const {lang} = useAppStore();
  const [activeSection, setActiveSection] = useState("");
  const sectionsRef = useRef([]);

  const [projectKey, categorySlug, pageSlug] =
    slugArray.length === 2
      ? [slugArray[0], null, slugArray[1]]
      : [slugArray[0], slugArray[1], slugArray[2]];

  const {data, isLoading, isError} = usePage(
    "docs.danavan.ai",
    projectKey,
    categorySlug,
    pageSlug,
    lang
  );

  useEffect(() => {
    if (!isLoading && !isError) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        {rootMargin: "-100px 0px -80% 0px"}
      );

      sectionsRef.current.forEach((section) => {
        if (section) observer.observe(section);
      });

      return () => {
        sectionsRef.current.forEach((section) => {
          if (section) observer.unobserve(section);
        });
      };
    }
  }, [isLoading, isError]);

  if (isLoading)
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>Failed to load page. Please try again later.</p>
        </div>
      </div>
    );

  const metaData = parseJson(data?.Page?.MetaJson);
  const apiSpec = data?.Page?.ApiSpec;

  // Build sections for TOC
  const sections = [];
  if (apiSpec?.Endpoint) sections.push({id: "endpoint", title: "Endpoint"});
  if (apiSpec?.ParametersByLocation?.body?.length > 0)
    sections.push({id: "parameters", title: "Parameters"});
  if (apiSpec?.RequestExamples?.length > 0)
    sections.push({id: "request-examples", title: "Request Examples"});
  if (apiSpec?.ResponseExamples?.length > 0)
    sections.push({id: "response-examples", title: "Response Examples"});
  if (metaData?.tags?.length > 0) sections.push({id: "tags", title: "Tags"});
  if (metaData?.extra?.relatedDocs?.length > 0)
    sections.push({id: "related-docs", title: "Related Docs"});

  return (
    <div className="bg-background min-h-screen mt-4">
      <div className="max-w-4xl mx-auto sm:px-0 px-4 pb-16">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center text-sm text-gray-500 mb-6">
          {data?.Breadcrumbs?.map((item, index) => (
            <span key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="w-3 h-3 mx-2" />}
              {item.NodeType === "page" ? (
                <span className=" text-primary font-medium">{item.Title}</span>
              ) : (
                <Link
                  href={`/${projectKey}${item.Slug ? `/${item.Slug}` : ""}`}
                  className="hover: text-primary hover:underline transition-colors"
                >
                  {item.Title}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <div className="lg:flex lg:gap-12">
          {/* Main content */}
          <main className="flex-1">
            <header className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold  text-primary">
                  {data?.Page?.Title}
                </h1>
                {metaData?.ui?.estimatedReadTime && (
                  <div className="flex items-center text-sm gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{metaData.ui.estimatedReadTime} دقیقه مطالعه</span>
                  </div>
                )}
              </div>

              {metaData?.extra?.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm text-yellow-800 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{metaData.extra.notes}</p>
                </div>
              )}
            </header>

            {/* API Endpoint */}
            {apiSpec?.Endpoint && (
              <section
                id="endpoint"
                ref={(el) => (sectionsRef.current[0] = el)}
                className="mb-10"
              >
                <h2 className="text-xl font-bold mb-4 text-primary">
                  Endpoint
                </h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          apiSpec.Endpoint.HttpMethod === "POST"
                            ? "bg-green-100 text-green-800"
                            : apiSpec.Endpoint.HttpMethod === "GET"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {apiSpec.Endpoint.HttpMethod}
                      </span>
                      <span className="text-sm font-mono">
                        {apiSpec.Endpoint.Path}
                      </span>
                    </div>
                    {apiSpec.Endpoint.IsDeprecated && (
                      <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
                        Deprecated
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-500">
                        Full URL:
                      </span>
                      <code className="text-sm font-mono ml-2">
                        {apiSpec.Endpoint.FullUrl}
                      </code>
                    </div>
                    {apiSpec.Endpoint.Description && (
                      <p className="text-sm text-gray-700 mt-3">
                        {apiSpec.Endpoint.Description}
                      </p>
                    )}
                    {/* Optionally show path and base URL separately if needed */}
                    {false /* Set to true if you want to show this info */ && (
                      <div className="mt-3 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Path:</span>
                          <code className="ml-2">{apiSpec.Endpoint.Path}</code>
                        </div>
                        <div className="mt-1">
                          <span className="font-medium">Base URL:</span>
                          <code className="ml-2">
                            {apiSpec.Endpoint.FullUrl.replace(
                              apiSpec.Endpoint.Path,
                              ""
                            )}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Parameters */}
            {apiSpec?.ParametersByLocation?.body?.length > 0 && (
              <section
                id="parameters"
                ref={(el) => (sectionsRef.current[1] = el)}
                className="mb-10"
              >
                <h2 className="text-xl font-bold mb-4  text-primary">
                  Parameters
                </h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-background">
                  <div className="border-b border-gray-200 p-4">
                    <h3 className="font-medium  text-primary">
                      Body Parameters
                    </h3>
                  </div>
                  <div className="p-4">
                    {apiSpec.ParametersByLocation.body.map((param) => (
                      <ParameterDisplay key={param.Id} parameter={param} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Request Examples */}
            {apiSpec?.RequestExamples?.length > 0 && (
              <section
                id="request-examples"
                ref={(el) => (sectionsRef.current[2] = el)}
                className="mb-10"
              >
                <h2 className="text-xl font-bold mb-4  text-primary">
                  Request Examples
                </h2>
                {apiSpec.RequestExamples.map((example) => (
                  <div key={example.Id} className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      {example.Title}
                    </h3>
                    {example.Description && (
                      <p className="text-sm text-gray-700 mb-2">
                        {example.Description}
                      </p>
                    )}
                    <CodeBlock
                      content={example.Code}
                      language={example.ExampleKey}
                    />
                  </div>
                ))}
              </section>
            )}

            {/* Response Examples */}
            {apiSpec?.ResponseExamples?.length > 0 && (
              <section
                id="response-examples"
                ref={(el) => (sectionsRef.current[3] = el)}
                className="mb-10"
              >
                <h2 className="text-xl font-bold mb-4  text-primary">
                  Response Examples
                </h2>
                {apiSpec.ResponseExamples.map((example) => (
                  <div key={example.Id} className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      {example.Title}
                    </h3>
                    {example.Description && (
                      <p className="text-sm text-gray-700 mb-2">
                        {example.Description}
                      </p>
                    )}
                    <CodeBlock content={example.Code} language="json" />
                  </div>
                ))}
              </section>
            )}

            {/* Content Markdown */}
            {data?.Page?.ContentMarkdown && (
              <section className="mb-10">
                <div className="prose max-w-none">
                  <Markdown>{data.Page.ContentMarkdown}</Markdown>
                </div>
              </section>
            )}

            {/* Tags */}
            {metaData?.tags?.length > 0 && (
              <section
                id="tags"
                ref={(el) => (sectionsRef.current[4] = el)}
                className="mb-10"
              >
                <h2 className="text-xl font-bold mb-4  text-primary">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {metaData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-lg border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Related Docs */}
            {metaData?.extra?.relatedDocs?.length > 0 && (
              <section
                id="related-docs"
                ref={(el) => (sectionsRef.current[5] = el)}
                className="mb-10"
              >
                <h2 className="text-xl font-bold mb-4  text-primary">
                  Related Documentation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {metaData.extra.relatedDocs.map((docSlug, index) => (
                    <Link
                      key={index}
                      href={`/${projectKey}/${
                        data.RequestedCategory || ""
                      }/${docSlug}`}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group"
                    >
                      <span className="text-blue-600 group-hover:text-blue-800">
                        {docSlug}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* SEO metadata display for developers (could be removed in production) */}
            {metaData?.seo && (
              <section className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metaData.seo.canonicalPath && (
                    <div>
                      <span className="font-medium">Canonical URL:</span>
                      <a
                        href={`https://docs.danavan.ai${metaData.seo.canonicalPath}`}
                        className="ml-2 text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {metaData.seo.canonicalPath}
                      </a>
                    </div>
                  )}
                  {metaData.seo.ogImage && (
                    <div>
                      <span className="font-medium">OG Image:</span>
                      <a
                        href={metaData.seo.ogImage}
                        className="ml-2 text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>

          {/* Table of contents sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 border border-gray-200 rounded-lg p-4 text-sm">
              <h3 className="font-medium mb-3  text-primary">On this page</h3>
              <nav className="space-y-2">
                {sections.map((section, index) => (
                  <Link
                    key={index}
                    href={`#${section.id}`}
                    className={`block transition-colors ${
                      activeSection === section.id
                        ? "text-blue-600 font-medium"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {section.title}
                  </Link>
                ))}
              </nav>

              {/* Additional metadata in sidebar */}
              {metaData?.ui?.estimatedReadTime && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>
                      Reading time: {metaData.ui.estimatedReadTime} min
                    </span>
                  </div>
                  {metaData?.tags?.length > 0 && (
                    <div className="flex items-start gap-1 mt-2">
                      <Tag className="w-3 h-3 text-gray-500 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {metaData.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {metaData.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{metaData.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
