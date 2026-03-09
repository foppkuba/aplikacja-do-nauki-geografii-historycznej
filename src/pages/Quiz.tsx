import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, RotateCcw, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Country } from "@/types";

// Typ pytania w Quizie
interface Question {
  country: string;
  correctAnswer: string;
  options: string[];
  flagCode: string; // Trzymamy kod, żeby wygenerować URL do flagi
}

const Quiz = () => {
  // Stan na surowe dane z API (żeby nie pobierać ich przy każdym restarcie gry)
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  // Stan gry
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  // 1. Pobieranie danych przy wejściu na stronę
  useEffect(() => {
    fetch("/api/game/quiz-data")
      .then((res) => res.json())
      .then((data) => {
        setAllCountries(data);
        startNewGame(data); // Od razu startujemy grę jak przyjdą dane
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania quizu:", err);
        setLoading(false);
      });
  }, []);

  // 2. Logika generowania pytań
  const startNewGame = (sourceData: Country[] = allCountries) => {
    if (sourceData.length < 4) return; // Zabezpieczenie: potrzeba min 4 krajów do losowania opcji

    // Mieszamy kraje
    const shuffled = [...sourceData].sort(() => Math.random() - 0.5);
    
    // Bierzemy max 10 pytań (lub mniej, jeśli krajów jest mało)
    const gameCount = Math.min(10, shuffled.length);

    const quizQuestions: Question[] = shuffled.slice(0, gameCount).map((targetCountry) => {
      // Dla każdego pytania losujemy 3 błędne odpowiedzi (stolice innych państw)
      const otherCountries = sourceData.filter((c) => c.code !== targetCountry.code);
      
      const wrongAnswers = otherCountries
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((c) => c.capital);
      
      // Łączymy poprawną z błędnymi i mieszamy
      const options = [...wrongAnswers, targetCountry.capital].sort(() => Math.random() - 0.5);
      
      return {
        country: targetCountry.name,
        correctAnswer: targetCountry.capital,
        options,
        flagCode: targetCountry.code,
      };
    });
    
    setQuestions(quizQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  // --- UI: Ładowanie ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p>Przygotowywanie pytań...</p>
      </div>
    );
  }

  // --- UI: Błąd (za mało danych) ---
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Brak danych do quizu</h2>
        <p className="mb-4">Potrzebujemy przynajmniej 4 krajów w bazie, aby uruchomić quiz.</p>
        <Link to="/">
            <Button>Wróć do menu</Button>
        </Link>
      </div>
    );
  }

  // --- UI: Wyniki ---
  if (showResult) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full text-center">
          <CardHeader>
            <div className="text-6xl mb-4">
              {percentage >= 80 ? "🏆" : percentage >= 60 ? "⭐" : "💪"}
            </div>
            <CardTitle className="text-4xl mb-2">Quiz zakończony!</CardTitle>
            <CardDescription className="text-xl">
              Twój wynik: {score} / {questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-5xl font-bold text-primary">
              {percentage.toFixed(0)}%
            </div>
            <p className="text-lg">
              {percentage >= 80 
                ? "Niesamowite! Jesteś ekspertem od geografii! 🎉" 
                : percentage >= 60 
                ? "Dobra robota! Jeszcze trochę praktyki i będziesz mistrzem! 🌟"
                : "Nie poddawaj się! Spróbuj jeszcze raz i zobacz jak się poprawisz! 💪"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => startNewGame()} size="lg">
                <RotateCcw className="mr-2 h-5 w-5" />
                Zagraj ponownie
              </Button>
              <Link to="/">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Strona główna
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- UI: Gra ---
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Strona główna
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Pytanie {currentQuestion + 1} z {questions.length}
            </span>
            <span className="text-sm font-medium flex items-center">
              <Trophy className="mr-1 h-4 w-4 text-accent" />
              Wynik: {score}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="mb-6">
          <CardHeader className="text-center">
            <img 
                src={`https://flagcdn.com/w320/${question.flagCode.toLowerCase()}.png`} 
                alt={`Flaga ${question.country}`} 
                className="w-48 h-auto object-cover mx-auto rounded-lg shadow-md mb-4 border" 
            />
            <CardTitle className="text-3xl mb-2">
              Jaka jest stolica kraju: {question.country}?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {question.options.map((option, index) => {
              const isCorrect = option === question.correctAnswer;
              const isSelected = option === selectedAnswer;
              
              let buttonVariant: "default" | "outline" | "destructive" | "secondary" = "outline";
              
              if (isAnswered) {
                if (isCorrect) {
                  buttonVariant = "secondary"; // Zielony (zależnie od theme)
                } else if (isSelected && !isCorrect) {
                  buttonVariant = "destructive";
                }
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className={`w-full h-auto p-6 text-lg justify-start transition-all duration-300 ${
                    isAnswered && isCorrect ? "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-500" : ""
                  }`}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                >
                  <span className="mr-4 text-2xl font-bold text-muted-foreground">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                  {isAnswered && isCorrect && <span className="ml-auto text-2xl">✓</span>}
                  {isAnswered && isSelected && !isCorrect && <span className="ml-auto text-2xl">✗</span>}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {isAnswered && (
          <Button 
            onClick={handleNext} 
            size="lg" 
            className="w-full animate-in fade-in zoom-in duration-300"
          >
            {currentQuestion < questions.length - 1 ? "Następne pytanie" : "Zobacz wynik"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Quiz;