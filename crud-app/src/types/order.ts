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
// similar to CartItem but have an Item inside them and used only in front end and not store in mongodb
export interface OrderWithItemsObject extends Order{
    items: idAmountAndItemObject[];
}

export interface idAmountAndItemObject{
    itemId: string;
    amount: number;
    itemDetails: Item;
}