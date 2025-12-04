import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { TypeClassStudent } from "../types/class.types";
import { classStudentService } from "../services/class-student.service";

export const useGetStudentsByClass = (classId: string | undefined | null) => {
  const [students, setStudents] = useState<TypeClassStudent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    if (classId) {
      const { success, data, message } =
        await classStudentService.getStudentsByClass(classId);
      if (success && data) {
        setStudents(data);
      } else {
        toast.error(message);
      }
      setLoading(false);
    } else {
      setStudents([]);
      setLoading(false);
      toast.error("ID de la clase no válido");
    }
  };

  useEffect(() => {
    if (classId !== undefined && classId !== null) {
      loadStudents();
    } else {
      setStudents([]);
      setLoading(false);
      toast.error("ID de la clase no válido");
    }
  }, [classId]);

  return { students, loading };
};
