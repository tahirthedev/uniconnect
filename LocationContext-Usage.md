# LocationContext Usage Instructions

## Setup

### 1. Wrap your app with LocationProvider

In `app/layout.tsx`, wrap your entire app:

```tsx
import { LocationProvider } from '@/contexts/LocationContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LocationProvider defaultRadius={20}>
          {children}
        </LocationProvider>
      </body>
    </html>
  );
}
```

### 2. Update your service pages (ridesharing, posts, accommodation, etc.)

Replace the existing location state management with the hooks:

```tsx
// BEFORE:
const [locationFilter, setLocationFilter] = useState({
  lat: undefined as number | undefined,
  lng: undefined as number | undefined,
  radius: undefined as number | undefined,
  hasLocation: false
});

const handleLocationFilterChange = useCallback((newLocationFilter: any) => {
  // Complex state management...
}, []);

// AFTER:
import { useLocationData } from '@/contexts/LocationContext';

const locationData = useLocationData();

// Use locationData directly in your effects and API calls
useEffect(() => {
  fetchData(filters, locationData);
}, [filters, locationData.lat, locationData.lng, locationData.radius, locationData.hasLocation]);
```

### 3. Update LocationFilter component

```tsx
// BEFORE:
<LocationFilter 
  onFilterChange={handleLocationFilterChange}
  defaultRadius={20}
  compact={true}
/>

// AFTER:
import { useLocation } from '@/contexts/LocationContext';

const { updateRadius } = useLocation();
const locationData = useLocationData();

<LocationFilter 
  onFilterChange={(data) => {
    if (data.radius !== locationData.radius) {
      updateRadius(data.radius);
    }
  }}
  defaultRadius={locationData.radius}
  compact={true}
/>
```

### 4. Update homepage location update button

```tsx
import { useLocation } from '@/contexts/LocationContext';

function HomePage() {
  const { updateLocation, isLoading } = useLocation();
  
  return (
    <button 
      onClick={() => updateLocation(true)} 
      disabled={isLoading}
    >
      {isLoading ? 'Updating...' : 'Update Location'}
    </button>
  );
}
```

## API Changes

### Reading Location Data
```tsx
const locationData = useLocationData();
// Returns: { lat?, lng?, radius?, hasLocation, address?, isLoading, error }
```

### Updating Location  
```tsx
const { updateLocation, updateRadius } = useLocation();

// Force refresh location
await updateLocation(true);

// Update just the radius
updateRadius(25);
```

## Benefits

1. **Single Initialization**: Location is fetched once when the app loads
2. **No More Infinite Renders**: Stable object references prevent unnecessary re-renders
3. **Global State**: All components share the same location data
4. **Preserved Caching**: Still uses your existing localStorage caching logic
5. **Type Safety**: Full TypeScript support
6. **Performance**: Prevents multiple simultaneous API calls

## Migration Steps

1. Add LocationProvider to your layout
2. Replace useState location management in service pages
3. Update useEffect dependencies to use individual location properties
4. Remove handleLocationFilterChange complexity
5. Update LocationFilter component usage
6. Test and remove debug console logs

The infinite re-rendering issue should be completely resolved once you migrate to this global state management system.
