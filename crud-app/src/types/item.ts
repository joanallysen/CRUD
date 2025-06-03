import { ObjectId } from "mongodb";

export interface Item {
  id?:string
  _id?: ObjectId;
  name: string;
  description: string;
  price: number;
  img: {
    mime: string,
    data: Buffer | string, // buffer in DB and base64 in front end
  }
  category: string;
  discount: number;
  available: boolean;
  popularity: number;
  modifiedAt: Date;
}
