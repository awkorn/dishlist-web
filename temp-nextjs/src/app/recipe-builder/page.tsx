import RecipeBuilderPage from '@/features/recipeBuilder/pages/RecipeBuilderPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <RecipeBuilderPage />
    </ProtectedRoute>
  );
}