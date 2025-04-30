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
import {
  getDesignExportJobStatus,
  syncImageDesignWithCanva,
} from "../services/canvaService";

export default function Editor2() {
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
