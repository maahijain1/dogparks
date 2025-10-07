# Test admin panel directly
$liveUrl = "https://www.dogboardingkennels.us"

Write-Host "Testing admin panel directly..."

try {
    # Test the admin panel page
    Write-Host "1. Testing admin panel page..."
    $adminResponse = Invoke-WebRequest -Uri "$liveUrl/admin/articles" -Method GET
    Write-Host "Admin panel status: $($adminResponse.StatusCode)"
    
    # Check if the page contains article data
    $adminContent = $adminResponse.Content
    
    # Look for specific articles in the HTML
    if ($adminContent -like "*Separation Anxiety*") {
        Write-Host "✅ 'Separation Anxiety' article found in admin panel HTML"
    } else {
        Write-Host "❌ 'Separation Anxiety' article NOT found in admin panel HTML"
    }
    
    if ($adminContent -like "*aggressive dog*") {
        Write-Host "✅ 'aggressive dog' article found in admin panel HTML"
    } else {
        Write-Host "❌ 'aggressive dog' article NOT found in admin panel HTML"
    }
    
    # Check for JavaScript errors or loading states
    if ($adminContent -like "*Loading*") {
        Write-Host "⚠️ Admin panel shows loading state"
    }
    
    if ($adminContent -like "*No Articles Found*") {
        Write-Host "❌ Admin panel shows 'No Articles Found'"
    }
    
    # Check for the articles API call
    if ($adminContent -like "*api/articles*") {
        Write-Host "✅ Admin panel references articles API"
    } else {
        Write-Host "❌ Admin panel does not reference articles API"
    }
    
    Write-Host "`n2. The issue is likely:"
    Write-Host "- JavaScript not loading articles in admin panel"
    Write-Host "- Articles are being filtered out"
    Write-Host "- There's a caching issue"
    Write-Host "- The admin panel is not fetching articles correctly"
    
    Write-Host "`n3. Let's try a different approach..."
    Write-Host "I'll create a simple test page to verify articles are accessible"
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
