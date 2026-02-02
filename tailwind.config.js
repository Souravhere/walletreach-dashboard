/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Vercel-style black & white theme
                background: '#000000',
                foreground: '#ffffff',
                border: '#333333',
                'border-light': '#555555',
                accent: '#ffffff',
                'accent-hover': '#e0e0e0',
                muted: '#666666',
                'muted-foreground': '#999999',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
