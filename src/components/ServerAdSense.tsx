import { supabase } from '@/lib/supabase'

interface ServerAdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  adStyle?: React.CSSProperties
  className?: string
  responsive?: boolean
}

export default async function ServerAdSense({ 
  adSlot, 
  adFormat = 'auto', 
  adStyle = { display: 'block', width: '100%', height: '250px' },
  className = '',
  responsive = true
}: ServerAdSenseProps) {
  // Fetch AdSense ID from database
  let adsenseId = ''
  try {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'adsense_id')
      .single()
    
    adsenseId = settings?.setting_value || ''
  } catch (error) {
    console.error('Error fetching AdSense ID:', error)
  }

  // Don't render if no AdSense ID
  if (!adsenseId) {
    return null
  }

  return (
    <div className={`adsense-banner ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={adsenseId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
        crossOrigin="anonymous"
      />
    </div>
  )
}
