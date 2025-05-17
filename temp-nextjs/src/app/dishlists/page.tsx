import DishListsPage from '@/features/dishlists/pages/DishListsPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <DishListsPage />
    </ProtectedRoute>
  );
}