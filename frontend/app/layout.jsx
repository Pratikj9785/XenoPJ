import './globals.css'

export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body className="bg-gray-50">
          <div className="min-h-screen">{children}</div>
        </body>
      </html>
    );
  }
  