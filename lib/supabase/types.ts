export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          active: boolean
          created_at: string
          id: string
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_authors: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          id: string
          image_media_id: string | null
          image_url: string | null
          name: string
          slug: string
          title: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_media_id?: string | null
          image_url?: string | null
          name: string
          slug: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_media_id?: string | null
          image_url?: string | null
          name?: string
          slug?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_authors_image_media_id_fkey"
            columns: ["image_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          page_id: string | null
          question: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          page_id?: string | null
          question: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          page_id?: string | null
          question?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_media: {
        Row: {
          created_at: string
          id: string
          is_gallery_item: boolean
          is_og_candidate: boolean
          is_primary: boolean
          listing_id: string
          media_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_gallery_item?: boolean
          is_og_candidate?: boolean
          is_primary?: boolean
          listing_id: string
          media_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_gallery_item?: boolean
          is_og_candidate?: boolean
          is_primary?: boolean
          listing_id?: string
          media_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_media_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "real_estate_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_types: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          label: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          label: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          duration_seconds: number | null
          embed_url: string | null
          external_url: string | null
          file_size_bytes: number | null
          height: number | null
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          mime_type: string | null
          provider: string | null
          public_url: string | null
          source_type: Database["public"]["Enums"]["media_source_type"]
          status: Database["public"]["Enums"]["content_status"]
          storage_bucket: string | null
          storage_path: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          embed_url?: string | null
          external_url?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          mime_type?: string | null
          provider?: string | null
          public_url?: string | null
          source_type: Database["public"]["Enums"]["media_source_type"]
          status?: Database["public"]["Enums"]["content_status"]
          storage_bucket?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          embed_url?: string | null
          external_url?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          mime_type?: string | null
          provider?: string | null
          public_url?: string | null
          source_type?: Database["public"]["Enums"]["media_source_type"]
          status?: Database["public"]["Enums"]["content_status"]
          storage_bucket?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      office_locations: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          country_code: string
          created_at: string
          detail: string | null
          email: string | null
          id: string
          image_media_id: string | null
          latitude: number | null
          longitude: number | null
          map_url: string | null
          name: string
          phone: string | null
          postal_code: string | null
          region: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          status_label: string | null
          updated_at: string
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          country_code?: string
          created_at?: string
          detail?: string | null
          email?: string | null
          id?: string
          image_media_id?: string | null
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          status_label?: string | null
          updated_at?: string
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          country_code?: string
          created_at?: string
          detail?: string | null
          email?: string | null
          id?: string
          image_media_id?: string | null
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          status_label?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_locations_image_media_id_fkey"
            columns: ["image_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      page_blocks: {
        Row: {
          attributes: Json
          block_key: string | null
          body: string | null
          created_at: string
          icon_name: string | null
          id: string
          link_kind: Database["public"]["Enums"]["link_kind"] | null
          link_label: string | null
          link_url: string | null
          media_id: string | null
          section_id: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          attributes?: Json
          block_key?: string | null
          body?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          link_kind?: Database["public"]["Enums"]["link_kind"] | null
          link_label?: string | null
          link_url?: string | null
          media_id?: string | null
          section_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          attributes?: Json
          block_key?: string | null
          body?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          link_kind?: Database["public"]["Enums"]["link_kind"] | null
          link_label?: string | null
          link_url?: string | null
          media_id?: string | null
          section_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_blocks_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_blocks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "page_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          body: string | null
          created_at: string
          eyebrow: string | null
          heading: string | null
          id: string
          media_id: string | null
          page_id: string
          section_key: string
          settings: Json
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          subheading: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          eyebrow?: string | null
          heading?: string | null
          id?: string
          media_id?: string | null
          page_id: string
          section_key: string
          settings?: Json
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          subheading?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          eyebrow?: string | null
          heading?: string | null
          id?: string
          media_id?: string | null
          page_id?: string
          section_key?: string
          settings?: Json
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          subheading?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          body: string | null
          created_at: string
          heading: string | null
          hero_media_id: string | null
          id: string
          intro: string | null
          keywords: string[]
          meta_description: string
          meta_title: string
          noindex: boolean
          og_image: string | null
          og_media_id: string | null
          page_key: string
          published_at: string | null
          route_path: string
          search_document: unknown
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          heading?: string | null
          hero_media_id?: string | null
          id?: string
          intro?: string | null
          keywords?: string[]
          meta_description: string
          meta_title: string
          noindex?: boolean
          og_image?: string | null
          og_media_id?: string | null
          page_key: string
          published_at?: string | null
          route_path: string
          search_document?: unknown
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          heading?: string | null
          hero_media_id?: string | null
          id?: string
          intro?: string | null
          keywords?: string[]
          meta_description?: string
          meta_title?: string
          noindex?: boolean
          og_image?: string | null
          og_media_id?: string | null
          page_key?: string
          published_at?: string | null
          route_path?: string
          search_document?: unknown
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_og_media_id_fkey"
            columns: ["og_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      real_estate_listings: {
        Row: {
          address_line: string | null
          area_unit: string | null
          area_value: number | null
          attributes: Json
          availability: string
          bathrooms: number | null
          bedrooms: number | null
          block: string | null
          canonical_path: string
          city: string | null
          contact_person_id: string | null
          country_code: string
          created_at: string
          description: string | null
          features: Json
          garage_capacity: number | null
          id: string
          keywords: string[]
          latitude: number | null
          listing_status: string | null
          listing_type_slug: string
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          neighborhood: string | null
          noindex: boolean
          og_image: string | null
          og_media_id: string | null
          phase: string | null
          postal_code: string | null
          price_currency: string
          price_label: string
          price_numeric: number | null
          project: string | null
          published_at: string | null
          region: string | null
          search_document: unknown
          size_label: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          thumbnail_media_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          address_line?: string | null
          area_unit?: string | null
          area_value?: number | null
          attributes?: Json
          availability?: string
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          canonical_path: string
          city?: string | null
          contact_person_id?: string | null
          country_code?: string
          created_at?: string
          description?: string | null
          features?: Json
          garage_capacity?: number | null
          id?: string
          keywords?: string[]
          latitude?: number | null
          listing_status?: string | null
          listing_type_slug: string
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          neighborhood?: string | null
          noindex?: boolean
          og_image?: string | null
          og_media_id?: string | null
          phase?: string | null
          postal_code?: string | null
          price_currency?: string
          price_label?: string
          price_numeric?: number | null
          project?: string | null
          published_at?: string | null
          region?: string | null
          search_document?: unknown
          size_label?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          thumbnail_media_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          address_line?: string | null
          area_unit?: string | null
          area_value?: number | null
          attributes?: Json
          availability?: string
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          canonical_path?: string
          city?: string | null
          contact_person_id?: string | null
          country_code?: string
          created_at?: string
          description?: string | null
          features?: Json
          garage_capacity?: number | null
          id?: string
          keywords?: string[]
          latitude?: number | null
          listing_status?: string | null
          listing_type_slug?: string
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          neighborhood?: string | null
          noindex?: boolean
          og_image?: string | null
          og_media_id?: string | null
          phase?: string | null
          postal_code?: string | null
          price_currency?: string
          price_label?: string
          price_numeric?: number | null
          project?: string | null
          published_at?: string | null
          region?: string | null
          search_document?: unknown
          size_label?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          thumbnail_media_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "real_estate_listings_contact_person_id_fkey"
            columns: ["contact_person_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "real_estate_listings_listing_type_slug_fkey"
            columns: ["listing_type_slug"]
            isOneToOne: false
            referencedRelation: "listing_types"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "real_estate_listings_og_media_id_fkey"
            columns: ["og_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "real_estate_listings_thumbnail_media_id_fkey"
            columns: ["thumbnail_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_landing_pages: {
        Row: {
          body: string | null
          canonical_path: string
          city: string | null
          created_at: string
          filters: Json
          heading: string
          hero_media_id: string | null
          id: string
          intro: string
          keywords: string[]
          listing_status: string | null
          listing_type_slug: string | null
          meta_description: string
          meta_title: string
          neighborhood: string | null
          noindex: boolean
          og_image: string | null
          og_media_id: string | null
          page_type: Database["public"]["Enums"]["seo_landing_page_type"]
          phase: string | null
          published_at: string | null
          public_link_description: string | null
          public_link_label: string | null
          search_document: unknown
          show_in_footer: boolean
          show_on_buy_sell: boolean
          show_on_home: boolean
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          canonical_path: string
          city?: string | null
          created_at?: string
          filters?: Json
          heading: string
          hero_media_id?: string | null
          id?: string
          intro: string
          keywords?: string[]
          listing_status?: string | null
          listing_type_slug?: string | null
          meta_description: string
          meta_title: string
          neighborhood?: string | null
          noindex?: boolean
          og_image?: string | null
          og_media_id?: string | null
          page_type: Database["public"]["Enums"]["seo_landing_page_type"]
          phase?: string | null
          published_at?: string | null
          public_link_description?: string | null
          public_link_label?: string | null
          search_document?: unknown
          show_in_footer?: boolean
          show_on_buy_sell?: boolean
          show_on_home?: boolean
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          canonical_path?: string
          city?: string | null
          created_at?: string
          filters?: Json
          heading?: string
          hero_media_id?: string | null
          id?: string
          intro?: string
          keywords?: string[]
          listing_status?: string | null
          listing_type_slug?: string | null
          meta_description?: string
          meta_title?: string
          neighborhood?: string | null
          noindex?: boolean
          og_image?: string | null
          og_media_id?: string | null
          page_type?: Database["public"]["Enums"]["seo_landing_page_type"]
          phase?: string | null
          published_at?: string | null
          public_link_description?: string | null
          public_link_label?: string | null
          search_document?: unknown
          show_in_footer?: boolean
          show_on_buy_sell?: boolean
          show_on_home?: boolean
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_landing_pages_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_landing_pages_listing_type_slug_fkey"
            columns: ["listing_type_slug"]
            isOneToOne: false
            referencedRelation: "listing_types"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "seo_landing_pages_og_media_id_fkey"
            columns: ["og_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_pages: {
        Row: {
          canonical_url: string | null
          created_at: string
          id: string
          keywords: string[]
          meta_description: string
          meta_title: string
          noindex: boolean
          og_image: string | null
          og_media_id: string | null
          route_path: string
          structured_data_overrides: Json
          title: string
          twitter_image: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          keywords?: string[]
          meta_description: string
          meta_title: string
          noindex?: boolean
          og_image?: string | null
          og_media_id?: string | null
          route_path: string
          structured_data_overrides?: Json
          title: string
          twitter_image?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          keywords?: string[]
          meta_description?: string
          meta_title?: string
          noindex?: boolean
          og_image?: string | null
          og_media_id?: string | null
          route_path?: string
          structured_data_overrides?: Json
          title?: string
          twitter_image?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_pages_og_media_id_fkey"
            columns: ["og_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_redirects: {
        Row: {
          active: boolean
          created_at: string
          id: string
          source_path: string
          status_code: number
          target_path: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          source_path: string
          status_code?: number
          target_path: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          source_path?: string
          status_code?: number
          target_path?: string
        }
        Relationships: []
      }
      seo_url_rules: {
        Row: {
          active: boolean
          canonical_path: string | null
          created_at: string
          id: string
          reason: string | null
          rule_kind: Database["public"]["Enums"]["seo_url_rule_kind"]
          source_pattern: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          canonical_path?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          rule_kind?: Database["public"]["Enums"]["seo_url_rule_kind"]
          source_pattern: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          canonical_path?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          rule_kind?: Database["public"]["Enums"]["seo_url_rule_kind"]
          source_pattern?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          bing_site_verification: string | null
          business_description: string | null
          business_name: string
          city: string | null
          country_code: string
          created_at: string
          default_meta_description: string | null
          default_meta_title: string | null
          default_og_image: string | null
          default_og_media_id: string | null
          email: string | null
          google_site_verification: string | null
          id: string
          knows_about: string[]
          latitude: number | null
          legal_name: string | null
          logo_media_id: string | null
          logo_url: string | null
          longitude: number | null
          map_url: string | null
          opening_hours: Json
          phone: string | null
          postal_code: string | null
          price_range: string | null
          region: string | null
          service_areas: string[]
          singleton_key: boolean
          social_links: Json
          tagline: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          bing_site_verification?: string | null
          business_description?: string | null
          business_name?: string
          city?: string | null
          country_code?: string
          created_at?: string
          default_meta_description?: string | null
          default_meta_title?: string | null
          default_og_image?: string | null
          default_og_media_id?: string | null
          email?: string | null
          google_site_verification?: string | null
          id?: string
          knows_about?: string[]
          latitude?: number | null
          legal_name?: string | null
          logo_media_id?: string | null
          logo_url?: string | null
          longitude?: number | null
          map_url?: string | null
          opening_hours?: Json
          phone?: string | null
          postal_code?: string | null
          price_range?: string | null
          region?: string | null
          service_areas?: string[]
          singleton_key?: boolean
          social_links?: Json
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          bing_site_verification?: string | null
          business_description?: string | null
          business_name?: string
          city?: string | null
          country_code?: string
          created_at?: string
          default_meta_description?: string | null
          default_meta_title?: string | null
          default_og_image?: string | null
          default_og_media_id?: string | null
          email?: string | null
          google_site_verification?: string | null
          id?: string
          knows_about?: string[]
          latitude?: number | null
          legal_name?: string | null
          logo_media_id?: string | null
          logo_url?: string | null
          longitude?: number | null
          map_url?: string | null
          opening_hours?: Json
          phone?: string | null
          postal_code?: string | null
          price_range?: string | null
          region?: string | null
          service_areas?: string[]
          singleton_key?: boolean
          social_links?: Json
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_default_og_media_id_fkey"
            columns: ["default_og_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_settings_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bio: string | null
          canonical_path: string | null
          created_at: string
          email: string | null
          has_profile_page: boolean
          id: string
          image_media_id: string | null
          image_url: string | null
          job_title: string | null
          keywords: string[]
          meta_description: string | null
          meta_title: string | null
          name: string
          og_image: string | null
          og_media_id: string | null
          phone: string | null
          profile_body: string | null
          profile_summary: string | null
          public_profile: boolean
          search_document: unknown
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          bio?: string | null
          canonical_path?: string | null
          created_at?: string
          email?: string | null
          has_profile_page?: boolean
          id?: string
          image_media_id?: string | null
          image_url?: string | null
          job_title?: string | null
          keywords?: string[]
          meta_description?: string | null
          meta_title?: string | null
          name: string
          og_image?: string | null
          og_media_id?: string | null
          phone?: string | null
          profile_body?: string | null
          profile_summary?: string | null
          public_profile?: boolean
          search_document?: unknown
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          bio?: string | null
          canonical_path?: string | null
          created_at?: string
          email?: string | null
          has_profile_page?: boolean
          id?: string
          image_media_id?: string | null
          image_url?: string | null
          job_title?: string | null
          keywords?: string[]
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          og_image?: string | null
          og_media_id?: string | null
          phone?: string | null
          profile_body?: string | null
          profile_summary?: string | null
          public_profile?: boolean
          search_document?: unknown
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_image_media_id_fkey"
            columns: ["image_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_og_media_id_fkey"
            columns: ["og_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      update_links: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["link_kind"]
          label: string
          sort_order: number
          update_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["link_kind"]
          label: string
          sort_order?: number
          update_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["link_kind"]
          label?: string
          sort_order?: number
          update_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_links_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "updates"
            referencedColumns: ["id"]
          },
        ]
      }
      update_media: {
        Row: {
          created_at: string
          id: string
          is_featured: boolean
          is_inline: boolean
          is_og_candidate: boolean
          media_id: string
          sort_order: number
          update_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_featured?: boolean
          is_inline?: boolean
          is_og_candidate?: boolean
          media_id: string
          sort_order?: number
          update_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_featured?: boolean
          is_inline?: boolean
          is_og_candidate?: boolean
          media_id?: string
          sort_order?: number
          update_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_media_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "updates"
            referencedColumns: ["id"]
          },
        ]
      }
      updates: {
        Row: {
          article_schema_type: Database["public"]["Enums"]["article_schema_type"]
          article_section: string | null
          author_id: string | null
          body: string | null
          canonical_path: string
          created_at: string
          featured: boolean
          has_detail_page: boolean
          headline: string | null
          id: string
          keywords: string[]
          meta_description: string | null
          meta_title: string | null
          modified_at: string | null
          noindex: boolean
          og_image: string | null
          og_media_id: string | null
          published_at: string | null
          search_document: unknown
          slug: string
          source: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          tags: string[]
          thumbnail_alt: string | null
          thumbnail_media_id: string | null
          thumbnail_url: string | null
          title: string
          update_type: Database["public"]["Enums"]["update_type"]
          updated_at: string
        }
        Insert: {
          article_schema_type?: Database["public"]["Enums"]["article_schema_type"]
          article_section?: string | null
          author_id?: string | null
          body?: string | null
          canonical_path: string
          created_at?: string
          featured?: boolean
          has_detail_page?: boolean
          headline?: string | null
          id?: string
          keywords?: string[]
          meta_description?: string | null
          meta_title?: string | null
          modified_at?: string | null
          noindex?: boolean
          og_image?: string | null
          og_media_id?: string | null
          published_at?: string | null
          search_document?: unknown
          slug: string
          source?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          tags?: string[]
          thumbnail_alt?: string | null
          thumbnail_media_id?: string | null
          thumbnail_url?: string | null
          title: string
          update_type?: Database["public"]["Enums"]["update_type"]
          updated_at?: string
        }
        Update: {
          article_schema_type?: Database["public"]["Enums"]["article_schema_type"]
          article_section?: string | null
          author_id?: string | null
          body?: string | null
          canonical_path?: string
          created_at?: string
          featured?: boolean
          has_detail_page?: boolean
          headline?: string | null
          id?: string
          keywords?: string[]
          meta_description?: string | null
          meta_title?: string | null
          modified_at?: string | null
          noindex?: boolean
          og_image?: string | null
          og_media_id?: string | null
          published_at?: string | null
          search_document?: unknown
          slug?: string
          source?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          tags?: string[]
          thumbnail_alt?: string | null
          thumbnail_media_id?: string | null
          thumbnail_url?: string | null
          title?: string
          update_type?: Database["public"]["Enums"]["update_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "content_authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "updates_og_media_id_fkey"
            columns: ["og_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "updates_thumbnail_media_id_fkey"
            columns: ["thumbnail_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      admin_role: "owner" | "editor" | "viewer"
      article_schema_type: "Article" | "NewsArticle" | "BlogPosting"
      content_status: "draft" | "review" | "published" | "archived"
      link_kind: "internal" | "external"
      media_source_type: "upload" | "youtube" | "facebook" | "external"
      media_type: "image" | "video" | "document" | "embed"
      seo_landing_page_type: "area" | "listing_category"
      seo_url_rule_kind: "index" | "noindex" | "canonical"
      update_type: "announcement" | "facebook" | "event" | "market" | "company"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["owner", "editor", "viewer"],
      article_schema_type: ["Article", "NewsArticle", "BlogPosting"],
      content_status: ["draft", "review", "published", "archived"],
      link_kind: ["internal", "external"],
      media_source_type: ["upload", "youtube", "facebook", "external"],
      media_type: ["image", "video", "document", "embed"],
      seo_landing_page_type: ["area", "listing_category"],
      seo_url_rule_kind: ["index", "noindex", "canonical"],
      update_type: ["announcement", "facebook", "event", "market", "company"],
    },
  },
} as const

// Convenience row types
export type ListingRow = Database["public"]["Tables"]["real_estate_listings"]["Row"]
export type UpdateRow = Database["public"]["Tables"]["updates"]["Row"]
export type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"]
export type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"]
