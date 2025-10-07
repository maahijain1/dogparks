# Debug database directly
$liveUrl = "https://www.dogboardingkennels.us"

Write-Host "Debugging database directly..."

try {
    # Test the API with different parameters
    Write-Host "1. Testing API with no parameters..."
    $response1 = Invoke-WebRequest -Uri "$liveUrl/api/articles" -Method GET
    $articles1 = $response1.Content | ConvertFrom-Json
    Write-Host "No parameters: $($articles1.Count) articles"
    
    # Test with cache busting
    Write-Host "`n2. Testing with cache busting..."
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $cacheBustUrl = "$liveUrl/api/articles?t=$timestamp"
    $response2 = Invoke-WebRequest -Uri $cacheBustUrl -Method GET
    $articles2 = $response2.Content | ConvertFrom-Json
    Write-Host "Cache busted: $($articles2.Count) articles"
    
    # Test with different headers
    Write-Host "`n3. Testing with different headers..."
    $headers = @{
        'Cache-Control' = 'no-cache'
        'Pragma' = 'no-cache'
        'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    $response3 = Invoke-WebRequest -Uri "$liveUrl/api/articles" -Method GET -Headers $headers
    $articles3 = $response3.Content | ConvertFrom-Json
    Write-Host "Different headers: $($articles3.Count) articles"
    
    # Show what articles we're getting
    Write-Host "`n4. Articles found:"
    foreach ($article in $articles1) {
        Write-Host "- $($article.title) (Published: $($article.published))"
    }
    
    # Check if there's a limit in the API
    Write-Host "`n5. Checking for API limits..."
    if ($articles1.Count -eq 4) {
        Write-Host "❌ API is limiting results to 4 articles"
        Write-Host "This suggests there's a LIMIT clause in the database query"
    } else {
        Write-Host "✅ API is returning all articles"
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
