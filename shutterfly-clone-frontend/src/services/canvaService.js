import { createClient } from "@hey-api/client-fetch";
import { poll } from "../utils/poll";
import { AssetService, client, DesignService } from "./apiService";

const ENDPOINT = import.meta.env.VITE_APP_API_URL;

export const getCanvaAuthorization = async () => {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL("/api/canva/authorize", ENDPOINT);
      const windowFeatures = ["popup", "height=800", "width=800"];
      const authWindow = window.open(url, "", windowFeatures.join(","));
      let closed = false;

      const checkAuth = async () => {
        try {
          const authorized = await checkForAccessToken();
          resolve(authorized.token);
        } catch (error) {
          reject(error);
        }
      };

      window.addEventListener("message", (event) => {
        if (event.data === "authorization_success") {
          checkAuth();
          authWindow?.close();
        } else if (event.data === "authorization_error") {
          reject(new Error("Authorization failed"));
          authWindow?.close();
        }
      });

      // Some errors from authorizing may not redirect to our servers,
      // in that case we need to check to see if the window has been manually closed by the user.
      const checkWindowClosed = setInterval(() => {
        if (authWindow?.closed && !closed) {
          clearInterval(checkWindowClosed);
          checkAuth();
          closed = true;
        }
      }, 1000);
    } catch (error) {
      console.error("Authorization failed", error);
      reject(error);
    }
  });
};

export const checkForAccessToken = async () => {
  const url = new URL("/api/canva/token", ENDPOINT);
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    return { token: undefined };
  }

  return { token: await response.text() };
};

export const revoke = async () => {
  const url = new URL("/api/canva/revoke", ENDPOINT);
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    return false;
  }

  return true;
};

function getUserClient(token) {
  const localClient = createClient({
    headers: {
      Authorization: `Bearer ${token}`,
    },
    baseUrl: import.meta.env.VITE_APP_BASE_CANVA_CONNECT_API_URL,
  });

  localClient.interceptors.response.use((res) => {
    const requestId = res.headers.get("x-request-id");
    if (res.status >= 400) {
      console.warn(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}}`
      );
    } else {
      console.log(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}`
      );
    }
    return res;
  });

  return localClient;
}

const updateImageDesign = async (imageId, body) => {
  const url = new URL(`/api/canva/image/${imageId}`, ENDPOINT);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseBody = await response.json();
    return responseBody;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

const getAssetUploadJob = async (jobId, token) => {
  const result = await AssetService.getAssetUploadJob({
    client: getUserClient(token),
    path: { jobId },
  });

  if (result.error) {
    console.error(result.error);
    throw new Error(result.error.message);
  }

  return result.data;
};

const pollAssetUpload = async (jobId, token) => {
  console.log("Job ID", jobId);
  const response = await poll(() => getAssetUploadJob(jobId, token));

  if (!response.job.asset) {
    throw new Error(
      `Asset upload for job id "${response.job.id}" was unsuccessful`
    );
  }

  return response.job.asset;
};

export const uploadAssetAndCreateDesign = async (design, token) => {
  const url = new URL("/api/canva/create-design", ENDPOINT);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(design),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const uploadJob = await response.json();
  console.log("UPLOAD JOB RESPONSE", uploadJob);

  if (uploadJob.error) {
    console.error("Upload job error", uploadJob.error);
    throw new Error(uploadJob.error.message);
  }

  const asset = await pollAssetUpload(uploadJob.data.job.id, token);
  console.log("ASSETS VALUE", asset);

  if (!asset) {
    throw new Error(
      `Asset upload for "${name}" with job id "${result.job.id}" was unsuccessful`
    );
  }

  const createDesignResult = await DesignService.createDesign({
    client: getUserClient(token),
    body: {
      asset_id: asset.id,
      title: uploadJob.data.name,
    },
  });

  if (createDesignResult.error) {
    console.error(createDesignResult.error);
    throw new Error(createDesignResult.error.message);
  }

  const createDesignResultData = createDesignResult.data;
  console.log("CREATE DESIGN RESULT DATA", createDesignResultData);

  if (!createDesignResultData) {
    throw new Error("Unable to create design");
  }

  console.log(createDesignResultData, design);

  // TODO: Save link to db
  await updateImageDesign(design.id, {
    canvaDesignId: createDesignResultData.design.id,
    canvaDesignUrl: createDesignResultData.design.urls.edit_url,
    canvaDesignViewUrl: createDesignResultData.design.urls.view_url,
  });
  return {
    design: createDesignResultData.design,
  };
};

const encodeCorrelationState = (stringifiedState) => {
  return btoa(stringifiedState);
};

export const decodeCorrelationState = (encodedState) => {
  return atob(encodedState);
};

export const getDesign = async (designId) => {
  const design = await DesignService.getDesign({
    client: client,
    path: { designId },
  });

  if (!design || design.error) throw new Error("Unable to find design");

  return { design: design.data.design };
};
export const createNavigateToCanvaUrl = ({ editUrl, correlationState }) => {
  const redirectUrl = new URL(editUrl);
  const encodedCorrelationState = encodeCorrelationState(correlationState);
  redirectUrl.searchParams.append(
    "correlation_state",
    encodeURIComponent(encodedCorrelationState)
  );
  return redirectUrl;
};
