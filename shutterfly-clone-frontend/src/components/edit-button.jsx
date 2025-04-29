import { useState } from "react";
import {
  createNavigateToCanvaUrl,
  uploadAssetAndCreateDesign,
} from "../services/canvaService";
import { useAppStore } from "../store";

function EditInCanvasButton({ design }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { canvaToken } = useAppStore();

  const editInCanvas = async () => {
    let canvaEditUrl = "";
    setIsLoading(true);

    try {
      if (!design.canvaDesignId) {
        const uploadAssetResult = await uploadAssetAndCreateDesign(
          design,
          canvaToken
        );
        canvaEditUrl = uploadAssetResult.design.urls.edit_url;
      } else {
        canvaEditUrl = design.canvaDesignUrl;
      }

      setIsRedirecting(true);
      console.log("Design id (correlation)", design)
      const navigateToCanvaUrl = createNavigateToCanvaUrl({
        editUrl: canvaEditUrl,
        correlationState: design.id,
      });
      window.open(navigateToCanvaUrl, "_self");
    } catch (error) {
      console.error(error);
      alert("Something went wrong creating the design.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="cursor-pointer px-4 py-1.5 text-white bg-black"
      onClick={editInCanvas}
    >
      {isRedirecting
        ? "Redirecting..."
        : isLoading
        ? "Loading..."
        : "EDIT IN CANVAS"}
    </button>
  );
}
export default EditInCanvasButton;
