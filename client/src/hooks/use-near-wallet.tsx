// use-near-wallet.tsx
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { WalletSelector, WalletSelectorUI } from "@hot-labs/near-connect";
import "@hot-labs/near-connect/modal-ui.css";

interface NearWalletState {
  isConnected: boolean;
  accountId?: string;
  selector?: WalletSelector;
  modal?: WalletSelectorUI;
  wallet?: any; // Consider typing this more specifically if possible
}

export function useNearWallet() {
  const [walletState, setWalletState] = useState<NearWalletState>({
    isConnected: false
  });
  const { toast } = useToast();

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      console.log("Initializing NEAR wallet selector...");
      const selector = new WalletSelector({
        network: "testnet",
        // Support all compatible wallets with required features
        features: {
          signAndSendTransaction: true,
          testnet: true
        }
      });
      const modal = new WalletSelectorUI(selector);

      // Set up event listeners
      selector.on("wallet:signOut", async () => {
        console.log("Wallet signed out");
        setWalletState({
          isConnected: false,
          selector,
          modal
        });
        toast({
          title: "Wallet Disconnected",
          description: "You have been signed out from your wallet."
        });
      });

      selector.on("wallet:signIn", async (event) => {
        console.log("Wallet signed in:", event);
        if (event.accounts && event.accounts.length > 0) {
          const accountId = event.accounts[0].accountId;
          try {
              const wallet = await selector.wallet(); // Get the specific wallet instance
              setWalletState({
                isConnected: true,
                accountId,
                selector,
                modal,
                wallet // Store the actual wallet instance
              });
              toast({
                title: "Wallet Connected",
                description: `Connected as ${accountId}.`
              });
          } catch (err) {
              console.error("Failed to get wallet instance after sign in:", err);
              toast({
                title: "Connection Error",
                description: "Failed to finalize wallet connection. Please try again.",
                variant: "destructive"
              });
               // Reset state on error
              setWalletState({ isConnected: false, selector, modal });
          }
        }
      });

      // Set initial state with selector and modal
      setWalletState({
        isConnected: false,
        selector,
        modal
      });
      console.log("NEAR wallet selector initialized successfully");

    } catch (error) {
      console.error("Failed to initialize wallet selector:", error);
      // Removed fallback to demo mode. Show an error instead.
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize NEAR wallet. Please ensure you have a compatible wallet installed.",
        variant: "destructive"
      });
      // Keep state as not connected
      setWalletState({ isConnected: false });
    }
  };

  const connectWallet = async () => {
    try {
      // Removed mock wallet connection fallback

      // Use the modal UI to show all available wallets
      if (walletState.modal) {
        console.log("Opening wallet selection modal...");
        walletState.modal.open();
      } else {
         // Handle case where modal isn't initialized (shouldn't happen if init succeeded)
         throw new Error("Wallet modal is not available.");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect NEAR wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      // Removed mock wallet disconnection logic

      if (walletState.wallet) {
        await walletState.wallet.signOut();
        // The signOut event listener will handle state update
        // Note: Ensure the wallet instance has a signOut method
      } else {
         // Handle case where wallet is not connected but disconnect is called
         console.warn("Attempted to disconnect, but no wallet was connected.");
         setWalletState(prev => ({ isConnected: false, selector: prev.selector, modal: prev.modal }));
         toast({
            title: "Not Connected",
            description: "No wallet was connected to disconnect.",
            variant: "default" // or warning
         });
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet. You might need to disconnect manually in your wallet app.",
        variant: "destructive"
      });
      // Optionally, still update local state if the wallet app might have disconnected anyway
      // setWalletState(prev => ({ isConnected: false, selector: prev.selector, modal: prev.modal }));
    }
  };

  const signAndSendTransaction = async (params: any) => {
    try {
      // Removed mock transaction logic

      if (!walletState.wallet) {
        const errorMsg = "Wallet not connected. Please connect your wallet first.";
        console.error(errorMsg);
        toast({
            title: "Action Failed",
            description: errorMsg,
            variant: "destructive"
        });
        throw new Error(errorMsg); // Throw error to be caught by caller
      }

      // Ensure the wallet object has the required method before calling
      if (typeof walletState.wallet.signAndSendTransaction !== 'function') {
           const errorMsg = "Connected wallet does not support signing transactions.";
           console.error(errorMsg);
           toast({
                title: "Unsupported Wallet",
                description: errorMsg,
                variant: "destructive"
           });
           throw new Error(errorMsg);
      }


      console.log("Sending transaction with params:", params);
      const result = await walletState.wallet.signAndSendTransaction(params);
      console.log("Transaction sent successfully:", result);
      return result;

    } catch (error) {
      console.error("Transaction failed in hook:", error);
      // Specific error handling can be added here if needed, but generally re-throw
      // The mintNFT function already handles user rejection errors
      throw error; // Re-throw for the caller (e.g., mintNFT) to handle
    }
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    signAndSendTransaction // Expose this for direct use or for mintNFT
  };
}
