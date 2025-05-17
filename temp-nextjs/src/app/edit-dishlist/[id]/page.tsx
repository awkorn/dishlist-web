import EditDishListPage from '@/features/dishlists/pages/EditDishListPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <EditDishListPage dishListId={params.id} />
    </ProtectedRoute>
  );
}