import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

interface GameResultProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  emojiThresholds?: { low: string; medium: string; high: string };
  messages?: { low: string; medium: string; high: string };
}

export const GameResult = ({
  score,
  totalQuestions,
  onRestart,
  emojiThresholds = { low: "💪", medium: "⭐", high: "🏆" },
  messages = {
    low: "Nie poddawaj się! Spróbuj jeszcze raz i zobacz jak się poprawisz! 💪",
    medium: "Dobra robota! Jeszcze trochę praktyki i będziesz mistrzem! 🌟",
    high: "Niesamowite! Jesteś ekspertem! 🎉",
  },
}: GameResultProps) => {
  const percentage = (score / totalQuestions) * 100;

  let emoji = emojiThresholds.low;
  let message = messages.low;

  if (percentage >= 80) {
    emoji = emojiThresholds.high;
    message = messages.high;
  } else if (percentage >= 60) {
    emoji = emojiThresholds.medium;
    message = messages.medium;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full text-center">
        <CardHeader>
          <div className="text-6xl mb-4">{emoji}</div>
          <CardTitle className="text-4xl mb-2">Gra zakończona!</CardTitle>
          <CardDescription className="text-xl">
            Twój wynik: {score} / {totalQuestions}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-5xl font-bold text-primary">{percentage.toFixed(0)}%</div>
          <p className="text-lg">{message}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onRestart} size="lg">
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
};
