import { useEffect, useState } from "react";
import type { TypeStadisticsGeneral } from "../types/stadistics.types";
import { stadisticsService } from "../services/stadistics.service";
import { toast } from "react-hot-toast";

export const useGetStadistics = () => {
  const [stadistics, setStadistics] = useState<TypeStadisticsGeneral | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStadistics = async () => {
      setLoading(true);
      const { success, data, message } = await stadisticsService.getStadisticsGeneral();
      if (success && data) {
        setStadistics(data);
        toast.success(message);
      } else {
        toast.error(message);
      }
      setLoading(false);
    };
    fetchStadistics();
  }, []);

  return { stadistics, loading };
};