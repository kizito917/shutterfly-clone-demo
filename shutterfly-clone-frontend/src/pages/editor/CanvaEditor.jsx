// External imports
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Download, ShoppingCart } from 'lucide-react';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';

// Internal imports
import { retrieveImageInfo, retrieveRequestedImage } from "../../services/imageService";
import { ConnectButton } from "../../components/connect-button";
import EditInCanvasButton from "../../components/edit-button";
import { useAppStore } from "../../store";
import { poll } from "../../utils/poll";
import { getDesignExportJobStatus, syncImageDesignWithCanva } from "../../services/canvaService";
import { processCheckout } from "../../services/profile/payment";
import { retrieveProducts } from '../../services/product';
import Dialog from "../../components/Dialog";

const shippingValidationSchema = Yup.object().shape({
    product: Yup.number()
        .required('Product is required'),
    productItem: Yup.mixed()
        .required('Product Item is required')
        .transform((value) => {
            if (typeof value === 'string') {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            }
            return value;
        })
});

export default function CanvaEditor() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(shippingValidationSchema),
    });

    const params = useParams();
    const [searchParams] = useSearchParams();
    const { canvaToken } = useAppStore();

    const [design, setDesign] = useState({});
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [productItems, setProductItems] = useState([]);
    const [filteredProductItems, setFilteredProductItems] = useState([]);
    const [productAmount, setProductAmount] = useState(10);
    
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

    useEffect(() => {
        const fetchProducts = async () => {
            const { status, data } = await retrieveProducts();
            if (status !== 200) {
                setProducts([]);
                return;
            }

            setProducts(data);
            let __productItems = [];
            data.map((item) => {
                __productItems.push(...item.productItems)
            });
            setProductItems(__productItems);
        }

        fetchProducts();
    }, []);

    const handleSelectedProduct = (event) => {
        const selectedId = event.target.value;
        const filteredProductItems = productItems.filter((item) => item.productId === parseInt(selectedId, 10));
        setFilteredProductItems(filteredProductItems);
    }

    const handleShippingCalculation = (event) => {
        const item = JSON.parse(event.target.value);
        const shippingCost = parseInt(item.shippingPrice, 10);
        setProductAmount(productAmount + shippingCost);
    }

    const onSubmit = async (values) => {
        setIsLoading(true);
        values.productItem = values.productItem.id
        const { status, message, data } =await processCheckout({
            ...values,
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
            <div className="w-[98%] lg:w-[80%] mx-auto px-4 py-8">
                <div className="flex gap-3 mt-10">
                    <ConnectButton />
                    {canvaToken ? <EditInCanvasButton design={design} /> : null}
                </div>
                <div className="flex flex-col md:flex-row md:gap-8">
                    {/* Center Image Area - Full width on mobile, flex-1 on desktop */}
                    <div className="w-full md:flex-1 flex flex-col items-center justify-center bg-white rounded-xl p-4 md:p-8 max-h-[900px] mb-6 md:mb-0">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={imageUrl}
                                alt="Editor preview"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    </div>
                    
                    {/* Purchase info section - Full width on mobile */}
                    <div className="w-full md:w-auto">
                        <div className="flex flex-col gap-4 mb-4">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center gap-2 disabled:bg-blue-300"
                            >
                                <span>Buy Now (${productAmount})</span>
                            </button>
                                    
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-md font-medium flex items-center justify-center gap-2">
                                <Download size={20} />
                                <span>Preview Sample</span>
                            </button>
                        </div>
                        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-md">
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
            <Dialog modalHeader="" isOpen={isModalOpen} closeDialog={() => setIsModalOpen(false)}>
                <div>
                    <h4>Kindly choose your design print choice and dimensions to process shipping after successful payment</h4>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mt-4">
                            <select 
                                name="product" 
                                className="w-full h-12 border border-gray-200 rounded-md px-2" 
                                {...register('product', {
                                    onChange: handleSelectedProduct
                                })}
                            >
                                <option value="">Select product type</option>
                                {
                                    products.map((item) => {
                                        return (
                                            <option value={item.id} key={item.id}>{ item.name }</option>
                                        )
                                    })
                                }
                            </select>
                            {errors['product'] && <p className='text-red-400 text-sm mt-2'>{errors['product'].message}</p>}
                        </div>
                        <div className="mt-4">
                            <select 
                                name="" 
                                className="w-full h-12 border border-gray-200 rounded-md px-2"
                                {...register('productItem', {
                                    onChange: handleShippingCalculation
                                })}
                            >
                                <option value="">Select dimension</option>
                                {
                                    filteredProductItems.map((item) => {
                                        return (
                                            <option value={JSON.stringify(item)} key={item.id}>{ item.type } { item.size }</option>
                                        )
                                    })
                                }
                            </select>
                            {errors['productItem'] && <p className='text-red-400 text-sm mt-2'>{errors['productItem'].message}</p>}
                        </div>
                        <div className="mt-4">
                            <button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center gap-2 disabled:bg-blue-300"
                            >
                                {isLoading ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        <ShoppingCart size={20} />
                                        <span>Proceed to Pay Now (${productAmount})</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Dialog>
        </div>
    );
}