// External imports
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Internal imports
import {
  retrieveImageInfo,
  retrieveRequestedImage,
} from "../services/imageService";
import { ConnectButton } from "../components/connect-button";
import EditInCanvasButton from "../components/edit-button";
import { useAppStore } from "../store";
import { poll } from "../utils/poll";
import { getDesignExportJobStatus } from "../services/canvaService";

export default function CanvaEditor() {
  const params = useParams();
  const [design, setDesign] = useState({});
  const [imageUrl, setImageUrl] = useState(null);
  const { canvaToken } = useAppStore();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
        </div>
      </div>
    </div>
  );
}

// {/* Right Panel */}
// <div className="w-82 space-y-2">
// <div className="mt-8">
//   <div className="book">
//     <img
//       alt="The Outstanding Developer by Sebastien Castiel"
//       src={imageUrl}
//     />
//   </div>
//   <div>
//     <svg className="w-full h-96" viewBox="0 0 400 400">
//       {/* Definitions for gradients, patterns, and filters */}
//       <defs>
//         {/* Pattern for the uploaded image */}
//         <pattern
//           id="mugImage"
//           patternUnits="userSpaceOnUse"
//           width="200"
//           height="200"
//           patternTransform="rotate(-10)"
//         >
//           <image
//             href={imageUrl}
//             width="200"
//             height="200"
//             preserveAspectRatio="xMidYMid slice"
//           />
//         </pattern>

//         {/* Ceramic material gradient for highlights */}
//         <linearGradient
//           id="mugHighlight"
//           x1="0%"
//           y1="0%"
//           x2="100%"
//           y2="0%"
//         >
//           <stop offset="0%" stopColor="white" stopOpacity="0.3" />
//           <stop offset="50%" stopColor="white" stopOpacity="0.1" />
//           <stop offset="100%" stopColor="white" stopOpacity="0.3" />
//         </linearGradient>

//         {/* Shadow filter */}
//         <filter
//           id="shadow"
//           x="-20%"
//           y="-20%"
//           width="140%"
//           height="140%"
//         >
//           <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
//           <feOffset dx="4" dy="4" result="offsetblur" />
//           <feComponentTransfer>
//             <feFuncA type="linear" slope="0.3" />
//           </feComponentTransfer>
//           <feMerge>
//             <feMergeNode />
//             <feMergeNode in="SourceGraphic" />
//           </feMerge>
//         </filter>

//         {/* Curved surface effect */}
//         <linearGradient
//           id="surfaceShading"
//           x1="0%"
//           y1="0%"
//           x2="100%"
//           y2="0%"
//         >
//           <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
//           <stop offset="50%" stopColor="rgba(0,0,0,0)" />
//           <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
//         </linearGradient>
//       </defs>

//       {/* Background */}
//       <rect width="400" height="400" fill="transparent" />

//       {/* Mug Group */}
//       <g transform="translate(100, 100)" filter="url(#shadow)">
//         {/* Main body with image pattern */}
//         <path
//           d="M 50,50 A 50,25 0 1,1 200,50 L 200,150 A 50,25 0 1,1 50,150 Z"
//           fill="url(#mugImage)"
//         />

//         {/* Surface shading overlay */}
//         <path
//           d="M 50,50 A 50,25 0 1,1 200,50 L 200,150 A 50,25 0 1,1 50,150 Z"
//           fill="url(#surfaceShading)"
//           opacity="0.4"
//         />

//         {/* Top ellipse */}
//         <ellipse
//           cx="125"
//           cy="50"
//           rx="75"
//           ry="25"
//           fill="#ffffff"
//           opacity="0.9"
//         />

//         {/* Inside shadow */}
//         <ellipse cx="125" cy="50" rx="65" ry="20" fill="#e0e0e0" />

//         {/* Handle */}
//         <path
//           d="M 200,70 C 230,70 230,130 200,130"
//           fill="none"
//           stroke="#d0d0d0"
//           strokeWidth="20"
//           strokeLinecap="round"
//         />

//         {/* Handle highlight */}
//         <path
//           d="M 200,70 C 230,70 230,130 200,130"
//           fill="none"
//           stroke="url(#mugHighlight)"
//           strokeWidth="18"
//           strokeLinecap="round"
//         />
//       </g>

//       {/* Surface highlights */}
//       <path
//         d="M 160,120 Q 180,150 160,180"
//         fill="none"
//         stroke="white"
//         strokeWidth="8"
//         strokeOpacity="0.3"
//         strokeLinecap="round"
//       />
//     </svg>
//   </div>
// </div>
// </div>
