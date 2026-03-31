const { defineConfig } = require("vite")

module.exports = defineConfig({
    // GitHub Pages serves project sites from /<repo-name>/.
    base: process.env.GITHUB_PAGES === "true" ? "/kung-fu-chicken/" : "/"
})
