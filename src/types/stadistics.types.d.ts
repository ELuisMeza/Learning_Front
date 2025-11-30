export interface TypeStadisticsGeneral {
  classes: {
    classes: {
      totalActiveClasses: number;
      byTeachingMode: {
        typeTeaching: string;
        count: string;
      }[];
    };
  };
  careers: {
    careers: {
      totalActiveCareers: number;
      byModality: {
        modality: string;
        count: string;
      }[];
    };
  };
  students: {
    totalActiveStudents: number;
  };
  teachers: {
    teachers: {
      totalActiveTeachers: number;
      byTeachingMode: {
        teachingModes: string;
        count: string;
      }[];
    };
  };
}