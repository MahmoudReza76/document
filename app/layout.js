import "./globals.css";
import {Roboto} from "next/font/google";
import localFont from "next/font/local";
import Providers from "./providers";

// Roboto font
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto"
});

// IRANSansX font
const iranSansX = localFont({
  src: [
    {
      path: "../public/fonts/IRANSansXV.woff",
      weight: "100 300 400 500 700 900",
      style: "normal"
    }
  ],
  variable: "--font-iransansx"
});

export default async function RootLayout({children, params}) {
  const {locale} = await params;

  return (
    <html
      lang={locale}
      className={`${roboto.className} ${iranSansX.className} `}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children} </Providers>
      </body>
    </html>
  );
}
