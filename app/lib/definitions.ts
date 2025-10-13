// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
// export type User = {
//   id: string;
//   name: string;
//   email: string;
//   password: string;
// };

export type crafting_methods = {
  id: number
  lvl: number;
  product: string;
  exp: number;
  exp_rate: number;
  ingredients: Record<string, any>;
};

export type custom_calculations = {
  id: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;

}
