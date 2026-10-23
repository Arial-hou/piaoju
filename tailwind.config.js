/** 预编译 Tailwind（U1）：npx tailwindcss -i src/input.css -o css/app.css --minify */
module.exports = {
  content: ['./index.html', './js/*.js'],
  safelist: [
    { pattern: /^(bg|text|border)-(rose|amber|primary)-(50|100|200|500|700|800)$/ },
    { pattern: /^bg-(rose|amber|primary)-50\/70$/ },
  ],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857', 800: '#065F46', 900: '#064E3B' },
      },
    },
  },
};
