// External imports
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Download, ShoppingCart } from 'lucide-react';

// Internal imports
import {
    retrieveImageInfo,
    retrieveRequestedImage,
} from "../../services/imageService";
import { ConnectButton } from "../../components/connect-button";
import EditInCanvasButton from "../../components/edit-button";
import { useAppStore } from "../../store";
import { poll } from "../../utils/poll";
import { getDesignExportJobStatus, syncImageDesignWithCanva } from "../../services/canvaService";
import { processCheckout } from "../../services/payment";

export default function CanvaEditor() {
    const params = useParams();
    const [searchParams] = useSearchParams();
    const { canvaToken } = useAppStore();

    const [design, setDesign] = useState({});
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const getImage = async (imageId) => {
        const { status, message, data } = await retrieveRequestedImage(imageId);
        if (status !== 200) {
            toast.error(message);
            return;
        }

        // Save image to be previwed to state
        const imageUrl = window.URL.createObjectURL(new Blob([data]));
        setImageUrl(imageUrl);
    };

    const checkAndProcessReturn = async () => {
        const params = new URLSearchParams(location.search);
        const jobId = params.get("jobId");
        const designId = params.get("designId");

        if (jobId && designId) {
            const result = await poll(() =>
                getDesignExportJobStatus(jobId, canvaToken)
            );

            if (result.job.status === "success") {
                const fileUrl = result.job.urls[0];
                if (!fileUrl) {
                    throw new Error("Failed to get export");
                }

                // Fetch and update db with image (replace)
                const response = await fetch(fileUrl);
                const data = await response.arrayBuffer();
                const imageUrl = window.URL.createObjectURL(new Blob([data]));
                setImageUrl(imageUrl);

                // Notify bacckend
                await syncImageDesignWithCanva(designId, fileUrl);

                history.replaceState(null, '', location.pathname)
            }
            return Promise.resolve();
        }
    };

    useEffect(() => {
        if (canvaToken) checkAndProcessReturn();
    }, [canvaToken]);

    useEffect(() => {
        const paymentSuccess = searchParams.get("payment-success");
        const orderId = searchParams.get("orderId");
        if (paymentSuccess && orderId) {
            // process order details retrieval to allow for download
        }
    }, []);

    useEffect(() => {
        (async function () {
            try {
                const res = await retrieveImageInfo(params.imageId);
                if (res.data) {
                    setDesign(res.data);
                    if (res.data.canvaDesignViewUrl) {
                        return setImageUrl(res.data.canvaDesignViewUrl);
                    }
                    getImage(res.data.id);
                }
            } catch (err) {
                console.error("Err", err);
            }
        })();
    }, []);

    const handleCheckout = async () => {
        setIsLoading(true);
        const { status, message, data } =await processCheckout({
            designId: params.imageId
        });

        if (status !== 200) {
            setIsLoading(false);
            toast.error(message);
            return;
        }

        setIsLoading(false);
        window.location.href = data.sessionUrl
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-[80%] mx-auto px-4 py-8">
                <div className="flex gap-3 mt-10">
                    <ConnectButton />
                    {canvaToken ? <EditInCanvasButton design={design} /> : null}
                </div>
                <div className="flex gap-8">
                    {/* Center Image Area */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl p-8 max-h-[900px]">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={imageUrl}
                                alt="Editor preview"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleCheckout}
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center gap-2 disabled:bg-blue-300"
                            >
                                {isLoading ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                    <ShoppingCart size={20} />
                                    <span>Buy Now ($10)</span>
                                    </>
                                )}
                            </button>
                                    
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-md font-medium flex items-center justify-center gap-2">
                                <Download size={20} />
                                <span>Preview Sample</span>
                            </button>
                        </div>
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                            <h3 className="font-semibold mb-2">What's included:</h3>
                            <ul className="text-gray-600 space-y-1">
                                <li>✓ High resolution image download</li>
                                <li>✓ Commercial usage rights</li>
                                <li>✓ No watermarks on purchased image</li>
                                <li>✓ Lifetime access to your purchase</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}