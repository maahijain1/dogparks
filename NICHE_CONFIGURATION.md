# 🎯 Niche Configuration Guide

## Quick Start - Change Your Niche

To change your niche from "Dog Park" to anything else (like "Restaurant", "Gym", "Salon", etc.), simply edit **ONE FILE**:

### 📁 File: `src/lib/config.ts`

**Line 4:** Change the niche value:
```typescript
export const siteConfig = {
  // Main niche - change this to update everywhere
  niche: 'Dog Park',  // ← Change this line only!
```

### 🎯 Examples:

**For Restaurants:**
```typescript
niche: 'Restaurant',
```

**For Gyms:**
```typescript
niche: 'Gym',
```

**For Salons:**
```typescript
niche: 'Salon',
```

**For Pet Stores:**
```typescript
niche: 'Pet Store',
```

## ✨ What Changes Automatically

When you change the niche in `config.ts`, it automatically updates:

### 🏠 **Homepage**
- Hero title: "Find the Best Local [Niche]s"
- Search placeholder: "Search [niche]s, locations..."
- Search button: "Find [Niche]s"
- All text references

### 🏛️ **State Pages** (`/state/[slug]`)
- Page title: "[State Name] [Niche] Directory"
- H1: "[State Name] [Niche] Directory"
- Description: "Discover X [niche]s across Y cities"
- All section headings

### 🏙️ **City Pages** (`/city/[slug]`)
- Page title: "[City Name] [Niche] Directory"
- H1: "[City Name] [Niche] Directory"
- Description: "Discover X [niche]s in [City Name]"
- Category sections: "[Niche] Categories"
- All business references

### 🔍 **SEO & Meta Tags**
- Page titles automatically update
- Meta descriptions include the niche
- Keywords include niche-specific terms
- Structured data reflects the niche

## 🎨 Customization Options

### **Advanced Customization**

You can also customize specific text in `src/lib/config.ts`:

```typescript
export const siteConfig = {
  niche: 'Dog Park',
  
  // Customize specific sections
  content: {
    hero: {
      title: 'Find the Best Local Dog Parks',  // Custom hero title
      subtitle: 'Discover top-rated dog parks in your area',  // Custom subtitle
      searchPlaceholder: 'Search dog parks, locations...',  // Custom placeholder
      searchButton: 'Find Dog Parks'  // Custom button text
    },
    
    featured: {
      title: 'Featured Dog Parks',  // Custom featured title
      subtitle: 'Hand-picked premium dog parks that stand out',  // Custom subtitle
      badge: '⭐ FEATURED DOG PARK'  // Custom badge text
    }
  }
}
```

### **SEO Templates**

Customize SEO titles and descriptions:

```typescript
seo: {
  state: {
    title: '{stateName} Dog Park Directory | Find Dog Parks in {stateName}',
    description: 'Discover {totalListings} dog parks across {totalCities} cities in {stateName}.',
    keywords: '{stateName} dog parks, dog parks in {stateName}, {stateName} dog park directory'
  },
  
  city: {
    title: '{cityName} Dog Park Directory | Find Dog Parks in {cityName}, {stateName}',
    description: 'Find {totalListings} dog parks in {cityName}, {stateName}.',
    keywords: '{cityName} dog parks, dog parks in {cityName}, {cityName} dog park directory'
  }
}
```

## 🚀 Popular Niche Examples

### **Food & Dining**
```typescript
niche: 'Restaurant',
// Results in: "Find the Best Local Restaurants", "Restaurant Directory", etc.
```

### **Health & Fitness**
```typescript
niche: 'Gym',
// Results in: "Find the Best Local Gyms", "Gym Directory", etc.
```

### **Beauty & Wellness**
```typescript
niche: 'Salon',
// Results in: "Find the Best Local Salons", "Salon Directory", etc.
```

### **Pet Services**
```typescript
niche: 'Pet Store',
// Results in: "Find the Best Local Pet Stores", "Pet Store Directory", etc.
```

### **Automotive**
```typescript
niche: 'Auto Repair',
// Results in: "Find the Best Local Auto Repair", "Auto Repair Directory", etc.
```

### **Home Services**
```typescript
niche: 'Plumber',
// Results in: "Find the Best Local Plumbers", "Plumber Directory", etc.
```

## 📝 Step-by-Step Instructions

1. **Open** `src/lib/config.ts`
2. **Find** line 4: `niche: 'Dog Park',`
3. **Change** to your desired niche: `niche: 'Restaurant',`
4. **Save** the file
5. **Restart** your development server (`npm run dev`)
6. **Visit** your site - everything updates automatically!

## ✅ Verification Checklist

After changing the niche, verify these update correctly:

- [ ] Homepage hero title
- [ ] Homepage search placeholder
- [ ] State page titles (e.g., "California Restaurant Directory")
- [ ] City page titles (e.g., "Los Angeles Restaurant Directory")
- [ ] All section headings
- [ ] Search result messages
- [ ] Meta descriptions in page source
- [ ] Browser tab titles

## 🎯 Pro Tips

1. **Use Singular Form**: Use "Restaurant" not "Restaurants" - the system handles pluralization
2. **Capitalize Properly**: Use title case for better SEO
3. **Keep It Simple**: Avoid complex phrases, use single words or short phrases
4. **Test Thoroughly**: Check all pages after changing to ensure everything updates
5. **SEO Keywords**: Update the SEO keywords in the config for better search rankings

## 🔧 Troubleshooting

**If changes don't appear:**
1. Restart your development server
2. Clear browser cache
3. Check for typos in the config file
4. Verify the file saved correctly

**If you see errors:**
1. Check the console for JavaScript errors
2. Ensure the config file syntax is correct
3. Make sure all quotes are properly closed

---

**That's it!** 🎉 One simple change updates your entire website's niche focus. Perfect for creating multiple directory sites or pivoting your business focus.




