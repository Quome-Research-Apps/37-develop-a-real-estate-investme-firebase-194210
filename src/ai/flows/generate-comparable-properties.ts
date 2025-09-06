// src/ai/flows/generate-comparable-properties.ts
'use server';

/**
 * @fileOverview Generates a summary of comparable properties on the market using a generative AI tool.
 *
 * - generateComparableProperties - A function that handles the generation of comparable properties summary.
 * - GenerateComparablePropertiesInput - The input type for the generateComparableProperties function.
 * - GenerateComparablePropertiesOutput - The return type for the generateComparableProperties function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComparablePropertiesInputSchema = z.object({
  location: z.string().describe('The location to search for comparable properties.'),
  radius: z.number().describe('The radius in miles to search around the location.'),
  squareFootageRange: z.string().describe('The range of square footage to consider (e.g., "1000-2000").'),
  propertyTypes: z.string().describe('The types of properties to include (e.g., "single family, duplex").'),
  propertyListingsCsv: z.string().describe('A CSV string of property listings with headers.'),
});
export type GenerateComparablePropertiesInput = z.infer<typeof GenerateComparablePropertiesInputSchema>;

const GenerateComparablePropertiesOutputSchema = z.object({
  summary: z.string().describe('A summary of comparable properties found on the market.'),
});
export type GenerateComparablePropertiesOutput = z.infer<typeof GenerateComparablePropertiesOutputSchema>;

export async function generateComparableProperties(input: GenerateComparablePropertiesInput): Promise<GenerateComparablePropertiesOutput> {
  return generateComparablePropertiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComparablePropertiesPrompt',
  input: {schema: GenerateComparablePropertiesInputSchema},
  output: {schema: GenerateComparablePropertiesOutputSchema},
  prompt: `You are a real estate expert. Given the following property criteria and a CSV of property listings, generate a summary of comparable properties on the market.

Criteria:
Location: {{{location}}}
Radius: {{{radius}}} miles
Square Footage Range: {{{squareFootageRange}}}
Property Types: {{{propertyTypes}}}

Property Listings CSV:
{{{propertyListingsCsv}}}

Summary:`, 
});

const generateComparablePropertiesFlow = ai.defineFlow(
  {
    name: 'generateComparablePropertiesFlow',
    inputSchema: GenerateComparablePropertiesInputSchema,
    outputSchema: GenerateComparablePropertiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
