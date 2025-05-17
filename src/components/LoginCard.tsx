import { account } from '@lens-protocol/metadata';
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useWalletClient } from 'wagmi';
import { checkUsernameAvailability, createNewAccountWithUsername, fetchAccountByTxHash, switchToAccount } from '../utils/account';
import { uploadFile, uplaodMetadata } from '../utils/storage-client';
import { SessionClient, Account } from '@lens-protocol/client';

type Props = {
  createOnboardingSessionClient: Function;
  setSessionClient: Function;
  setCurrentAccount: Function;
  createAccountOwnerSessionClient: Function;
  currentAccount?: Account;
};

export default function LoginCard({
  createOnboardingSessionClient,
  createAccountOwnerSessionClient,
  setSessionClient,
  setCurrentAccount,
  currentAccount,
}: Props) {
  const { data: walletClient } = useWalletClient();

  const [isCreating, setIsCreating] = useState(false);
  const [isLogginIn, setIsLoggingIn] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [nameError, setNameError] = useState('');
  const [picture, setPicture] = useState<File>();
  const [picturePath, setPicturePath] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);  //??
  const accountDetected = currentAccount && currentAccount.username?.localName ? true : false;

  const checkUsername = (value: string) => {
    if (value.length < 5) {  // Lens protocol global namespace min
      setUsernameError("Username must be at least 5 characters long.");
      return;
    }

    if (value.length > 26) {  // Lens protocol global namespace max
      setUsernameError("Username must be at most 26 characters long.");
      return;
    }

    if (!/^[a-z0-9]/.test(value)) {
      setUsernameError("Username must start with a letter or number.");
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(value)) {
      setUsernameError("Only a-z, 0-9, _, and - are allowed");
      return;
    }

    setUsernameError("");
  };

  const checkName = (value: string) => {
    if (!/^[a-z]/i.test(value))
      setNameError("Name must start with a letter.");
    else if (!/^[a-z ]+$/i.test(value))
      setNameError("Only a-z and space is allowed");
    else if (value.trim().length < 5)  // Arbitrary value
      setNameError("Name must be at least 5 characters long.");
    else if (value.length > 32)  // Arbitrary value
      setNameError("Name must be at most 32 characters long.");
    else
      setNameError("");
  };

  const isUsernameAvailable = async (sessionClient: SessionClient) => {
    checkUsername(username);
    if (usernameError) return false;

    try {
      await checkUsernameAvailability({ sessionClient, username });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setUsernameError(error.message);
      } else {
        setUsernameError("Unknown error occurred");
      }
      return false;
    }

    return true;
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setPicture(file);

      const reader = new FileReader();
      reader.onload = () => setPicturePath(reader.result as string);  // To be used as src to preview the pic
      reader.readAsDataURL(file);  // triggers the onload event after finishing (getting url)
    }
  };

  const generateMetadata = (pictureUri: string) => {
    const metadata = {
      name,
      picture: pictureUri,
    };

    return account(metadata);
  };
  
 async function handleLogin() {
   try {
     setIsLoggingIn(true);
      const sessionClient= await createAccountOwnerSessionClient();
      if (!sessionClient){
        throw new Error("Error creating account owner session client");
      }
      
      setSessionClient(sessionClient);
      console.log("Account owner session client created");
    } catch(error) {
      alert(error);
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
 }
 
  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!walletClient) {
      console.error("Error:", new Error("Wallet not connected"));
      alert("Wallet not connected");
      return;
    }

    if (nameError) return;
    if (usernameError) return;

    if (!picture) {
      alert("Profile picture is required");
      return;
    }

    try {
      setIsCreating(true);

      const sessionClient = await createOnboardingSessionClient();
      if (!sessionClient) {
        throw new Error("Error creating onboarding session client");
      }

      const usernameAvailable = await isUsernameAvailable(sessionClient);
      if (!usernameAvailable) {
        throw new Error("Username error: " + usernameError);
      }

      console.log("Session client", sessionClient);
      const pictureUri = await uploadFile(picture!);
      console.log("Picture Uri", pictureUri);
      const metadata = generateMetadata(pictureUri);
      // TODO: Check username availabilty before uploading metadata
      const metadataUri = await uplaodMetadata(metadata);
      console.log("MetadataUri", metadataUri);
      const txHash = await createNewAccountWithUsername({
        username,
        metadataUri,
        walletClient,
        sessionClient,
      });
      console.log("CreationTxHash", txHash);
      const account = await fetchAccountByTxHash(txHash);
      console.log("Account created", account);
      const accountOwnerSessionClient = await switchToAccount({
        sessionClient,
        address: account?.address,
      });
      setSessionClient(accountOwnerSessionClient);
      setCurrentAccount(account);

      console.log("Account owner session client created", accountOwnerSessionClient);
    } catch (error) {
      alert(error);
      console.error("Error creating account:", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="h-[80vh] bg-background flex items-center justify-center p-4">
      <div className={`bg-surface rounded-2xl p-6 w-full max-w-md transition-all duration-500 shadow-xl`}>
        {!showSignupForm ? (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-white">Welcome to LensJobs</h1>
            {accountDetected && <button
              className="w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80 transition"
              onClick={handleLogin}
            >
              {isLogginIn ? "Logging in..." : `Continue as ${currentAccount!.username!.localName}`}
            </button>}
            <button
              className="w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80 transition"
              onClick={() => setShowSignupForm(true)}
            >
              Create Account
            </button>
          </div>
        ) : (
          <form
            className="space-y-4 text-white"
            onSubmit={submitForm}
          >
            {/* TODO: Add a back button to the form to go back to the buttons*/}
            <img
              src={picturePath ?? "profile-placeholder.png"}
              alt="Preview"
              className="mt-3 mx-auto w-24 h-24 rounded-full object-cover border-2 border-primary"
            />

            <div>
              <label className="block mb-1 text-sm">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  checkName(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-md bg-background border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {nameError && <p className="text-danger text-xs mt-1">{nameError}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase());
                  checkUsername(e.target.value.toLowerCase());
                }}
                className={`w-full px-3 py-2 rounded-md bg-background border ${usernameError ? 'border-danger' : 'border-gray-600'
                  } text-white focus:outline-none focus:ring-2 focus:ring-primary`}
                required
              />
              {usernameError && <p className="text-danger text-xs mt-1">{usernameError}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm">Profile Picture</label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-300 file:bg-primary file:border-none file:text-white file:px-4 file:py-2 file:rounded-md bg-background border border-gray-600 rounded-md"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-2 bg-secondary text-black font-semibold rounded-lg hover:bg-secondary/80 transition disabled:opacity-60"
            >
              {isCreating ? "Creating account..." : "Submit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
