import { useState, useEffect } from 'react'
import { Order } from 'src/types/order'
import { Item } from 'src/types/item'

type CustomerSection = 'Ordering' | 'Summary' | 'Payment' | 'Favorite' | 'History'

interface OrderWithDetails extends Order {
  items: Array<{
    itemId: string;
    amount: number;
    itemDetails?: Item;
  }>;
}

export default function CustomerHistory(
  { onChangeSection, onAddToCart }: {
    onChangeSection: (section: CustomerSection) => void;
    onAddToCart?: (item: Item) => void;
  }
): React.JSX.Element {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    try {
      setLoading(true);
      const orderHistory = await window.electron.ipcRenderer.invoke('get-customer-orders');
      setOrders(orderHistory);
    } catch (error) {
      console.error('Error loading order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const result = await window.electron.ipcRenderer.invoke('reorder-items', orderId);
      if (result.success) {
        alert('Items added to cart successfully!');
        onChangeSection('Ordering');
      } else {
        alert('Failed to reorder: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Error reordering items');
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'text-green-200 bg-green-900';
      case 'Cancelled': return 'text-red-200 bg-red-900';
      case 'Processing': return 'text-yellow-200 bg-yellow-900';
      default: return 'text-gray-200 bg-gray-700';
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-850 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading order history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-850 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Order History</h1>
          <button
            onClick={() => onChangeSection('Ordering')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Ordering
          </button>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-300 text-lg">No orders found</p>
            <button
              onClick={() => onChangeSection('Ordering')}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-white">Order ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-white">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-white">Total</th>
                  <th className="text-left py-4 px-6 font-semibold text-white">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const { date, time } = formatDate(order.date);
                  return [
                    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-4 px-6">
                        <div className="font-medium text-white">{order.id}</div>
                        <div className="text-sm text-gray-300">{order.paymentMethod}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-white">{date}</div>
                        <div className="text-sm text-gray-300">{time}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-lg text-white">${order.totalPrice.toFixed(2)}</div>
                        <div className="text-sm text-gray-300">{order.items.length} items</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleOrderExpansion(order.id!)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            {expandedOrder === order.id ? 'Hide' : 'View'} Items
                          </button>
                          <button
                            onClick={() => handleReorder(order.id!)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm"
                          >
                            Reorder
                          </button>
                        </div>
                      </td>
                    </tr>,
                    expandedOrder === order.id && (
                      <tr key={`${order.id}-expanded`}>
                        <td colSpan={5} className="bg-gray-750 border-b border-gray-700 p-6">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-white text-lg mb-4">Order Items:</h4>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg">
                                {item.itemDetails && (
                                  <div className="w-16 h-16 flex-shrink-0">
                                    <img 
                                      src={`data:${item.itemDetails.img.mime};base64,${item.itemDetails.img.data}`} 
                                      alt={item.itemDetails.name}
                                      className="w-full h-full object-cover rounded" 
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h5 className="font-semibold text-white">
                                    {item.itemDetails?.name || `Item ${item.itemId}`}
                                  </h5>
                                  <p className="text-gray-300">
                                    Quantity: {item.amount} × ${item.itemDetails?.price.toFixed(2) || '0.00'}
                                  </p>
                                  <p className="font-semibold text-green-400">
                                    Subtotal: ${((item.itemDetails?.price || 0) * item.amount).toFixed(2)}
                                  </p>
                                </div>
                                {item.itemDetails && onAddToCart && (
                                  <button
                                    onClick={() => onAddToCart(item.itemDetails!)}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                                  >
                                    Add to Cart
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  ].filter(Boolean);
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}