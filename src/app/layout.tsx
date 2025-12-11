import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
// Provider Groups - reduces nesting from 17 to 6 levels
import {
  CoreProvider,
  FinancialAccountsProvider,
  CardsAndCashbackProvider,
  BusinessProvider,
  InvestmentsAndSavingsProvider,
} from "@/providers";
import { CentralTransfersProvider } from "@/contexts/central-transfers-context";
import { ReconciliationProvider } from "@/contexts/reconciliation-context";
import { LayoutProvider } from "@/components/layout/layout-provider";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CFM - الإدارة المالية الشاملة",
  description: "Comprehensive Financial Management - لإدارة أموالك بشكل أكثر احترافية ودقة - نظام متكامل لإدارة جميع جوانب حياتك المالية",
  icons: {
    icon: [
      { url: '/logos/LOGO MONEY MANGER.png', sizes: '32x32', type: 'image/png' },
      { url: '/logos/LOGO MONEY MANGER.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/logos/LOGO MONEY MANGER.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logos/LOGO MONEY MANGER.png',
  },
  applicationName: 'CFM',
  manifest: '/manifest.json',
};

// سكريبت لتطبيق الثيم قبل تحميل React
const themeScript = `
  (function() {
    try {
      var savedTheme = localStorage.getItem('theme');
      var resolvedTheme;

      // حساب الثيم الفعلي
      if (savedTheme === 'light' || savedTheme === 'dark') {
        resolvedTheme = savedTheme;
      } else {
        // إذا كان 'system' أو غير محدد، نستخدم تفضيل النظام
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      document.documentElement.classList.add(resolvedTheme);
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      document.documentElement.style.colorScheme = resolvedTheme;
      document.documentElement.style.backgroundColor = resolvedTheme === 'dark' ? '#0f172a' : '#f8fafc';
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${notoSansArabic.variable} antialiased bg-background text-foreground`}
      >
        {/*
          Provider Groups - Reduced from 17 nested providers to 6 logical groups
          This improves:
          - Code readability
          - Maintainability
          - Performance (slightly)
        */}
        <CoreProvider>
          <CardsAndCashbackProvider>
            <FinancialAccountsProvider>
              <BusinessProvider>
                <InvestmentsAndSavingsProvider>
                  <CentralTransfersProvider>
                    <ReconciliationProvider>
                      <LayoutProvider>
                        {children}
                      </LayoutProvider>
                      <Toaster />
                    </ReconciliationProvider>
                  </CentralTransfersProvider>
                </InvestmentsAndSavingsProvider>
              </BusinessProvider>
            </FinancialAccountsProvider>
          </CardsAndCashbackProvider>
        </CoreProvider>
      </body>
    </html>
  );
}
