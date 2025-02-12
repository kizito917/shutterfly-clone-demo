// External imports
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ImageFilter from 'react-image-filter';

// Internal imports
import { retrieveRequestedImage } from "../services/imageService";

export default function Editor() {
    const params = useParams();

    const [imageUrl, setImageUrl] = useState(null);
    const [selectedImageFilter, setSelectedImageFilter] = useState('');
    const [colorOne, setColorOne] = useState([]);
    const [colorTwo, setColorTwo] = useState([]);
    const [dutotoneColor1, setDutotoneColor1] = useState([
        {
            dutotoneColorOneCodeOne: 'dutotoneColorOneCodeOne',
            value: ''
        },
        {
            dutotoneColorOneCodeTwo: 'dutotoneColorOneCodeTwo',
            value: ''
        },
        {
            dutotoneColorOneCodeThree: 'dutotoneColorOneCodeThree',
            value: ''
        }
    ]);
    const [dutotoneColor2, setDutotoneColor2] = useState([
        {
            dutotoneColorTwoCodeOne: 'dutotoneColorTwoCodeOne',
            value: ''
        },
        {
            dutotoneColorTwoCodeTwo: 'dutotoneColorTwoCodeTwo',
            value: ''
        },
        {
            dutotoneColorTwoCodeThree: 'dutotoneColorTwoCodeThree',
            value: ''
        }
    ]);

    useEffect(() => {
        const getImage = async () => {
            const { status, message, data } = await retrieveRequestedImage(params.imageId);
            if (status !== 200) {
                toast.error(message);
                return;
            }

            // Save image to be previwed to state
            const imageUrl = window.URL.createObjectURL(new Blob([data]));
            setImageUrl(imageUrl);
        }

        getImage();
    }, [params.imageId]);

    const resetEditor = () => {
        window.location.reload();
    }

    const handleSelectedFilter = (event) => {
        setSelectedImageFilter(event.target.value);
    }

    const handleDuotoneColorOneChange = (event) => {
        const { name, value } = event.target;
        
        setDutotoneColor1(prevState => {
          return prevState.map(item => {
            // Find the matching item based on the input name
            if (item[name] === name) {
              return {
                ...item,
                value: value
              };
            }
            return item;
          });
        });
    };

    const handleDuotoneColorTwoChange = (event) => {
        const { name, value } = event.target;
        
        setDutotoneColor2(prevState => {
          return prevState.map(item => {
            // Find the matching item based on the input name
            if (item[name] === name) {
              return {
                ...item,
                value: value
              };
            }
            return item;
          });
        });
    };

    const setDuotoneColorsToImage = () => {
        const filteredDutotoneColorOne = dutotoneColor1
          .map(color => {
            const numValue = Number(color.value);
            return !isNaN(numValue) ? numValue : null;
          })
          .filter(value => value !== null);
    
        const filteredDutotoneColorTwo = dutotoneColor2
          .map(color => {
            const numValue = Number(color.value);
            return !isNaN(numValue) ? numValue : null;
          })
          .filter(value => value !== null);

        setColorOne(filteredDutotoneColorOne);
        setColorTwo(filteredDutotoneColorTwo);
    };

    return(
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-full mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Left Panel */}
                    <div className="w-82 space-y-2">
                        <span className="text-sm">Use configurations below to apply effects to image:</span>
                        <div className="mt-8">
                            <select name="" id="" className="border rounded p-1 text-sm" onChange={handleSelectedFilter}>
                            <option value="duotone">Select Image Effect</option>
                                <option value="duotone">Dutone (red/blue)</option>
                                <option value="grayscale">Grayscale</option>
                                <option value="sepia">Sepia</option>
                                <option value="invert">Invert</option>
                                <option value="duotone">Dutone (green/purple)</option>
                                <option value="duotone">Dutone (light blue/orange)</option>
                                <option value="duotone">Dutone (blue/red)</option>
                            </select>
                        </div>
                        <div className="mt-8 border p-2 rounded">
                            <h4 className="text-sm">Apply Duotone color range</h4>
                            <small>This configuration is strictly for dutotone effect</small>
                            <div className="mt-2">
                                <label htmlFor="Color One">Color One</label>
                                <br />
                                <div className="flex gap-2 mt-2">
                                    <input type="number" name="dutotoneColorOneCodeOne" id="dutotoneColorOneCodeOne" placeholder="40" className="border w-20" value={dutotoneColor1[0].value} onChange={handleDuotoneColorOneChange} />
                                    <input type="number" name="dutotoneColorOneCodeTwo" id="dutotoneColorOneCodeTwo" placeholder="40" className="border w-20" value={dutotoneColor1[1].value} onChange={handleDuotoneColorOneChange} />
                                    <input type="number" name="dutotoneColorOneCodeThree" id="dutotoneColorOneCodeThree" placeholder="40" className="border w-20" value={dutotoneColor1[2].value} onChange={handleDuotoneColorOneChange} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="Color One">Color Two</label>
                                <br />
                                <div className="flex gap-2 mt-2">
                                    <input type="number" name="dutotoneColorTwoCodeOne" id="dutotoneColorTwoCodeOne" placeholder="40" className="border w-20" value={dutotoneColor2[0].value} onChange={handleDuotoneColorTwoChange} />
                                    <input type="number" name="dutotoneColorTwoCodeTwo" id="dutotoneColorTwoCodeTwo" placeholder="40" className="border w-20" value={dutotoneColor2[1].value} onChange={handleDuotoneColorTwoChange} />
                                    <input type="number" name="dutotoneColorTwoCodeThree" id="dutotoneColorTwoCodeThree" placeholder="40" className="border w-20" value={dutotoneColor2[2].value} onChange={handleDuotoneColorTwoChange} />
                                </div>
                            </div>
                            <div className="mt-2">
                                <button className="px-4 py-2 text-sm text-white bg-blue-800 rounded" onClick={setDuotoneColorsToImage}>
                                    Apply color range
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Center Image Area */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl p-8 max-h-[900px]">
                        <div className="relative w-full h-full flex items-center justify-center">
                            {
                                selectedImageFilter ? <ImageFilter
                                    image={imageUrl}
                                    filter={ selectedImageFilter }
                                    colorOne={ colorOne }
                                    colorTwo={ colorTwo }
                                /> : <img 
                                    src={imageUrl}
                                    alt="Editor preview" 
                                    className="max-w-full max-h-full object-contain"
                                />
                            }
                        </div>
                        
                        {/* Bottom Controls */}
                        {/* <div className="w-full mt-6 flex items-center justify-between">
                            <button className="px-4 py-2 text-sm text-white bg-gray-800 rounded" onClick={resetEditor}>
                                Reset
                            </button>
                            <button className="px-4 py-2 text-sm text-white bg-green-600 rounded" onClick={resetEditor}>
                                Download Image
                            </button>
                        </div> */}
                    </div>

                    {/* Right Panel */}
                    <div className="w-82 space-y-2">
                        <div className="mt-8">
                            <div className="book">
                                <img alt="The Outstanding Developer by Sebastien Castiel" src={imageUrl} />
                            </div>
                            <div>
                                <svg className="w-full h-96" viewBox="0 0 400 400">
                                    {/* Definitions for gradients, patterns, and filters */}
                                    <defs>
                                    {/* Pattern for the uploaded image */}
                                    <pattern
                                        id="mugImage"
                                        patternUnits="userSpaceOnUse"
                                        width="200"
                                        height="200"
                                        patternTransform="rotate(-10)"
                                    >
                                        <image
                                        href={imageUrl}
                                        width="200"
                                        height="200"
                                        preserveAspectRatio="xMidYMid slice"
                                        />
                                    </pattern>

                                    {/* Ceramic material gradient for highlights */}
                                    <linearGradient id="mugHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                                        <stop offset="50%" stopColor="white" stopOpacity="0.1" />
                                        <stop offset="100%" stopColor="white" stopOpacity="0.3" />
                                    </linearGradient>

                                    {/* Shadow filter */}
                                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                                        <feOffset dx="4" dy="4" result="offsetblur" />
                                        <feComponentTransfer>
                                        <feFuncA type="linear" slope="0.3" />
                                        </feComponentTransfer>
                                        <feMerge>
                                        <feMergeNode />
                                        <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>

                                    {/* Curved surface effect */}
                                    <linearGradient id="surfaceShading" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
                                        <stop offset="50%" stopColor="rgba(0,0,0,0)" />
                                        <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
                                    </linearGradient>
                                    </defs>

                                    {/* Background */}
                                    <rect width="400" height="400" fill="transparent" />

                                    {/* Mug Group */}
                                    <g transform="translate(100, 100)" filter="url(#shadow)">
                                    {/* Main body with image pattern */}
                                    <path d="M 50,50 A 50,25 0 1,1 200,50 L 200,150 A 50,25 0 1,1 50,150 Z" fill="url(#mugImage)" />

                                    {/* Surface shading overlay */}
                                    <path d="M 50,50 A 50,25 0 1,1 200,50 L 200,150 A 50,25 0 1,1 50,150 Z" fill="url(#surfaceShading)" opacity="0.4" />

                                    {/* Top ellipse */}
                                    <ellipse cx="125" cy="50" rx="75" ry="25" fill="#ffffff" opacity="0.9" />

                                    {/* Inside shadow */}
                                    <ellipse cx="125" cy="50" rx="65" ry="20" fill="#e0e0e0" />

                                    {/* Handle */}
                                    <path d="M 200,70 C 230,70 230,130 200,130" fill="none" stroke="#d0d0d0" strokeWidth="20" strokeLinecap="round" />

                                    {/* Handle highlight */}
                                    <path d="M 200,70 C 230,70 230,130 200,130" fill="none" stroke="url(#mugHighlight)" strokeWidth="18" strokeLinecap="round" />
                                    </g>

                                    {/* Surface highlights */}
                                    <path d="M 160,120 Q 180,150 160,180" fill="none" stroke="white" strokeWidth="8" strokeOpacity="0.3" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}