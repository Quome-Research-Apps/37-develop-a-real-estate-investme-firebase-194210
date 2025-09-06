"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { DealAnalyzerForm } from "@/lib/schema";
import { dealAnalyzerSchema } from "@/lib/schema";
import { calculateMetrics, type Metrics } from "@/lib/calculations";
import { BarChart, Briefcase, Building, Calendar, DollarSign, Euro, Banknote, Landmark, Percent, PieChart, TrendingUp, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, PieChart as RechartsPieChart } from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ComparablePropertiesTool } from "@/components/comparable-properties-tool";

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const numberFormatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MetricCard = ({ icon: Icon, label, value, tooltip }: { icon: React.ElementType, label: string, value: string, tooltip: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{label}</CardTitle>
      <Icon className="h-5 w-5 text-accent" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{tooltip}</p>
    </CardContent>
  </Card>
);

export function DealAnalyzer() {
  const [metrics, setMetrics] = React.useState<Metrics | null>(null);
  const [visibleSections, setVisibleSections] = React.useState({
    keyMetrics: true,
    cashFlow: true,
    expenseBreakdown: true,
  });

  const form = useForm<DealAnalyzerForm>({
    resolver: zodResolver(dealAnalyzerSchema),
    defaultValues: dealAnalyzerSchema.parse({}),
  });

  const watchedValues = form.watch();

  React.useEffect(() => {
    const parsedData = dealAnalyzerSchema.safeParse(watchedValues);
    if (parsedData.success) {
      const result = calculateMetrics(parsedData.data);
      setMetrics(result);
    }
  }, [watchedValues]);

  React.useEffect(() => {
    const { purchasePrice, closingCosts, rehabCosts, loanType, downPaymentPercent, downPaymentAmount } = watchedValues;
    const totalProjectCost = purchasePrice + closingCosts + rehabCosts;
    if (loanType === 'percentage') {
      const newDownPaymentAmount = totalProjectCost * (downPaymentPercent / 100);
      if (newDownPaymentAmount !== downPaymentAmount) {
        form.setValue('downPaymentAmount', newDownPaymentAmount, { shouldValidate: true });
      }
    } else {
      const newDownPaymentPercent = totalProjectCost > 0 ? (downPaymentAmount / totalProjectCost) * 100 : 0;
      if (newDownPaymentPercent !== downPaymentPercent) {
        form.setValue('downPaymentPercent', newDownPaymentPercent, { shouldValidate: true });
      }
    }
  }, [watchedValues.loanType, watchedValues.downPaymentPercent, watchedValues.downPaymentAmount, watchedValues.purchasePrice, watchedValues.closingCosts, watchedValues.rehabCosts, form]);

  const expenseData = React.useMemo(() => {
    if (!metrics || !watchedValues) return [];
    const annualTaxes = watchedValues.propertyTaxes * 12;
    const annualInsurance = watchedValues.insurance * 12;
    const managementCost = metrics.grossOperatingIncome * (watchedValues.management / 100);
    const repairsCost = metrics.grossOperatingIncome * (watchedValues.repairs / 100);
    const capexCost = metrics.grossOperatingIncome * (watchedValues.capex / 100);
    
    return [
        { name: "Taxes", value: annualTaxes, fill: "var(--color-taxes)" },
        { name: "Insurance", value: annualInsurance, fill: "var(--color-insurance)" },
        { name: "Management", value: managementCost, fill: "var(--color-management)" },
        { name: "Repairs", value: repairsCost, fill: "var(--color-repairs)" },
        { name: "CapEx", value: capexCost, fill: "var(--color-capex)" },
    ].filter(item => item.value > 0);
  }, [metrics, watchedValues]);

  const cashFlowData = React.useMemo(() => {
    if (!metrics) return [];
    return [
      { name: 'Income', GOI: metrics.grossOperatingIncome, fill: "var(--color-income)" },
      { name: 'Expenses', Expenses: metrics.totalOperatingExpenses, fill: "var(--color-expenses)" },
      { name: 'Cash Flow', "Cash Flow": metrics.annualCashFlow, fill: "var(--color-cashflow)" },
    ];
  }, [metrics]);

  const chartConfig: ChartConfig = {
    taxes: { label: "Taxes", color: "hsl(var(--chart-1))" },
    insurance: { label: "Insurance", color: "hsl(var(--chart-2))" },
    management: { label: "Management", color: "hsl(var(--chart-3))" },
    repairs: { label: "Repairs", color: "hsl(var(--chart-4))" },
    capex: { label: "CapEx", color: "hsl(var(--chart-5))" },
    GOI: { label: "GOI", color: "hsl(var(--chart-2))" },
    Expenses: { label: "Expenses", color: "hsl(var(--chart-5))" },
    "Cash Flow": { label: "Cash Flow", color: "hsl(var(--chart-1))" },
  };

  return (
    <Form {...form}>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Property Analysis</CardTitle>
              <CardDescription>Enter the details of your potential investment property.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="property">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="property">Property</TabsTrigger>
                  <TabsTrigger value="financing">Financing</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                </TabsList>
                
                <TabsContent value="property" className="pt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price</FormLabel>
                        <FormControl><Input type="number" placeholder="300,000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="closingCosts" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Costs</FormLabel>
                        <FormControl><Input type="number" placeholder="9,000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="rehabCosts" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rehab Costs</FormLabel>
                        <FormControl><Input type="number" placeholder="10,000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </TabsContent>

                <TabsContent value="financing" className="pt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="loanType" render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Down Payment Type</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="percentage" /></FormControl><FormLabel className="font-normal">Percentage</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="amount" /></FormControl><FormLabel className="font-normal">Fixed Amount</FormLabel></FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )} />
                    {watchedValues.loanType === 'percentage' ? (
                      <FormField control={form.control} name="downPaymentPercent" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Down Payment (%)</FormLabel>
                          <FormControl><Input type="number" placeholder="20" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    ) : (
                      <FormField control={form.control} name="downPaymentAmount" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Down Payment ($)</FormLabel>
                          <FormControl><Input type="number" placeholder="60,000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    <div></div>
                    <FormField control={form.control} name="interestRate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest Rate (%)</FormLabel>
                        <FormControl><Input type="number" placeholder="6.5" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="loanTerm" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Term (Years)</FormLabel>
                        <FormControl><Input type="number" placeholder="30" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </TabsContent>

                <TabsContent value="income" className="pt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="grossMonthlyRent" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Monthly Rent</FormLabel>
                        <FormControl><Input type="number" placeholder="3000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="otherMonthlyIncome" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Monthly Income</FormLabel>
                        <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </TabsContent>

                <TabsContent value="expenses" className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4">Enter fixed monthly costs or percentage of gross operating income for variable expenses.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="propertyTaxes" render={({ field }) => (
                      <FormItem><FormLabel>Property Taxes ($/mo)</FormLabel><FormControl><Input type="number" placeholder="300" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="insurance" render={({ field }) => (
                      <FormItem><FormLabel>Insurance ($/mo)</FormLabel><FormControl><Input type="number" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="vacancy" render={({ field }) => (
                      <FormItem><FormLabel>Vacancy (%)</FormLabel><FormControl><Input type="number" placeholder="5" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="repairs" render={({ field }) => (
                      <FormItem><FormLabel>Repairs & Maint. (%)</FormLabel><FormControl><Input type="number" placeholder="5" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="capex" render={({ field }) => (
                      <FormItem><FormLabel>Capital Expenditures (%)</FormLabel><FormControl><Input type="number" placeholder="5" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="management" render={({ field }) => (
                      <FormItem><FormLabel>Management Fees (%)</FormLabel><FormControl><Input type="number" placeholder="8" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="utilities" render={({ field }) => (
                      <FormItem><FormLabel>Utilities ($/mo)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="otherExpenses" render={({ field }) => (
                      <FormItem><FormLabel>Other Expenses ($/mo)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>

          <ComparablePropertiesTool />

        </div>

        <div className="lg:sticky top-28 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Pro-forma Report</CardTitle>
              <CardDescription>Key metrics and visualizations based on your inputs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 p-2 border rounded-md">
                  <Checkbox id="showMetrics" checked={visibleSections.keyMetrics} onCheckedChange={(checked) => setVisibleSections(v => ({...v, keyMetrics: !!checked}))} />
                  <Label htmlFor="showMetrics">Key Metrics</Label>
                  <Checkbox id="showCashFlow" checked={visibleSections.cashFlow} onCheckedChange={(checked) => setVisibleSections(v => ({...v, cashFlow: !!checked}))} />
                  <Label htmlFor="showCashFlow">Cash Flow Chart</Label>
                  <Checkbox id="showExpenses" checked={visibleSections.expenseBreakdown} onCheckedChange={(checked) => setVisibleSections(v => ({...v, expenseBreakdown: !!checked}))} />
                  <Label htmlFor="showExpenses">Expense Breakdown</Label>
              </div>
              <Separator/>

              {metrics && (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                  {visibleSections.keyMetrics && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <MetricCard icon={Wallet} label="Total Investment" value={currencyFormatter.format(metrics.totalInvestment)} tooltip="Cash required to close" />
                      <MetricCard icon={DollarSign} label="Annual Cash Flow" value={currencyFormatter.format(metrics.annualCashFlow)} tooltip="NOI minus debt service" />
                      <MetricCard icon={TrendingUp} label="Cash on Cash Return" value={`${numberFormatter.format(metrics.cashOnCashReturn)}%`} tooltip="Annual cash flow / total investment" />
                      <MetricCard icon={Landmark} label="Cap Rate" value={`${numberFormatter.format(metrics.capRate)}%`} tooltip="NOI / purchase price" />
                      <MetricCard icon={Banknote} label="NOI" value={currencyFormatter.format(metrics.netOperatingIncome)} tooltip="Annual Net Operating Income" />
                      <MetricCard icon={Briefcase} label="DSCR" value={isFinite(metrics.dscr) ? numberFormatter.format(metrics.dscr) : "N/A"} tooltip="Debt Service Coverage Ratio" />
                    </div>
                  )}

                  {visibleSections.cashFlow && (
                    <Card>
                      <CardHeader><CardTitle>Annual Financial Overview</CardTitle></CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="h-64 w-full">
                          <RechartsBarChart data={cashFlowData} accessibilityLayer>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="GOI" fill="var(--color-GOI)" radius={4} />
                            <Bar dataKey="Expenses" fill="var(--color-Expenses)" radius={4} />
                            <Bar dataKey="Cash Flow" fill="var(--color-cashflow)" radius={4} />
                          </RechartsBarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  )}

                  {visibleSections.expenseBreakdown && expenseData.length > 0 && (
                     <Card>
                      <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="h-64 w-full">
                          <RechartsPieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Pie data={expenseData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                               {expenseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                          </RechartsPieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Form>
  );
}
