This repository contains the source code for the weather intelligence dashboard that lets users input any location and obtain the current weather information. It also provides the forecast for the next 7 days, as well as planning recommendations to better prepare for any weather conditions.

Project Overview:
- App Name: Weather Intelligence App
- APIs Integrated: Open-Meteo Geocoding API (https://geocoding-api.open-meteo.com/v1/search) and Open-Meteo Forecast API (https://api.open-meteo.com/v1/forecast)

Google AI Studio to GitHub Steps:
1. Created the Weather Intelligence App inside Google AI Studio App Build
2. Used the direct GitHub integration in AI Studio to export and sync the project source code to the repository: https://github.com/meghha/Weather-Intelligence.
3. Verified the GitHub repository contains package.json, source code, and project files

Cloudflare Pages Deployment Steps:
1. Logged into Cloudflare Dashboard and navigated to Workers & Pages
2. Connected the GitHub repository meghha/Weather-Intelligence
3. Configured Build Settings:
   - Build Command: npm run build
   - Output Directory: dist
   - Root Directory: /
4. Ran deployment and verified the application was successfully served on the generated pages.dev URL

Documentation Evidence:
- Updated repository README.md with setup and deployment instructions
