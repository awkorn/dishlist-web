import RecipeDetailPage from '@/features/recipe/pages/RecipeDetailPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <RecipeDetailPage recipeId={params.id} />
    </ProtectedRoute>
  );
}