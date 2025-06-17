import React, { useState } from 'react';
import { Order } from 'src/types/order';
import { Customer } from 'src/types/customer';

// Mock data using your actual interfaces
const mockOrders: Order[] = [
    // ... (same as before)
    {
        id: '1',
        date: new Date('2025-06-17T10:30:00'),
        customerEmail: 'john@example.com',
        customerName: 'John Doe',
        items: [{ itemId: 'item1', amount: 2 }],
        totalPrice: 89.99,
        orderStatus: 'Complete',
        paymentMethod: 'Card'
    },
    {
        id: '2',
        date: new Date('2025-06-17T14:15:00'),
        customerEmail: 'sarah@example.com',
        customerName: 'Sarah Smith',
        items: [{ itemId: 'item2', amount: 1 }],
        totalPrice: 156.50,
        orderStatus: 'Processing',
        paymentMethod: 'Cash'
    },
    {
        id: '3',
        date: new Date('2025-06-16T16:45:00'),
        customerEmail: 'mike@example.com',
        customerName: 'Mike Johnson',
        items: [{ itemId: 'item3', amount: 3 }],
        totalPrice: 78.25,
        orderStatus: 'Complete',
        paymentMethod: 'Card'
    },
    {
        id: '4',
        date: new Date('2025-06-15T09:20:00'),
        customerEmail: 'emma@example.com',
        customerName: 'Emma Wilson',
        items: [{ itemId: 'item4', amount: 1 }],
        totalPrice: 234.75,
        orderStatus: 'Complete',
        paymentMethod: 'Card'
    },
    {
        id: '5',
        date: new Date('2025-06-10T11:30:00'),
        customerEmail: 'alex@example.com',
        customerName: 'Alex Brown',
        items: [{ itemId: 'item5', amount: 2 }],
        totalPrice: 92.40,
        orderStatus: 'Complete',
        paymentMethod: 'Cash'
    }
];

const mockCustomers: Customer[] = [
    // ... (same as before)
    {
        id: '1',
        email: 'john@example.com',
        password: 'hashed_password',
        name: 'John Doe',
        favorites: ['item1'],
        cart: [],
        orderHistory: ['1'],
        status: 'Complete',
        paymentMethod: 'Card'
    },
    {
        id: '2',
        email: 'sarah@example.com',
        password: 'hashed_password',
        name: 'Sarah Smith',
        favorites: ['item2', 'item3'],
        cart: [],
        orderHistory: ['2'],
        status: 'Processing',
        paymentMethod: 'Cash'
    },
    {
        id: '3',
        email: 'mike@example.com',
        password: 'hashed_password',
        name: 'Mike Johnson',
        favorites: [],
        cart: [{ itemId: 'item6', amount: 1 }],
        orderHistory: ['3'],
        status: 'Complete',
        paymentMethod: 'Card'
    },
    {
        id: '4',
        email: 'emma@example.com',
        password: 'hashed_password',
        name: 'Emma Wilson',
        favorites: ['item4'],
        cart: [],
        orderHistory: ['4'],
        status: 'Complete',
        paymentMethod: 'Card'
    },
    {
        id: '5',
        email: 'alex@example.com',
        password: 'hashed_password',
        name: 'Alex Brown',
        favorites: [],
        cart: [],
        orderHistory: ['5'],
        status: 'Inactive',
        paymentMethod: 'Cash'
    }
];

const AdminDashboard = () => {
    const [orders] = useState(mockOrders);
    const [customers] = useState(mockCustomers);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Calculate sales metrics
    const calculateSales = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const todaySales = orders
            .filter(order => new Date(order.date) >= today)
            .reduce((sum, order) => sum + order.totalPrice, 0);

        const weekSales = orders
            .filter(order => new Date(order.date) >= weekStart)
            .reduce((sum, order) => sum + order.totalPrice, 0);

        const monthSales = orders
            .filter(order => new Date(order.date) >= monthStart)
            .reduce((sum, order) => sum + order.totalPrice, 0);

        return { todaySales, weekSales, monthSales };
    };

    const { todaySales, weekSales, monthSales } = calculateSales();

    // Calculate additional customer metrics
    const getCustomerMetrics = (customer: Customer) => {
        const customerOrders = orders.filter(order => order.customerEmail === customer.email);
        const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        const lastOrderDate = customerOrders.length > 0 
            ? new Date(Math.max(...customerOrders.map(order => new Date(order.date).getTime())))
            : null;
        
        return {
            totalSpent,
            lastOrderDate,
            totalOrders: customerOrders.length
        };
    };

    // Filter customers
    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                 customer.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || customer.status.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });


    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-NZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-100 mb-8">Sales Dashboard</h1>
                
                {/* Top Row - Sales Metrics (3 columns) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Today's Sales */}
                    <div className="bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold">Today's Sales</h3>
                                <h1 className="font-bold">${todaySales}</h1>
                                <p className="text-green-400 flex items-center mt-1">
                                    +12.5% from yesterday
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* This Week's Sales */}
                    <div className="bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">This Week's Sales</p>
                                <p className="text-2xl font-bold text-gray-100">{weekSales}</p>
                                <p className="text-xs text-green-400 flex items-center mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M3.4 18L2 16.6l7.4-7.45l4 4L18.6 8H16V6h6v6h-2V9.4L13.4 16l-4-4z"/></svg>
                                    +8.2% from last week
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* This Month's Sales */}
                    <div className="bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">This Month's Sales</p>
                                <p className="text-2xl font-bold text-gray-100">{monthSales}</p>
                                <p className="text-xs text-green-400 flex items-center mt-1">
                                    +15.7% from last month
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Customer Data (1 column, full width) */}
                <div className=" rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-xl font-semibold">Customer Management</h2>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search customers..."
                                        className="pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                
                                {/* Status Filter */}
                                <div className="relative">
                                    <select
                                        className="pl-10 pr-8 py-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="processing">Processing</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="complete">Complete</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
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
                                {filteredCustomers.map((customer) => {
                                    const metrics = getCustomerMetrics(customer);
                                    return (
                                        <tr key={customer.id} className="hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="">{customer.name}</div>
                                                    <div className=" text-gray-400">{customer.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-3 py-1 font-semibold rounded-full ${
                                                    customer.status === 'Complete' 
                                                        ? 'bg-green-900 text-green-300'
                                                        : customer.status === 'Processing'
                                                        ? 'bg-yellow-900 text-yellow-300'
                                                        : customer.status === 'Cancelled'
                                                        ? 'bg-red-900 text-red-300'
                                                        : 'bg-gray-700 text-gray-300' // Inactive
                                                }`}>
                                                    {customer.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                                                ${metrics.totalSpent}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                                                <span className={`inline-flex px-2 py-1 rounded ${
                                                    customer.paymentMethod === 'Card' 
                                                        ? 'bg-blue-900 text-blue-300'
                                                        : customer.paymentMethod === 'Cash'
                                                        ? 'bg-yellow-900 text-yellow-300'
                                                        : 'bg-gray-700 text-gray-300' // Unknown
                                                }`}>
                                                    {customer.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                                {metrics.lastOrderDate ? formatDate(metrics.lastOrderDate) : 'No orders'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                                                {metrics.totalOrders}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {filteredCustomers.length === 0 && (
                            <div className="text-center py-12">
                                <h3 className="mt-2 ">No customers found</h3>
                                <p className="mt-1">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;