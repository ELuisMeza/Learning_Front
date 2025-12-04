import { useEffect, useState } from "react";
import type { TypeClassDetails } from "../types/class.types";
import { classService } from "../services/class.service";
import toast from "react-hot-toast";

export const useGetClassDetail = (classId: string | undefined | null) => {

  const [classData, setClassData] = useState<TypeClassDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classId !== undefined && classId !== null) {
      loadClassDetails();
    } else {
      setClassData(null);
      setLoading(false);
      toast.error('ID de la clase no válido');
    }
  }, [classId]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      if (classId) {
        const { success, data, message } = await classService.getClassById(classId);
        if (success && data) {
          setClassData(data);
        } else {
          toast.error(message || 'Error al cargar los detalles de la clase');
        }
      }
    } catch (error) {
      toast.error('Error al cargar los detalles de la clase');
    } finally {
      setLoading(false);
    }
  };

  return { classData, loading };


} 