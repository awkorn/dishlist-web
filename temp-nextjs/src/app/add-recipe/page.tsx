import AddRecipePage from '@/features/recipe/pages/AddRecipePage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <AddRecipePage />
    </ProtectedRoute>
  );
}