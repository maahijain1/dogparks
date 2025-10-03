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
  // Kennel-specific fields
  boarding_type?: string // cage-based, suite, free-roam, in-home
  dog_size_accepted?: string // small, medium, large, all-sizes
  breed_restrictions?: string
  services_offered?: string[] // playtime, walks, grooming, training, medical
  supervision_24_7?: boolean
  cctv_access?: boolean
  vet_on_call?: boolean
  vaccination_required?: boolean
  price_per_night?: number
  price_per_week?: number
  price_per_month?: number
  latitude?: number
  longitude?: number
  max_dogs?: number
  outdoor_space?: boolean
  indoor_space?: boolean
  emergency_contact?: string
  pickup_dropoff_times?: string
  special_diet_accommodation?: boolean
  medication_administered?: boolean
  exercise_schedule?: string
  social_playtime?: boolean
  individual_attention?: boolean
  webcam_access?: boolean
  insurance_coverage?: boolean
  licensing_info?: string
  years_in_business?: number
  staff_ratio?: string
  temperature_controlled?: boolean
  noise_level?: string
  special_needs_accommodation?: boolean
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

