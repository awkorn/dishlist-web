import ProfilePage from '@/features/profile/pages/ProfilePage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page({ params }: { params: { userId: string } }) {
  return (
    <ProtectedRoute>
      <ProfilePage userId={params.userId} />
    </ProtectedRoute>
  );
}