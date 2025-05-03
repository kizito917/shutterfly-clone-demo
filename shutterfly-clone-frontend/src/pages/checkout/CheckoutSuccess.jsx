// External imports
import { useState, useEffect } from "react";
import { Check, User } from "lucide-react";

export default function CheckoutSuccess() {
    const [animateCheck, setAnimateCheck] = useState(false);

    useEffect(() => {
        setAnimateCheck(true);
    }, []);

    return (
        <section>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-green-600 p-8 flex flex-col items-center">
                        <div className={`rounded-full bg-white p-4 mb-6 transform ${animateCheck ? 'scale-100' : 'scale-0'} transition-transform duration-700`}>
                            <Check className="h-10 w-10 text-green-600" strokeWidth={3} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Thank You!</h1>
                        <p className="text-green-100 text-lg text-center">Your order has been successfully placed</p>
                    </div>
                    
                    {/* Simple Success Message */}
                    <div className="p-8 text-center">
                        <p className="text-gray-600 mb-8 text-lg">
                            We've received your order and are getting it ready.
                            A confirmation email has been sent to your inbox.
                        </p>
                        
                        {/* CTA Button */}
                        <a href="/profile" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors duration-300 text-lg">
                            <User className="h-5 w-5 mr-2" />
                            Return to Profile
                        </a>
                    </div>
                </div>
                
                {/* Help Section */}
                <div className="mt-8 text-center text-gray-500">
                    <p>Need help? <a href="#" className="text-green-600 hover:text-green-700 font-medium">Contact our support team</a></p>
                </div>
            </div>
        </section>
    )
}