import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { clearSettingsCache } from '@/lib/dynamic-config'

// GET - Read all settings
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .order('setting_key')

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Convert array to object for easier use
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT - Update settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { site_name, niche, country, email } = body

    // Validate required fields
    if (!site_name || !niche || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update each setting
    const updates = [
      { setting_key: 'site_name', setting_value: site_name },
      { setting_key: 'niche', setting_value: niche },
      { setting_key: 'country', setting_value: country }
    ]

    // Add email if provided
    if (email) {
      updates.push({ setting_key: 'email', setting_value: email })
    }

    for (const update of updates) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(update, { onConflict: 'setting_key' })

      if (error) {
        console.error('Error updating setting:', update.setting_key, error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
      }
    }

    // Clear the cache so new settings are fetched immediately
    clearSettingsCache()

    return NextResponse.json({ success: true, message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
