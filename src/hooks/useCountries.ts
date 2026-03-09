import { useQuery } from "@tanstack/react-query";
import { Country } from "@/types/Country";

export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async (): Promise<Country[]> => {
      const response = await fetch("/api/game/quiz-data");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
