// External imports
import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, RefreshCw, Image } from 'lucide-react';
import { toast } from 'react-toastify';

// Internal imports
import { fetchProfile } from '../services/profile';

export default function Profile() {
    const [user, setUser] = useState({} || null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { status, data } = await fetchProfile();
            if (status !== 200) {
                toast.error('Unable to retrieve profile details');
                return
            }

            setUser(data);
            console.log(data);
        }

        fetchUserProfile();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!user) {
        return <div className="flex justify-center items-center h-64">Loading profile...</div>;
    }

    return (
        <div className="bg-white rounded-lg mt-8 p-6 w-full md:w-4/5 mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden my-4">
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

            {/* User Images Section */}
            {user.userImages && user.userImages.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden my-4">
                    <div className="p-8">
                        <div className="flex items-center mb-6">
                            <Image className="h-6 w-6 text-blue-500 mr-2" />
                            <h3 className="text-xl font-semibold text-gray-800">Your Images</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {user.userImages.map((image) => (
                                <div key={image.id}>
                                    <div className="relative overflow-hidden rounded-lg shadow-sm">
                                        <img 
                                            src={`${import.meta.env.VITE_APP_SERVER_IMAGE_BASE_URL}/${image.imagePath}`} 
                                            alt={`User image ${image.id}`}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2">
                                            <p>Uploaded: {formatDate(image.createdAt)}</p>
                                            <p>Image ID: {image.id}</p>
                                        </div>
                                    </div>
                                    <div className='mt-4'>
                                        <button 
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                            onClick={() => window.location.href = `/canva-editor/${image.id}`}
                                        >
                                            Edit Image
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}