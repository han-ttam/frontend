/** @type {import('tailwindcss').Config} */

const { colors } = require("./src/constants/colors");

module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: { colors },
  },
  plugins: [],
};
