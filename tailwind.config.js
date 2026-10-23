/** 预编译 Tailwind（U1）：npx tailwindcss -i src/input.css -o css/app.css --minify */
module.exports = {
  content: ['./index.html', './js/*.js'],
  safelist: [
    { pattern: /^(bg|text|border)-(rose|amber|primary|accent)-(50|100|200|500|700|800)$/ },
    { pattern: /^bg-(rose|amber|primary|accent)-50\/70$/ },
  ],
  theme: {
    extend: {
      colors: {
        // 主色：深青绿（稳重、可信，适合"算账"类工具）
        primary: { 50: '#EEF8F6', 100: '#D3EEE9', 200: '#A8DDD3', 300: '#74C5B8', 400: '#43A898', 500: '#23897A', 600: '#187063', 700: '#155A51', 800: '#134842', 900: '#103B37' },
        // 点缀色：暖杏（年轻、有温度，用于强调与"租"）
        accent: { 50: '#FFF5EF', 100: '#FFE6D6', 200: '#FFC9A8', 300: '#FFA673', 400: '#FB8447', 500: '#F06A2A', 600: '#D6531A', 700: '#B04117', 800: '#8C3618', 900: '#722F17' },
        cream: '#F7F5F0',
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,25,23,.04), 0 6px 20px -8px rgba(28,25,23,.10)',
        lift: '0 12px 28px -10px rgba(21,90,81,.35)',
      },
      borderRadius: { '4xl': '1.75rem' },
    },
  },
};
