import { ObjectId } from "mongodb";
import {Item} from './item'
import {CartItem} from './customer'

export interface Order {
    id?: string;
    _id?: ObjectId;
    date: Date;
    customerEmail: string;
    customerName: string;
    items: CartItem[];
    orderStatus: 'Processing' | 'Cancelled' | 'Complete';
    paymentMethod: 'Cash' | 'Card';
    totalPrice: number;

    // not gonna be used for now
    notes?: string;
    updatedAt?: Date; 
}

// cannot store multiple item due to exceeding the limit
export interface HistoryItem{
    itemId: string;
    amount: number;
}