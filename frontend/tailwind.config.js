/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0f',
                surface: '#12121a',
                primary: '#6b4cff',
                'primary-hover': '#5436e3',
                secondary: '#2a2a35',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
