import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Outil de facturation SVC",
  description: "Outil de facturation développé pour Francepay",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/favicon-svc.png" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <div>
          {children}
        </div>
      </body>
    </html>
  );
}
