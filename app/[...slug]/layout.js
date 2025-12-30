import "../globals.css";
import {ThemeProvider} from "next-themes";
import Sidebar from "@/components/Sidebar/sidebar";
import Header from "@/components/Header/header";

export default async function LocaleLayout({children}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
