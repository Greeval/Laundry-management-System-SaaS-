/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./views/**/*.ejs",
    "./public/**/*.html",
    "./*.html",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        "on-primary-fixed-variant": "#003ea8",
        "tertiary-container": "#b54e00",
        "outline-variant": "#c3c6d7",
        "secondary-fixed-dim": "#6bd8cb",
        "secondary-fixed": "#89f5e7",
        "on-primary-container": "#eeefff",
        "tertiary-fixed": "#ffdbca",
        "on-tertiary": "#ffffff",
        "on-primary-fixed": "#00174b",
        "on-secondary": "#ffffff",
        "on-surface": "#0b1c30",
        "on-tertiary-container": "#ffece5",
        "error-container": "#ffdad6",
        "surface-variant": "#d3e4fe",
        "surface-bright": "#f8f9ff",
        "surface": "#f8f9ff",
        "secondary-container": "#86f2e4",
        "on-error-container": "#93000a",
        "inverse-primary": "#b4c5ff",
        "primary-fixed": "#dbe1ff",
        "inverse-surface": "#213145",
        "surface-container-high": "#dce9ff",
        "on-secondary-container": "#006f66",
        "tertiary-fixed-dim": "#ffb690",
        "on-tertiary-fixed-variant": "#783200",
        "on-error": "#ffffff",
        "primary": "#004ac6",
        "error": "#ba1a1a",
        "outline": "#737686",
        "background": "#f8f9ff",
        "primary-fixed-dim": "#b4c5ff",
        "on-secondary-fixed-variant": "#005049",
        "surface-container-lowest": "#ffffff",
        "primary-container": "#2563eb",
        "surface-container-highest": "#d3e4fe",
        "surface-container-low": "#eff4ff",
        "tertiary": "#8e3c00",
        "surface-tint": "#0053db",
        "secondary": "#006a61",
        "on-background": "#0b1c30",
        "on-surface-variant": "#434655",
        "on-tertiary-fixed": "#341100",
        "inverse-on-surface": "#eaf1ff",
        "surface-dim": "#cbdbf5",
        "surface-container": "#e5eeff",
        "on-secondary-fixed": "#00201d",
        "on-primary": "#ffffff"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1.5rem",
        full: "9999px"
      },
      spacing: {
        xs: "4px",
        "touch-target-min": "48px",
        sm: "8px",
        md: "16px",
        xl: "32px",
        base: "4px",
        "2xl": "48px",
        lg: "24px",
        "margin-mobile": "20px"
      },
      fontFamily: {
        "headline-sm": ["Plus Jakarta Sans"],
        "label-lg": ["Plus Jakarta Sans"],
        "body-md": ["Plus Jakarta Sans"],
        "headline-lg": ["Plus Jakarta Sans"],
        "headline-lg-mobile": ["Plus Jakarta Sans"],
        "body-lg": ["Plus Jakarta Sans"],
        "label-sm": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
