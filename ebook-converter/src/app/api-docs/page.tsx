"use client";

import { useEffect, useState } from "react";
import { RedocStandalone } from "redoc";

const OPENAPI_URL = "/api-docs/openapi.json";

export default function ApiDocsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const res = await fetch(OPENAPI_URL);
        if (!res.ok) throw new Error(`Failed to load OpenAPI spec: ${res.status}`);
        const json = await res.json();
        if (!json || !json.openapi) throw new Error("Invalid OpenAPI specification");
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error loading API docs");
        setLoading(false);
      }
    };
    fetchSpec();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Failed to load API documentation</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href={OPENAPI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            View raw OpenAPI spec
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API documentation…</p>
        </div>
      </div>
    );
  }

  return (
    <RedocStandalone
      specUrl={OPENAPI_URL}
      options={{
        theme: {
          colors: {
            primary: { main: "#2563eb" },
            text: { primary: "#1f2937" },
            success: { main: "#16a34a" },
            error: { main: "#dc2626" },
            warning: { main: "#d97706" },
            gray: { 50: "#f3f4f6", 100: "#e5e7eb" },
          },
          typography: {
            fontSize: "14px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            headings: {
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: "600",
            },
          },
          rightPanel: {
            backgroundColor: "#f9fafb",
          },
          codeBlock: {
            backgroundColor: "#f3f4f6",
          },
        },
        expandResponses: "200,202",
        requiredPropsFirst: true,
        sortPropsAlphabetically: true,
        hideDownloadButton: false,
        nativeScrollbars: true,
        pathInMiddlePanel: true,
        showExtensions: true,
        scrollYOffset: 0,
      }}
    />
  );
}
