import { Document } from "mongoose";
import { Response } from "express";

export interface ICard {
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}
