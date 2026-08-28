import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Medimate App',
    short_name: 'medimate',
    description: 'Medimate App',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
        // DOTHIS: i don't have the icon so
    ],
  }
}