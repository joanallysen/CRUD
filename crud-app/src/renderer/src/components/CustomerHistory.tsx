import { useState, useEffect } from 'react'
import { OrderWithItemsObject } from 'src/types/order'
import { Item } from 'src/types/item'
import LoadingBlur from './LoadingBlur';
import HistoryItem from './HistoryItem';
import Notification from './Notification';

export default function CustomerHistory(
  { onAddToCart }: {
    onAddToCart: (item: Item) => void;
  }
): React.JSX.Element {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderWithItemsObject[]>([]);
  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState(false);

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

  const handleReorder = async (order: OrderWithItemsObject) => {
    console.log('order: ', order);
    order.items.forEach((itemObj) => {
      if (itemObj.itemDetails){
        onAddToCart(itemObj.itemDetails);
      } else{
        console.log('An item must have been missing');
      }
    });
    setNotification(true);
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'text-green-800 bg-green-900';
      case 'Cancelled': return 'text-red-800 bg-red-900';
      case 'Processing': return 'text-yellow-200 bg-yellow-900';
      default: return 'text-gray-200 bg-gray-700';
    }
  };

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
    <div className="min-h-screen bg-gray-850 p-6">
      {loading && <LoadingBlur loadingMessage='Loading history...'/>}
      {notification && <Notification notificationMessage={'Successfully Reordered!'} onNotificationEnd={() => setNotification(false)} />}
      <div className="max-w-6xl mx-auto">
          <h1 className="font-bold mb-6">Order History</h1>
        
        {orders.length === 0 ? (
            <p className="text-gray-300 text-lg">No orders found</p>
        ) : (
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left py-4 px-6 uppercase">Order ID</th>
                  <th className="text-left py-4 px-6 uppercase">Date</th>
                  <th className="text-left py-4 px-6 uppercase">Total</th>
                  <th className="text-left py-4 px-6 uppercase">Status</th>
                  <th className="text-left py-4 px-6 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className='bg-gray-800 divide-y divide-gray-700'>
                {orders.map((order) => {
                  return [
                    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-4 px-6">
                        <div>{order.id}</div>
                        <div className='text-gray-500'>{order.paymentMethod}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className='text-gray-500'>{formatDate(order.date)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div>${order.totalPrice.toFixed(2)}</div>
                        <div className='text-gray-500'>{order.items.length} items</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleOrderExpansion(order.id!)}
                            className="bg-gray-700  px-3 py-1 rounded hover:bg-gray-600 transition-colors cursor-pointer"
                          >
                            {expandedOrder === order.id ? 'Hide' : 'View'} Items
                          </button>
                          <button
                            onClick={() => handleReorder(order)}
                            className="bg-green-800  px-3 py-1 rounded hover:bg-green-700 transition-colors cursor-pointer"
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
                            <h4 className="font-semibold mb-4">Order Items:</h4>
                            {order.items.map((item, idx) => (
                              <HistoryItem 
                                key={idx}
                                idAmountAndItemObject = {item}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  ].filter(Boolean);
                })}
              </tbody>
            </table>
        )}
      </div>
    </div>
  );
}