export interface State {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface City {
  id: string
  name: string
  state_id: string
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  business: string
  category: string
  review_rating: number
  number_of_reviews: number
  address: string
  website: string
  phone: string
  email?: string
  city_id: string
  featured?: boolean
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  title: string
  content: string
  slug: string
  featured_image?: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      states: {
        Row: State
        Insert: Omit<State, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<State, 'id' | 'created_at' | 'updated_at'>>
      }
      cities: {
        Row: City
        Insert: Omit<City, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<City, 'id' | 'created_at' | 'updated_at'>>
      }
      listings: {
        Row: Listing
        Insert: Omit<Listing, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Listing, 'id' | 'created_at' | 'updated_at'>>
      }
      articles: {
        Row: Article
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Article, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

