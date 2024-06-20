import { Paystack } from "paystack-sdk";

// export class PaystackService {
//   private paystack: Paystack;

//   constructor(private secretKey: string) {
//     this.paystack = new Paystack(this.secretKey);
//   }

//   async initializePayment(amount: number, email: string): Promise<string> {
//     const response = await this.paystack.transaction.initialize({
//       amount: (amount * 100).toString(),
//       email,
//     });

//     return response.data?.authorization_url as string;
//   }

//   async verifyPayment(reference: string): Promise<boolean> {
//     const response = await this.paystack.transaction.verify(reference);

//     return response.data?.status === "success";
//   }
// }

export class Payment {
  private paystack: Paystack;

  constructor(private secretKey: string) {
    this.paystack = new Paystack(this.secretKey);
  }

  async initializePayment(amount: number, email: string): Promise<string> {
    const response = await this.paystack.transaction.initialize({
      amount: (amount * 100).toString(),
      email,
    });

    return response.data?.authorization_url as string;
  }

  async verifyPayment(reference: string): Promise<boolean> {
    const response = await this.paystack.transaction.verify(reference);

    return response.data?.status === "success";
  }
}
