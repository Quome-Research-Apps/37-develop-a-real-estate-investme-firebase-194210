"use server";

import { generateComparableProperties } from "@/ai/flows/generate-comparable-properties";
import { z } from "zod";

const formSchema = z.object({
  location: z.string().min(1, 'Location is required.'),
  radius: z.coerce.number().min(1, 'Radius must be at least 1 mile.'),
  squareFootageRange: z.string().min(1, 'Square footage range is required.'),
  propertyTypes: z.string().min(1, 'Property types are required.'),
  propertyListingsCsv: z.string().min(1, 'Property listings CSV file is required.'),
});

export type FormState = {
  message: string;
  summary?: string;
  errors?: {
    location?: string[];
    radius?: string[];
    squareFootageRange?: string[];
    propertyTypes?: string[];
    propertyListingsCsv?: string[];
  }
}

export async function getComparableProperties(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    const result = await generateComparableProperties(validatedFields.data);
    return { message: 'Success!', summary: result.summary };
  } catch (e) {
    console.error(e);
    return { message: 'An error occurred while generating the summary. Please try again.' };
  }
}
