import React, { useEffect, useState } from 'react';
import { Order } from 'src/types/order';
import Notification from './Notification';


export default function AdminDashboard() : React.JSX.Element {
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showNotification, setShowNotification] = useState<boolean>(false);
    useEffect(() => {
        loadOrder();
    }, []);

    const loadOrder = async () => {
        console.log('Loading order...');
        const result: { success: boolean; orders: Order[] } = await window.electron.ipcRenderer.invoke('get-all-orders');
        if (result.success) {
            console.log('orders', result.orders);
            setOrders(result.orders);
        } else {
            console.log('Data is wrong?');
        }
    };

    // Calculate sales metrics
    const calculateSales = () => {
        const now = new Date();
        // start from midnight
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(weekStart.getDate() - 7);

        const lastWeekEnd = new Date(weekStart);
        lastWeekEnd.setDate(weekStart.getDate() - 1);

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const todaySales = orders
            .filter(order => new Date(order.date) >= today)
            .reduce((sum, order) => sum + order.totalPrice, 0);

        const yesterdaySales = orders
            .filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= yesterday && orderDate < today;
            })
            .reduce((sum, order) => sum + order.totalPrice, 0);

        const weekSales = orders
            .filter(order => new Date(order.date) >= weekStart)
            .reduce((sum, order) => sum + order.totalPrice, 0);

        const lastWeekSales = orders
            .filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= lastWeekStart && orderDate <= lastWeekEnd;
            })
            .reduce((sum, order) => sum + order.totalPrice, 0);

        const monthSales = orders
            .filter(order => new Date(order.date) >= monthStart)
            .reduce((sum, order) => sum + order.totalPrice, 0);

        const lastMonthSales = orders
            .filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
            })
            .reduce((sum, order) => sum + order.totalPrice, 0);

        return { todaySales, weekSales, monthSales, yesterdaySales, lastWeekSales, lastMonthSales };
    };

    const { todaySales, weekSales, monthSales, yesterdaySales, lastWeekSales, lastMonthSales } = calculateSales();
/*

now	Current date and time	June 18, 2025, 12:34:56 PM
today	Current date at midnight (00:00)	June 18, 2025, 00:00:00
yesterday	Yesterday's date at midnight	June 17, 2025, 00:00:00
weekStart	Start of the current week (Sunday)	June 15, 2025, 00:00:00
lastWeekStart	Start of the previous week (Sunday of last week)	June 8, 2025, 00:00:00
lastWeekEnd	End of the previous week (Saturday of last week)	June 14, 2025, 00:00:00
monthStart	First day of the current month	June 1, 2025, 00:00:00
lastMonthStart	First day of the previous month	May 1, 2025, 00:00:00
lastMonthEnd	Last day of the previous month	May 31, 2025, 00:00:00*/

    const filteredOrders = orders.filter((order) => {
        const regex = new RegExp(searchTerm, 'i'); // 'i' means case-insensitive
        const matchesSearch : boolean = regex.test(order.customerName) || regex.test(order.customerEmail);
        const matchesStatus : boolean = statusFilter === 'all' || order.orderStatus.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const exportToCSV = () => {
        setShowNotification(true);
        window.electron.ipcRenderer.invoke('export-order-to-csv');
    }

    const exportToJSON = () =>{
        setShowNotification(true);
        window.electron.ipcRenderer.invoke('export-order-to-json');
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-NZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const daySalesChanges =  yesterdaySales === 0 ? 0 : ((todaySales - yesterdaySales) / (yesterdaySales || 1)) * 100;
    const weekSalesChanges = (weekSales - lastWeekSales) / (lastWeekSales || 1) * 100;
    const monthSalesChanges = (monthSales - lastMonthSales) / (lastMonthSales || 1) * 100;
    return (
        <div className="min-h-screen bg-gray-850 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="mb-6">Sales Dashboard</h1>
                
                {/* Top Row - Sales Metrics (3 columns) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Today's Sales */}
                    <div className="bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3>Today's Sales</h3>
                                <h2>${todaySales.toFixed(2)}</h2>
                                {daySalesChanges > 0 ? 
                                    <p className="text-green-400 flex items-center mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M3.4 18L2 16.6l7.4-7.45l4 4L18.6 8H16V6h6v6h-2V9.4L13.4 16l-4-4z"/></svg>
                                    {daySalesChanges.toFixed(2)}% from yesterday
                                    </p> :
                                    <p className='text-red-400 flex items-center mt-1'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M16 18v-2h2.6l-5.2-5.15l-4 4L2 7.4L3.4 6l6 6l4-4l6.6 6.6V12h2v6z"/></svg>
                                    {daySalesChanges.toFixed(2)}% from yesterday
                                    </p>   
                                }
                            </div>
                        </div>
                    </div>

                    {/* This Week's Sales */}
                    <div className="bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3>This Week's Sales</h3>
                                <h2>${weekSales.toFixed(2)}</h2>
                                {weekSalesChanges > 0 ? 
                                    <p className="text-green-400 flex items-center mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M3.4 18L2 16.6l7.4-7.45l4 4L18.6 8H16V6h6v6h-2V9.4L13.4 16l-4-4z"/></svg>
                                    {weekSalesChanges.toFixed(2)}% from last week
                                    </p> :
                                    <p className='text-red-400 flex items-center mt-1'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M16 18v-2h2.6l-5.2-5.15l-4 4L2 7.4L3.4 6l6 6l4-4l6.6 6.6V12h2v6z"/></svg>
                                    {weekSalesChanges.toFixed(2)}% from last week
                                    </p>   
                                }
                            </div>
                        </div>
                    </div>

                    {/* This Month's Sales */}
                    <div className="bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3>This Month's Sales</h3>
                                <h2>${monthSales.toFixed(2)}</h2>
                                {monthSalesChanges > 0 ? 
                                    <p className="text-green-400 flex items-center mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M3.4 18L2 16.6l7.4-7.45l4 4L18.6 8H16V6h6v6h-2V9.4L13.4 16l-4-4z"/></svg>
                                    {monthSalesChanges.toFixed(2)}% from last month
                                    </p> :
                                    <p className='text-red-400 flex items-center mt-1'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M16 18v-2h2.6l-5.2-5.15l-4 4L2 7.4L3.4 6l6 6l4-4l6.6 6.6V12h2v6z"/></svg>
                                    {monthSalesChanges.toFixed(2)}% from last month
                                    </p>   
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Customer Data (1 column, full width) */}
                <div>
                    <div className="flex flex-row items-center justify-between gap-4">
                        <h1 className="mb-6">Customer Management</h1>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                    className="pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-gray-900"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            {/* Status Filter */}
                            <div className="relative flex items-center">
                                <select
                                    className="pr-8 py-2 pl-4 border border-gray-700 rounded-lg bg-gray-900 hover:bg-gray-800 cursor-pointer appearance-none"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="processing">Processing</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="complete">Complete</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <span className="absolute right-2 pointer-events-none flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M11 20q-.425 0-.712-.288T10 19v-6L4.2 5.6q-.375-.5-.112-1.05T5 4h14q.65 0 .913.55T19.8 5.6L14 13v6q0 .425-.288.713T13 20z"/>
                                    </svg>
                                </span>
                            </div>

                            {/* Export to CSV */}
                            <div className='relative flex items-center'>
                                <select
                                    className="pr-5 py-2 pl-4 border border-gray-700 bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer appearance-none"
                                    onChange={(e) => {
                                        if (e.target.value === 'csv') {
                                            exportToCSV();
                                        } else if (e.target.value === 'json') {
                                            exportToJSON();
                                        }
                                        e.target.selectedIndex = 0;
                                    }}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Export</option>
                                    <option value="csv">Export to CSV</option>
                                    <option value="json">Export to JSON</option>
                                </select>
                                <span className="absolute right-2 pointer-events-none flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="m5.05 22.375l-1.4-1.425L6.6 18H4.35v-2H10v5.65H8v-2.225zM12 22v-2h6V9h-5V4H6v10H4V4q0-.825.588-1.412T6 2h8l6 6v12q0 .825-.587 1.413T18 22z"/></svg>
                                </span>
                            </div>
                        </div>
                    </div>

                {/* Customer Table */}
                    <table className="w-full">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="px-6 py-4 text-left uppercase">Customer</th>
                                <th className="px-6 py-4 text-left uppercase">Status</th>
                                <th className="px-6 py-4 text-left uppercase">Total Spent</th>
                                <th className="px-6 py-4 text-left uppercase">Payment Method</th>
                                <th className="px-6 py-4 text-left uppercase">Last Order</th>
                                <th className="px-6 py-4 text-left uppercase">Orders</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {filteredOrders.map((order) => {
                                return (
                                    <tr key={order.id} className="hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="">{order.customerName}</div>
                                                <div className=" text-gray-400">{order.customerEmail}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-3 py-1  rounded-full ${
                                                order.orderStatus === 'Complete' 
                                                    ? 'bg-green-900 text-green-300'
                                                    : order.orderStatus === 'Processing'
                                                    ? 'bg-yellow-900 text-yellow-300'
                                                    : order.orderStatus === 'Cancelled'
                                                    ? 'bg-red-900 text-red-300'
                                                    : 'bg-gray-700 text-gray-300' // Inactive
                                            }`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            ${order.totalPrice.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 rounded ${
                                                order.paymentMethod === 'Card' 
                                                    ? 'bg-blue-900 text-blue-300'
                                                    : order.paymentMethod === 'Cash'
                                                    ? 'bg-yellow-900 text-yellow-300'
                                                    : 'bg-gray-700 text-gray-300' // Unknown
                                            }`}>
                                                {order.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                            {order.date ? formatDate(order.date) : 'No orders'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap ">
                                            {order.items.length}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <h3 className="mt-2 ">No orders found</h3>
                            <p className="mt-1">Try adjusting your search or filter criteria.</p>
                        </div>
                    )}

                    {showNotification && <Notification notificationMessage='Successfully exported!' onNotificationEnd={() => setShowNotification(false)}/>}
                </div>
            </div>
        </div>
    );
};