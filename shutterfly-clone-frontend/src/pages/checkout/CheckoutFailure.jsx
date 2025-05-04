// External imports
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function CheckoutFailure() {
    const [animateAlert, setAnimateAlert] = useState(false);
  
    useEffect(() => {
        setAnimateAlert(true);
    }, []);

    return (
        <section>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Error Header */}
                    <div className="bg-red-600 p-8 flex flex-col items-center">
                        <div className={`rounded-full bg-white p-4 mb-6 transform ${animateAlert ? 'scale-100' : 'scale-0'} transition-transform duration-700`}>
                            <AlertCircle className="h-10 w-10 text-red-600" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
                        <p className="text-red-100 text-lg text-center">We couldn't process your payment</p>
                    </div>
                    
                    {/* Error Message */}
                    <div className="p-8 text-center">
                        <p className="text-gray-600 mb-6 text-lg">
                            There was an issue processing your payment. This could be due to insufficient funds, 
                            expired card details, or a temporary system error.
                        </p>
                        
                        {/* CTA Buttons */}
                        <div className="space-y-4">
                            <a href="/profile" className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors duration-300">
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back to Profile
                            </a>
                        </div>
                    </div>
                </div>
                
                {/* Help Section */}
                <div className="mt-8 text-center text-gray-500">
                    <p>Need help? <a href="#" className="text-red-600 hover:text-red-700 font-medium">Contact our support team</a></p>
                </div>
            </div>
        </section>
    )
}