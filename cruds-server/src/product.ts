import { Model, DataTypes } from "sequelize";
import sequelize from "./database";

export interface ProductAttributes {
  id?: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

export class Product
  extends Model<ProductAttributes>
  implements ProductAttributes
{
  public id?: number;
  public name!: string;
  public description?: string;
  public price!: number;
  public quantity!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Product",
  }
);
