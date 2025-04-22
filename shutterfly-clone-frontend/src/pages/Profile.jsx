import React, { useState } from 'react';
import { User, Mail, Calendar, RefreshCw } from 'lucide-react';
import { LocalStorage } from '../helpers/localstorageHelper';

export default function Profile() {
    const [user, setUser] = useState(LocalStorage.getItem('shutterfly-user') || null);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg mt-30 p-6 w-full md:w-[60%] mx-auto">
            <div className="mt-30 bg-white rounded-xl shadow-md overflow-hidden my-4">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="bg-blue-500 rounded-full p-3">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-gray-500 text-sm">User ID: {user.id}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Mail className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-gray-700">{user.email}</span>
                        </div>
                    
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                            <div>
                                <span className="text-gray-700">Account Created:</span>
                                <span className="ml-2 text-gray-600">{formatDate(user.createdAt)}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            <RefreshCw className="h-5 w-5 text-gray-500 mr-2" />
                            <div>
                                <span className="text-gray-700">Last Updated:</span>
                                <span className="ml-2 text-gray-600">{formatDate(user.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}