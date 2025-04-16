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

const priceToPay = 1.5;

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
  const handleOnStatus = useCallback(
    (status: LifecycleStatus) => {
      console.log(
        "📦 Tx Lifecycle Status:",
        status.statusName,
        status.statusData,
      );

      if (status.statusName === "success" && orderId) {
        // apiRequest.id.webhookWorldOrder(orderId);
        setShowSuccess(true);
      } else if (status.statusName === "error") {
        alert("❌ Transaction Failed: " + status.statusData.message);
      }
    },
    [orderId, setShowSuccess],
  );

  const callsCallback = async () => {
    // const data = await apiRequest.id.createBaseOrder(username, years);

    const response = await fetch(
      "https://api.coinbase.com/v2/exchange-rates?currency=ETH",
    );
    const result = await response.json();

    const ethUsdPrice = parseFloat(result.data.rates?.USD);

    // Convert USD to ETH
    const ethAmount = priceToPay / ethUsdPrice;

    const data = {
      data: {
        orderId: "segdfhjhed",
        ethAmount: ethAmount,
      },
    };

    setOrderId(data.data.orderId);

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

    console.log({ calls });

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
