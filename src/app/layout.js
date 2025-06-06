// src/app/layout.js
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import "./globals.css";

export const metadata = {
  title: "Asutav kogu",
  description: "Next.js + Mantine",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
      </body>
    </html>
  );
}
