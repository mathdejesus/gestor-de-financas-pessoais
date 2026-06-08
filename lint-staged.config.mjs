export default {
  "frontend/**/*.{ts,tsx}": [
    "eslint --fix --config frontend/eslint.config.js",
    "prettier --write"
  ],
  "frontend/**/*.{css,json}": [
    "prettier --write"
  ],
  "mobile/**/*.{ts,tsx}": [
    "prettier --write"
  ]
}
