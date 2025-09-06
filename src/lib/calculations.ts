import { type DealAnalyzerForm } from "./schema";

export type Metrics = {
    totalInvestment: number;
    loanAmount: number;
    grossOperatingIncome: number;
    totalOperatingExpenses: number;
    netOperatingIncome: number;
    monthlyMortgagePayment: number;
    monthlyCashFlow: number;
    annualCashFlow: number;
    capRate: number;
    cashOnCashReturn: number;
    dscr: number;
};

export function calculateMetrics(data: DealAnalyzerForm): Metrics {
    const {
        purchasePrice, closingCosts, rehabCosts, loanType, downPaymentPercent,
        downPaymentAmount, interestRate, loanTerm, grossMonthlyRent, otherMonthlyIncome,
        propertyTaxes, insurance, vacancy, repairs, capex, management, utilities, otherExpenses
    } = data;

    const totalProjectCost = purchasePrice + closingCosts + rehabCosts;
    const downPayment = loanType === 'percentage' ? totalProjectCost * (downPaymentPercent / 100) : downPaymentAmount;
    const loanAmount = totalProjectCost - downPayment;
    const totalInvestment = downPayment + closingCosts + rehabCosts;

    const annualGrossRent = grossMonthlyRent * 12;
    const annualOtherIncome = otherMonthlyIncome * 12;
    const potentialGrossIncome = annualGrossRent + annualOtherIncome;
    const vacancyLoss = potentialGrossIncome * (vacancy / 100);
    const grossOperatingIncome = potentialGrossIncome - vacancyLoss;

    const annualTaxes = propertyTaxes * 12;
    const annualInsurance = insurance * 12;
    const annualUtilities = utilities * 12;
    const annualOtherExpenses = otherExpenses * 12;
    const repairsCost = grossOperatingIncome * (repairs / 100);
    const capexCost = grossOperatingIncome * (capex / 100);
    const managementCost = grossOperatingIncome * (management / 100);
    
    const totalOperatingExpenses = annualTaxes + annualInsurance + annualUtilities + annualOtherExpenses + repairsCost + capexCost + managementCost;
    
    const netOperatingIncome = grossOperatingIncome - totalOperatingExpenses;

    const monthlyInterestRate = (interestRate / 100) / 12;
    const numberOfPayments = loanTerm * 12;
    const monthlyMortgagePayment = loanAmount > 0 && monthlyInterestRate > 0 && numberOfPayments > 0
        ? loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
        : 0;
    const annualDebtService = monthlyMortgagePayment * 12;

    const annualCashFlow = netOperatingIncome - annualDebtService;
    const monthlyCashFlow = annualCashFlow / 12;

    const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
    const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;
    const dscr = annualDebtService > 0 ? netOperatingIncome / annualDebtService : Infinity;

    return {
        totalInvestment,
        loanAmount,
        grossOperatingIncome,
        totalOperatingExpenses,
        netOperatingIncome,
        monthlyMortgagePayment,
        monthlyCashFlow,
        annualCashFlow,
        capRate,
        cashOnCashReturn,
        dscr,
    };
}
