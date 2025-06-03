import { ObjectId } from "mongodb";

export interface Admin{
    _id?: ObjectId;
    id?: string;
    email: string;
    password: string;
}