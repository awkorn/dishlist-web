import AddDishListPage from '@/features/dishlists/pages/AddDishListPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <AddDishListPage />
    </ProtectedRoute>
  );
}