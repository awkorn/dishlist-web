import DishListDetailPage from '@/features/dishlist/pages/DishListDetailPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <DishListDetailPage dishListId={params.id} />
    </ProtectedRoute>
  );
}