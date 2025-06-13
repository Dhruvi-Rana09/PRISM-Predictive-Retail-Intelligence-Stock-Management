// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { auth } from "@/lib/firebase-config";
// import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// interface AuthFormProps {
//   mode: "login" | "register";
// }

// export default function AuthForm({ mode }: AuthFormProps) {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   try {
//     if (mode === "login") {
//       await signInWithEmailAndPassword(auth, email, password);
//     } else {
//       await createUserWithEmailAndPassword(auth, email, password);
//     }
//     router.push("/dashboard"); // or your desired route
//   } catch (error: any) {
//     console.error("Auth error:", error.message);
//     alert(error.message);
//   }
// };

//   const handleGoogleSignIn = async () => {
//   const provider = new GoogleAuthProvider();
//   try {
//     const result = await signInWithPopup(auth, provider);
//     const user = result.user;
//     console.log("Google user:", user);
//     router.push("/"); // redirect after success
//   } catch (error) {
//     console.error("Google Sign-in Error:", error);
//     alert("Google Sign-in failed. Try again.");
//   }
// };


//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black px-4">
//       <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 rounded-lg shadow-lg">
//         <h2 className="text-3xl font-bold text-white text-center">
//           {mode === "login" ? "Sign In" : "Register"}
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-zinc-300 mb-1">
//               Email address*
//             </label>
//             <input
//               type="email"
//               required
//               className="w-full px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-zinc-300 mb-1">
//               Password*
//             </label>
//             <input
//               type="password"
//               required
//               className="w-full px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
//           >
//             {mode === "login" ? "Sign In" : "Register"}
//           </button>
//         </form>

//         <div className="text-center text-zinc-400">or continue with</div>

//         <button onClick={handleGoogleSignIn} className="w-full py-2 px-4 bg-white text-black font-medium rounded hover:bg-zinc-200 transition flex items-center justify-center gap-3">
//             <svg
//             className="w-5 h-5"
//             viewBox="0 0 488 512"
//             fill="currentColor"
//             xmlns="http://www.w3.org/2000/svg"
//             >
//             <path
//                 fill="#EA4335"
//                 d="M488 261.8C488 403.3 391.6 512 248 512 111 512 0 401 0 264S111 16 248 16c66.2 0 121.6 24 163.6 63.4l-66.2 63.2C319.2 108.1 286.6 96 248 96c-86.3 0-156.1 69.7-156.1 154.1S161.7 404.2 248 404.2c78.7 0 127.3-44.4 133.1-106.6h-133v-84h220.6c2.1 12.5 3.3 25.4 3.3 39.2z"
//             />
//             </svg>
//             Continue with Google
//         </button>


//         <div className="text-sm text-zinc-400 text-center">
//           {mode === "login" ? (
//             <>
//               Don&apos;t have an account?{' '}
//               <Link href="/register" className="text-blue-400 hover:underline">
//                 Register
//               </Link>{' '}
//               |{' '}
//               <a href="#" className="hover:underline">
//                 Forgot your password?
//               </a>
//             </>
//           ) : (
//             <>
//               Already have an account?{' '}
//               <Link href="/login" className="text-blue-400 hover:underline">
//                 Sign In
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase-config";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "@/lib/firebase-config"; 

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const db = getFirestore(app); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const ensureUserInFirestore = async (uid: string, email: string | null) => {
  if (!email) return;
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email,
      role: email === ADMIN_EMAIL ? "admin" : "client",
      createdAt: new Date(),
    });
  }
};


  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com";

  const redirectUser = (userEmail: string | null) => {
    if (!userEmail) return;
    if (userEmail === ADMIN_EMAIL) {
      router.push("/");
    } else {
      router.push("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    let userCredential;
    if (mode === "login") {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } else {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    }

    await ensureUserInFirestore(userCredential.user.uid, userCredential.user.email);
    redirectUser(userCredential.user.email);
  } catch (error: any) {
    console.error("Auth error:", error.message);
    alert(error.message);
  } finally {
    setLoading(false);
  }
};
const handleGoogleSignIn = async () => {
  setLoading(true);
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    await ensureUserInFirestore(result.user.uid, result.user.email);
    redirectUser(result.user.email);
  } catch (error) {
    console.error("Google Sign-in Error:", error);
    alert("Google Sign-in failed. Try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
    <Link 
  href="/"
  className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 mt-16 rounded-md border border-white text-white hover:bg-white hover:text-black transition duration-200 shadow-md"
>
  ← Back to Home
</Link>


      <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-white text-center">
          {mode === "login" ? "Sign In" : "Register"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Email address*
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Password*
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Register"}
          </button>
        </form>

        <div className="text-center text-zinc-400">or continue with</div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2 px-4 bg-white text-black font-medium rounded hover:bg-zinc-200 transition flex items-center justify-center gap-3"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 488 512"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#EA4335"
              d="M488 261.8C488 403.3 391.6 512 248 512 111 512 0 401 0 264S111 16 248 16c66.2 0 121.6 24 163.6 63.4l-66.2 63.2C319.2 108.1 286.6 96 248 96c-86.3 0-156.1 69.7-156.1 154.1S161.7 404.2 248 404.2c78.7 0 127.3-44.4 133.1-106.6h-133v-84h220.6c2.1 12.5 3.3 25.4 3.3 39.2z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="text-sm text-zinc-400 text-center">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:underline">
                Register
              </Link>{" "}
              |{" "}
              <a href="#" className="hover:underline">
                Forgot your password?
              </a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:underline">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
