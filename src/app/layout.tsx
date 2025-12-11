import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/contexts/theme-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { BankAccountsProvider } from "@/contexts/bank-accounts-context";
import { EWalletsProvider } from "@/contexts/e-wallets-context";
import { CashVaultsProvider } from "@/contexts/cash-vaults-context";
import { CardsProvider } from "@/contexts/cards-context";
import { CustomersProvider } from "@/contexts/customers-context";
import { ProductsProvider } from "@/contexts/products-context";
import { SalesProvider } from "@/contexts/sales-context";
import { PrepaidCardsProvider } from "@/contexts/prepaid-cards-context";
import { POSMachinesProvider } from "@/contexts/pos-machines-context";
import { SavingsCirclesProvider } from "@/contexts/savings-circles-context";
import { InvestmentsProvider } from "@/contexts/investments-context";
import { MerchantsProvider } from "@/contexts/merchants-context";
import { CentralTransfersProvider } from "@/contexts/central-transfers-context";
import { CashbackProvider } from "@/contexts/cashback-context";
import { ReconciliationProvider } from "@/contexts/reconciliation-context";
import { BalanceVisibilityProvider } from "@/contexts/balance-visibility-context";
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
        <SettingsProvider>
          <ThemeProvider>
            <NotificationsProvider>
              <AuthProvider>
                <BalanceVisibilityProvider>
                  <MerchantsProvider>
                  <CardsProvider>
                    <BankAccountsProvider>
                      <CashVaultsProvider>
                        <EWalletsProvider>
                          <PrepaidCardsProvider>
                            <POSMachinesProvider>
                              <CustomersProvider>
                                <ProductsProvider>
                                  <SalesProvider>
                                    <SavingsCirclesProvider>
                                      <InvestmentsProvider>
                                        <CentralTransfersProvider>
                                          <CashbackProvider>
                                            <ReconciliationProvider>
                                              <LayoutProvider>
                                                {children}
                                              </LayoutProvider>
                                              <Toaster />
                                            </ReconciliationProvider>
                                          </CashbackProvider>
                                        </CentralTransfersProvider>
                                      </InvestmentsProvider>
                                    </SavingsCirclesProvider>
                                  </SalesProvider>
                                </ProductsProvider>
                              </CustomersProvider>
                            </POSMachinesProvider>
                          </PrepaidCardsProvider>
                        </EWalletsProvider>
                      </CashVaultsProvider>
                    </BankAccountsProvider>
                  </CardsProvider>
                </MerchantsProvider>
                </BalanceVisibilityProvider>
              </AuthProvider>
            </NotificationsProvider>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
