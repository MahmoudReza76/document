"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {useState, useEffect} from "react";
import {useAppStore} from "@/stores/appStore";

export default function Providers({children}) {
  const [client] = useState(new QueryClient());
  const {lang, direction} = useAppStore();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = direction;
  }, [lang, direction]);

  return (
    <QueryClientProvider dir={direction} client={client}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
