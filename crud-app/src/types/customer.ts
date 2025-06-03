import {Item} from './item'
import {ObjectId} from 'mongodb'

export interface Customer{
    _id?: ObjectId; // mongodb automatic _id
    id?: string; // normal string for the front end
    email: string;
    password: string;
    name: string;
    favorite: Item[];
    cart: CartItem[];
    history: HistoryTransaction[];
    status: string;
}

// only have id to save room
export interface CartItem{
    itemId: string;
    amount: number;
}

// with the actual item
export interface CartItemObject{

}

export interface HistoryTransaction {
    items: CartItem[];
    date?: Date;
    total?: number;
}