import "./globals.css";

export const metadata = {
  title: "ReEmber Test Auth App",
  description: "Basic Next.js authentication flow using the Django backend."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
