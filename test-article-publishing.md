# Article Publishing Test

## Test Steps:

1. **Create a new article** via API
2. **Check if it appears in all articles** (should be draft)
3. **Publish the article** via API
4. **Check if it appears in published articles**
5. **Check if it appears on homepage**

## API Endpoints:

- GET `/api/articles` - All articles
- GET `/api/articles?published=true` - Published articles only
- POST `/api/articles` - Create article
- PUT `/api/articles/[id]` - Update article

## Test Article Data:

```json
{
  "title": "Test Article for Publishing",
  "content": "<p>This is a test article to verify the publishing flow.</p>",
  "slug": "test-article-publishing",
  "published": false
}
```

## Expected Results:

1. Article should be created as draft (published: false)
2. After publishing, it should appear in published articles
3. It should appear on the homepage
4. Copy-paste should preserve formatting in the editor