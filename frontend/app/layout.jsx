export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body>
          <div className="container mx-auto p-6">{children}</div>
        </body>
      </html>
    );
  }
  