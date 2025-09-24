# 🎯 Niche Change Examples

## Current Configuration (Dog Parks)
```typescript
// src/lib/config.ts
export const siteConfig = {
  niche: 'Dog Park',
  // ... rest of config
}
```

**Results in:**
- Homepage: "Find the Best Local Dog Parks"
- State pages: "California Dog Park Directory"
- City pages: "Los Angeles Dog Park Directory"
- Search: "Search dog parks, locations..."

---

## Example 1: Change to Restaurants
```typescript
// src/lib/config.ts
export const siteConfig = {
  niche: 'Restaurant',
  // ... rest of config
}
```

**Results in:**
- Homepage: "Find the Best Local Restaurants"
- State pages: "California Restaurant Directory"
- City pages: "Los Angeles Restaurant Directory"
- Search: "Search restaurants, locations..."

---

## Example 2: Change to Gyms
```typescript
// src/lib/config.ts
export const siteConfig = {
  niche: 'Gym',
  // ... rest of config
}
```

**Results in:**
- Homepage: "Find the Best Local Gyms"
- State pages: "California Gym Directory"
- City pages: "Los Angeles Gym Directory"
- Search: "Search gyms, locations..."

---

## Example 3: Change to Salons
```typescript
// src/lib/config.ts
export const siteConfig = {
  niche: 'Salon',
  // ... rest of config
}
```

**Results in:**
- Homepage: "Find the Best Local Salons"
- State pages: "California Salon Directory"
- City pages: "Los Angeles Salon Directory"
- Search: "Search salons, locations..."

---

## Example 4: Change to Pet Stores
```typescript
// src/lib/config.ts
export const siteConfig = {
  niche: 'Pet Store',
  // ... rest of config
}
```

**Results in:**
- Homepage: "Find the Best Local Pet Stores"
- State pages: "California Pet Store Directory"
- City pages: "Los Angeles Pet Store Directory"
- Search: "Search pet stores, locations..."

---

## 🎯 What Updates Automatically

### ✅ **Homepage Elements**
- Hero title
- Hero subtitle
- Search placeholder
- Search button text
- Search result messages
- Featured section titles

### ✅ **State Page Elements**
- Page title (SEO)
- H1 heading
- Meta description
- Keywords
- All section headings
- Business count text

### ✅ **City Page Elements**
- Page title (SEO)
- H1 heading
- Meta description
- Keywords
- Category section titles
- Business count text

### ✅ **SEO & Meta Tags**
- Page titles
- Meta descriptions
- Keywords
- Open Graph titles
- Twitter card titles
- Structured data

---

## 🚀 Quick Test

1. **Change** `niche: 'Dog Park'` to `niche: 'Restaurant'` in `src/lib/config.ts`
2. **Save** the file
3. **Restart** your dev server
4. **Visit** your homepage
5. **See** "Find the Best Local Restaurants" instead of "Find the Best Local Dog Parks"

**That's it!** 🎉 One line change updates everything across your entire website.




