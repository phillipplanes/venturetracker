import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Expecting { bucket: '...', path: '...' } in the body
    const { bucket, path } = await req.json()

    if (!bucket || !path) {
        throw new Error("Missing bucket or path")
    }

    // 1. Download the image
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(path)

    if (downloadError) throw downloadError

    // 2. Resize using ImageScript (Deno)
    const image = await Image.decode(new Uint8Array(await fileData.arrayBuffer()))
    
    // Resize to 500px width, auto height (maintain aspect ratio)
    // Use .resize(500, 500) to force square
    const resized = image.resize(500, Image.RESIZE_AUTO)
    const encoded = await resized.encodeJPEG(80)

    // 3. Upload back (overwrite original)
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, encoded, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) throw uploadError

    return new Response(
      JSON.stringify({ message: 'Image resized successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})