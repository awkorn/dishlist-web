import ImportRecipePage from '@/features/recipeImport/pages/ImportRecipePage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <ImportRecipePage dishListId={params.id} />
    </ProtectedRoute>
  );
}