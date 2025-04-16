"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import Identicon from "./Identicon";
import TransactionFlow from "./TransactionFlow";

export default function Test(props: { username: string }) {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const [years, setYears] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  // const { login } = usePrivy();
  // const { user } = useAppSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // const baseURL = `https://id.offlineprotocol.com?${
    //   user.referralCode ? `referral=${user.referralCode}` : ""
    // }`;
    // navigator.clipboard.writeText(baseURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const updateYear = (value: number) => {
    const newValue = years + value;
    if (newValue >= 1 && newValue <= 3) {
      setYears(years + value);
    }
  };

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="flex flex-col gap-4 bg-black/10 p-4">
      {showSuccess ? (
        <div>
          <div className="italic text-baliHai font-instrumentSerif text-2xl">
            ID Details
          </div>

          <div className="flex gap-4 items-center my-5">
            <div className="rounded-full overflow-hidden w-fit">
              <Identicon size="60px" name={props.username} />
            </div>

            <div className="profile-b mt-20px text-center">
              <p
                className={`text-xl font-[instrumentSerif] italic text-bayOfMany`}
              >
                {props.username}
                <span className="text-bayOfMany/40 font-[instrumentSerif]">
                  .offline
                </span>
              </p>
            </div>
          </div>

          <div className="text-baliHai mt-5">
            expiry date: <span>{Date.now().toString()}</span>
          </div>

          <div className="btn mt-20px" onClick={handleCopy}>
            {copied ? "Copied Link!" : "Share Invite"}
          </div>
        </div>
      ) : (
        <>
          <div className="italic text-baliHai font-instrumentSerif text-2xl">
            Get your username
          </div>

          <div className="profile-b mt-20px text-center">
            <p
              className={`text-xl font-[instrumentSerif] italic text-bayOfMany`}
            >
              {props.username}
              <span className="text-bayOfMany/40 font-[instrumentSerif]">
                .offline
              </span>
            </p>
          </div>

          <div className="year-selector flex justify-between items-center mt-5 mb-2">
            <div className="minus" onClick={() => updateYear(-1)}>
              -
            </div>
            <div className="value">
              {years} year{years > 1 && "s"}
            </div>
            <div className="plus" onClick={() => updateYear(1)}>
              +
            </div>
          </div>

          <TransactionFlow
            username={props.username}
            years={years}
            setShowSuccess={setShowSuccess}
          />
        </>
      )}
    </div>
  );
}
