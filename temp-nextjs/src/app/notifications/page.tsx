import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <NotificationsPage />
    </ProtectedRoute>
  );
}