import { z } from "zod";

export const doctorAddPatientDiseaseSchema = z.object({
  patientId: z.number().int().positive(),
  diseaseId: z.number().int().positive(),
});
