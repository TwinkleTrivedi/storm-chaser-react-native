# Storm Chaser

React Native app for hobbyist storm chasers. It loads weather for the device location, stores photo reports on the device, and shows those reports on a map.

## Run

```bash
npm install
npm start
```

Then open the project in Expo Go or a simulator (`npm run ios`, `npm run android`).

```bash
npm test
npm run typecheck
```

## Stack

- React Native and Expo, TypeScript
- Expo Router for navigation
- expo-sqlite for storm reports
- expo-location, expo-image-picker, and expo-file-system for location, camera, and photo files
- Open-Meteo for weather. No API key.

## How the code is organized

Screens live in `app/`. Shared logic lives in `src/` and is grouped by feature.

```
app/
  index.tsx              Launch screen
  _layout.tsx            Theme and database providers, root stack
  (tabs)/                Weather, Storms, Document, Map
  storm/[id].tsx         One saved report
src/
  features/weather/      API client, parser, mock fallback
  features/storms/       Validation, SQLite repository, photo files, map HTML
  features/cloud/        Optional Supabase sync
  database/              SQLite open and migrations
  components/            Shared UI
  hooks/                 Location, weather, storms, online status
  theme/                 Light, dark, and system theme
```

Each feature keeps types, pure functions, and side effects apart. Weather is `weather.api.ts` (HTTP) then `weather.utils.ts` (parse) then `weather.service.ts` (choose live or mock). Storms are `storm.utils.ts` (validate) then `storm.repository.ts` (SQL) then `storm.service.ts` (save photo, insert row, try cloud sync). Screens call hooks (`useWeather`, `useStorms`, `useLocation`) and do not talk to SQLite or fetch directly.

The root layout wraps the app in `ThemeProvider` and `DatabaseProvider`. The database provider opens `stormchaser.db`, runs migrations, and then mounts `StormsProvider`.

## Screens

1. **Launch** (`app/index.tsx`) introduces the app and opens the tabs. Tapping the theme label cycles system, light, and dark.
2. **Weather** (`app/(tabs)/index.tsx`) requests location, then current conditions plus hourly and daily forecast. Pull to refresh reloads both. A skeleton shows while the first request is in flight. If location permission is denied, the screen offers a retry or a fixed sample point in Norman, Oklahoma. Invalid coordinates show **Not found**.
3. **Storms** (`app/(tabs)/storms.tsx`) lists saved reports, newest capture first, with pull to refresh.
4. **Document** (`app/(tabs)/document.tsx`) takes a camera photo or a library photo, fills weather conditions from the current snapshot, and saves coordinates, time, notes, and storm type.
5. **Map** (`app/(tabs)/map.tsx`) plots saved reports. Online it uses OpenStreetMap tiles in a WebView. Offline, or if the WebView fails, it draws a coordinate plot from the local rows.
6. **Report detail** (`app/storm/[id].tsx`) shows one report and can retry cloud sync or delete it.

## Weather

`src/features/weather/weather.api.ts` calls the Open-Meteo Weather Forecast API:

`https://api.open-meteo.com/v1/forecast`

The request asks for current conditions, hourly values, and five daily days. Units are Celsius, km/h, and millimeters. The parser in `weather.utils.ts` turns that payload into a `WeatherSnapshot` and keeps the next 12 hours.

If the request or the payload fails, `loadWeather` returns mock storm data and marks `source: 'mock'`. The weather screen labels that sample data. A chase outlook (`quiet`, `watch`, `active`) is derived from the weather code, wind, and precipitation.

Place names come from OpenStreetMap Nominatim (`src/utils/geocode.ts`). If that lookup fails, the screen shows coordinates instead.

## Storm reports

A report is valid only when it has a photo, weather conditions, coordinates, a capture time, and a storm type. Notes are optional. Rules are in `validateStormDraft`.

Saving a report:

1. Copy the photo into the app documents directory (`storms/<id>.jpg`).
2. Insert a row in SQLite.
3. If Supabase env vars are set, POST metadata to `/rest/v1/storms`. Photos stay on the device.

`sync_status` is `local` when cloud sync is not configured, `synced` after a successful push, and `pending` after a failed push. Retry from the detail screen calls the provider again.

Storm types stored in SQLite: thunderstorm, supercell, tornado, hail, flash-flood, derecho, winter-storm, tropical, other. The check constraint matches `STORM_TYPES` in `storm.types.ts`.

Schema changes go through `src/database/migrations.ts`. Version 1 creates `storms` and an index on `captured_at`.

## Other behavior

- **Dark mode.** Preference is `system`, `light`, or `dark`, stored in AsyncStorage under `stormchaser.theme`.
- **Offline.** Reports and photos are local. The map falls back to stored coordinates when NetInfo reports the device is offline.
- **Errors.** Services throw `AppError` with a code (`not_found`, `permission`, `validation`, `storage`, and others). Screens map that to empty states.

## Tests

```bash
npm test
```

- `src/features/weather/weather.utils.test.ts` covers compass labels, weather codes, chase outlook, coordinate checks, and forecast parsing.
- `src/features/storms/storm.utils.test.ts` covers draft validation and storm helpers.

## APIs used

- Weather: Open-Meteo Weather Forecast API, `https://api.open-meteo.com/v1/forecast`. No API key. Docs: https://open-meteo.com/en/docs
- Place names: OpenStreetMap Nominatim reverse geocoding.
- Map tiles: OpenStreetMap, through Leaflet in the map WebView.
- Optional cloud: Supabase REST. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` locally. Those keys are not committed.

## AI tools

Cursor was used to implement features, wire the weather client, and write this documentation.

---

Speer Technologies Mobile Development Assessment: Storm Chaser App
Overview
The goal of this assessment is to build a mobile application that serves as an app for
storm chasing hobbyist meteorologists. The app will demonstrate common tasks such
as fetching data, persisting information, camera integration and geolocation.
Technology Stack and Design
You may use any mobile technology stack (Swift, Kotlin, React Native, Flutter) to
complete this assessment. Choose the stack you're most comfortable with or want to
showcase your skills in.
Note that there are no specific designs to follow for this assessment, so you have
creative freedom regarding the layout and user experience. If you're developing for iOS,
Android, or both platforms will depend on your chosen technology stack and
development environment.
Features
For this assessment, you'll need to build a Storm Chaser application that allows
meteorology enthusiasts to track and document weather events. The required features
we'd like to see built are:
1. A weather data view that enables users to:
○ Fetch and display current weather data based on the device's current
location
■ Use free weather APIs such as https://open-meteo.com/ OR
https://www.weather.gov/documentation/services-web-api
■ Use mock data if limited.
○ Display key meteorological information relevant to storm chasers
(temperature, wind speed, precipitation, etc.)
○ Show a "Not found" view if weather data cannot be retrieved
2. A storm documentation feature that allows users to:
○ Capture photos using the device camera
○ Add metadata to photos including:
■ Weather conditions
■ Location coordinates
■ Date and time
■ Notes/description
■ Storm type/classification

3. Data persistence capabilities:
○ Save all captured storm data locally on the device
○ Implement proper data models and storage solutions
4. The ability to navigate between different sections of the app with intuitive UI/UX
Bonus features (Requirement for Senior Roles)
These features aren't mandatory, but if you have extra time and want to stand out feel
free to add any of the following.
If you are applying for a Senior role, you should try to implement a few of these
features:
● Weather forecast integration
● Map visualization of documented storm locations
● Offline functionality
● Dark mode support
● Skeleton screens
● Pull to refresh
● Cloud integration (Just integration code for any provider, Don't include your API
keys or private keys).
AI Tools Usage
You are free to use any AI tools (such as ChatGPT, Claude, etc.) to assist with your
development process. However, please include a document that discloses:
● Which AI tools were used
● For what specific purposes they were utilized
● What portions of code were generated with AI assistance
Grading
The GitHub repo for this exercise will be graded on a number of criteria including, but
not limited to:
● Functionality over UI
● Clean, readable, and well-documented code
● Unit test wherever applicable - At least write one.
● Readme file with clear documentation and implementation decisions.
● Adherence to the established principles
● Utilization of an architectural pattern
● Reusable components

Submission
Kindly create a video recording of your screen clearly showing the startup and 20-40
second basic UI run through of the app. You do not need to add voiceovers for this.
Upload the video to a Google Drive and share a privately accessible link along with the
GitHub submission. Our team will not be able to evaluate your submission without
this video.
Use a PRIVATE Github repository for your code and invite developer@speer.io .
Please do not share a public repository.
Show us what you can do in no more than 24 hours. Keep a log of the time spent and
include it with your submission. There is no specific deadline, but please keep your work
within a 24-hour time period (meaning you can start whenever as long as you complete
the assessment within 24 hours).
Note: We respect your time. If you are not able to implement all the required
features, try implementing a simplified version of it or even hardcode some
aspects. At minimum, please let us know what you were unable to complete and
why in your submission documentation.
To submit your assessment - include the following in your documentation
attachment as a PDF:
1. Candidate Full Name :Twinkle Trivedi
1. Name of assessment completed (Front End, Back End, React Native, Mobile -frontend reactnative
iOS, Mobile - Android)
2. Github Link for Assessment : https://github.com/TwinkleTrivedi/storm-chaser-react-native
3. Link to the Screen recording of your submission. Must be a shared public link 
4. Log of time spent on assessment 4 hours