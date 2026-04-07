const { defineConfig } = require("vite")

/**
 * GitHub project Pages are served from https://<user>.github.io/<repo>/
 * so asset URLs must use that prefix. In Actions, GITHUB_REPOSITORY is "owner/repo".
 */
function pagesBase() {
    if (process.env.GITHUB_PAGES !== "true") return "/"
    const full = process.env.GITHUB_REPOSITORY || ""
    const repo = full.includes("/") ? full.split("/")[1] : ""
    if (repo) return `/${repo.toLowerCase()}/`
    return "/kung-fu-chicken/"
}

module.exports = defineConfig({
    base: pagesBase()
})
