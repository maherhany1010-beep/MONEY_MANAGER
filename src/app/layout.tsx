import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/contexts/theme-context";
import { MerchantsProvider } from "@/contexts/merchants-context";
import { CardsProvider } from "@/contexts/cards-context";
import { BankAccountsProvider } from "@/contexts/bank-accounts-context";
import { CashVaultsProvider } from "@/contexts/cash-vaults-context";
import { EWalletsProvider } from "@/contexts/e-wallets-context";
import { PrepaidCardsProvider } from "@/contexts/prepaid-cards-context";
import { POSMachinesProvider } from "@/contexts/pos-machines-context";
import { CentralTransfersProvider } from "@/contexts/central-transfers-context";
import { CustomersProvider } from "@/contexts/customers-context";
import { SavingsCirclesProvider } from "@/contexts/savings-circles-context";
import { ProductsProvider } from "@/contexts/products-context";
import { SalesProvider } from "@/contexts/sales-context";
import { InvestmentsProvider } from "@/contexts/investments-context";
import { ReconciliationProvider } from "@/contexts/reconciliation-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "الإدارة المالية الشاملة",
  description: "نظام شامل لإدارة البطاقات الائتمانية والحسابات البنكية والمحافظ الإلكترونية والخزائن النقدية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${notoSansArabic.variable} antialiased`}
      >
        <SettingsProvider>
          <ThemeProvider>
            <NotificationsProvider>
              <AuthProvider>
                <MerchantsProvider>
                  <CardsProvider>
                    <BankAccountsProvider>
                      <CashVaultsProvider>
                        <EWalletsProvider>
                          <PrepaidCardsProvider>
                            <POSMachinesProvider>
                              <CentralTransfersProvider>
                                <CustomersProvider>
                                  <SavingsCirclesProvider>
                                    <ProductsProvider>
                                      <SalesProvider>
                                        <InvestmentsProvider>
                                          <ReconciliationProvider>
                                            {children}
                                            <Toaster />
                                          </ReconciliationProvider>
                                        </InvestmentsProvider>
                                      </SalesProvider>
                                    </ProductsProvider>
                                  </SavingsCirclesProvider>
                                </CustomersProvider>
                              </CentralTransfersProvider>
                            </POSMachinesProvider>
                          </PrepaidCardsProvider>
                        </EWalletsProvider>
                      </CashVaultsProvider>
                    </BankAccountsProvider>
                  </CardsProvider>
                </MerchantsProvider>
              </AuthProvider>
            </NotificationsProvider>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
