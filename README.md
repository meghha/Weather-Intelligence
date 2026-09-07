This repository contains the source code for the weather intelligence dashboard that lets users input any location and obtain the current weather information. It also provides the forecast for the next 7 days, as well as planning recommendations to better prepare for any weather conditions.

Project Overview:
- App Name: Weather Intelligence App[cite: 1]
- APIs Integrated: Open-Meteo Geocoding API (https://geocoding-api.open-meteo.com/v1/search) and Open-Meteo Forecast API (https://api.open-meteo.com/v1/forecast)[cite: 1]

Google AI Studio to GitHub Steps:
1. Created the Weather Intelligence App inside Google AI Studio App Build[cite: 1].
2. Used the direct GitHub integration in AI Studio to export and sync the project source code to the repository: https://github.com/meghha/Weather-Intelligence[cite: 1].
3. Verified the GitHub repository contains package.json, source code, and project files[cite: 1].

Cloudflare Pages Deployment Steps:
1. Logged into Cloudflare Dashboard and navigated to Workers & Pages[cite: 1].
2. Connected the GitHub repository meghha/Weather-Intelligence[cite: 1].
3. Configured Build Settings:
   - Build Command: npm run build[cite: 1]
   - Output Directory: dist[cite: 1]
   - Root Directory: /[cite: 1]
4. Ran deployment and verified the application was successfully served on the generated pages.dev URL[cite: 1].

Documentation Evidence:
- Updated repository README.md with setup and deployment instructions[cite: 1].
