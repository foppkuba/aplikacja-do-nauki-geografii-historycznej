import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Country } from "@/types";

const Learn = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetch("/api/game/quiz-data")
      .then((res) => res.json())
      .then((data) => {
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
        setCountries(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania:", err);
        setLoading(false);
      });
  }, []);

  // Szukamy wybranego kraju po kodzie (np. "PL")
  const country = selectedCountryCode 
    ? countries.find(c => c.code === selectedCountryCode)
    : null;

  // --- EKRAN ŁADOWANIA ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // --- WIDOK SZCZEGÓŁÓW KRAJU (Gdy wybrano kraj) ---
  if (country) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setSelectedCountryCode(null)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do listy
          </Button>

          <div className="perspective-1000">
            <Card 
              className="cursor-pointer transition-all duration-500 hover:shadow-lg"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div style={{ backfaceVisibility: "hidden" }}>
                <CardHeader className="text-center pb-4">
                  {/* ZMIANA: Flaga z CDN */}
                  <img 
                    src={`https://flagcdn.com/w320/${country.code.toLowerCase()}.png`} 
                    alt={`Flaga ${country.name}`} 
                    className="w-48 h-auto object-cover rounded-lg shadow-lg mb-4 mx-auto border" 
                  />
                  <CardTitle className="text-4xl font-bold">{country.name}</CardTitle>
                  <CardDescription className="text-xl">Kliknij aby zobaczyć stolicę</CardDescription>
                </CardHeader>
              </div>
              
              <div 
                className="absolute inset-0 bg-background rounded-lg border" // Dodano tło, żeby rewers nie był przezroczysty
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  display: "flex", flexDirection: "column", justifyContent: "center" // Centrowanie rewersu
                }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="text-8xl mb-4">🏛️</div>
                  <CardTitle className="text-4xl font-bold text-primary">{country.capital}</CardTitle>
                  <CardDescription className="text-xl">Stolica {country.name}</CardDescription>
                </CardHeader>
              </div>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Ciekawe fakty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Używamy operatora || "Brak danych", bo Java tego nie wysyła */}
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="font-semibold">{country.region || "Europa"}</p>
                </div>
                <div className="p-4 bg-secondary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Populacja</p>
                  <p className="font-semibold">{country.population || "Brak danych w API"}</p>
                </div>
                <div className="p-4 bg-accent/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Powierzchnia</p>
                  <p className="font-semibold">{country.area || "Brak danych w API"}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Języki</p>
                  <p className="font-semibold">
                    {country.languages ? country.languages.join(", ") : "Język narodowy"}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-muted-foreground mb-1">💡 Czy wiesz, że...</p>
                <p className="font-medium">{country.funFact || "Więcej ciekawostek pojawi się wkrótce!"}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = countries.findIndex(c => c.code === country.code);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : countries.length - 1;
                setSelectedCountryCode(countries[prevIndex].code);
                setIsFlipped(false);
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Poprzedni
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = countries.findIndex(c => c.code === country.code);
                const nextIndex = (currentIndex + 1) % countries.length;
                setSelectedCountryCode(countries[nextIndex].code);
                setIsFlipped(false);
              }}
            >
              Następny
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- WIDOK LISTY KRAJÓW (Strona główna Learn) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Link to="/">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Strona główna
            </Button>
          </Link>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Biblioteka Krajów
          </h1>
          <p className="text-xl text-muted-foreground">
            Poznaj kraje!
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {countries.map((country) => (
            <Card
              key={country.code}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
              onClick={() => setSelectedCountryCode(country.code)}
            >
              <CardHeader className="text-center">
                <img 
                   src={`https://flagcdn.com/w320/${country.code.toLowerCase()}.png`} 
                   alt={`Flaga ${country.name}`} 
                   className="w-24 h-16 object-cover rounded shadow mb-3 mx-auto border" 
                />
                <CardTitle className="text-xl">{country.name}</CardTitle>
                <CardDescription className="text-primary font-medium">
                  {country.capital}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Learn;