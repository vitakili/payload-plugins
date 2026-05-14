import { ResolvedThemeConfiguration, ThemeProvider } from '@kilivi-dev/payloadcms-theme-management'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import React from 'react'
import { AuthProvider } from '@/providers/Auth'
import { SonnerProvider } from '@/providers/Sonner'
import { HeaderThemeProvider } from './HeaderTheme'

export const Providers: React.FC<{
  themeConfiguration?: ResolvedThemeConfiguration
  children: React.ReactNode
}> = ({ themeConfiguration, children }) => {
  return (
    <ThemeProvider
      initialTheme={themeConfiguration?.theme ?? undefined}
      initialMode={themeConfiguration?.colorMode ?? undefined}
    >
      <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <EcommerceProvider
            enableVariants={true}
            api={{
              cartsFetchQuery: {
                depth: 2,
                populate: {
                  products: {
                    slug: true,
                    title: true,
                    gallery: true,
                    inventory: true,
                  },
                  variants: {
                    title: true,
                    inventory: true,
                  },
                },
              },
            }}
            paymentMethods={[
              stripeAdapterClient({
                publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
              }),
            ]}
          >
            {children}
          </EcommerceProvider>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
