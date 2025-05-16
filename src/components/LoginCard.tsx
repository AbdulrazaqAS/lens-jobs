import React, { useState, useRef, ChangeEvent } from 'react';

export default function LoginCard() {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const checkUsername = (value: string) => {
    // Dummy validation
    const taken = ['alice', 'bob', 'admin'];
    if (taken.includes(value.toLowerCase())) {
      setUsernameError('Username is already taken');
    } else {
      setUsernameError('');
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className={`bg-surface rounded-2xl p-6 w-full max-w-md transition-all duration-500 shadow-xl`}>
        {!isCreatingAccount ? (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-white">Welcome to LensJobs</h1>
            <button
              className="w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80 transition"
              onClick={() => setIsCreatingAccount(true)}
            >
              Create Account
            </button>
          </div>
        ) : (
          <form
            className="space-y-4 text-white"
            onSubmit={(e) => {
              e.preventDefault();
              if (!usernameError && name && username) {
                alert('Submitted!');
              }
            }}
          >
            <h2 className="text-xl font-bold mb-2">Create your account</h2>

            <div>
              <label className="block mb-1 text-sm">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-background border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  checkUsername(e.target.value);
                }}
                className={`w-full px-3 py-2 rounded-md bg-background border ${
                  usernameError ? 'border-danger' : 'border-gray-600'
                } text-white focus:outline-none focus:ring-2 focus:ring-primary`}
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
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-3 w-24 h-24 rounded-full object-cover border-2 border-primary"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={!!usernameError}
              className="w-full py-2 bg-secondary text-black font-semibold rounded-lg hover:bg-secondary/80 transition disabled:opacity-60"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
