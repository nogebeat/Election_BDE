/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                olympusBg: "#0B0C10",
                olympusGold: "#D4AF37",
                beesYellow: "#FFD700",
                beesBlack: "#000000",
            },
            fontFamily: {
                olympus: ['Playfair Display', 'serif'],
                bees: ['Poppins', 'sans-serif'],
                base: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
