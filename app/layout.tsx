import favicon from './favicon.ico';

export const metadata = {
  icons: {
    icon: favicon.src,
  },
};

// This file is required by Next.js but delegates to the locale-specific layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
