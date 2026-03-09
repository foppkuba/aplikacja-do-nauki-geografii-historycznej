import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Loader2 } from "lucide-react";
import { Country } from "@/types";

const Flags = () => {
  const navigate = useNavigate();
  
  // Stan na dane z backendu
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  // 1. POBIERANIE DANYCH Z BACKENDU
  useEffect(() => {
    fetch("/api/game/quiz-data")
      .then((res) => {
        if (!res.ok) throw new Error("Błąd sieci");
        return res.json();
      })
      .then((data) => {
        setCountries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania quizu:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  // Zabezpieczenie: jeśli lista pusta lub ładowanie
  const currentCountry = countries[currentIndex];

  // 2. GENEROWANIE OPCJI (zaktualizowane pod nową listę)
  const options = useMemo(() => {
    if (!currentCountry || countries.length === 0) return [];

    const opts = [currentCountry.name];
    // Filtrujemy po kodzie (bo to unikalny identyfikator zamiast id)
    const otherCountries = countries.filter(c => c.code !== currentCountry.code);
    
    // Zabezpieczenie pętli while, jeśli mamy za mało krajów w bazie
    const maxOptions = Math.min(4, otherCountries.length + 1);

    while (opts.length < maxOptions) {
      const randomCountry = otherCountries[Math.floor(Math.random() * otherCountries.length)];
      if (!opts.includes(randomCountry.name)) {
        opts.push(randomCountry.name);
      }
    }
    
    return opts.sort(() => Math.random() - 0.5);
  }, [currentIndex, countries, currentCountry]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    setAnsweredQuestions(prev => prev + 1);
    
    if (answer === currentCountry.name) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < countries.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowResult(false);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnsweredQuestions(0);
  };

  // --- EKRAN ŁADOWANIA ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p>Ładowanie pytań z serwera...</p>
        </div>
      </div>
    );
  }

  // --- EKRAN BŁĘDU ---
  if (error || countries.length === 0) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
                <h2 className="text-xl font-bold text-destructive mb-2">Ups! Błąd.</h2>
                <p>Nie udało się pobrać flag. Sprawdź czy backend działa.</p>
                <Button onClick={() => navigate("/")} className="mt-4">Wróć</Button>
            </div>
        </div>
    )
  }

  // --- EKRAN WYNIKU ---
  if (answeredQuestions === countries.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Powrót
          </Button>
          <Card className="p-8 text-center">
            <CardContent className="space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold">Gratulacje!</h2>
              <p className="text-xl">Twój wynik: {score} / {countries.length}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleRestart}>Zagraj ponownie</Button>
                <Button variant="outline" onClick={() => navigate("/")}>Wróć do menu</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- EKRAN GRY ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Powrót
        </Button>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Nauka Flag 🚩</h1>
          <p className="text-muted-foreground">Pytanie {currentIndex + 1} z {countries.length}</p>
          <p className="text-sm text-muted-foreground mt-2">Wynik: {score} / {answeredQuestions}</p>
        </div>

        <Card className="p-8">
          <CardContent className="space-y-8">
            <div className="text-center space-y-4">
              <img 
                src={`https://flagcdn.com/w640/${currentCountry.code.toLowerCase()}.png`} 
                alt={`Flaga`}
                className="mx-auto w-full max-w-md h-auto rounded-lg shadow-lg border"
              />
              <h2 className="text-2xl font-bold">Jaki to kraj?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((option) => {
                const isCorrect = option === currentCountry.name;
                const isSelected = option === selectedAnswer;
                
                return (
                  <Button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                    variant={
                      showResult
                        ? isCorrect
                          ? "default"
                          : isSelected
                          ? "destructive"
                          : "outline"
                        : "outline"
                    }
                    className="h-auto py-4 text-lg relative"
                  >
                    {option}
                    {showResult && isCorrect && <Check className="ml-2 h-5 w-5 absolute right-4" />}
                    {showResult && isSelected && !isCorrect && <X className="ml-2 h-5 w-5 absolute right-4" />}
                  </Button>
                );
              })}
            </div>

            {showResult && (
              <div className="text-center space-y-4 animate-in fade-in duration-500">
                <p className="text-lg">
                  {selectedAnswer === currentCountry.name ? (
                    <span className="text-green-600 dark:text-green-400 font-bold">✓ Brawo! To {currentCountry.name}!</span>
                  ) : (
                    <span className="text-destructive font-bold">✗ Niestety, to {currentCountry.name}</span>
                  )}
                </p>
                <p className="text-muted-foreground">Stolica: {currentCountry.capital}</p>
                <Button onClick={handleNext}>
                  {currentIndex < countries.length - 1 ? "Następna flaga" : "Zobacz wynik"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Flags;