/**
 * Enums e tipos de modelo Prisma para uso em cliente/servidor.
 * O barrel `@/generated/prisma` é apagado pelo `prisma generate`; mantemos este arquivo estável.
 */
export * from "@/generated/prisma/enums";
export type * from "@/generated/prisma/models";

import type {
  AccountModel,
  CommissionModel,
  CompanyMemberModel,
  CompanyModel,
  CompanySettingsModel,
  CustomerModel,
  FinancialTransactionModel,
  PostSaleActivityModel,
  ProductModel,
  SaleItemModel,
  SaleModel,
  SellerModel,
  SessionModel,
  UserModel,
  VerificationModel,
} from "@/generated/prisma/models";

export type User = UserModel;
export type Session = SessionModel;
export type Account = AccountModel;
export type Verification = VerificationModel;
export type Company = CompanyModel;
export type CompanyMember = CompanyMemberModel;
export type Seller = SellerModel;
export type Product = ProductModel;
export type Customer = CustomerModel;
export type Sale = SaleModel;
export type SaleItem = SaleItemModel;
export type PostSaleActivity = PostSaleActivityModel;
export type Commission = CommissionModel;
export type FinancialTransaction = FinancialTransactionModel;
export type CompanySettings = CompanySettingsModel;
