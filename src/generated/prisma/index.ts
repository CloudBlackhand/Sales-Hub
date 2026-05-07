// Safe for client-side: types/enums only (no Node.js runtime)
export * from "./enums";
export type * from "./models";

// Convenience aliases: Prisma 7 exports models as XxxModel
import type {
  UserModel,
  SessionModel,
  AccountModel,
  CompanyModel,
  CompanyMemberModel,
  SellerModel,
  ProductModel,
  CustomerModel,
  SaleModel,
  SaleItemModel,
  PostSaleActivityModel,
  CommissionModel,
  FinancialTransactionModel,
  CompanySettingsModel,
} from "./models";

export type User = UserModel;
export type Session = SessionModel;
export type Account = AccountModel;
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
