import { z } from "zod";

export const dealAnalyzerSchema = z.object({
  // Property Info
  purchasePrice: z.coerce.number().min(0).default(300000),
  closingCosts: z.coerce.number().min(0).default(9000),
  rehabCosts: z.coerce.number().min(0).default(10000),

  // Financing
  loanType: z.enum(["percentage", "amount"]).default("percentage"),
  downPaymentPercent: z.coerce.number().min(0).max(100).default(20),
  downPaymentAmount: z.coerce.number().min(0).default(63800),
  interestRate: z.coerce.number().min(0).max(100).default(6.5),
  loanTerm: z.coerce.number().min(1).default(30),

  // Income
  grossMonthlyRent: z.coerce.number().min(0).default(3000),
  otherMonthlyIncome: z.coerce.number().min(0).default(0),

  // Expenses
  propertyTaxes: z.coerce.number().min(0).default(300),
  insurance: z.coerce.number().min(0).default(100),
  vacancy: z.coerce.number().min(0).max(100).default(5),
  repairs: z.coerce.number().min(0).max(100).default(5),
  capex: z.coerce.number().min(0).max(100).default(5),
  management: z.coerce.number().min(0).max(100).default(8),
  utilities: z.coerce.number().min(0).default(0),
  otherExpenses: z.coerce.number().min(0).default(0),
});

export type DealAnalyzerForm = z.infer<typeof dealAnalyzerSchema>;
