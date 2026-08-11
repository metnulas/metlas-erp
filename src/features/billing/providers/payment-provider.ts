export type PaymentRequest = { amount: number; currency: string; reference: string; email: string };
export type PaymentResult = { status: "SUCCEEDED" | "PENDING" | "FAILED"; providerReference: string; failureReason?: string };

export interface PaymentProvider { readonly name: string; createPayment(input: PaymentRequest): Promise<PaymentResult>; refund(providerReference: string, amount: number): Promise<PaymentResult>; }

export const demoPaymentProvider: PaymentProvider = {
  name: "demo",
  async createPayment(input) { return { status: "SUCCEEDED", providerReference: `DEMO-${input.reference}` }; },
  async refund(providerReference) { return { status: "SUCCEEDED", providerReference }; },
};
