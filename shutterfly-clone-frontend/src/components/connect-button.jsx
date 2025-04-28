import { useEffect, useState } from "react";
import {
  checkForAccessToken,
  getCanvaAuthorization,
  revoke,
} from "../services/canvaService";

export const ConnectButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkForAccessToken()
      .then((result) => {
        if (result.token) {
          setToken(result.token);
          setIsAuthorized(true);
        } else {
          setToken(undefined);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const onConnectClick = async () => {
    try {
      setIsLoading(true);
      const result = await getCanvaAuthorization();

      if (result) {
        setToken(result);
        setIsAuthorized(true);
      } else {
        setToken(undefined);
      }
    } catch (error) {
      setToken(undefined);
      alert("Authorization has failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRevokeClick = async () => {
    setIsLoading(true);
    try {
      const result = await revoke();

      if (result) {
        setToken(undefined);
        setIsAuthorized(false);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return isAuthorized ? (
    <button
      className="cursor-pointer px-4 py-1.5 text-white bg-black"
      onClick={onRevokeClick}
    >
      {isLoading ? "Loading..." : "DISCONNECT FROM CANVA"}
    </button>
  ) : (
    <button
      className="cursor-pointer px-4 py-1.5 text-white bg-black"
      onClick={onConnectClick}
    >
      {isLoading ? "Loading..." : "CONNECT TO CANVA"}
    </button>
  );
};
