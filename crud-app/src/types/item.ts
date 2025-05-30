import { ObjectId } from "mongodb";

export interface Item {
  id:string
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  img: {
    mime: string,
    data: Buffer,
  }
  category: string;
  discount: number;
  available: boolean;
  popularity: number;
  special: boolean;
  modifiedAt: Date;
}
