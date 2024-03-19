/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"], 
  daisyui: {
    themes: ["light"],
  plugins: [require('@tailwindcss/typography'), require("daisyui")],

}
}
  