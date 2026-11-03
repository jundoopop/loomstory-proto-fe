# Reserved for a future function

This folder is intentionally documentation-only. It contains no executable Netlify Function and exposes no API endpoint.

If AI integration is approved later, choose one server-side location: a Netlify Function here **or** a Supabase Edge Function. Keep provider secrets there, validate and authorize input, and return an explicit suggestion or fallback result to the frontend. Do not place secret keys in `VITE_*` variables.

The current UI uses a prepared sample and sends no image or AI request.
