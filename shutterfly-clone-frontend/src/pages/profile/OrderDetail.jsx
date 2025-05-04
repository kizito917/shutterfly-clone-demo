// External imports
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { Calendar, Clock, Package, DollarSign, MapPin, User, Truck, CreditCard, Phone, Mail, ArrowLeft, Printer } from 'lucide-react';

// Internal imports
import { retrieveOrderDetails } from '../../services/profile/order';
import { formatDate, formatDateTime } from "../../helpers/globalHelper";
import { LocalStorage } from "../../helpers/localstorageHelper";

export default function OrderDetail() {
    const params = useParams();

    const [loading, setLoading] = useState(true);
    const [orderData, setOrderData] = useState({});
    const [activeTab, setActiveTab] = useState('details');
    const [user] = useState(LocalStorage.getItem('shutterfly-user') || null)

    useEffect(() => {
        const fetchOrderDetail = async () => {
            const { status, message, data } = await retrieveOrderDetails(params.id);
            if (status !== 200) {
                setLoading(false);
                toast.error(message);
                return;
            }

            console.log(data);
            setLoading(false);
            setOrderData(data);
        }

        fetchOrderDetail();
    }, []);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'delivered':
                return 'bg-green-100 text-green-700';
            case 'processing':
            case 'shipped':
                return 'bg-blue-100 text-blue-700';
            case 'pending':
            case 'order placed':
            case 'payment confirmed':
                return 'bg-yellow-100 text-yellow-700';
            case 'cancelled':
            case 'failed':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div>
            {
                loading ? <>
                    <h4>Loading data...</h4>
                </> : 
                <div className="max-w-5xl mx-auto p-4 bg-gray-50">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <button className="p-2 rounded-full hover:bg-gray-200" onClick={() => console.log('Go back')}>
                                <ArrowLeft size={20} className="text-gray-600" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">Order #{orderData.id}</h1>
                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderData.status)}`}>
                                {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                            </span>
                        </div>
                        
                        <div className="flex gap-2">
                            <button className="px-4 py-2 flex items-center gap-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Printer size={16} />
                                Print Receipt
                            </button>
                            {orderData.status === 'completed' && (
                                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Reorder
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Order Summary Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                            <div className="mb-4 md:mb-0">
                                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                                <p className="font-medium">{formatDateTime(orderData.createdAt)}</p>
                            </div>
                            
                            <div className="mb-4 md:mb-0">
                                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                <p className="font-medium text-lg">${parseFloat(orderData.amount).toFixed(2)}</p>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                                <p className="font-medium">Card</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'details'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Order Details
                            </button>
                            <button
                                onClick={() => setActiveTab('tracking')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'tracking'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Tracking
                            </button>
                        </nav>
                    </div>
                    
                    {/* Tab Content */}
                    {activeTab === 'details' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column - Order Items */}
                            <div className="col-span-2">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                    <h2 className="text-lg font-medium mb-4">Order Items</h2>
                                    
                                    {orderData.orderItem.map(item => (
                                        <div key={item.id} className="flex justify-between border-b border-gray-100 py-4 last:border-0 last:pb-0">
                                            <div className="flex gap-4">
                                                <div className="bg-gray-100 h-16 w-16 rounded-md flex items-center justify-center">
                                                    <Package size={24} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Design #{item.designId}</p>
                                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">${parseFloat(item.price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Payment Summary */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <h2 className="text-lg font-medium mb-4">Payment Summary</h2>
                                    
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>${parseFloat(orderData.amount).toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Shipping</span>
                                        <span>-</span>
                                    </div>
                                    
                                    <div className="flex justify-between py-2 border-t border-gray-100 mt-2 pt-2">
                                        <span className="font-medium">Total</span>
                                        <span className="font-medium">${parseFloat(orderData.amount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Column - Customer and Shipping */}
                            <div>
                                {/* Customer Info */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                    <h2 className="text-lg font-medium mb-4">Customer Information</h2>
                                    
                                    <div className="flex items-start gap-3 mb-3">
                                        <User size={20} className="text-gray-400 mt-1" />
                                        <div>
                                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                                        <p className="text-sm text-gray-500">Customer ID: {user.id}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 mb-3">
                                        <Mail size={20} className="text-gray-400" />
                                        <p className="text-sm">{user.email}</p>
                                    </div>
                                </div>
                                
                                {/* Shipping Info */}
                                {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <h2 className="text-lg font-medium mb-4">Shipping Details</h2>
                                    
                                    <div className="flex items-start gap-3 mb-4">
                                        <MapPin size={20} className="text-gray-400 mt-1" />
                                        <div>
                                        <p className="font-medium mb-1">Shipping Address</p>
                                        <p className="text-sm text-gray-600">{orderData.shipping.address.line1}</p>
                                        {orderData.shipping.address.line2 && (
                                            <p className="text-sm text-gray-600">{orderData.shipping.address.line2}</p>
                                        )}
                                        <p className="text-sm text-gray-600">
                                            {orderData.shipping.address.city}, {orderData.shipping.address.state} {orderData.shipping.address.zipCode}
                                        </p>
                                        <p className="text-sm text-gray-600">{orderData.shipping.address.country}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3 mb-4">
                                        <Truck size={20} className="text-gray-400 mt-1" />
                                        <div>
                                        <p className="font-medium mb-1">Shipping Method</p>
                                        <p className="text-sm text-gray-600">{orderData.shipping.method}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Estimated Delivery: {formatDate(orderData.shipping.estimatedDelivery)}
                                        </p>
                                        </div>
                                    </div>
                                
                                    {orderData.shipping.trackingNumber && (
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                                        <p className="text-sm font-medium text-blue-800 mb-1">Tracking Number</p>
                                        <p className="text-sm text-blue-700">{orderData.shipping.trackingNumber}</p>
                                        </div>
                                    )}
                                </div> */}
                            </div>
                        </div>
                    ) : (
                        /* Tracking Tab */
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h4>Tracking info coming soon...</h4>
                            {/* <h2 className="text-lg font-medium mb-6">Order Timeline</h2> */}
                            
                            {/* {orderData.shipping.trackingNumber && (
                                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                                <div className="flex justify-between items-center">
                                    <div>
                                    <p className="font-medium text-gray-900">Tracking Number</p>
                                    <p className="text-sm text-gray-600">{orderData.shipping.trackingNumber}</p>
                                    </div>
                                    <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Track Package
                                    </button>
                                </div>
                                </div>
                            )} */}
                        </div>
                    )}
                </div>
            }
        </div>
    )
}