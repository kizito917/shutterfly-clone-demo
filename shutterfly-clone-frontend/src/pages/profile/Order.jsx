// External imports
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { Calendar, Clock, Package, DollarSign, ChevronDown, ChevronUp, Search } from 'lucide-react';

// Internal imports
import { retrieveUserOrders } from '../../services/profile/order';
import { formatDate, formatTime } from "../../helpers/globalHelper";

export default function Order() {
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchUserOrder = async () => {
            const { status, message, data } = await retrieveUserOrders();
            if (status !== 200) {
                toast.error(message);
                setOrders([]);
                return;
            }

            setOrders(data);
        }

        fetchUserOrder();
    }, []);
    
    // Handle order expansion
    const toggleOrderDetails = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };
    
    // Filter orders based on search term and status
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-white rounded-lg mt-12 p-6 w-full md:w-4/5 mx-auto">
            <div className="max-w-4xl mx-auto p-4 bg-gray-50">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">My Orders</h1>
                
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={20} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by order ID"
                            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select
                        className="p-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                
                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No orders found matching your criteria
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {/* Order Header - Always Visible */}
                                <div 
                                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                                    onClick={() => toggleOrderDetails(order.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <Package size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Order #{order.id}</p>
                                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">${parseFloat(order.amount).toFixed(2)}</p>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block
                                            ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'}`}
                                            >
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </div>
                                        </div>
                                        
                                        {expandedOrder === order.id ? 
                                            <ChevronUp size={20} className="text-gray-400" /> : 
                                            <ChevronDown size={20} className="text-gray-400" />
                                        }
                                    </div>
                                </div>
                            
                                {/* Expanded Order Details */}
                                {expandedOrder === order.id && (
                                    <div className="px-4 pb-4 border-t border-gray-100">
                                        <div className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                                    <Calendar size={16} className="inline" /> Order Date
                                                </p>
                                                <p className="font-medium">{formatDate(order.createdAt)}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                                    <Clock size={16} className="inline" /> Order Time
                                                </p>
                                                <p className="font-medium">{formatTime(order.createdAt)}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                                    <DollarSign size={16} className="inline" /> Total Amount
                                                </p>
                                                <p className="font-medium">${parseFloat(order.amount).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    
                                        {/* Order Items */}
                                        <div className="mt-4">
                                            <h3 className="font-medium mb-2">Order Items</h3>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                {order.orderItem.map(item => (
                                                    <div key={item.id} className="flex justify-between items-center py-2">
                                                    <div>
                                                        <p className="font-medium">Design #{item.designId}</p>
                                                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium">${parseFloat(item.price).toFixed(2)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    
                                        {/* Action Buttons */}
                                        <div className="mt-4 flex gap-2 justify-end">
                                            <a href={`/order/${order.id}`} className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                                View Details
                                            </a>
                                            {/* {order.status === 'completed' && (
                                                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                    Reorder
                                                </button>
                                            )} */}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}