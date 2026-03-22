import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export const metadata = {
  title: 'J5 Sales OS',
  description: 'Internal lead generation and sales pipeline platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Topbar />
            <main className="page-container">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
