import ReviewImportedRecipePage from '@/features/recipeImport/pages/ReviewImportedRecipePage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <ReviewImportedRecipePage dishListId={params.id} />
    </ProtectedRoute>
  );
}