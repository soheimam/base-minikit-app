import { useCallback, useState } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionToast,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionToastAction,
} from "@coinbase/onchainkit/transaction";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { baseSepolia } from "wagmi/chains";
import { Address, Call } from "viem";
import { useAccount } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";

const priceToPay = .1;

export default function TransactionFlow({
  username,
  years,
  setShowSuccess,
}: {
  username: string;
  years: number;
  setShowSuccess: (v: boolean) => void;
}) {
  const { address } = useAccount();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pendingStartTime, setPendingStartTime] = useState<number | null>(null);
  
  const handleOnStatus = useCallback(
    (status: LifecycleStatus) => {
      const now = Date.now();
      const timestamp = new Date(now).toISOString();
      
      // Log transaction status with clear status indicators and timestamps
      console.log(`========================`);
      console.log(`TRANSACTION STATUS: ${status.statusName.toUpperCase()} (${timestamp})`);
      console.log(`Details:`, status.statusData);
      
      // Track pending transaction time
      if (status.statusName === "transactionPending") {
        if (!pendingStartTime) {
          setPendingStartTime(now);
          console.log(`⏳ PENDING STARTED: Transaction entered pending state at ${timestamp}`);
        } else {
          const pendingDuration = Math.floor((now - pendingStartTime) / 1000);
          console.log(`⏳ PENDING DURATION: Transaction has been pending for ${pendingDuration} seconds`);
          
          // Alert if transaction is pending for too long (e.g., more than 60 seconds)
          if (pendingDuration > 60) {
            console.warn(`⚠️ POTENTIAL STUCK TRANSACTION: Pending for ${pendingDuration} seconds`);
            console.log(`Network Congestion: Check https://etherscan.io/gastracker or https://basescan.org`);
          }
        }
      } else if (pendingStartTime && (status.statusName === "transactionLegacyExecuted" || status.statusName === "success")) {
        const pendingDuration = Math.floor((now - pendingStartTime) / 1000);
        console.log(`✅ PENDING RESOLVED: Transaction was pending for ${pendingDuration} seconds before moving to ${status.statusName}`);
        setPendingStartTime(null);
      }
      
      console.log(`========================`);

      if (status.statusName === "success" && orderId) {
        console.log(`✅ SUCCESS: Transaction completed successfully.`);
        // apiRequest.id.webhookWorldOrder(orderId);
        setShowSuccess(true);
      } else if (status.statusName === "error") {
        console.log(`❌ ERROR: Transaction failed - ${status.statusData.message}`);
        console.log(`Error Details:`, status.statusData);
        if (pendingStartTime) {
          const pendingDuration = Math.floor((now - pendingStartTime) / 1000);
          console.log(`❌ PENDING FAILED: Transaction was pending for ${pendingDuration} seconds before failing`);
          setPendingStartTime(null);
        }
        alert("❌ Transaction Failed: " + status.statusData.message);
      }
    },
    [orderId, setShowSuccess, pendingStartTime],
  );

  const callsCallback = async () => {
    console.log(`🚀 STARTING TRANSACTION: Preparing payment (${new Date().toISOString()})`);
    
    // const data = await apiRequest.id.createBaseOrder(username, years);

    const response = await fetch(
      "https://api.coinbase.com/v2/exchange-rates?currency=ETH",
    );
    const result = await response.json();

    const ethUsdPrice = parseFloat(result.data.rates?.USD);

    // Convert USD to ETH
    const ethAmount = priceToPay / ethUsdPrice;
    console.log(`💰 PAYMENT: $${priceToPay} = ${ethAmount} ETH`);

    const data = {
      data: {
        orderId: "segdfhjhed",
        ethAmount: ethAmount,
      },
    };

    setOrderId(data.data.orderId);
    console.log(`📝 ORDER ID: ${data.data.orderId}`);

    const receiverAddress =
      "0xbc7D860f6e8ceC925d411F868b76098B44Dc4Fa6" as Address;
    const weiAmount = BigInt(Math.floor(data.data.ethAmount * 1e18));

    const calls: Call[] = [
      {
        to: receiverAddress,
        value: weiAmount,
        data: "0x",
      },
    ];

    console.log(`📤 SENDING: ${ethAmount} ETH to ${receiverAddress}`);

    return calls;
  };

  return (
    <>
      {address ? (
        <Transaction
          chainId={baseSepolia.id}
          calls={callsCallback} // or `calls={[{ to, data, value }]` directly
          onStatus={handleOnStatus}
          isSponsored={false}
        >
          <TransactionButton text={`Pay $${priceToPay}`} />
          <TransactionSponsor />

          <TransactionStatus>
            <TransactionStatusLabel />
            <TransactionStatusAction />
          </TransactionStatus>

          <TransactionToast>
            <TransactionToastIcon />
            <TransactionToastLabel />
            <TransactionToastAction />
          </TransactionToast>
        </Transaction>
      ) : (
        <div className="flex justify-center items-center">
          <Wallet>
            <ConnectWallet>
              {/* <ConnectWalletText>Get Started</ConnectWalletText> */}
            </ConnectWallet>
          </Wallet>
        </div>
      )}
    </>
  );
}
