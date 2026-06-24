import { Arimo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "@/app/components/layout/Header";
import { LocaleProvider } from "@/context/LocaleContext";
import Footer from "@/app/components/layout/Footer";
import GlobalLoader from "@/app/components/common/GlobalLoader";
import PromoModal from "@/app/components/common/PromoModal";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CartProvider } from "@/context/CartContext";

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
});

const myFont = localFont({
  src: [
    {
      path: "../../public/font/Zapf-Humanist-601.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-zapf",
});

export const metadata = {
  title: "Cein - Skincare",
  description: "A skincare ecommerce website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${arimo.variable} ${myFont.variable}`}>
      <body>
        <LocaleProvider>
          <FavoritesProvider>
            <CartProvider>
              <GlobalLoader />
              <Header />
              <PromoModal />
              {children}
              <Footer />
            </CartProvider>
          </FavoritesProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
