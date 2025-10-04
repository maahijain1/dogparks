import { supabase } from '@/lib/supabase'

export default async function TestArticleDebug() {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', 'how-to-choose-a-luxury-dog-boarding-kennel-that-fits-your-pets-needs')
      .eq('published', true)
      .single()

    if (error) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Error fetching article</h1>
          <pre className="bg-red-100 p-4 rounded">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )
    }

    if (!article) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        </div>
      )
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Article Debug</h1>
        <div className="mb-4">
          <strong>Title:</strong> {article.title}
        </div>
        <div className="mb-4">
          <strong>Slug:</strong> {article.slug}
        </div>
        <div className="mb-4">
          <strong>Published:</strong> {article.published ? 'Yes' : 'No'}
        </div>
        <div className="mb-4">
          <strong>Featured Image:</strong> {article.featured_image || 'None'}
        </div>
        <div className="mb-4">
          <strong>Content Length:</strong> {article.content?.length || 0} characters
        </div>
        <div className="mb-4">
          <strong>Content Preview (first 200 chars):</strong>
          <div className="bg-gray-100 p-4 rounded mt-2">
            {article.content?.substring(0, 200)}...
          </div>
        </div>
        <div className="mb-4">
          <strong>Raw Content (first 500 chars):</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2 text-xs overflow-auto">
            {article.content?.substring(0, 500)}
          </pre>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Server Error</h1>
        <pre className="bg-red-100 p-4 rounded">{String(error)}</pre>
      </div>
    )
  }
}
