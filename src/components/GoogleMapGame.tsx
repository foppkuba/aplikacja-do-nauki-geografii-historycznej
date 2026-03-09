import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

interface SimpleMapGameProps {
  currentCountry: {
    name: string;
    flag: string;
    capital: string;
  };
  onCountryClick: (countryName: string) => void;
  isCorrect: boolean | null;
}

// Mapowanie polskich nazw na nazwy krajów w GeoJSON
  const countryNameMap: { [key: string]: string[] } = {
  "Polska": ["Poland"],
  "Niemcy": ["Germany"],
  "Francja": ["France"],
  "Hiszpania": ["Spain"],
  "Włochy": ["Italy"],
  "Wielka Brytania": ["United Kingdom"],
  "Szwecja": ["Sweden"],
  "Norwegia": ["Norway"],
  "Cypr": ["Cyprus"],
  "Dania": ["Denmark"],
  "Finlandia": ["Finland"],
  "Islandia": ["Iceland"],
  "Czechy": ["Czech Republic", "Czechia"],
  "Słowacja": ["Slovakia"],
  "Węgry": ["Hungary"],
  "Austria": ["Austria"],
  "Szwajcaria": ["Switzerland"],
  "Litwa": ["Lithuania"],
  "Łotwa": ["Latvia"],
  "Estonia": ["Estonia"],
  "Ukraina": ["Ukraine"],
  "Białoruś": ["Belarus"],
  "Mołdawia": ["Moldova"],
  "Rumunia": ["Romania"],
  "Bułgaria": ["Bulgaria"],
  "Grecja": ["Greece"],
  "Portugalia": ["Portugal"],
  "Chorwacja": ["Croatia"],
  "Słowenia": ["Slovenia"],
  "Serbia": ["Serbia"],
  "Bośnia i Hercegowina": ["Bosnia and Herz."],
  "Czarnogóra": ["Montenegro"],
  "Monako": ["Monaco"],
  "Albania": ["Albania"],
  "Macedonia Północna": ["Macedonia", "North Macedonia"],
  "Holandia": ["Netherlands"],
  "Belgia": ["Belgium"],
  "Irlandia": ["Ireland"],
  "Luksemburg": ["Luxembourg"],
  "Turcja": ["Turkey"]
};

const SimpleMapGame = ({ currentCountry, onCountryClick, isCorrect }: SimpleMapGameProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCountry(null);
  }, [currentCountry]);

  const handleCountryClick = (geo: Record<string, any>) => {
    if (isCorrect !== null) return;
    
    const geoName = geo.properties.name || geo.properties.NAME || geo.properties.ADMIN;
    setSelectedCountry(geoName);
    
    // Znajdź polską nazwę kraju
    const polishName = Object.keys(countryNameMap).find(
      key => countryNameMap[key].includes(geoName)
    );
    
    if (polishName) {
      onCountryClick(polishName);
    }
  };

  const getCountryStyle = (geo: Record<string, any>) => {
    const geoName = geo.properties.name || geo.properties.NAME || geo.properties.ADMIN;
    const targetGeoNames = countryNameMap[currentCountry.name] || [];
    const isTarget = targetGeoNames.includes(geoName);
    const isSelected = geoName === selectedCountry;
    const isHovered = geoName === hoveredCountry;

    let fill = undefined;
    
    if (isCorrect !== null && isTarget) {
      fill = "hsl(142 76% 36%)"; // green for correct answer
    } else if (isSelected && isCorrect === false) {
      fill = "hsl(0 84% 60%)"; // red for wrong answer
    } else if (isSelected && isCorrect === null) {
      fill = "hsl(217 91% 60%)"; // blue for selected
    } else if (isHovered && isCorrect === null) {
      fill = "hsl(var(--primary))";
    }

    return {
      fill,
      stroke: "hsl(var(--border))",
      strokeWidth: 0.5,
      cursor: isCorrect === null ? "pointer" : "default",
      outline: "none",
    };
  };

  return (
    <div className="bg-muted/30 rounded-lg overflow-hidden border-2 border-border">
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: [-10, -52, 0],
          scale: 900,
        }}
        width={800}
        height={500}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => handleCountryClick(geo)}
                onMouseEnter={() => {
                  if (isCorrect === null) {
                    setHoveredCountry(geo.properties.name || geo.properties.NAME || geo.properties.ADMIN);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredCountry(null);
                }}
                className="fill-slate-300 stroke-white stroke-[0.5] dark:fill-slate-800 dark:stroke-slate-700 focus:outline-none"
                style={{
                  default: getCountryStyle(geo),
                  hover: getCountryStyle(geo),
                  pressed: getCountryStyle(geo),
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default SimpleMapGame;
