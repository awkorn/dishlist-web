import { ApolloWrapper } from '@/lib/apollo-provider';
import { AuthProvider } from '@/contexts/AuthProvider';
import '../styles/globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'DishList',
  description: 'Create and share your favorite recipes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>
          <AuthProvider>
            {children}
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}