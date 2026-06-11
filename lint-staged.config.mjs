export default {
  "frontend/**/*.{ts,tsx}": [
    "npx eslint --fix --config frontend/eslint.config.js",
    "npx prettier --write"
  ],
  "frontend/**/*.{css,json}": [
    "npx prettier --write"
  ]
}