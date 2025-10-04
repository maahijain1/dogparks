import { supabase } from '@/lib/supabase'

export default async function TestArticleSimplePage() {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', 'how-much-does-dog-boarding-cost-in-the-usa')
      .eq('published', true)
      .single()

    if (error) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Article Error</h1>
          <p>Error: {error.message}</p>
        </div>
      )
    }

    if (!article) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p>No article found with that slug.</p>
        </div>
      )
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Article Found!</h1>
        <h2 className="text-xl mb-2">{article.title}</h2>
        <p className="mb-2">Slug: {article.slug}</p>
        <p className="mb-2">Published: {article.published ? 'Yes' : 'No'}</p>
        <p className="mb-2">Has Image: {article.featured_image ? 'Yes' : 'No'}</p>
        <div className="mt-4">
          <h3 className="font-bold">Content Preview:</h3>
          <div className="bg-gray-100 p-4 rounded">
            {article.content ? article.content.substring(0, 200) + '...' : 'No content'}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Server Error</h1>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }
}
