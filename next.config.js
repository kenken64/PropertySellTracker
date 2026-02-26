const withNextIntl = require("next-intl/plugin")("./i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = withNextIntl(nextConfig)
