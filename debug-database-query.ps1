# Debug database query directly
$liveUrl = "https://www.dogboardingkennels.us"

Write-Host "Debugging database query..."

try {
    # Test the API with different parameters
    Write-Host "1. Testing all articles..."
    $allResponse = Invoke-WebRequest -Uri "$liveUrl/api/articles" -Method GET
    $allArticles = $allResponse.Content | ConvertFrom-Json
    Write-Host "All articles: $($allArticles.Count)"
    
    # Test published articles
    Write-Host "`n2. Testing published articles..."
    $publishedResponse = Invoke-WebRequest -Uri "$liveUrl/api/articles?published=true" -Method GET
    $publishedArticles = $publishedResponse.Content | ConvertFrom-Json
    Write-Host "Published articles: $($publishedArticles.Count)"
    
    # Test draft articles
    Write-Host "`n3. Testing draft articles..."
    $draftResponse = Invoke-WebRequest -Uri "$liveUrl/api/articles?published=false" -Method GET
    $draftArticles = $draftResponse.Content | ConvertFrom-Json
    Write-Host "Draft articles: $($draftArticles.Count)"
    
    # Show all articles
    Write-Host "`n4. All articles found:"
    foreach ($article in $allArticles) {
        $status = if ($article.published) { "Published" } else { "Draft" }
        Write-Host "- $($article.title) ($status)"
    }
    
    # Check if there's a pattern
    Write-Host "`n5. Analysis:"
    Write-Host "Total: $($allArticles.Count) articles"
    Write-Host "Published: $($publishedArticles.Count) articles"
    Write-Host "Draft: $($draftArticles.Count) articles"
    
    if ($allArticles.Count -eq 4) {
        Write-Host "❌ Database is limiting results to 4 articles"
        Write-Host "This suggests there's a LIMIT 4 clause somewhere"
    } else {
        Write-Host "✅ Database is returning all articles"
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
