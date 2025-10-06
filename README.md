# Delhi Metro Planner

A modern, production-ready web application for planning journeys on the Delhi Metro system. Built with React, TypeScript, and Tailwind CSS.

![Delhi Metro Planner](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚇 Features

- **Smart Station Search**: Autocomplete search with fuzzy matching in English and Hindi
- **Intelligent Route Planning**: Dijkstra's algorithm-based pathfinding with multiple route options
- **Interactive Map**: OpenStreetMap integration with station markers and route visualization
- **Detailed Station Information**: Timings, facilities, exits, landmarks, and nearby transport
- **Line View**: Schematic visualization of all metro lines with interchange stations
- **Bilingual Support**: Full i18n support for English and Hindi
- **Live Status Display**: Real-time service status updates (simulated)
- **Responsive Design**: Mobile-first, fully responsive interface
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **Offline-Ready**: Works with local JSON dataset for demo purposes

## 🛠️ Tech Stack

- **Frontend**: React 18.3, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Maps**: Leaflet with OpenStreetMap tiles
- **Internationalization**: i18next, react-i18next
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- Git

### Setup

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd delhi-metro-planner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Layout.tsx      # Main app layout with navigation
│   ├── LineBadge.tsx   # Metro line color badges
│   ├── LanguageToggle.tsx
│   ├── MetroMap.tsx    # Leaflet map component
│   └── StationSearch.tsx
├── pages/              # Route pages
│   ├── Home.tsx        # Landing page with search
│   ├── StationDetail.tsx
│   ├── RoutePlanner.tsx
│   ├── Lines.tsx       # Line view
│   ├── MapView.tsx     # Interactive map page
│   └── NotFound.tsx
├── i18n/               # Internationalization
│   ├── config.ts
│   └── locales/
│       ├── en.json
│       └── hi.json
├── types/              # TypeScript type definitions
│   └── metro.ts
├── utils/              # Utility functions
│   ├── metroData.ts    # Data loading and search
│   └── pathfinding.ts  # Route finding algorithms
├── index.css           # Global styles and design tokens
└── App.tsx             # App entry point

public/
└── data/
    └── demo-stations.json  # Sample metro data
```

## 📊 Data Structure

The application uses a JSON-based data structure for metro information:

### Station Object
```typescript
{
  id: string;           // Unique identifier
  name: string;         // English name
  nameHi: string;       // Hindi name
  lines: string[];      // Metro lines serving this station
  lat: number;          // Latitude
  lng: number;          // Longitude
  isInterchange: boolean;
  facilities: string[]; // Available facilities
  firstTrain: string;   // First train time
  lastTrain: string;    // Last train time
  exits: Exit[];        // Exit information
  nearbyTransport: string[]; // Connected transport
}
```

### Line Object
```typescript
{
  id: string;          // Line ID (e.g., "Red", "Blue")
  name: string;        // English name
  nameHi: string;      // Hindi name
  color: string;       // CSS class for line color
  stations: string[];  // Ordered list of station IDs
}
```

## 🔄 Replacing Demo Data with Real APIs

The app currently uses a local JSON file (`public/data/demo-stations.json`). To integrate real data:

### Option 1: REST API

1. Update `src/utils/metroData.ts`:

```typescript
export async function loadMetroData(): Promise<MetroData> {
  try {
    const response = await fetch('https://api.example.com/metro/data');
    if (!response.ok) throw new Error('Failed to load metro data');
    
    const data = await response.json();
    return transformApiData(data); // Transform to match MetroData interface
  } catch (error) {
    console.error('Error loading metro data:', error);
    throw error;
  }
}
```

### Option 2: GTFS/GTFS-RT Integration

For real-time data using GTFS format:

```typescript
import GTFSRealtimeBindings from 'gtfs-realtime-bindings';

export async function loadRealTimeData() {
  const response = await fetch('https://api.example.com/gtfs-rt');
  const buffer = await response.arrayBuffer();
  const feed = GTFSRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(buffer)
  );
  // Process feed.entity
}
```

### Expected API Endpoints

- `GET /stations` - List all stations
- `GET /stations/:id` - Get station details
- `GET /lines` - List all metro lines
- `GET /routes?from=:stationId&to=:stationId` - Calculate route
- `GET /status` - Get live service status

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

Tests are located in `__tests__/` directories alongside components.

Example test structure:
```typescript
// src/utils/__tests__/pathfinding.test.ts
import { findMetroRoutes } from '../pathfinding';

describe('Route Finding', () => {
  it('should find shortest path between two stations', () => {
    // Test implementation
  });
});
```

### Running Specific Tests

```bash
npm run test -- pathfinding
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

Or use Netlify's drag-and-drop deployment by uploading the `dist/` folder.

#### netlify.toml Configuration
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

Or connect your Git repository on [vercel.com](https://vercel.com) for automatic deployments.

#### vercel.json Configuration
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🎨 Design System

The app uses a comprehensive design system defined in `src/index.css` and `tailwind.config.ts`:

### Color Tokens

- **Primary**: Deep indigo (#1e3a8a) - Main brand color
- **Accent**: Orange (#f97316) - Call-to-action elements
- **Metro Line Colors**: Authentic Delhi Metro colors
  - Red Line: `--line-red`
  - Blue Line: `--line-blue`
  - Yellow Line: `--line-yellow`
  - etc.

### Custom Utilities

```css
.metro-line-badge {
  /* Styled metro line badges */
}

.card-hover {
  /* Hover effect for cards */
}
```

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation support
- High contrast color scheme
- Screen reader friendly
- Focus indicators
- Alt text for all images

## 🌍 Internationalization

Switch between English and Hindi using the language toggle in the header.

### Adding New Languages

1. Create locale file: `src/i18n/locales/[lang].json`
2. Update `src/i18n/config.ts`:

```typescript
import newLang from './locales/newLang.json';

i18n.init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    newLang: { translation: newLang }
  }
});
```

## 📱 Mobile Support

- Mobile-first responsive design
- Touch-friendly interface
- Bottom navigation bar on mobile
- Optimized map controls for mobile
- Pull-to-refresh support (browser native)

## 🔧 Configuration

### Environment Variables

Create a `.env` file for environment-specific configuration:

```env
# Not used in current implementation but ready for API integration
VITE_API_BASE_URL=https://api.example.com
VITE_MAPBOX_TOKEN=your_token_here
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 🐛 Known Issues & Limitations

- Route algorithm uses simplified distance/time calculations
- Live status is simulated (not connected to real API)
- Map tiles require internet connection
- Limited to ~20 sample stations (expand in `demo-stations.json`)

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add tests for new features

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Delhi Metro Rail Corporation (DMRC) for metro data
- OpenStreetMap contributors for map tiles
- shadcn/ui for component library
- Lucide for icon set

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@example.com

## 🗺️ Roadmap

- [ ] Real-time train tracking
- [ ] Fare calculator with smart card integration
- [ ] Crowding information
- [ ] Accessibility route planning
- [ ] Offline map caching
- [ ] Push notifications for delays
- [ ] Integration with Delhi Bus API
- [ ] Multi-modal journey planning

---

**Built with ❤️ for Delhi Metro commuters**
