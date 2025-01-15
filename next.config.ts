import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/pomodoro-timer" : "",
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            publicPath: "/_next/static/media/",
            outputPath: "static/media/",
          },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
